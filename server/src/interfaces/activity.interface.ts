import type {
    ActivityAction,
    ActivityEntityType,
} from "../modules/activity/activity.model";

export interface IActivityActor {
    _id:
        string;

    name:
        string;

    username:
        string;

    avatar?:
        string;
}

export interface IActivityResponse {
    _id:
        string;

    workspace:
        string;

    project:
        string;

    actor:
        IActivityActor |
        null;

    action:
        ActivityAction;

    entityType:
        ActivityEntityType;

    entityId:
        string;

    metadata:
        Record<
            string,
            unknown
        >;

    createdAt:
        Date;
}

export interface IActivitiesResponse {
    activities:
        IActivityResponse[];
}