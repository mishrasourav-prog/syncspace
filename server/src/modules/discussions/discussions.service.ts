import {
    Types,
    type FilterQuery,
} from "mongoose";

import {
    DomainEventName,
    eventBus,
} from "../../events";

import type {
    ICreateDiscussionInput,
    ICreateDiscussionReplyInput,
    IDiscussionListQuery,
    IDiscussionListResponse,
    IDiscussionReplyListQuery,
    IDiscussionReplyListResponse,
    IDiscussionReplyResponse,
    IDiscussionResponse,
    IUpdateDiscussionInput,
    IUpdateDiscussionReplyInput,
} from "../../interfaces/discussions.interface";

import ApiError from "../../utils/ApiError";

import Project from "../project/project.model";

import ProjectMember from "../projectMember/projectMember.model";

import { ProjectRole } from "../../interfaces/projectMember.interface";

import Discussion, {
    type IDiscussion,
} from "./discussions.model";

import DiscussionReply from "./discussionsReply.model";

import {
    mapDiscussion,
    mapDiscussionReply,
    type IDiscussionForResponse,
    type IDiscussionReplyForResponse,
} from "./discussions.mapper";

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

interface IDiscussionContext {
    _id: Types.ObjectId;

    workspace: Types.ObjectId;

    project: Types.ObjectId;

    title: string;

    author: Types.ObjectId;

    isPinned: boolean;

    isLocked: boolean;

    isDeleted: boolean;
}

interface IReplyContext {
    _id: Types.ObjectId;

    project: Types.ObjectId;

    discussion: Types.ObjectId;

    author: Types.ObjectId;

    isDeleted: boolean;
}

class DiscussionService {
    private async getProjectContext(
        projectId: string,
        userId: string,
        mutation: boolean
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

    private async getDiscussionContext(
        discussionId: string
    ): Promise<IDiscussionContext> {
        const discussion =
            await Discussion.findById(
                discussionId
            )
                .select(
                    "_id workspace project title author isPinned isLocked isDeleted"
                )
                .lean<IDiscussionContext>();

        if (
            !discussion ||
            discussion.isDeleted
        ) {
            throw new ApiError(
                404,
                "Discussion not found."
            );
        }

        return discussion;
    }

    private async getReplyContext(
        replyId: string
    ): Promise<IReplyContext> {
        const reply =
            await DiscussionReply
                .findById(
                    replyId
                )
                .select(
                    "_id project discussion author isDeleted"
                )
                .lean<IReplyContext>();

        if (
            !reply ||
            reply.isDeleted
        ) {
            throw new ApiError(
                404,
                "Reply not found."
            );
        }

        return reply;
    }

    private async getDiscussionForResponse(
        discussionId:
            string |
            Types.ObjectId
    ): Promise<IDiscussionResponse> {
        const discussion =
            await Discussion
                .findById(
                    discussionId
                )
                .populate(
                    "author",
                    "name username avatar"
                )
                .lean()
                .exec();

        if (
            !discussion ||
            discussion.isDeleted
        ) {
            throw new ApiError(
                404,
                "Discussion not found."
            );
        }

        const replyCount =
            await DiscussionReply
                .countDocuments({
                    discussion:
                        discussion._id,

                    isDeleted:
                        false,
                });

        return mapDiscussion({
            ...(discussion as unknown as
                IDiscussionForResponse),

            replyCount,
        });
    }

    private async getReplyForResponse(
        replyId:
            string |
            Types.ObjectId
    ): Promise<IDiscussionReplyResponse> {
        const reply =
            await DiscussionReply
                .findById(
                    replyId
                )
                .populate(
                    "author",
                    "name username avatar"
                )
                .lean()
                .exec();

        if (!reply) {
            throw new ApiError(
                404,
                "Reply not found."
            );
        }

        return mapDiscussionReply(
            reply as unknown as
                IDiscussionReplyForResponse
        );
    }

    async createDiscussion(
        projectId: string,
        userId: string,
        data: ICreateDiscussionInput
    ): Promise<IDiscussionResponse> {
        const {
            project,
        } =
            await this.getProjectContext(
                projectId,
                userId,
                true
            );

        const discussion =
            await Discussion.create({
                workspace:
                    project.workspace,

                project:
                    project._id,

                title:
                    data.title,

                body:
                    data.body,

                author:
                    new Types.ObjectId(
                        userId
                    ),
            });

        await eventBus.publish(
            DomainEventName
                .DISCUSSION_CREATED,
            {
                workspaceId:
                    project.workspace
                        .toString(),

                projectId:
                    project._id
                        .toString(),

                discussionId:
                    discussion._id
                        .toString(),

                actorId:
                    userId,

                title:
                    discussion.title,
            }
        );

        return this.getDiscussionForResponse(
            discussion._id
        );
    }

    async getProjectDiscussions(
        projectId: string,
        userId: string,
        query: IDiscussionListQuery
    ): Promise<IDiscussionListResponse> {
        await this.getProjectContext(
            projectId,
            userId,
            false
        );

        const filter:
            FilterQuery<IDiscussion> = {
                project:
                    new Types.ObjectId(
                        projectId
                    ),

                isDeleted:
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

            filter.$or = [
                {
                    title: {
                        $regex:
                            escapedSearch,

                        $options:
                            "i",
                    },
                },
                {
                    body: {
                        $regex:
                            escapedSearch,

                        $options:
                            "i",
                    },
                },
            ];
        }

        const discussions =
            await Discussion
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
                    "author",
                    "name username avatar"
                )
                .lean()
                .exec();

        const hasMore =
            discussions.length >
            query.limit;

        const selected =
            hasMore
                ? discussions.slice(
                    0,
                    query.limit
                )
                : discussions;

        const discussionIds =
            selected.map(
                (discussion) =>
                    discussion._id
            );

        const replyCounts =
            await DiscussionReply
                .aggregate<{
                    _id: Types.ObjectId;

                    count: number;
                }>([
                    {
                        $match: {
                            discussion: {
                                $in:
                                    discussionIds,
                            },

                            isDeleted:
                                false,
                        },
                    },
                    {
                        $group: {
                            _id:
                                "$discussion",

                            count: {
                                $sum:
                                    1,
                            },
                        },
                    },
                ]);

        const replyCountMap =
            new Map(
                replyCounts.map(
                    (item) => [
                        item._id.toString(),
                        item.count,
                    ]
                )
            );

        return {
            discussions:
                selected.map(
                    (discussion) =>
                        mapDiscussion({
                            ...(discussion as unknown as
                                IDiscussionForResponse),

                            replyCount:
                                replyCountMap.get(
                                    discussion._id
                                        .toString()
                                ) ??
                                0,
                        })
                ),

            nextCursor:
                hasMore
                    ? selected[
                        selected.length -
                        1
                    ]?._id.toString() ??
                    null
                    : null,
        };
    }

    async getDiscussionById(
        discussionId: string,
        userId: string
    ): Promise<IDiscussionResponse> {
        const discussion =
            await this.getDiscussionContext(
                discussionId
            );

        await this.getProjectContext(
            discussion.project.toString(),
            userId,
            false
        );

        return this.getDiscussionForResponse(
            discussionId
        );
    }

    async updateDiscussion(
        discussionId: string,
        userId: string,
        data: IUpdateDiscussionInput
    ): Promise<IDiscussionResponse> {
        const discussion =
            await this.getDiscussionContext(
                discussionId
            );

        await this.getProjectContext(
            discussion.project.toString(),
            userId,
            true
        );

        if (
            discussion.author.toString() !==
            userId
        ) {
            throw new ApiError(
                403,
                "Only the discussion author can edit this discussion."
            );
        }

        if (discussion.isLocked) {
            throw new ApiError(
                409,
                "Locked discussions cannot be edited."
            );
        }

        const updatedDiscussion =
            await Discussion
                .findOneAndUpdate(
                    {
                        _id:
                            discussion._id,

                        isDeleted:
                            false,

                        isLocked:
                            false,
                    },
                    {
                        $set: {
                            ...(data.title !==
                                undefined && {
                                title:
                                    data.title,
                            }),

                            ...(data.body !==
                                undefined && {
                                body:
                                    data.body,
                            }),
                        },
                    },
                    {
                        new:
                            true,
                    }
                )
                .select(
                    "_id workspace project title"
                )
                .lean<{
                    _id: Types.ObjectId;

                    workspace:
                        Types.ObjectId;

                    project:
                        Types.ObjectId;

                    title: string;
                }>();

        if (!updatedDiscussion) {
            throw new ApiError(
                409,
                "Discussion could not be updated."
            );
        }

        await eventBus.publish(
            DomainEventName
                .DISCUSSION_UPDATED,
            {
                workspaceId:
                    updatedDiscussion.workspace
                        .toString(),

                projectId:
                    updatedDiscussion.project
                        .toString(),

                discussionId:
                    updatedDiscussion._id
                        .toString(),

                actorId:
                    userId,

                title:
                    updatedDiscussion.title,
            }
        );

        return this.getDiscussionForResponse(
            discussionId
        );
    }

    async deleteDiscussion(
        discussionId: string,
        userId: string
    ): Promise<void> {
        const discussion =
            await this.getDiscussionContext(
                discussionId
            );

        const {
            membership,
        } =
            await this.getProjectContext(
                discussion.project.toString(),
                userId,
                true
            );

        const canDelete =
            discussion.author.toString() ===
                userId ||
            membership.role ===
                ProjectRole.ADMIN;

        if (!canDelete) {
            throw new ApiError(
                403,
                "Only the discussion author or a project admin can delete this discussion."
            );
        }

        const result =
            await Discussion.updateOne(
                {
                    _id:
                        discussion._id,

                    isDeleted:
                        false,
                },
                {
                    $set: {
                        isDeleted:
                            true,

                        deletedAt:
                            new Date(),

                        deletedBy:
                            new Types.ObjectId(
                                userId
                            ),

                        body:
                            "",
                    },
                }
            );

        if (
            result.modifiedCount ===
            0
        ) {
            throw new ApiError(
                409,
                "Discussion could not be deleted."
            );
        }

        await eventBus.publish(
            DomainEventName
                .DISCUSSION_DELETED,
            {
                workspaceId:
                    discussion.workspace
                        .toString(),

                projectId:
                    discussion.project
                        .toString(),

                discussionId:
                    discussion._id
                        .toString(),

                actorId:
                    userId,

                title:
                    discussion.title,
            }
        );
    }

    private async updateModerationState(
        discussionId: string,
        userId: string,
        field:
            "isPinned" |
            "isLocked",
        value: boolean,
        eventName:
            | DomainEventName.DISCUSSION_PINNED
            | DomainEventName.DISCUSSION_UNPINNED
            | DomainEventName.DISCUSSION_LOCKED
            | DomainEventName.DISCUSSION_UNLOCKED
    ): Promise<IDiscussionResponse> {
        const discussion =
            await this.getDiscussionContext(
                discussionId
            );

        const {
            membership,
        } =
            await this.getProjectContext(
                discussion.project.toString(),
                userId,
                true
            );

        if (
            membership.role !==
            ProjectRole.ADMIN
        ) {
            throw new ApiError(
                403,
                "Only a project admin can change discussion moderation settings."
            );
        }

        if (
            discussion[field] ===
            value
        ) {
            throw new ApiError(
                409,
                `Discussion is already ${
                    value
                        ? field ===
                            "isPinned"
                            ? "pinned"
                            : "locked"
                        : field ===
                            "isPinned"
                            ? "unpinned"
                            : "unlocked"
                }.`
            );
        }

        const updated =
            await Discussion
                .findOneAndUpdate(
                    {
                        _id:
                            discussion._id,

                        isDeleted:
                            false,
                    },
                    {
                        $set: {
                            [field]:
                                value,
                        },
                    },
                    {
                        new:
                            true,
                    }
                )
                .select(
                    "_id workspace project title"
                )
                .lean<{
                    _id: Types.ObjectId;

                    workspace:
                        Types.ObjectId;

                    project:
                        Types.ObjectId;

                    title: string;
                }>();

        if (!updated) {
            throw new ApiError(
                409,
                "Discussion could not be updated."
            );
        }

        await eventBus.publish(
            eventName,
            {
                workspaceId:
                    updated.workspace
                        .toString(),

                projectId:
                    updated.project
                        .toString(),

                discussionId:
                    updated._id
                        .toString(),

                actorId:
                    userId,

                title:
                    updated.title,
            }
        );

        return this.getDiscussionForResponse(
            discussionId
        );
    }

    async pinDiscussion(
        discussionId: string,
        userId: string
    ): Promise<IDiscussionResponse> {
        return this.updateModerationState(
            discussionId,
            userId,
            "isPinned",
            true,
            DomainEventName
                .DISCUSSION_PINNED
        );
    }

    async unpinDiscussion(
        discussionId: string,
        userId: string
    ): Promise<IDiscussionResponse> {
        return this.updateModerationState(
            discussionId,
            userId,
            "isPinned",
            false,
            DomainEventName
                .DISCUSSION_UNPINNED
        );
    }

    async lockDiscussion(
        discussionId: string,
        userId: string
    ): Promise<IDiscussionResponse> {
        return this.updateModerationState(
            discussionId,
            userId,
            "isLocked",
            true,
            DomainEventName
                .DISCUSSION_LOCKED
        );
    }

    async unlockDiscussion(
        discussionId: string,
        userId: string
    ): Promise<IDiscussionResponse> {
        return this.updateModerationState(
            discussionId,
            userId,
            "isLocked",
            false,
            DomainEventName
                .DISCUSSION_UNLOCKED
        );
    }

    async createReply(
        discussionId: string,
        userId: string,
        data: ICreateDiscussionReplyInput
    ): Promise<IDiscussionReplyResponse> {
        const discussion =
            await this.getDiscussionContext(
                discussionId
            );

        await this.getProjectContext(
            discussion.project.toString(),
            userId,
            true
        );

        if (discussion.isLocked) {
            throw new ApiError(
                409,
                "This discussion is locked."
            );
        }

        const reply =
            await DiscussionReply.create({
                workspace:
                    discussion.workspace,

                project:
                    discussion.project,

                discussion:
                    discussion._id,

                author:
                    new Types.ObjectId(
                        userId
                    ),

                body:
                    data.body,
            });

        await eventBus.publish(
            DomainEventName
                .DISCUSSION_REPLY_CREATED,
            {
                workspaceId:
                    discussion.workspace
                        .toString(),

                projectId:
                    discussion.project
                        .toString(),

                discussionId:
                    discussion._id
                        .toString(),

                replyId:
                    reply._id
                        .toString(),

                actorId:
                    userId,

                discussionAuthorId:
                    discussion.author
                        .toString(),

                title:
                    discussion.title,
            }
        );

        return this.getReplyForResponse(
            reply._id
        );
    }

    async getReplies(
        discussionId: string,
        userId: string,
        query:
            IDiscussionReplyListQuery
    ): Promise<IDiscussionReplyListResponse> {
        const discussion =
            await this.getDiscussionContext(
                discussionId
            );

        await this.getProjectContext(
            discussion.project.toString(),
            userId,
            false
        );

        const filter:
            Record<string, unknown> = {
                discussion:
                    discussion._id,
            };

        if (query.cursor) {
            filter._id = {
                $gt:
                    new Types.ObjectId(
                        query.cursor
                    ),
            };
        }

        const replies =
            await DiscussionReply
                .find(
                    filter
                )
                .sort({
                    _id: 1,
                })
                .limit(
                    query.limit +
                    1
                )
                .populate(
                    "author",
                    "name username avatar"
                )
                .lean()
                .exec();

        const hasMore =
            replies.length >
            query.limit;

        const selected =
            hasMore
                ? replies.slice(
                    0,
                    query.limit
                )
                : replies;

        return {
            replies:
                selected.map(
                    (reply) =>
                        mapDiscussionReply(
                            reply as unknown as
                                IDiscussionReplyForResponse
                        )
                ),

            nextCursor:
                hasMore
                    ? selected[
                        selected.length -
                        1
                    ]?._id.toString() ??
                    null
                    : null,
        };
    }

    async updateReply(
        replyId: string,
        userId: string,
        data:
            IUpdateDiscussionReplyInput
    ): Promise<IDiscussionReplyResponse> {
        const reply =
            await this.getReplyContext(
                replyId
            );

        const discussion =
            await this.getDiscussionContext(
                reply.discussion
                    .toString()
            );

        await this.getProjectContext(
            reply.project.toString(),
            userId,
            true
        );

        if (
            reply.author.toString() !==
            userId
        ) {
            throw new ApiError(
                403,
                "Only the reply author can edit this reply."
            );
        }

        if (discussion.isLocked) {
            throw new ApiError(
                409,
                "Replies in locked discussions cannot be edited."
            );
        }

        const updated =
            await DiscussionReply
                .findOneAndUpdate(
                    {
                        _id:
                            reply._id,

                        isDeleted:
                            false,
                    },
                    {
                        $set: {
                            body:
                                data.body,
                        },
                    },
                    {
                        new:
                            true,
                    }
                );

        if (!updated) {
            throw new ApiError(
                409,
                "Reply could not be updated."
            );
        }

        await eventBus.publish(
            DomainEventName
                .DISCUSSION_REPLY_UPDATED,
            {
                workspaceId:
                    discussion.workspace
                        .toString(),

                projectId:
                    discussion.project
                        .toString(),

                discussionId:
                    discussion._id
                        .toString(),

                replyId:
                    reply._id
                        .toString(),

                actorId:
                    userId,

                discussionAuthorId:
                    discussion.author
                        .toString(),

                title:
                    discussion.title,
            }
        );

        return this.getReplyForResponse(
            replyId
        );
    }

    async deleteReply(
        replyId: string,
        userId: string
    ): Promise<void> {
        const reply =
            await this.getReplyContext(
                replyId
            );

        const discussion =
            await this.getDiscussionContext(
                reply.discussion
                    .toString()
            );

        const {
            membership,
        } =
            await this.getProjectContext(
                reply.project.toString(),
                userId,
                true
            );

        const canDelete =
            reply.author.toString() ===
                userId ||
            membership.role ===
                ProjectRole.ADMIN;

        if (!canDelete) {
            throw new ApiError(
                403,
                "Only the reply author or a project admin can delete this reply."
            );
        }

        const result =
            await DiscussionReply
                .updateOne(
                    {
                        _id:
                            reply._id,

                        isDeleted:
                            false,
                    },
                    {
                        $set: {
                            body:
                                "",

                            isDeleted:
                                true,

                            deletedAt:
                                new Date(),

                            deletedBy:
                                new Types.ObjectId(
                                    userId
                                ),
                        },
                    }
                );

        if (
            result.modifiedCount ===
            0
        ) {
            throw new ApiError(
                409,
                "Reply could not be deleted."
            );
        }

        await eventBus.publish(
            DomainEventName
                .DISCUSSION_REPLY_DELETED,
            {
                workspaceId:
                    discussion.workspace
                        .toString(),

                projectId:
                    discussion.project
                        .toString(),

                discussionId:
                    discussion._id
                        .toString(),

                replyId:
                    reply._id
                        .toString(),

                actorId:
                    userId,

                discussionAuthorId:
                    discussion.author
                        .toString(),

                title:
                    discussion.title,
            }
        );
    }
}

const discussionService =
    new DiscussionService();

export default discussionService;