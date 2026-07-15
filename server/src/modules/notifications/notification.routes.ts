import {
    Router,
} from "express";

import {
    authenticateUser,
} from "../../middlewares/auth.middleware";

import {
    getNotifications,
    getUnreadNotificationCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "./notification.controller";

const router =
    Router();

router.get(
    "/notifications",
    authenticateUser,
    getNotifications
);

router.get(
    "/notifications/unread-count",
    authenticateUser,
    getUnreadNotificationCount
);

router.patch(
    "/notifications/:notificationId/read",
    authenticateUser,
    markNotificationAsRead
);

router.patch(
    "/notifications/read-all",
    authenticateUser,
    markAllNotificationsAsRead
);

export default router;