import {
    Types,
} from "mongoose";

import ApiError from "../../utils/ApiError";

import Notification, {
    NotificationEntityType,
    NotificationType,
} from "./notification.model";

import {
    INotificationActor,
    INotificationResponse,
    INotificationsResponse,
    IUnreadNotificationCountResponse,
} from "../../interfaces/notification.interfaces"

interface IPopulatedNotificationActor {
    _id:
        Types.ObjectId;

    name:
        string;

    username:
        string;

    avatar?:
        string;
}

interface INotificationForResponse {
    _id:
        Types.ObjectId;

    recipient:
        Types.ObjectId;

    actor:
        IPopulatedNotificationActor |
        null;

    type:
        NotificationType;

    title:
        string;

    message:
        string;

    workspace?:
        Types.ObjectId;

    project?:
        Types.ObjectId;

    entityType?:
        NotificationEntityType;

    entityId?:
        Types.ObjectId;

    metadata:
        Record<
            string,
            unknown
        >;

    isRead:
        boolean;

    readAt?:
        Date;

    createdAt:
        Date;
}

interface ICreateNotificationInternal {
    recipientId:
        string;

    actorId?:
        string;

    type:
        NotificationType;

    title:
        string;

    message:
        string;

    workspaceId?:
        string;

    projectId?:
        string;

    entityType?:
        NotificationEntityType;

    entityId?:
        string;

    metadata?:
        Record<
            string,
            unknown
        >;
}

export class NotificationService {
    private mapNotification(
        notification:
            INotificationForResponse
    ): INotificationResponse {
        const actor:
            INotificationActor |
            null =
                notification.actor
                    ? {
                        _id:
                            notification.actor
                                ._id
                                .toString(),

                        name:
                            notification.actor
                                .name,

                        username:
                            notification.actor
                                .username,

                        avatar:
                            notification.actor
                                .avatar,
                    }
                    : null;

        return {
            _id:
                notification._id.toString(),

            recipient:
                notification.recipient.toString(),

            actor,

            type:
                notification.type,

            title:
                notification.title,

            message:
                notification.message,

            workspace:
                notification.workspace
                    ?.toString() ??
                null,

            project:
                notification.project
                    ?.toString() ??
                null,

            entityType:
                notification.entityType ??
                null,

            entityId:
                notification.entityId
                    ?.toString() ??
                null,

            metadata:
                notification.metadata,

            isRead:
                notification.isRead,

            readAt:
                notification.readAt ??
                null,

            createdAt:
                notification.createdAt,
        };
    }

    async createNotification(
        data:
            ICreateNotificationInternal
    ): Promise<void> {
        await Notification.create({
            recipient:
                new Types.ObjectId(
                    data.recipientId
                ),

            actor:
                data.actorId
                    ? new Types.ObjectId(
                        data.actorId
                    )
                    : undefined,

            type:
                data.type,

            title:
                data.title,

            message:
                data.message,

            workspace:
                data.workspaceId
                    ? new Types.ObjectId(
                        data.workspaceId
                    )
                    : undefined,

            project:
                data.projectId
                    ? new Types.ObjectId(
                        data.projectId
                    )
                    : undefined,

            entityType:
                data.entityType,

            entityId:
                data.entityId
                    ? new Types.ObjectId(
                        data.entityId
                    )
                    : undefined,

            metadata:
                data.metadata ?? {},
        });
    }

    async getNotifications(
        userId: string
    ): Promise<INotificationsResponse> {
        const notifications =
            await Notification.find({
                recipient:
                    userId,
            })
                .sort({
                    createdAt:
                        -1,

                    _id:
                        -1,
                })
                .limit(
                    50
                )
                .populate<{
                    actor:
                        IPopulatedNotificationActor |
                        null;
                }>(
                    "actor",
                    "name username avatar"
                )
                .lean<
                    INotificationForResponse[]
                >()
                .exec();

        return {
            notifications:
                notifications.map(
                    (notification) =>
                        this.mapNotification(
                            notification
                        )
                ),
        };
    }

    async getUnreadCount(
        userId: string
    ): Promise<IUnreadNotificationCountResponse> {
        const unreadCount =
            await Notification.countDocuments({
                recipient:
                    userId,

                isRead:
                    false,
            });

        return {
            unreadCount,
        };
    }

    async markAsRead(
        notificationId: string,
        userId: string
    ): Promise<INotificationResponse> {
        const notification =
            await Notification.findOne({
                _id:
                    notificationId,

                recipient:
                    userId,
            });

        /*
        Return 404 rather than revealing whether a
        notification belongs to another user.
        */
        if (!notification) {
            throw new ApiError(
                404,
                "Notification not found."
            );
        }

        if (!notification.isRead) {
            notification.isRead =
                true;

            notification.readAt =
                new Date();

            await notification.save();
        }

        const populatedNotification =
            await Notification.findById(
                notification._id
            )
                .populate<{
                    actor:
                        IPopulatedNotificationActor |
                        null;
                }>(
                    "actor",
                    "name username avatar"
                )
                .lean<
                    INotificationForResponse
                >()
                .exec();

        if (!populatedNotification) {
            throw new ApiError(
                404,
                "Notification not found."
            );
        }

        return this.mapNotification(
            populatedNotification
        );
    }

    async markAllAsRead(
        userId: string
    ): Promise<void> {
        const now =
            new Date();

        await Notification.updateMany(
            {
                recipient:
                    userId,

                isRead:
                    false,
            },
            {
                $set: {
                    isRead:
                        true,

                    readAt:
                        now,
                },
            }
        );
    }
}

export default new NotificationService();