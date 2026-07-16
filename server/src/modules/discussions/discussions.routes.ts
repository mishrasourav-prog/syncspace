import {
    Router,
} from "express";

import {
    authenticateUser,
} from "../../middlewares/auth.middleware";

import discussionController from "./discussions.controller";

const discussionRouter =
    Router();

discussionRouter.use(
    authenticateUser
);

discussionRouter.post(
    "/projects/:projectId/discussions",
    discussionController
        .createDiscussion
        .bind(
            discussionController
        )
);

discussionRouter.get(
    "/projects/:projectId/discussions",
    discussionController
        .getProjectDiscussions
        .bind(
            discussionController
        )
);

discussionRouter.get(
    "/discussions/:discussionId",
    discussionController
        .getDiscussionById
        .bind(
            discussionController
        )
);

discussionRouter.patch(
    "/discussions/:discussionId",
    discussionController
        .updateDiscussion
        .bind(
            discussionController
        )
);

discussionRouter.delete(
    "/discussions/:discussionId",
    discussionController
        .deleteDiscussion
        .bind(
            discussionController
        )
);

discussionRouter.patch(
    "/discussions/:discussionId/pin",
    discussionController
        .pinDiscussion
        .bind(
            discussionController
        )
);

discussionRouter.patch(
    "/discussions/:discussionId/unpin",
    discussionController
        .unpinDiscussion
        .bind(
            discussionController
        )
);

discussionRouter.patch(
    "/discussions/:discussionId/lock",
    discussionController
        .lockDiscussion
        .bind(
            discussionController
        )
);

discussionRouter.patch(
    "/discussions/:discussionId/unlock",
    discussionController
        .unlockDiscussion
        .bind(
            discussionController
        )
);

discussionRouter.post(
    "/discussions/:discussionId/replies",
    discussionController
        .createReply
        .bind(
            discussionController
        )
);

discussionRouter.get(
    "/discussions/:discussionId/replies",
    discussionController
        .getReplies
        .bind(
            discussionController
        )
);

discussionRouter.patch(
    "/discussion-replies/:replyId",
    discussionController
        .updateReply
        .bind(
            discussionController
        )
);

discussionRouter.delete(
    "/discussion-replies/:replyId",
    discussionController
        .deleteReply
        .bind(
            discussionController
        )
);

export default discussionRouter;