export interface IAssignTask {

    userId: string;

}

export interface ITaskAssigneeResponse {

    _id: string;

    task: string;

    user: {

        _id: string;

        name: string;

        username: string;

        email: string;

        avatar?: string;

    };

    assignedBy: string;

    assignedAt: Date;

}

export interface ITaskAssigneesResponse {

    assignees: ITaskAssigneeResponse[];

}




