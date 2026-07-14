import { Types } from "mongoose";

import { ITaskCommentDocument } from "../modules/taskComment/taskComment.model";

/*
|--------------------------------------------------------------------------
| Request Interfaces
|--------------------------------------------------------------------------
*/

export interface ICreateTaskComment {
    body: string;
}

export interface IUpdateTaskComment {
    body: string;
}

/*
|--------------------------------------------------------------------------
| Comment List Query
|--------------------------------------------------------------------------
*/

export interface IGetTaskCommentsQuery {
    cursor?: string;
    limit: number;
}

/*
|--------------------------------------------------------------------------
| Author Types
|--------------------------------------------------------------------------
*/

/*
Used internally after Mongoose populate().
ObjectId remains a MongoDB ObjectId inside the service layer.
*/
export interface ITaskCommentAuthorDocument {
    _id: Types.ObjectId;
    name: string;
    username: string;
    avatar?: string;
}

/*
Public API representation.
Do not expose the author's email address.
*/
export interface ITaskCommentAuthor {
    _id: string;
    name: string;
    username: string;
    avatar?: string;
}

/*
|--------------------------------------------------------------------------
| Populated Document Type
|--------------------------------------------------------------------------
*/

export type ITaskCommentPopulatedDocument =
    Omit<ITaskCommentDocument, "author"> & {
        author: ITaskCommentAuthorDocument | null;
    };

/*
|--------------------------------------------------------------------------
| Response Interfaces
|--------------------------------------------------------------------------
*/

export interface ITaskCommentResponse {
    _id: string;

    task: string;

    /*
    Nullable because the referenced user could be deleted,
    deactivated, or unavailable.
    */
    author: ITaskCommentAuthor | null;

    body: string;

    isEdited: boolean;

    editedAt?: Date;

    isDeleted: boolean;

    deletedAt?: Date;

    createdAt: Date;

    updatedAt: Date;
}

export interface ITaskCommentsResponse {
    comments: ITaskCommentResponse[];

    nextCursor: string | null;

    hasMore: boolean;
}