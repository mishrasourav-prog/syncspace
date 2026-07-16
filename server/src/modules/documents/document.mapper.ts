import {
    Types,
} from "mongoose";

import type {
    IDocumentUserPreview,
    IProjectDocumentResponse,
} from "../../interfaces/document.interface";

interface IPopulatedDocumentUser {
    _id: Types.ObjectId;

    name: string;

    username: string;

    avatar?: string;
}

export interface IProjectDocumentForResponse {
    _id: Types.ObjectId;

    workspace: Types.ObjectId;

    project: Types.ObjectId;

    title: string;

    content: unknown;

    createdBy:
        IPopulatedDocumentUser |
        null;

    updatedBy:
        IPopulatedDocumentUser |
        null;

    revision: number;

    isArchived: boolean;

    archivedAt?:
        Date |
        null;

    createdAt: Date;

    updatedAt: Date;
}

const mapUserPreview = (
    user:
        IPopulatedDocumentUser |
        null
): IDocumentUserPreview | null => {
    if (!user) {
        return null;
    }

    return {
        _id:
            user._id.toString(),

        name:
            user.name,

        username:
            user.username,

        avatar:
            user.avatar,
    };
};

export const mapProjectDocument = (
    document:
        IProjectDocumentForResponse
): IProjectDocumentResponse => {
    return {
        _id:
            document._id.toString(),

        workspace:
            document.workspace.toString(),

        project:
            document.project.toString(),

        title:
            document.title,

        content:
            document.content,

        createdBy:
            mapUserPreview(
                document.createdBy
            ),

        updatedBy:
            mapUserPreview(
                document.updatedBy
            ),

        revision:
            document.revision,

        isArchived:
            document.isArchived,

        archivedAt:
            document.archivedAt ??
            null,

        createdAt:
            document.createdAt,

        updatedAt:
            document.updatedAt,
    };
};