import {
    Types,
} from "mongoose";

import ApiError from "../../utils/ApiError";

import Task, {
    ITaskDocument,
    TaskStatus,
} from "./task.model";

import Project from "../project/project.model";

import ProjectMember from "../projectMember/projectMember.model";

import { ProjectRole } from "../../interfaces/projectMember.interface";

import {
    Workspace,
} from "../workspace/workspace.model";

import TaskAssignee from "../taskAssignee/taskAssignee.model";

import {
    ICreateTask,
    ITaskAssigneePreview,
    ITaskResponse,
    ITasksResponse,
    IUpdateTask,
} from "../../interfaces/task.interface";

import { TaskType } from "./task.model";

import {
    DomainEventName,
    eventBus,
} from "../../events";

interface ITaskHierarchyNode {
    _id: Types.ObjectId;

    project: Types.ObjectId;

    parentTask?: Types.ObjectId | null;

    isArchived: boolean;
}

/*
|--------------------------------------------------------------------------
| Populated Assignee User
|--------------------------------------------------------------------------
*/

interface IPopulatedAssigneeUser {
    _id: Types.ObjectId;

    name: string;

    username: string;

    avatar?: string;
}

export class TaskService {
    /*
    |--------------------------------------------------------------------------
    | Validate Parent Task
    |--------------------------------------------------------------------------
    |
    | Ensures:
    |
    | 1. A task cannot be its own parent.
    | 2. Parent and ancestors belong to the same project.
    | 3. The direct parent is not archived.
    | 4. The proposed relationship does not create a cycle.
    | 5. The existing hierarchy is not already corrupted.
    |
    */

    private async validateParentTask(
        projectId: string,
        parentTaskId: string,
        currentTaskId?: string
    ): Promise<void> {
        /*
        |--------------------------------------------------------------------------
        | Immediate Self-Parent Protection
        |--------------------------------------------------------------------------
        */

        if (
            currentTaskId &&
            parentTaskId === currentTaskId
        ) {
            throw new ApiError(
                409,
                "A task cannot be its own parent."
            );
        }

        const visitedTaskIds =
            new Set<string>();

        let currentParentId:
            string | null =
                parentTaskId;

        let isDirectParent =
            true;

        /*
        |--------------------------------------------------------------------------
        | Walk Through Parent Chain
        |--------------------------------------------------------------------------
        */

        while (currentParentId) {
            /*
            Detect a cycle already present in the
            stored hierarchy.
            */
            if (
                visitedTaskIds.has(
                    currentParentId
                )
            ) {
                throw new ApiError(
                    409,
                    "The existing task hierarchy contains a circular reference."
                );
            }

            visitedTaskIds.add(
                currentParentId
            );

            /*
            If the task being updated appears in the
            proposed parent's ancestor chain, the new
            relationship would create a cycle.
            */
            if (
                currentTaskId &&
                currentParentId ===
                    currentTaskId
            ) {
                throw new ApiError(
                    409,
                    "This parent task would create a circular task hierarchy."
                );
            }

            const parentNode:
    ITaskHierarchyNode | null =
        await Task.findById(
            currentParentId
        )
            .select(
                "_id project parentTask isArchived"
            )
            .lean<ITaskHierarchyNode>()
            .exec();

            if (!parentNode) {
                if (isDirectParent) {
                    throw new ApiError(
                        404,
                        "Parent task not found."
                    );
                }

                throw new ApiError(
                    409,
                    "The existing task hierarchy contains a missing parent reference."
                );
            }

            if (
                parentNode.project.toString() !==
                projectId
            ) {
                throw new ApiError(
                    409,
                    "Parent tasks and their ancestors must belong to the same project."
                );
            }

            /*
            Only the directly selected parent must be active.

            An ancestor could have been archived after
            the hierarchy was originally created.
            */
            if (
                isDirectParent &&
                parentNode.isArchived
            ) {
                throw new ApiError(
                    409,
                    "An archived task cannot be used as a parent."
                );
            }

            currentParentId =
                parentNode.parentTask
                    ?.toString() ??
                null;

            isDirectParent =
                false;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Get Task Assignee Previews
    |--------------------------------------------------------------------------
    */

    private async getTaskAssigneePreview(
        taskId: string
    ): Promise<ITaskAssigneePreview[]> {
        const assignments =
            await TaskAssignee.find({
                task: taskId,
            })
                .populate<{
                    user:
                        IPopulatedAssigneeUser |
                        null;
                }>(
                    "user",
                    "name username avatar"
                )
                .exec();

        const assignees:
            ITaskAssigneePreview[] = [];

        for (
            const assignment of
            assignments
        ) {
            const user =
                assignment.user;

            /*
            A referenced user may have been removed.
            Do not allow one missing user reference to
            crash the whole task response.
            */
            if (!user) {
                continue;
            }

            assignees.push({
                _id:
                    user._id.toString(),

                name:
                    user.name,

                username:
                    user.username,

                avatar:
                    user.avatar,
            });
        }

        return assignees;
    }

    /*
    |--------------------------------------------------------------------------
    | Map Task
    |--------------------------------------------------------------------------
    */

    private mapTask(
        task: ITaskDocument,
        assignees: ITaskAssigneePreview[]
    ): ITaskResponse {
        return {
            _id:
                task._id.toString(),

            project:
                task.project.toString(),

            title:
                task.title,

            description:
                task.description,

            status:
                task.status,

            priority:
                task.priority,

            createdBy:
                task.createdBy.toString(),

            updatedBy:
                task.updatedBy?.toString(),

            completedBy:
                task.completedBy?.toString(),

            type:
            task.type ??
            TaskType.TASK,


            startDate:
                task.startDate,

            dueDate:
                task.dueDate,

            completedAt:
                task.completedAt,

            parentTask:
                task.parentTask?.toString(),

            position:
                task.position,

            assignees,

            isArchived:
                task.isArchived,

            createdAt:
                task.createdAt,

            updatedAt:
                task.updatedAt,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Create Task
    |--------------------------------------------------------------------------
    */

    async createTask(
        projectId: string,
        userId: string,
        data: ICreateTask
    ): Promise<ITaskResponse> {
        const project =
            await Project.findById(
                projectId
            )
                .select(
                    "_id workspace isArchived"
                )
                .lean();

        if (!project) {
            throw new ApiError(
                404,
                "Project not found."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Project Membership
        |--------------------------------------------------------------------------
        */

        const membershipExists =
            await ProjectMember.exists({
                project:
                    projectId,

                user:
                    userId,
            });

        if (!membershipExists) {
            throw new ApiError(
                403,
                "You are not a member of this project."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Workspace
        |--------------------------------------------------------------------------
        */

        const workspace =
            await Workspace.findById(
                project.workspace
            )
                .select(
                    "_id isArchived"
                )
                .lean();

        if (!workspace) {
            throw new ApiError(
                404,
                "Workspace not found."
            );
        }

        if (workspace.isArchived) {
            throw new ApiError(
                409,
                "Tasks cannot be created while the workspace is archived."
            );
        }

        if (project.isArchived) {
            throw new ApiError(
                409,
                "Tasks cannot be created inside an archived project."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Parent Task
        |--------------------------------------------------------------------------
        */

        if (data.parentTask) {
            await this.validateParentTask(
                projectId,
                data.parentTask
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Dates
        |--------------------------------------------------------------------------
        */

        if (
            data.startDate &&
            data.dueDate &&
            data.startDate.getTime() >
                data.dueDate.getTime()
        ) {
            throw new ApiError(
                400,
                "Due date cannot be before start date."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Calculate Position
        |--------------------------------------------------------------------------
        */

        const lastTask =
            await Task.findOne({
                project:
                    projectId,
            })
                .sort({
                    position: -1,
                    _id: -1,
                })
                .select(
                    "position"
                )
                .lean();

        const position =
            lastTask
                ? lastTask.position +
                  1000
                : 1000;

        /*
        |--------------------------------------------------------------------------
        | Create Task
        |--------------------------------------------------------------------------
        */

        const task =
            await Task.create({
                project:
                    new Types.ObjectId(
                        projectId
                    ),

                title:
                    data.title,

                description:
                    data.description ?? "",

                priority:
                    data.priority,

                type:
                    data.type ??
                    TaskType.TASK,

                createdBy:
                    new Types.ObjectId(
                        userId
                    ),

                updatedBy:
                    new Types.ObjectId(
                        userId
                    ),

                startDate:
                    data.startDate,

                dueDate:
                    data.dueDate,

                parentTask:
                    data.parentTask
                        ? new Types.ObjectId(
                            data.parentTask
                        )
                        : undefined,

                position,
            });

            await eventBus.publish(
    DomainEventName.TASK_CREATED,
    {
        workspaceId:
            workspace._id.toString(),

        projectId:
            project._id.toString(),

        taskId:
            task._id.toString(),

        actorId:
            userId,

        title:
            task.title,

        status:
            task.status,

        taskType:
            task.type,
    }
);

        /*
        A newly created task has no assignees,
        so no assignment query is required.
        */
        return this.mapTask(
            task,
            []
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get Task
    |--------------------------------------------------------------------------
    */

    async getTask(
        taskId: string,
        userId: string
    ): Promise<ITaskResponse> {
        const task =
            await Task.findById(
                taskId
            );

        if (!task) {
            throw new ApiError(
                404,
                "Task not found."
            );
        }

        const membershipExists =
            await ProjectMember.exists({
                project:
                    task.project,

                user:
                    userId,
            });

        if (!membershipExists) {
            throw new ApiError(
                403,
                "You are not a member of this project."
            );
        }

        /*
        Archived tasks remain readable.
        */

        const assignees =
            await this.getTaskAssigneePreview(
                task._id.toString()
            );

        return this.mapTask(
            task,
            assignees
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get Project Tasks
    |--------------------------------------------------------------------------
    */

    async getProjectTasks(
        projectId: string,
        userId: string
    ): Promise<ITasksResponse> {
        const project =
            await Project.findById(
                projectId
            )
                .select(
                    "_id isArchived"
                )
                .lean();

        if (!project) {
            throw new ApiError(
                404,
                "Project not found."
            );
        }

        const membershipExists =
            await ProjectMember.exists({
                project:
                    projectId,

                user:
                    userId,
            });

        if (!membershipExists) {
            throw new ApiError(
                403,
                "You are not a member of this project."
            );
        }

        /*
        Both active and archived tasks are returned.
        */
        const tasks =
            await Task.find({
                project:
                    projectId,
            }).sort({
                position: 1,
                _id: 1,
            });

        if (tasks.length === 0) {
            return {
                tasks: [],
            };
        }

        /*
        |--------------------------------------------------------------------------
        | Batch Load Assignees
        |--------------------------------------------------------------------------
        */

        const taskIds =
            tasks.map(
                (task) =>
                    task._id
            );

        const assignments =
            await TaskAssignee.find({
                task: {
                    $in:
                        taskIds,
                },
            })
                .populate<{
                    user:
                        IPopulatedAssigneeUser |
                        null;
                }>(
                    "user",
                    "name username avatar"
                )
                .exec();

        const assigneeMap =
            new Map<
                string,
                ITaskAssigneePreview[]
            >();

        for (
            const assignment of
            assignments
        ) {
            const user =
                assignment.user;

            if (!user) {
                continue;
            }

            const assignmentTaskId =
                assignment.task.toString();

            const currentAssignees =
                assigneeMap.get(
                    assignmentTaskId
                ) ?? [];

            currentAssignees.push({
                _id:
                    user._id.toString(),

                name:
                    user.name,

                username:
                    user.username,

                avatar:
                    user.avatar,
            });

            assigneeMap.set(
                assignmentTaskId,
                currentAssignees
            );
        }

        return {
            tasks:
                tasks.map(
                    (task) =>
                        this.mapTask(
                            task,

                            assigneeMap.get(
                                task._id.toString()
                            ) ?? []
                        )
                ),
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Update Task
    |--------------------------------------------------------------------------
    */

    async updateTask(
        taskId: string,
        userId: string,
        data: IUpdateTask
    ): Promise<ITaskResponse> {
        const task =
            await Task.findById(
                taskId
            );

        if (!task) {
            throw new ApiError(
                404,
                "Task not found."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Project Membership
        |--------------------------------------------------------------------------
        */

        const membershipExists =
            await ProjectMember.exists({
                project:
                    task.project,

                user:
                    userId,
            });

        if (!membershipExists) {
            throw new ApiError(
                403,
                "You are not a member of this project."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Project
        |--------------------------------------------------------------------------
        */

        const project =
            await Project.findById(
                task.project
            )
                .select(
                    "_id workspace isArchived"
                )
                .lean();

        if (!project) {
            throw new ApiError(
                404,
                "Project not found."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Workspace
        |--------------------------------------------------------------------------
        */

        const workspace =
            await Workspace.findById(
                project.workspace
            )
                .select(
                    "_id isArchived"
                )
                .lean();

        if (!workspace) {
            throw new ApiError(
                404,
                "Workspace not found."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Resources Are Writable
        |--------------------------------------------------------------------------
        */

        if (workspace.isArchived) {
            throw new ApiError(
                409,
                "Tasks cannot be updated while the workspace is archived."
            );
        }

        if (project.isArchived) {
            throw new ApiError(
                409,
                "Tasks cannot be updated inside an archived project."
            );
        }

        if (task.isArchived) {
            throw new ApiError(
                409,
                "Archived tasks cannot be updated."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Parent Task
        |--------------------------------------------------------------------------
        */

        if (
            data.parentTask !==
            undefined && data.parentTask !==
        null
        ) {
            await this.validateParentTask(
                task.project.toString(),
                data.parentTask,
                task._id.toString()
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Validate Effective Dates
        |--------------------------------------------------------------------------
        */

        const effectiveStartDate =
            data.startDate ??
            task.startDate;

        const effectiveDueDate =
            data.dueDate ??
            task.dueDate;

        if (
            effectiveStartDate &&
            effectiveDueDate &&
            effectiveStartDate.getTime() >
                effectiveDueDate.getTime()
        ) {
            throw new ApiError(
                400,
                "Due date cannot be before start date."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Apply Updates
        |--------------------------------------------------------------------------
        */

        if (
            data.title !==
            undefined
        ) {
            task.title =
                data.title;
        }

        if (
            data.description !==
            undefined
        ) {
            task.description =
                data.description;
        }

        if (
            data.priority !==
            undefined
        ) {
            task.priority =
                data.priority;
        }

        if(data.type!==undefined){
            task.type = data.type;
        }

        if (
    data.startDate !==
    undefined
) {
    task.startDate =
        data.startDate ??
        undefined;
}

        if (
    data.dueDate !==
    undefined
) {
    task.dueDate =
        data.dueDate ??
        undefined;
}

        if (
    data.parentTask !==
    undefined
) {
    if (
        data.parentTask ===
        null
    ) {
        task.parentTask =
            undefined;
    } else {
        task.parentTask =
            new Types.ObjectId(
                data.parentTask
            );
    }
}

        task.updatedBy =
            new Types.ObjectId(
                userId
            );

        await task.save();

        

        const assignees =
            await this.getTaskAssigneePreview(
                task._id.toString()
            );

        return this.mapTask(
            task,
            assignees
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Update Task Status
    |--------------------------------------------------------------------------
    */

    async updateTaskStatus(
        taskId: string,
        userId: string,
        status: TaskStatus
    ): Promise<ITaskResponse> {
        const task =
            await Task.findById(
                taskId
            );

        if (!task) {
            throw new ApiError(
                404,
                "Task not found."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Project Membership
        |--------------------------------------------------------------------------
        */

        const membershipExists =
            await ProjectMember.exists({
                project:
                    task.project,

                user:
                    userId,
            });

        if (!membershipExists) {
            throw new ApiError(
                403,
                "You are not a member of this project."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Project
        |--------------------------------------------------------------------------
        */

        const project =
            await Project.findById(
                task.project
            )
                .select(
                    "_id workspace isArchived"
                )
                .lean();

        if (!project) {
            throw new ApiError(
                404,
                "Project not found."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Workspace
        |--------------------------------------------------------------------------
        */

        const workspace =
            await Workspace.findById(
                project.workspace
            )
                .select(
                    "_id isArchived"
                )
                .lean();

        if (!workspace) {
            throw new ApiError(
                404,
                "Workspace not found."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Verify Resources Are Writable
        |--------------------------------------------------------------------------
        */

        if (workspace.isArchived) {
            throw new ApiError(
                409,
                "Task status cannot be changed while the workspace is archived."
            );
        }

        if (project.isArchived) {
            throw new ApiError(
                409,
                "Task status cannot be changed inside an archived project."
            );
        }

        if (task.isArchived) {
            throw new ApiError(
                409,
                "Status cannot be changed on an archived task."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Idempotent Update
        |--------------------------------------------------------------------------
        |
        | Repeating the same request must not reset
        | completedAt or completedBy.
        |
        */

        if (
            task.status ===
            status
        ) {
            const assignees =
                await this.getTaskAssigneePreview(
                    task._id.toString()
                );

            return this.mapTask(
                task,
                assignees
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Update Lifecycle Metadata
        |--------------------------------------------------------------------------
        */
       const previousStatus =
    task.status;

        task.status =
            status;

        task.updatedBy =
            new Types.ObjectId(
                userId
            );

        if (
            status ===
            TaskStatus.DONE
        ) {
            task.completedAt =
                new Date();

            task.completedBy =
                new Types.ObjectId(
                    userId
                );
        } else {
            /*
            Moving away from DONE reopens the task.
            */
            task.completedAt =
                undefined;

            task.completedBy =
                undefined;
        }

        await task.save();

        await eventBus.publish(
    DomainEventName.TASK_STATUS_CHANGED,
    {
        workspaceId:
            workspace._id.toString(),

        projectId:
            project._id.toString(),

        taskId:
            task._id.toString(),

        actorId:
            userId,

        title:
            task.title,

        previousStatus,

        currentStatus:
            task.status,
        
        taskType:
            task.type,
    }
);

        const assignees =
            await this.getTaskAssigneePreview(
                task._id.toString()
            );

        /*
        Future event boundary:

        TaskStatusChangedEvent should be published
        after successful persistence.
        */

        return this.mapTask(
            task,
            assignees
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Archive Task
    |--------------------------------------------------------------------------
    */

    async archiveTask(
        taskId: string,
        userId: string
    ): Promise<void> {
        const task =
            await Task.findById(
                taskId
            );

        if (!task) {
            throw new ApiError(
                404,
                "Task not found."
            );
        }

        const membership =
            await ProjectMember.findOne({
                project:
                    task.project,

                user:
                    userId,
            })
                .select(
                    "role"
                )
                .lean();

        if (!membership) {
            throw new ApiError(
                403,
                "You are not a member of this project."
            );
        }

        const canManageTask =
            membership.role ===
                ProjectRole.ADMIN ||
            task.createdBy.toString() ===
                userId;

        if (!canManageTask) {
            throw new ApiError(
                403,
                "You do not have permission to archive this task."
            );
        }

        const project =
            await Project.findById(
                task.project
            )
                .select(
                    "_id workspace isArchived"
                )
                .lean();

        if (!project) {
            throw new ApiError(
                404,
                "Project not found."
            );
        }

        const workspace =
            await Workspace.findById(
                project.workspace
            )
                .select(
                    "_id isArchived"
                )
                .lean();

        if (!workspace) {
            throw new ApiError(
                404,
                "Workspace not found."
            );
        }

        if (workspace.isArchived) {
            throw new ApiError(
                409,
                "Tasks cannot be archived while the workspace is archived."
            );
        }

        if (project.isArchived) {
            throw new ApiError(
                409,
                "Tasks cannot be archived inside an archived project."
            );
        }

        if (task.isArchived) {
            throw new ApiError(
                409,
                "Task is already archived."
            );
        }

        task.isArchived =
            true;

        task.updatedBy =
            new Types.ObjectId(
                userId
            );

        await task.save();
    }

    /*
    |--------------------------------------------------------------------------
    | Restore Task
    |--------------------------------------------------------------------------
    */

    async restoreTask(
        taskId: string,
        userId: string
    ): Promise<void> {
        const task =
            await Task.findById(
                taskId
            );

        if (!task) {
            throw new ApiError(
                404,
                "Task not found."
            );
        }

        const membership =
            await ProjectMember.findOne({
                project:
                    task.project,

                user:
                    userId,
            })
                .select(
                    "role"
                )
                .lean();

        if (!membership) {
            throw new ApiError(
                403,
                "You are not a member of this project."
            );
        }

        const canManageTask =
            membership.role ===
                ProjectRole.ADMIN ||
            task.createdBy.toString() ===
                userId;

        if (!canManageTask) {
            throw new ApiError(
                403,
                "You do not have permission to restore this task."
            );
        }

        const project =
            await Project.findById(
                task.project
            )
                .select(
                    "_id workspace isArchived"
                )
                .lean();

        if (!project) {
            throw new ApiError(
                404,
                "Project not found."
            );
        }

        const workspace =
            await Workspace.findById(
                project.workspace
            )
                .select(
                    "_id isArchived"
                )
                .lean();

        if (!workspace) {
            throw new ApiError(
                404,
                "Workspace not found."
            );
        }

        if (workspace.isArchived) {
            throw new ApiError(
                409,
                "Restore the workspace before restoring this task."
            );
        }

        if (project.isArchived) {
            throw new ApiError(
                409,
                "Restore the project before restoring this task."
            );
        }

        if (!task.isArchived) {
            throw new ApiError(
                409,
                "Task is already active."
            );
        }

        task.isArchived =
            false;

        task.updatedBy =
            new Types.ObjectId(
                userId
            );

        await task.save();
    }
}

export default new TaskService();