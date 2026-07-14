// import { IAssignTask , ITaskAssigneeResponse , ITaskAssigneesResponse } from "../../interfaces/taskAssignee.interface";
// import ApiError from "../../utils/ApiError";
// import Task from "../tasks/task.model";
// import ProjectMember from "../projectMember/projectMember.model";
// import TaskAssignee from "./taskAssignee.model";


// export class TaskAssigneeService{

   
//     async assignMember(
//     taskId: string,
//     userId: string,
//     assigneeId: string
// ): Promise<ITaskAssigneeResponse> {

//     /*
//     |--------------------------------------------------------------------------
//     | Verify Task
//     |--------------------------------------------------------------------------
//     */

//     const task = await Task.findById(taskId);

//     if (!task || task.isArchived) {
//         throw new ApiError(
//             404,
//             "Task not found."
//         );
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Verify Requester
//     |--------------------------------------------------------------------------
//     */

//     const requester =
//         await ProjectMember.findOne({
//             project: task.project,
//             user: userId,
//         });

//     if (!requester) {
//         throw new ApiError(
//             403,
//             "You are not a member of this project."
//         );
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Verify Assignee
//     |--------------------------------------------------------------------------
//     */

//     const assigneeMember =
//         await ProjectMember.findOne({
//             project: task.project,
//             user: assigneeId,
//         });

//     if (!assigneeMember) {
//         throw new ApiError(
//             400,
//             "User is not a member of this project."
//         );
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Already Assigned?
//     |--------------------------------------------------------------------------
//     */

//     const existing =
//         await TaskAssignee.findOne({
//             task: taskId,
//             user: assigneeId,
//         });

//     if (existing) {
//         throw new ApiError(
//             409,
//             "User is already assigned."
//         );
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Create Assignment
//     |--------------------------------------------------------------------------
//     */

//     const assignment =
//         await TaskAssignee.create({
//             task: taskId,
//             user: assigneeId,
//             assignedBy: userId,
//         });

//     await assignment.populate(
//         "user",
//         "name username email avatar"
//     );

//     /*
//     |--------------------------------------------------------------------------
//     | Event (Later)
//     |--------------------------------------------------------------------------
//     */

//     // eventDispatcher.publish(
//     //     new TaskAssignedEvent(...)
//     // );

//     return {
//         _id: assignment._id.toString(),
//         task: assignment.task.toString(),
//         user: {
//             _id: (assignment.user as any)._id.toString(),
//             name: (assignment.user as any).name,
//             username: (assignment.user as any).username,
//             email: (assignment.user as any).email,
//             avatar: (assignment.user as any).avatar,
//         },
//         assignedBy: assignment.assignedBy.toString(),
//         assignedAt: assignment.assignedAt,
//     };
// }

// async getTaskAssignees(
//     taskId: string,
//     userId: string
// ): Promise<ITaskAssigneesResponse> {

//     /*
//     |--------------------------------------------------------------------------
//     | Verify Task
//     |--------------------------------------------------------------------------
//     */

//     const task = await Task.findById(taskId);

//     if (!task || task.isArchived) {
//         throw new ApiError(
//             404,
//             "Task not found."
//         );
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Verify Membership
//     |--------------------------------------------------------------------------
//     */

//     const membership =
//         await ProjectMember.findOne({
//             project: task.project,
//             user: userId,
//         });

//     if (!membership) {
//         throw new ApiError(
//             403,
//             "You are not a member of this project."
//         );
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Fetch Assignees
//     |--------------------------------------------------------------------------
//     */

//     const assignees = await TaskAssignee.find({
//         task: taskId,
//     })
//     .populate(
//         "user",
//         "name username email avatar"
//     )
//     .sort({
//         assignedAt: 1,
//     });

//     /*
//     |--------------------------------------------------------------------------
//     | Return
//     |--------------------------------------------------------------------------
//     */

//     return {
//         assignees: assignees.map((assignee) => ({
//             _id: assignee._id.toString(),

//             task: assignee.task.toString(),

//             user: {
//                 _id: (assignee.user as any)._id.toString(),
//                 name: (assignee.user as any).name,
//                 username: (assignee.user as any).username,
//                 email: (assignee.user as any).email,
//                 avatar: (assignee.user as any).avatar,
//             },

//             assignedBy:
//                 assignee.assignedBy.toString(),

//             assignedAt:
//                 assignee.assignedAt,
//         })),
//     };
// }

// async removeAssignee(
//     taskId: string,
//     assigneeId: string,
//     userId: string
// ): Promise<void> {

//     /*
//     |--------------------------------------------------------------------------
//     | Verify Task
//     |--------------------------------------------------------------------------
//     */

//     const task = await Task.findById(taskId);

//     if (!task || task.isArchived) {
//         throw new ApiError(
//             404,
//             "Task not found."
//         );
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Verify Membership
//     |--------------------------------------------------------------------------
//     */

//     const membership =
//         await ProjectMember.findOne({
//             project: task.project,
//             user: userId,
//         });

//     if (!membership) {
//         throw new ApiError(
//             403,
//             "You are not a member of this project."
//         );
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Find Assignment
//     |--------------------------------------------------------------------------
//     */

//     const assignment =
//         await TaskAssignee.findOne({
//             task: taskId,
//             user: assigneeId,
//         });

//     if (!assignment) {
//         throw new ApiError(
//             404,
//             "User is not assigned to this task."
//         );
//     }

//     /*
//     |--------------------------------------------------------------------------
//     | Delete Assignment
//     |--------------------------------------------------------------------------
//     */

//     await assignment.deleteOne();

//     /*
//     |--------------------------------------------------------------------------
//     | Event (Later)
//     |--------------------------------------------------------------------------
//     */

//     // eventDispatcher.publish(
//     //     new TaskUnassignedEvent(...)
//     // );
// }

// }

// export default new TaskAssigneeService;


import { Types } from "mongoose";

import ApiError from "../../utils/ApiError";

import Task, {
    ITaskDocument,
} from "../tasks/task.model";

import Project, {
    IProjectDocument,
} from "../project/project.model";

import ProjectMember from "../projectMember/projectMember.model";

import {
    Workspace,
    IWorkspaceDocument,
} from "../workspace/workspace.model";

import {
    WorkspaceMember,
} from "../workspace-member/workspace-member.model";

import TaskAssignee from "./taskAssignee.model";

import {
    ITaskAssigneeResponse,
    ITaskAssigneesResponse,
} from "../../interfaces/taskAssignee.interface";

/*
|--------------------------------------------------------------------------
| Internal Populate Types
|--------------------------------------------------------------------------
*/

interface IPopulatedAssigneeUser {
    _id: Types.ObjectId;

    name: string;

    username: string;

    email: string;

    avatar?: string;
}

interface IAssignmentRecord {
    _id: Types.ObjectId;

    task: Types.ObjectId;

    assignedBy: Types.ObjectId;

    assignedAt: Date;
}

interface ITaskAssignmentContext {
    task: ITaskDocument;

    project: IProjectDocument;

    workspace: IWorkspaceDocument;
}

export class TaskAssigneeService {
    /*
    |--------------------------------------------------------------------------
    | Map Assignment
    |--------------------------------------------------------------------------
    */

    private mapAssignment(
        assignment: IAssignmentRecord,
        user: IPopulatedAssigneeUser
    ): ITaskAssigneeResponse {
        return {
            _id:
                assignment._id.toString(),

            task:
                assignment.task.toString(),

            user: {
                _id:
                    user._id.toString(),

                name:
                    user.name,

                username:
                    user.username,

                email:
                    user.email,

                avatar:
                    user.avatar,
            },

            assignedBy:
                assignment.assignedBy.toString(),

            assignedAt:
                assignment.assignedAt,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Load and Authorize Task Context
    |--------------------------------------------------------------------------
    |
    | This verifies that the requester is both:
    |
    | 1. a project member
    | 2. a current member of the parent workspace
    |
    */

    private async getTaskContextForMember(
        taskId: string,
        userId: string
    ): Promise<ITaskAssignmentContext> {
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

        const [
            project,
            projectMembership,
        ] = await Promise.all([
            Project.findById(
                task.project
            ),

            ProjectMember.exists({
                project:
                    task.project,

                user:
                    userId,
            }),
        ]);

        if (!projectMembership) {
            throw new ApiError(
                403,
                "You are not a member of this project."
            );
        }

        if (!project) {
            throw new ApiError(
                404,
                "Project not found."
            );
        }

        const [
            workspace,
            workspaceMembership,
        ] = await Promise.all([
            Workspace.findById(
                project.workspace
            ),

            WorkspaceMember.exists({
                workspace:
                    project.workspace,

                user:
                    userId,
            }),
        ]);

        if (!workspaceMembership) {
            throw new ApiError(
                403,
                "You are no longer a member of this workspace."
            );
        }

        if (!workspace) {
            throw new ApiError(
                404,
                "Workspace not found."
            );
        }

        return {
            task,
            project,
            workspace,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Verify Assignment State Is Writable
    |--------------------------------------------------------------------------
    */

    private assertAssignmentsAreWritable(
        context: ITaskAssignmentContext
    ): void {
        if (
            context.workspace.isArchived
        ) {
            throw new ApiError(
                409,
                "Task assignments cannot be changed while the workspace is archived."
            );
        }

        if (
            context.project.isArchived
        ) {
            throw new ApiError(
                409,
                "Task assignments cannot be changed inside an archived project."
            );
        }

        if (
            context.task.isArchived
        ) {
            throw new ApiError(
                409,
                "Task assignments cannot be changed on an archived task."
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Assign Member
    |--------------------------------------------------------------------------
    */

    async assignMember(
        taskId: string,
        userId: string,
        assigneeId: string
    ): Promise<ITaskAssigneeResponse> {
        const context =
            await this.getTaskContextForMember(
                taskId,
                userId
            );

        this.assertAssignmentsAreWritable(
            context
        );

        /*
        |--------------------------------------------------------------------------
        | Verify Target User Membership
        |--------------------------------------------------------------------------
        */

        const [
            assigneeProjectMembership,
            assigneeWorkspaceMembership,
        ] = await Promise.all([
            ProjectMember.exists({
                project:
                    context.project._id,

                user:
                    assigneeId,
            }),

            WorkspaceMember.exists({
                workspace:
                    context.workspace._id,

                user:
                    assigneeId,
            }),
        ]);

        if (
            !assigneeProjectMembership ||
            !assigneeWorkspaceMembership
        ) {
            throw new ApiError(
                409,
                "The user must be a current member of both the project and workspace."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Check Existing Assignment
        |--------------------------------------------------------------------------
        */

        const existingAssignment =
            await TaskAssignee.exists({
                task:
                    context.task._id,

                user:
                    assigneeId,
            });

        if (existingAssignment) {
            throw new ApiError(
                409,
                "User is already assigned to this task."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Create Assignment
        |--------------------------------------------------------------------------
        */

        const assignment =
            await TaskAssignee.create({
                task:
                    context.task._id,

                user:
                    new Types.ObjectId(
                        assigneeId
                    ),

                assignedBy:
                    new Types.ObjectId(
                        userId
                    ),
            });

        /*
        The compound unique index on task + user protects
        against concurrent duplicate-assignment requests.
        */

        const populatedAssignment =
            await assignment.populate<{
                user:
                    IPopulatedAssigneeUser |
                    null;
            }>(
                "user",
                "name username email avatar"
            );

        if (
            !populatedAssignment.user
        ) {
            throw new ApiError(
                409,
                "The assigned user is no longer available."
            );
        }

        /*
        Future domain-event boundary:

        TaskAssignedEvent should be published here,
        after successful persistence.
        */

        return this.mapAssignment(
            populatedAssignment,
            populatedAssignment.user
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Get Task Assignees
    |--------------------------------------------------------------------------
    */

    async getTaskAssignees(
        taskId: string,
        userId: string
    ): Promise<ITaskAssigneesResponse> {
        await this.getTaskContextForMember(
            taskId,
            userId
        );

        /*
        Archived resources remain readable, so there is
        intentionally no archived-state rejection here.
        */

        const assignments =
            await TaskAssignee.find({
                task:
                    taskId,
            })
                .populate<{
                    user:
                        IPopulatedAssigneeUser |
                        null;
                }>(
                    "user",
                    "name username email avatar"
                )
                .sort({
                    assignedAt: 1,
                    _id: 1,
                })
                .exec();

        const assignees:
            ITaskAssigneeResponse[] = [];

        for (
            const assignment of
            assignments
        ) {
            /*
            A missing referenced user should not crash
            the complete assignee list.
            */
            if (!assignment.user) {
                continue;
            }

            assignees.push(
                this.mapAssignment(
                    assignment,
                    assignment.user
                )
            );
        }

        return {
            assignees,
        };
    }

    /*
    |--------------------------------------------------------------------------
    | Remove Assignee
    |--------------------------------------------------------------------------
    */

    async removeAssignee(
        taskId: string,
        assigneeId: string,
        userId: string
    ): Promise<void> {
        const context =
            await this.getTaskContextForMember(
                taskId,
                userId
            );

        this.assertAssignmentsAreWritable(
            context
        );

        /*
        |--------------------------------------------------------------------------
        | Find Assignment
        |--------------------------------------------------------------------------
        */

        const assignment =
            await TaskAssignee.findOne({
                task:
                    context.task._id,

                user:
                    assigneeId,
            });

        if (!assignment) {
            throw new ApiError(
                404,
                "User is not assigned to this task."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Delete Assignment
        |--------------------------------------------------------------------------
        */

        await assignment.deleteOne();

        /*
        Future domain-event boundary:

        TaskUnassignedEvent should be published here,
        after successful deletion.
        */
    }
}

export default new TaskAssigneeService();