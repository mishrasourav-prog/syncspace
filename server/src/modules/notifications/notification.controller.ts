import type {
    NextFunction,
    Request,
    Response,
} from "express";

import ApiResponse from "../../utils/ApiResponse";

import {
    objectIdSchema,
} from "../../validators/common.validation";

import notificationService from "./notification.service";

export const getNotifications =
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const result =
                await notificationService
                    .getNotifications(
                        req.user!._id
                    );

            res.status(200).json(
                new ApiResponse(
                    200,
                    "Notifications fetched successfully.",
                    result
                )
            );
        } catch (error) {
            return next(
                error
            );
        }
    };

export const getUnreadNotificationCount =
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const result =
                await notificationService
                    .getUnreadCount(
                        req.user!._id
                    );

            res.status(200).json(
                new ApiResponse(
                    200,
                    "Unread notification count fetched successfully.",
                    result
                )
            );
        } catch (error) {
            return next(
                error
            );
        }
    };

export const markNotificationAsRead =
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const notificationId =
                objectIdSchema.parse(
                    req.params.notificationId
                );

            const notification =
                await notificationService
                    .markAsRead(
                        notificationId,
                        req.user!._id
                    );

            res.status(200).json(
                new ApiResponse(
                    200,
                    "Notification marked as read.",
                    notification
                )
            );
        } catch (error) {
            return next(
                error
            );
        }
    };

export const markAllNotificationsAsRead =
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            await notificationService
                .markAllAsRead(
                    req.user!._id
                );

            res.status(200).json(
                new ApiResponse(
                    200,
                    "All notifications marked as read."
                )
            );
        } catch (error) {
            return next(
                error
            );
        }
    };