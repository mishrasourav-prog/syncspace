import {
    registerActivitySubscribers,
} from "../modules/activity/activity.subscriber";

import {
    registerNotificationSubscribers,
} from "../modules/notifications/notification.subscriber";

import {
    registerSocketSubscribers,
} from "../sockets/socket.subscriber";

let subscribersRegistered =
    false;

export const registerDomainEventSubscribers =
    (): void => {
        if (subscribersRegistered) {
            return;
        }

        subscribersRegistered =
            true;

        registerActivitySubscribers();

        registerNotificationSubscribers();

        registerSocketSubscribers();
    };