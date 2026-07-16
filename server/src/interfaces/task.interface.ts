

import { TaskPriority , TaskStatus , TaskType } from "../modules/tasks/task.model";
export interface ITaskAssigneePreview {

    _id: string;

    name: string;

    username: string;

    avatar?: string;

}

export interface ITaskResponse {

    _id: string;

    project: string;

    title: string;

    description: string;

    status: TaskStatus;

    priority: TaskPriority;

    createdBy: string;

    updatedBy?: string;

    completedBy?: string;

    startDate?: Date;

    dueDate?: Date;

    completedAt?: Date;

    type?:TaskType;

    parentTask?: string;

    position: number;

    assignees: ITaskAssigneePreview[];

    isArchived: boolean;

    createdAt: Date;

    updatedAt: Date;
}

export interface ITasksResponse {

    tasks: ITaskResponse[];

}

export interface ICreateTask {

    title: string;

    description?: string;

    priority?: TaskPriority;

    startDate?: Date;

    dueDate?: Date;

    parentTask?: string;

    type?:TaskType

}

export interface IUpdateTask {

    title?: string;

    description?: string;

    priority?: TaskPriority;

    startDate?: Date | null;

    dueDate?: Date | null;

    parentTask?: string | null;

    type?:TaskType;

}

export interface IUpdateTaskStatus {
    status: TaskStatus;
}

export interface ITaskReorderColumnInput {
    status: TaskStatus;

    /*
    Task IDs must be supplied in the exact order
    in which they should appear in this column.
    */
    taskIds: string[];
}

export interface IReorderProjectTasksInput {
    columns:
        ITaskReorderColumnInput[];
}

export interface IReorderProjectTasksResponse {
    updatedTaskCount: number;
}