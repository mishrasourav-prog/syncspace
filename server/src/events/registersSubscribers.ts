import {
    registerActivitySubscribers,
} from "../modules/activity/activity.subscriber";

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
    };