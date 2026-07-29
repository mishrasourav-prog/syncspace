// import {
//     DomainEventName,
//     eventBus,
// } from "../events";

// import {
//     getSocketServer,
// } from "./socket.server";

// import {
//     getProjectRoom,
//     getUserRoom,
//     getWorkspaceRoom,
// } from "./socket.rooms";

// let isRegistered =
//     false;

// export const registerSocketSubscribers =
//     (): void => {
//         if (isRegistered) {
//             return;
//         }

//         isRegistered =
//             true;

//         /*
//         |--------------------------------------------------------------------------
//         | Task Created
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.TASK_CREATED,
//             async (event) => {
//                 const io =
//                     getSocketServer();

//                 io.to(
//                     getProjectRoom(
//                         event.payload.projectId
//                     )
//                 ).emit(
//                     "task:created",
//                     event.payload
//                 );
//             }
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Task Status Changed
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.TASK_STATUS_CHANGED,
//             async (event) => {
//                 const io =
//                     getSocketServer();

//                 io.to(
//                     getProjectRoom(
//                         event.payload.projectId
//                     )
//                 ).emit(
//                     "task:status-changed",
//                     event.payload
//                 );
//             }
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Task Assigned
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.TASK_ASSIGNED,
//             async (event) => {
//                 const io =
//                     getSocketServer();

//                 io.to(
//                     getProjectRoom(
//                         event.payload.projectId
//                     )
//                 ).emit(
//                     "task:assigned",
//                     {
//                         workspaceId:
//                             event.payload.workspaceId,

//                         projectId:
//                             event.payload.projectId,

//                         taskId:
//                             event.payload.taskId,

//                         actorId:
//                             event.payload.actorId,

//                         assigneeId:
//                             event.payload.recipientId,

//                         title:
//                             event.payload.title,

//                         taskType: event.payload.taskType,
//                     }
//                 );
//             }
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | New Notification
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.NOTIFICATION_CREATED,
//             async (event) => {
//                 const io =
//                     getSocketServer();

//                 io.to(
//                     getUserRoom(
//                         event.payload.recipientId
//                     )
//                 ).emit(
//                     "notification:new",
//                     {
//                         notificationId:
//                             event.payload.notificationId,
//                     }
//                 );
//             }
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | New Activity
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.ACTIVITY_CREATED,
//             async (event) => {
//                 const io =
//                     getSocketServer();

//                 io.to(
//                     getWorkspaceRoom(
//                         event.payload.workspaceId
//                     )
//                 )
//                     .to(
//                         getProjectRoom(
//                             event.payload.projectId
//                         )
//                     )
//                     .emit(
//                         "activity:new",
//                         {
//                             activityId:
//                                 event.payload.activityId,

//                             workspaceId:
//                                 event.payload.workspaceId,

//                             projectId:
//                                 event.payload.projectId,
//                         }
//                     );
//             })
//             eventBus.subscribe(
//     DomainEventName.DOCUMENT_CREATED,
//     async (event) => {
//         const io =
//             getSocketServer();

//         io.to(
//             getProjectRoom(
//                 event.payload.projectId
//             )
//         ).emit(
//             "document:created",
//             event.payload
//         );
//     }
// );

// eventBus.subscribe(
//     DomainEventName.DOCUMENT_UPDATED,
//     async (event) => {
//         const io =
//             getSocketServer();

//         io.to(
//             getProjectRoom(
//                 event.payload.projectId
//             )
//         ).emit(
//             "document:updated",
//             event.payload
//         );
//     }
// );

// eventBus.subscribe(
//     DomainEventName.DOCUMENT_ARCHIVED,
//     async (event) => {
//         const io =
//             getSocketServer();

//         io.to(
//             getProjectRoom(
//                 event.payload.projectId
//             )
//         ).emit(
//             "document:archived",
//             event.payload
//         );
//     }
// );

// eventBus.subscribe(
//     DomainEventName.DOCUMENT_RESTORED,
//     async (event) => {
//         const io =
//             getSocketServer();

//         io.to(
//             getProjectRoom(
//                 event.payload.projectId
//             )
//         ).emit(
//             "document:restored",
//             event.payload
//         );
//     }

//         );

//             /*
//         |--------------------------------------------------------------------------
//         | Discussion Socket Helper
//         |--------------------------------------------------------------------------
//         */

//         const emitDiscussionChange = (
//             payload: {
//                 workspaceId: string;

//                 projectId: string;

//                 discussionId: string;

//                 actorId: string;

//                 title: string;
//             },
//             change:
//                 | "created"
//                 | "updated"
//                 | "deleted"
//                 | "pinned"
//                 | "unpinned"
//                 | "locked"
//                 | "unlocked"
//         ): void => {
//             const io =
//                 getSocketServer();

//             io.to(
//                 getProjectRoom(
//                     payload.projectId
//                 )
//             ).emit(
//                 "discussion:changed",
//                 {
//                     workspaceId:
//                         payload.workspaceId,

//                     projectId:
//                         payload.projectId,

//                     discussionId:
//                         payload.discussionId,

//                     actorId:
//                         payload.actorId,

//                     title:
//                         payload.title,

//                     change,
//                 }
//             );
//         };

//         /*
//         |--------------------------------------------------------------------------
//         | Discussion Reply Socket Helper
//         |--------------------------------------------------------------------------
//         */

//         const emitDiscussionReplyChange = (
//             payload: {
//                 workspaceId: string;

//                 projectId: string;

//                 discussionId: string;

//                 replyId: string;

//                 actorId: string;

//                 title: string;
//             },
//             change:
//                 | "created"
//                 | "updated"
//                 | "deleted"
//         ): void => {
//             const io =
//                 getSocketServer();

//             io.to(
//                 getProjectRoom(
//                     payload.projectId
//                 )
//             ).emit(
//                 "discussion:reply-changed",
//                 {
//                     workspaceId:
//                         payload.workspaceId,

//                     projectId:
//                         payload.projectId,

//                     discussionId:
//                         payload.discussionId,

//                     replyId:
//                         payload.replyId,

//                     actorId:
//                         payload.actorId,

//                     title:
//                         payload.title,

//                     change,
//                 }
//             );
//         };

//                 /*
//         |--------------------------------------------------------------------------
//         | Discussion Created
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.DISCUSSION_CREATED,
//             async (event) => {
//                 emitDiscussionChange(
//                     event.payload,
//                     "created"
//                 );
//             }
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Discussion Updated
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.DISCUSSION_UPDATED,
//             async (event) => {
//                 emitDiscussionChange(
//                     event.payload,
//                     "updated"
//                 );
//             }
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Discussion Deleted
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.DISCUSSION_DELETED,
//             async (event) => {
//                 emitDiscussionChange(
//                     event.payload,
//                     "deleted"
//                 );
//             }
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Discussion Pinned
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.DISCUSSION_PINNED,
//             async (event) => {
//                 emitDiscussionChange(
//                     event.payload,
//                     "pinned"
//                 );
//             }
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Discussion Unpinned
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.DISCUSSION_UNPINNED,
//             async (event) => {
//                 emitDiscussionChange(
//                     event.payload,
//                     "unpinned"
//                 );
//             }
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Discussion Locked
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.DISCUSSION_LOCKED,
//             async (event) => {
//                 emitDiscussionChange(
//                     event.payload,
//                     "locked"
//                 );
//             }
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Discussion Unlocked
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.DISCUSSION_UNLOCKED,
//             async (event) => {
//                 emitDiscussionChange(
//                     event.payload,
//                     "unlocked"
//                 );
//             }
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Discussion Reply Created
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.DISCUSSION_REPLY_CREATED,
//             async (event) => {
//                 emitDiscussionReplyChange(
//                     event.payload,
//                     "created"
//                 );
//             }
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Discussion Reply Updated
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.DISCUSSION_REPLY_UPDATED,
//             async (event) => {
//                 emitDiscussionReplyChange(
//                     event.payload,
//                     "updated"
//                 );
//             }
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Discussion Reply Deleted
//         |--------------------------------------------------------------------------
//         */

//         eventBus.subscribe(
//             DomainEventName.DISCUSSION_REPLY_DELETED,
//             async (event) => {
//                 emitDiscussionReplyChange(
//                     event.payload,
//                     "deleted"
//                 );
//             }
//         );

//         /*
// |--------------------------------------------------------------------------
// | Tasks Reordered
// |--------------------------------------------------------------------------
// */

// eventBus.subscribe(
//     DomainEventName.TASKS_REORDERED,
//     async (event) => {
//         const io =
//             getSocketServer();

//         io.to(
//             getProjectRoom(
//                 event.payload.projectId
//             )
//         ).emit(
//             "tasks:reordered",
//             event.payload
//         );
//     }
// );

//         /*
//         |--------------------------------------------------------------------------
//         | Project Membership Ended
//         |--------------------------------------------------------------------------
//         |
//         | Remove every active connection belonging to the affected
//         | user from the project room.
//         |
//         */

//         eventBus.subscribe(
//             DomainEventName.PROJECT_MEMBERSHIP_ENDED,
//             async (event) => {
//                 const io =
//                     getSocketServer();

//                 const userRoom =
//                     getUserRoom(
//                         event.payload
//                             .affectedUserId
//                     );

//                 const projectRoom =
//                     getProjectRoom(
//                         event.payload.projectId
//                     );

//                 /*
//                 Select all sockets belonging to this user and
//                 force those sockets to leave the project room.
//                 */

//                 io.in(
//                     userRoom
//                 ).socketsLeave(
//                     projectRoom
//                 );

//                 /*
//                 The sockets remain connected and remain inside
//                 their private user room.

//                 Notify them that project access has ended.
//                 */

//                 io.to(
//                     userRoom
//                 ).emit(
//                     "access:project-revoked",
//                     {
//                         workspaceId:
//                             event.payload.workspaceId,

//                         projectId:
//                             event.payload.projectId,

//                         reason:
//                             event.payload.reason,
//                     }
//                 );
//             }
//         );

//         /*
//         |--------------------------------------------------------------------------
//         | Workspace Membership Ended
//         |--------------------------------------------------------------------------
//         |
//         | Workspace removal also terminates access to every project
//         | inside that workspace.
//         |
//         */

//         eventBus.subscribe(
//             DomainEventName.WORKSPACE_MEMBERSHIP_ENDED,
//             async (event) => {
//                 const io =
//                     getSocketServer();

//                 const userRoom =
//                     getUserRoom(
//                         event.payload
//                             .affectedUserId
//                     );

//                 /*
//                 First remove every active socket belonging to this
//                 user from the workspace room.
//                 */

//                 io.in(
//                     userRoom
//                 ).socketsLeave(
//                     getWorkspaceRoom(
//                         event.payload.workspaceId
//                     )
//                 );

//                 /*
//                 Then remove those sockets from every project room
//                 associated with the workspace.
//                 */

//                 for (
//                     const projectId of
//                     event.payload.projectIds
//                 ) {
//                     io.in(
//                         userRoom
//                     ).socketsLeave(
//                         getProjectRoom(
//                             projectId
//                         )
//                     );
//                 }

//                 io.to(
//                     userRoom
//                 ).emit(
//                     "access:workspace-revoked",
//                     {
//                         workspaceId:
//                             event.payload.workspaceId,

//                         projectIds:
//                             event.payload.projectIds,

//                         reason:
//                             event.payload.reason,
//                     }
//                 );
//             }
//         );

    
//     };

import {
  DomainEventName,
  eventBus,
} from "../events";

import type {
  DiscussionChangedEventPayload,
  DiscussionReplyChangedEventPayload,
} from "../interfaces/domainEvent.interface";

import type {
  DiscussionChange,
  DiscussionReplyChange,
} from "../interfaces/socket.interface";

import {
  getProjectRoom,
  getUserRoom,
  getWorkspaceRoom,
} from "./socket.rooms";

import {
  getSocketServer,
} from "./socket.server";

let isRegistered =
  false;

/*
|--------------------------------------------------------------------------
| Discussion Broadcast Helpers
|--------------------------------------------------------------------------
*/

const emitDiscussionChange = (
  payload:
    DiscussionChangedEventPayload,
  change:
    DiscussionChange
): void => {
  const io =
    getSocketServer();

  io.to(
    getProjectRoom(
      payload.projectId
    )
  ).emit(
    "discussion:changed",
    {
      ...payload,
      change,
    }
  );
};

const emitDiscussionReplyChange = (
  payload:
    DiscussionReplyChangedEventPayload,
  change:
    DiscussionReplyChange
): void => {
  const io =
    getSocketServer();

  io.to(
    getProjectRoom(
      payload.projectId
    )
  ).emit(
    "discussion:reply-changed",
    {
      workspaceId:
        payload.workspaceId,

      projectId:
        payload.projectId,

      discussionId:
        payload.discussionId,

      replyId:
        payload.replyId,

      actorId:
        payload.actorId,

      title:
        payload.title,

      change,
    }
  );
};

/*
|--------------------------------------------------------------------------
| Register Socket Subscribers
|--------------------------------------------------------------------------
|
| Subscribers are registered exactly once during server startup.
|
| Domain mutations persist first and publish their event afterward. These
| subscribers only translate persisted domain events into Socket.IO room
| broadcasts.
|
*/

export const registerSocketSubscribers =
  (): void => {
    if (
      isRegistered
    ) {
      return;
    }

    isRegistered =
      true;

    /*
    |--------------------------------------------------------------------------
    | Tasks
    |--------------------------------------------------------------------------
    */

    eventBus.subscribe(
      DomainEventName
        .TASK_CREATED,
      async (
        event
      ) => {
        const io =
          getSocketServer();

        io.to(
          getProjectRoom(
            event.payload
              .projectId
          )
        ).emit(
          "task:created",
          event.payload
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .TASK_UPDATED,
      async (event) => {
        const io = getSocketServer();
        io.to(getProjectRoom(event.payload.projectId)).emit(
          "task:updated",
          event.payload
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .TASK_STATUS_CHANGED,
      async (
        event
      ) => {
        const io =
          getSocketServer();

        io.to(
          getProjectRoom(
            event.payload
              .projectId
          )
        ).emit(
          "task:status-changed",
          event.payload
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .TASK_ASSIGNED,
      async (
        event
      ) => {
        const io =
          getSocketServer();

        io.to(
          getProjectRoom(
            event.payload
              .projectId
          )
        ).emit(
          "task:assigned",
          {
            workspaceId:
              event.payload
                .workspaceId,

            projectId:
              event.payload
                .projectId,

            taskId:
              event.payload
                .taskId,

            actorId:
              event.payload
                .actorId,

            assigneeId:
              event.payload
                .recipientId,

            title:
              event.payload
                .title,

            taskType:
              event.payload
                .taskType,
          }
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .TASK_UNASSIGNED,
      async (event) => {
        const io = getSocketServer();
        io.to(getProjectRoom(event.payload.projectId)).emit(
          "task:unassigned",
          event.payload
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .TASK_ASSIGNMENT_REQUESTED,
      async (event) => {
        const io = getSocketServer();
        io.to(getProjectRoom(event.payload.projectId)).emit(
          "task:assignment-requested",
          event.payload
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .TASK_ASSIGNMENT_REQUEST_ACCEPTED,
      async (event) => {
        const io = getSocketServer();
        io.to(getProjectRoom(event.payload.projectId)).emit(
          "task:assignment-request-accepted",
          event.payload
        );
      }
    );

    const emitTaskCommentChange = (
      event: { payload: { workspaceId: string; projectId: string; taskId: string; commentId: string; actorId: string } },
      change: "created" | "updated" | "deleted"
    ) => {
      const io = getSocketServer();
      io.to(getProjectRoom(event.payload.projectId)).emit(
        "task:comment-changed",
        { ...event.payload, change }
      );
    };

    eventBus.subscribe(
      DomainEventName.TASK_COMMENT_CREATED,
      async (event) => emitTaskCommentChange(event, "created")
    );

    eventBus.subscribe(
      DomainEventName.TASK_COMMENT_UPDATED,
      async (event) => emitTaskCommentChange(event, "updated")
    );

    eventBus.subscribe(
      DomainEventName.TASK_COMMENT_DELETED,
      async (event) => emitTaskCommentChange(event, "deleted")
    );

    eventBus.subscribe(
      DomainEventName
        .TASKS_REORDERED,
      async (
        event
      ) => {
        const io =
          getSocketServer();

        io.to(
          getProjectRoom(
            event.payload
              .projectId
          )
        ).emit(
          "tasks:reordered",
          event.payload
        );
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Notifications and Activity
    |--------------------------------------------------------------------------
    */

    eventBus.subscribe(
      DomainEventName
        .NOTIFICATION_CREATED,
      async (
        event
      ) => {
        const io =
          getSocketServer();

        io.to(
          getUserRoom(
            event.payload
              .recipientId
          )
        ).emit(
          "notification:new",
          {
            notificationId:
              event.payload
                .notificationId,
          }
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .ACTIVITY_CREATED,
      async (
        event
      ) => {
        const io =
          getSocketServer();

        io.to(
          getWorkspaceRoom(
            event.payload
              .workspaceId
          )
        )
          .to(
            getProjectRoom(
              event.payload
                .projectId
            )
          )
          .emit(
            "activity:new",
            {
              activityId:
                event.payload
                  .activityId,

              workspaceId:
                event.payload
                  .workspaceId,

              projectId:
                event.payload
                  .projectId,
            }
          );
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Documents
    |--------------------------------------------------------------------------
    */

    eventBus.subscribe(
      DomainEventName
        .DOCUMENT_CREATED,
      async (
        event
      ) => {
        const io =
          getSocketServer();

        io.to(
          getProjectRoom(
            event.payload
              .projectId
          )
        ).emit(
          "document:created",
          event.payload
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .DOCUMENT_UPDATED,
      async (
        event
      ) => {
        const io =
          getSocketServer();

        io.to(
          getProjectRoom(
            event.payload
              .projectId
          )
        ).emit(
          "document:updated",
          event.payload
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .DOCUMENT_ARCHIVED,
      async (
        event
      ) => {
        const io =
          getSocketServer();

        io.to(
          getProjectRoom(
            event.payload
              .projectId
          )
        ).emit(
          "document:archived",
          event.payload
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .DOCUMENT_RESTORED,
      async (
        event
      ) => {
        const io =
          getSocketServer();

        io.to(
          getProjectRoom(
            event.payload
              .projectId
          )
        ).emit(
          "document:restored",
          event.payload
        );
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Discussions
    |--------------------------------------------------------------------------
    */

    eventBus.subscribe(
      DomainEventName
        .DISCUSSION_CREATED,
      async (
        event
      ) => {
        emitDiscussionChange(
          event.payload,
          "created"
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .DISCUSSION_UPDATED,
      async (
        event
      ) => {
        emitDiscussionChange(
          event.payload,
          "updated"
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .DISCUSSION_DELETED,
      async (
        event
      ) => {
        emitDiscussionChange(
          event.payload,
          "deleted"
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .DISCUSSION_PINNED,
      async (
        event
      ) => {
        emitDiscussionChange(
          event.payload,
          "pinned"
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .DISCUSSION_UNPINNED,
      async (
        event
      ) => {
        emitDiscussionChange(
          event.payload,
          "unpinned"
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .DISCUSSION_LOCKED,
      async (
        event
      ) => {
        emitDiscussionChange(
          event.payload,
          "locked"
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .DISCUSSION_UNLOCKED,
      async (
        event
      ) => {
        emitDiscussionChange(
          event.payload,
          "unlocked"
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .DISCUSSION_REPLY_CREATED,
      async (
        event
      ) => {
        emitDiscussionReplyChange(
          event.payload,
          "created"
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .DISCUSSION_REPLY_UPDATED,
      async (
        event
      ) => {
        emitDiscussionReplyChange(
          event.payload,
          "updated"
        );
      }
    );

    eventBus.subscribe(
      DomainEventName
        .DISCUSSION_REPLY_DELETED,
      async (
        event
      ) => {
        emitDiscussionReplyChange(
          event.payload,
          "deleted"
        );
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Membership Added and Role Changed
    |--------------------------------------------------------------------------
    */

    eventBus.subscribe(
      DomainEventName.WORKSPACE_MEMBER_ADDED,
      async (event) => {
        const io = getSocketServer();
        const userRoom = getUserRoom(event.payload.affectedUserId);
        const workspaceRoom = getWorkspaceRoom(event.payload.workspaceId);

        io.in(userRoom).socketsJoin(workspaceRoom);
        io.to(workspaceRoom).emit("workspace:member-added", event.payload);
      }
    );

    eventBus.subscribe(
      DomainEventName.PROJECT_MEMBER_ADDED,
      async (event) => {
        const io = getSocketServer();
        const userRoom = getUserRoom(event.payload.affectedUserId);
        const projectRoom = getProjectRoom(event.payload.projectId);

        io.in(userRoom).socketsJoin(projectRoom);
        io.to(projectRoom).emit("project:member-added", event.payload);
      }
    );

    eventBus.subscribe(
      DomainEventName.WORKSPACE_MEMBER_ROLE_CHANGED,
      async (event) => {
        const io = getSocketServer();
        io.to(getWorkspaceRoom(event.payload.workspaceId))
          .to(getUserRoom(event.payload.affectedUserId))
          .emit("workspace:member-role-changed", event.payload);
      }
    );

    eventBus.subscribe(
      DomainEventName.PROJECT_MEMBER_ROLE_CHANGED,
      async (event) => {
        const io = getSocketServer();
        io.to(getProjectRoom(event.payload.projectId))
          .to(getUserRoom(event.payload.affectedUserId))
          .emit("project:member-role-changed", event.payload);
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Project Access Revoked
    |--------------------------------------------------------------------------
    |
    | Remove all sockets belonging to the affected user from the project room
    | while retaining their authenticated user-room connection.
    |
    */

    eventBus.subscribe(
      DomainEventName
        .PROJECT_MEMBERSHIP_ENDED,
      async (
        event
      ) => {
        const io =
          getSocketServer();

        const userRoom =
          getUserRoom(
            event.payload
              .affectedUserId
          );

        io.in(
          userRoom
        ).socketsLeave(
          getProjectRoom(
            event.payload
              .projectId
          )
        );

        io.to(
          userRoom
        ).emit(
          "access:project-revoked",
          {
            workspaceId:
              event.payload
                .workspaceId,

            projectId:
              event.payload
                .projectId,

            reason:
              event.payload
                .reason,
          }
        );
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Workspace Access Revoked
    |--------------------------------------------------------------------------
    |
    | Workspace membership removal also ends access to every project room
    | inside that workspace.
    |
    */

    eventBus.subscribe(
      DomainEventName
        .WORKSPACE_MEMBERSHIP_ENDED,
      async (
        event
      ) => {
        const io =
          getSocketServer();

        const userRoom =
          getUserRoom(
            event.payload
              .affectedUserId
          );

        io.in(
          userRoom
        ).socketsLeave(
          getWorkspaceRoom(
            event.payload
              .workspaceId
          )
        );

        for (
          const projectId of
          event.payload
            .projectIds
        ) {
          io.in(
            userRoom
          ).socketsLeave(
            getProjectRoom(
              projectId
            )
          );
        }

        io.to(
          userRoom
        ).emit(
          "access:workspace-revoked",
          {
            workspaceId:
              event.payload
                .workspaceId,

            projectIds:
              event.payload
                .projectIds,

            reason:
              event.payload
                .reason,
          }
        );
      }
    );

    /*
    |--------------------------------------------------------------------------
    | Account Session Revoked
    |--------------------------------------------------------------------------
    |
    | Notify every connected tab/device in the authenticated user's private
    | room and then forcefully disconnect those sockets.
    |
    | The initiating HTTP controller also clears its own cookies. Other tabs
    | receive this event before disconnection and clear their local auth/query
    | state immediately.
    |
    */

    eventBus.subscribe(
      DomainEventName
        .USER_SESSION_REVOKED,
      async (
        event
      ) => {
        const io =
          getSocketServer();

        const userRoom =
          getUserRoom(
            event.payload
              .userId
          );

        io.to(
          userRoom
        ).emit(
          "account:session-revoked",
          {
            reason:
              event.payload
                .reason,
          }
        );

        io.in(
          userRoom
        ).disconnectSockets(
          true
        );
      }
    );
  };