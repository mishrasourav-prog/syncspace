import {
    Types,
    type FilterQuery,
} from "mongoose";

import type {
    ICreateProjectDocumentInput,
    IProjectDocumentListQuery,
    IProjectDocumentListResponse,
    IProjectDocumentResponse,
    IUpdateProjectDocumentInput,
} from "../../interfaces/document.interface";

import {
    DomainEventName,
    eventBus,
} from "../../events";

import ApiError from "../../utils/ApiError";

import Project from "../project/project.model";

import ProjectMember from "../projectMember/projectMember.model";

import { ProjectRole } from "../../interfaces/projectMember.interface";

import ProjectDocument, {
    type IProjectDocument,
} from "./document.model";

import {
    mapProjectDocument,
    type IProjectDocumentForResponse,
} from "./document.mapper";

interface IProjectContext {
    project: {
        _id: Types.ObjectId;

        workspace: Types.ObjectId;

        isArchived: boolean;
    };

    membership: {
        role: ProjectRole;
    };
}

interface IDocumentContext {
    _id: Types.ObjectId;

    workspace: Types.ObjectId;

    project: Types.ObjectId;

    title: string;

    createdBy: Types.ObjectId;

    revision: number;

    isArchived: boolean;
}

class DocumentService {
    private async getProjectContext(
        projectId: string,
        userId: string,
        mutation:
            boolean
    ): Promise<IProjectContext> {
        const project =
            await Project.findById(
                projectId
            )
                .select(
                    "_id workspace isArchived"
                )
                .lean<{
                    _id: Types.ObjectId;

                    workspace: Types.ObjectId;

                    isArchived: boolean;
                }>();

        if (!project) {
            throw new ApiError(
                404,
                "Project not found."
            );
        }

        const membership =
            await ProjectMember
                .findOne({
                    project:
                        project._id,

                    user:
                        new Types.ObjectId(
                            userId
                        ),
                })
                .select(
                    "role"
                )
                .lean<{
                    role: ProjectRole;
                }>();

        /*
        A non-member should not learn that
        the private project exists.
        */
        if (!membership) {
            throw new ApiError(
                404,
                "Project not found."
            );
        }

        if (
            mutation &&
            project.isArchived
        ) {
            throw new ApiError(
                409,
                "Archived projects are read-only."
            );
        }

        return {
            project,
            membership,
        };
    }

    private async getDocumentContext(
        documentId: string
    ): Promise<IDocumentContext> {
        const document =
            await ProjectDocument
                .findById(
                    documentId
                )
                .select(
                    "_id workspace project title createdBy revision isArchived"
                )
                .lean<IDocumentContext>();

        if (!document) {
            throw new ApiError(
                404,
                "Document not found."
            );
        }

        return document;
    }

    private async getDocumentForResponse(
        documentId:
            string |
            Types.ObjectId
    ): Promise<IProjectDocumentResponse> {
        const document =
            await ProjectDocument
                .findById(
                    documentId
                )
                .populate(
                    "createdBy",
                    "name username avatar"
                )
                .populate(
                    "updatedBy",
                    "name username avatar"
                )
                .lean()
                .exec();

        if (!document) {
            throw new ApiError(
                404,
                "Document not found."
            );
        }

        return mapProjectDocument(
            document as unknown as
                IProjectDocumentForResponse
        );
    }

    async createDocument(
        projectId: string,
        userId: string,
        data:
            ICreateProjectDocumentInput
    ): Promise<IProjectDocumentResponse> {
        const {
            project,
        } =
            await this.getProjectContext(
                projectId,
                userId,
                true
            );

        const document =
            await ProjectDocument.create({
                workspace:
                    project.workspace,

                project:
                    project._id,

                title:
                    data.title,

                content:
                    data.content ??
                    null,

                createdBy:
                    new Types.ObjectId(
                        userId
                    ),

                updatedBy:
                    new Types.ObjectId(
                        userId
                    ),
            });

        await eventBus.publish(
            DomainEventName.DOCUMENT_CREATED,
            {
                workspaceId:
                    project.workspace
                        .toString(),

                projectId:
                    project._id
                        .toString(),

                documentId:
                    document._id
                        .toString(),

                actorId:
                    userId,

                title:
                    document.title,

                revision:
                    document.revision,
            }
        );

        return this.getDocumentForResponse(
            document._id
        );
    }

    async getProjectDocuments(
        projectId: string,
        userId: string,
        query:
            IProjectDocumentListQuery
    ): Promise<IProjectDocumentListResponse> {
        await this.getProjectContext(
            projectId,
            userId,
            false
        );

        const filter:
            FilterQuery<IProjectDocument> = {
                project:
                    new Types.ObjectId(
                        projectId
                    ),

                isArchived:
                    query.isArchived ??
                    false,
            };

        if (query.cursor) {
            filter._id = {
                $lt:
                    new Types.ObjectId(
                        query.cursor
                    ),
            };
        }

        if (query.search) {
            const escapedSearch =
                query.search.replace(
                    /[.*+?^${}()|[\]\\]/g,
                    "\\$&"
                );

            filter.title = {
                $regex:
                    escapedSearch,

                $options:
                    "i",
            };
        }

        const documents =
            await ProjectDocument
                .find(
                    filter
                )
                .sort({
                    _id: -1,
                })
                .limit(
                    query.limit +
                    1
                )
                .populate(
                    "createdBy",
                    "name username avatar"
                )
                .populate(
                    "updatedBy",
                    "name username avatar"
                )
                .lean()
                .exec();

        const hasMore =
            documents.length >
            query.limit;

        const selectedDocuments =
            hasMore
                ? documents.slice(
                    0,
                    query.limit
                )
                : documents;

        const nextCursor =
            hasMore
                ? selectedDocuments[
                    selectedDocuments.length -
                    1
                ]?._id.toString() ??
                null
                : null;

        return {
            documents:
                selectedDocuments.map(
                    (document) =>
                        mapProjectDocument(
                            document as unknown as
                                IProjectDocumentForResponse
                        )
                ),

            nextCursor,
        };
    }

    async getDocumentById(
        documentId: string,
        userId: string
    ): Promise<IProjectDocumentResponse> {
        const document =
            await this.getDocumentContext(
                documentId
            );

        await this.getProjectContext(
            document.project.toString(),
            userId,
            false
        );

        return this.getDocumentForResponse(
            documentId
        );
    }

    async updateDocument(
        documentId: string,
        userId: string,
        data:
            IUpdateProjectDocumentInput
    ): Promise<IProjectDocumentResponse> {
        const existingDocument =
            await this.getDocumentContext(
                documentId
            );

        await this.getProjectContext(
            existingDocument.project
                .toString(),
            userId,
            true
        );

        if (
            existingDocument.isArchived
        ) {
            throw new ApiError(
                409,
                "Archived documents are read-only."
            );
        }

        if (
            existingDocument.revision !==
            data.expectedRevision
        ) {
            throw new ApiError(
                409,
                "This document was modified by another user. Refresh it before saving again."
            );
        }

        const updates:
            Record<string, unknown> = {
                updatedBy:
                    new Types.ObjectId(
                        userId
                    ),
            };

        if (
            data.title !==
            undefined
        ) {
            updates.title =
                data.title;
        }

        if (
            data.content !==
            undefined
        ) {
            updates.content =
                data.content;
        }

        /*
        revision is included in the filter.

        If another request updates the document between our
        initial read and this update, this query returns null.
        */
        const updatedDocument =
            await ProjectDocument
                .findOneAndUpdate(
                    {
                        _id:
                            existingDocument._id,

                        revision:
                            data.expectedRevision,

                        isArchived:
                            false,
                    },
                    {
                        $set:
                            updates,

                        $inc: {
                            revision:
                                1,
                        },
                    },
                    {
                        new:
                            true,
                    }
                )
                .select(
                    "_id workspace project title revision"
                )
                .lean<{
                    _id: Types.ObjectId;

                    workspace: Types.ObjectId;

                    project: Types.ObjectId;

                    title: string;

                    revision: number;
                }>();

        if (!updatedDocument) {
            throw new ApiError(
                409,
                "This document was modified by another user. Refresh it before saving again."
            );
        }

        await eventBus.publish(
            DomainEventName.DOCUMENT_UPDATED,
            {
                workspaceId:
                    updatedDocument.workspace
                        .toString(),

                projectId:
                    updatedDocument.project
                        .toString(),

                documentId:
                    updatedDocument._id
                        .toString(),

                actorId:
                    userId,

                title:
                    updatedDocument.title,

                revision:
                    updatedDocument.revision,
            }
        );

        return this.getDocumentForResponse(
            documentId
        );
    }

    async archiveDocument(
        documentId: string,
        userId: string
    ): Promise<IProjectDocumentResponse> {
        const document =
            await this.getDocumentContext(
                documentId
            );

        const {
            membership,
        } =
            await this.getProjectContext(
                document.project
                    .toString(),
                userId,
                true
            );

        const canArchive =
            document.createdBy.toString() ===
                userId ||
            membership.role ===
                ProjectRole.ADMIN;

        if (!canArchive) {
            throw new ApiError(
                403,
                "Only the document creator or a project admin can archive this document."
            );
        }

        if (
            document.isArchived
        ) {
            throw new ApiError(
                409,
                "Document is already archived."
            );
        }

        const archivedDocument =
            await ProjectDocument
                .findOneAndUpdate(
                    {
                        _id:
                            document._id,

                        isArchived:
                            false,
                    },
                    {
                        $set: {
                            isArchived:
                                true,

                            archivedAt:
                                new Date(),

                            archivedBy:
                                new Types.ObjectId(
                                    userId
                                ),

                            updatedBy:
                                new Types.ObjectId(
                                    userId
                                ),
                        },

                        $inc: {
                            revision:
                                1,
                        },
                    },
                    {
                        new:
                            true,
                    }
                )
                .select(
                    "_id workspace project title revision"
                )
                .lean<{
                    _id: Types.ObjectId;

                    workspace: Types.ObjectId;

                    project: Types.ObjectId;

                    title: string;

                    revision: number;
                }>();

        if (!archivedDocument) {
            throw new ApiError(
                409,
                "Document could not be archived."
            );
        }

        await eventBus.publish(
            DomainEventName.DOCUMENT_ARCHIVED,
            {
                workspaceId:
                    archivedDocument.workspace
                        .toString(),

                projectId:
                    archivedDocument.project
                        .toString(),

                documentId:
                    archivedDocument._id
                        .toString(),

                actorId:
                    userId,

                title:
                    archivedDocument.title,

                revision:
                    archivedDocument.revision,
            }
        );

        return this.getDocumentForResponse(
            documentId
        );
    }

    async restoreDocument(
        documentId: string,
        userId: string
    ): Promise<IProjectDocumentResponse> {
        const document =
            await this.getDocumentContext(
                documentId
            );

        const {
            membership,
        } =
            await this.getProjectContext(
                document.project
                    .toString(),
                userId,
                true
            );

        const canRestore =
            document.createdBy.toString() ===
                userId ||
            membership.role ===
                ProjectRole.ADMIN;

        if (!canRestore) {
            throw new ApiError(
                403,
                "Only the document creator or a project admin can restore this document."
            );
        }

        if (
            !document.isArchived
        ) {
            throw new ApiError(
                409,
                "Document is not archived."
            );
        }

        const restoredDocument =
            await ProjectDocument
                .findOneAndUpdate(
                    {
                        _id:
                            document._id,

                        isArchived:
                            true,
                    },
                    {
                        $set: {
                            isArchived:
                                false,

                            archivedAt:
                                null,

                            archivedBy:
                                null,

                            updatedBy:
                                new Types.ObjectId(
                                    userId
                                ),
                        },

                        $inc: {
                            revision:
                                1,
                        },
                    },
                    {
                        new:
                            true,
                    }
                )
                .select(
                    "_id workspace project title revision"
                )
                .lean<{
                    _id: Types.ObjectId;

                    workspace: Types.ObjectId;

                    project: Types.ObjectId;

                    title: string;

                    revision: number;
                }>();

        if (!restoredDocument) {
            throw new ApiError(
                409,
                "Document could not be restored."
            );
        }

        await eventBus.publish(
            DomainEventName.DOCUMENT_RESTORED,
            {
                workspaceId:
                    restoredDocument.workspace
                        .toString(),

                projectId:
                    restoredDocument.project
                        .toString(),

                documentId:
                    restoredDocument._id
                        .toString(),

                actorId:
                    userId,

                title:
                    restoredDocument.title,

                revision:
                    restoredDocument.revision,
            }
        );

        return this.getDocumentForResponse(
            documentId
        );
    }
}

const documentService =
    new DocumentService();

export default documentService;