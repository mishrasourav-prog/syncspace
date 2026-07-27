<div align="center">

SyncSpace

A secure, real-time collaborative workspace for teams

SyncSpace brings workspaces, projects, tasks, issues, documents, discussions, notifications, and team profiles into one focused collaboration platform.



Repository · Report a Bug · Request a Feature

</div>

Table of Contents

About SyncSpace

Why This Project Exists

Core Features

Screenshots

System Architecture

Real-Time and Event-Driven Design

Security Architecture

Technology Stack

Data Model Overview

Repository Structure

Getting Started

Environment Variables

Available Scripts

API Overview

Engineering Decisions

Current Limitations

Roadmap

Contributing

License

Author

About SyncSpace

SyncSpace is a full-stack collaboration platform designed around a clear hierarchy:

User
└── Workspace
    └── Project
        ├── Tasks and Issues
        ├── Documents
        ├── Discussions
        ├── Members
        └── Activity

Instead of treating collaboration as a collection of unrelated screens, SyncSpace keeps every action inside its correct workspace and project context.

The application combines:

structured workspace and project organization;

role-based membership and invitations;

task and issue tracking;

rich-text project documentation;

threaded project discussions;

real-time notifications and activity updates;

secure authentication and session revocation;

editable private profiles and context-authorized member profiles.

The project was built as a production-oriented full-stack system, with special attention to authorization, session security, state synchronization, modular architecture, and graceful handling of concurrent users.

Why This Project Exists

Modern teams often split their work across several disconnected products:

one tool for tasks;

another for documents;

another for discussions;

another for notifications;

and separate spreadsheets or messages for access management.

This fragmentation creates several problems:

Context is lost when tasks, decisions, documents, and conversations live in different places.

Access control becomes inconsistent when workspace and project permissions are managed separately.

Users see stale data when updates are not synchronized across active sessions.

Important activity is easy to miss when notifications are not connected to the original resource.

Account security becomes fragile when logout or password changes do not invalidate existing sessions immediately.

SyncSpace addresses these problems by keeping collaboration resources together while maintaining strict workspace and project boundaries.

Core Features

Authentication and Account Security

User registration and login

HTTP-only access and refresh token cookies

Automatic access-token refresh

OTP-based forgot-password and reset-password flow

Enumeration-safe password-reset responses

Account-wide session invalidation

Multi-tab and multi-device session-revocation events

Password change with forced reauthentication

Secure account deletion with readiness checks

Account anonymization that preserves historical project references

Workspaces

Create and manage workspaces

View all accessible workspaces from a dashboard

Update, archive, and restore workspaces

Invite users to a workspace

Accept or reject workspace invitations

Role-based workspace membership

Update member roles

Remove members or voluntarily leave a workspace

Projects

Create projects inside workspaces

Update, archive, and restore projects

Invite workspace users into projects

Accept, reject, or cancel project invitations

Manage project members and project roles

Enforce workspace and project access independently

Tasks and Issues

Separate task and issue work-item types

Kanban board and list views

Drag-and-drop task reordering

Statuses:

TODO

IN_PROGRESS

IN_REVIEW

DONE

Priorities:

LOW

MEDIUM

HIGH

URGENT

Assignee management

Start dates and due dates

Parent-task relationships

Task comments

Archive and restore operations

Search and URL-driven filters

Real-time task creation, status, assignment, and reorder updates

Documents

Project-scoped documents

Rich-text editing powered by TipTap

Tables, links, task lists, formatting, and structured content

Document revision tracking

Archive and restore operations

Real-time document update notifications

Server-authoritative document state

Discussions

Project discussion threads

Replies

Edit and delete operations

Pin and unpin discussions

Lock and unlock discussions

Role-aware moderation

Real-time discussion and reply updates

Notifications and Activity

In-app notification center

Unread notification count

Mark one or all notifications as read

Workspace and project activity feeds

Domain-event-generated activity records

Real-time cache invalidation for new notifications

Access-revocation handling when a user is removed or leaves

Profiles

Editable private profile

Avatar upload and removal through Cloudinary

Headline, bio, and location

Workspace, project, and completed-task statistics

Read-only member profiles

Member profiles authorized through shared workspace or project context

Privacy-safe profile responses

Account deletion blockers for workspace owners and last project administrators

User Experience

Responsive desktop and mobile layouts

Persistent authenticated application shell

Sidebar, topbar, and mobile navigation

Loading skeletons and recoverable error states

Toast notifications

Accessible dialogs and forms

Dark, workspace-focused interface

Query caching and targeted invalidation

Screenshots

Landing Experience

<p align="center">
  <img
    src="docs/screenshots/landing-page.png"
    alt="SyncSpace landing page"
    width="100%"
  />
</p>

The landing experience introduces SyncSpace as a unified workspace for projects, tasks, documents, discussions, and team collaboration.

Workspace Dashboard

<p align="center">
  <img
    src="docs/screenshots/dashboard.png"
    alt="SyncSpace workspace dashboard"
    width="100%"
  />
</p>

The dashboard provides a consolidated view of active and archived workspaces, invitations, notifications, access information, and quick workspace actions.

Authentication

<p align="center">
  <img
    src="docs/screenshots/authentication.png"
    alt="SyncSpace account registration page"
    width="82%"
  />
</p>

SyncSpace includes dedicated authentication flows for registration, login, forgot password, OTP verification, and password reset.

Workspace and Project Management

Workspace Overview

Project Overview

<img src="docs/screenshots/workspace-overview.png" alt="SyncSpace workspace overview" />

<img src="docs/screenshots/project-overview.png" alt="SyncSpace project overview" />

Workspace and project overview pages combine membership, activity, access controls, project statistics, task completion, and direct navigation to collaboration tools.

Tasks and Issues

<p align="center">
  <img
    src="docs/screenshots/tasks-and-issues.png"
    alt="SyncSpace tasks and issues board"
    width="100%"
  />
</p>

The task workspace supports board and list views, status-based organization, filters, priorities, assignees, due dates, summaries, and drag-and-drop reordering.

Documents

Document Library

Rich-Text Document Editor

<img src="docs/screenshots/documents.png" alt="SyncSpace document library" />

<img src="docs/screenshots/document-editor.png" alt="SyncSpace rich-text document editor" />

Project documents include search, sorting, filtering, archive state, revisions, rich-text editing, preview mode, duplication, export, and server-authoritative save behavior.

Discussions

<p align="center">
  <img
    src="docs/screenshots/discussions.png"
    alt="SyncSpace project discussions"
    width="100%"
  />
</p>

Discussions provide threaded project communication with replies, participants, metadata, activity, pinning, locking, editing, and moderation controls.

Profile and Account Management

<p align="center">
  <img
    src="docs/screenshots/profile.png"
    alt="SyncSpace profile and account management page"
    width="100%"
  />
</p>

The Profile experience combines editable personal information, account metadata, activity statistics, avatar management, password changes, deletion-readiness checks, and secure account deletion.

Responsive Mobile Experience

<table>
  <tr>
    <td align="center">
      <img
        src="docs/screenshots/mobile-dashboard.png"
        alt="SyncSpace mobile dashboard"
        width="300"
      />
    </td>
    <td align="center">
      <img
        src="docs/screenshots/mobile-sidebar.png"
        alt="SyncSpace mobile navigation drawer"
        width="300"
      />
    </td>
  </tr>
  <tr>
    <td align="center"><strong>Mobile dashboard</strong></td>
    <td align="center"><strong>Mobile navigation</strong></td>
  </tr>
</table>

The interface adapts to narrow screens with responsive cards, touch-friendly actions, a compact topbar, and an authenticated navigation drawer.

Additional screenshots, including the read-only Member Profile page, task details, notifications, and invitation flows, can be added later under docs/screenshots/ without restructuring this README.

System Architecture

SyncSpace uses a client-server architecture with REST for commands and queries, and Socket.IO for real-time synchronization.

flowchart LR
    U[User] --> C[React Client]

    subgraph Frontend
        C --> R[React Router]
        C --> Z[Zustand Auth State]
        C --> Q[TanStack Query Cache]
        C --> A[Axios Client]
        C --> SC[Socket.IO Client]
    end

    A -->|REST /api/v1| E[Express API]
    SC <-->|WebSocket / polling| SIO[Socket.IO Server]

    subgraph Backend
        E --> M[Authentication and Validation Middleware]
        M --> RT[Feature Routes]
        RT --> CT[Controllers]
        CT --> SV[Services]
        SV --> MG[Mongoose Models]
        SV --> EB[Typed Domain Event Bus]

        EB --> AS[Activity Subscribers]
        EB --> NS[Notification Subscribers]
        EB --> SS[Socket Subscribers]
    end

    MG --> DB[(MongoDB)]
    SS --> SIO
    AS --> DB
    NS --> DB

    SIO --> UR[User Rooms]
    SIO --> WR[Workspace Rooms]
    SIO --> PR[Project Rooms]

    UR --> SC
    WR --> SC
    PR --> SC

Typical Request Flow

Browser action
→ Axios request
→ Express route
→ Authentication middleware
→ Zod validation
→ Controller
→ Service
→ Authorization and business rules
→ Mongoose query or transaction
→ MongoDB
→ Domain event publication
→ Activity / notification / Socket.IO subscribers
→ Client query invalidation
→ Updated interface

Frontend State Separation

SyncSpace deliberately separates client state by responsibility:

Concern

Tool

Responsibility

Authentication identity

Zustand

Small current-user session state

Server data

TanStack Query

Fetching, caching, invalidation, retries

Forms

React Hook Form + Zod

Input state and validation

Navigation and filters

React Router

Routes, params, search parameters

HTTP communication

Axios

API requests and token refresh

Real-time communication

Socket.IO Client

Live updates and access events

Editor state

TipTap

Rich-text document editing

The full profile object is not stored globally. Zustand keeps only the compact authenticated identity, while extended profile data remains in the Query cache.

Real-Time and Event-Driven Design

SyncSpace does not place every side effect directly inside controllers.

Business services persist the primary operation first and then publish a typed domain event. Independent subscribers react to the event.

sequenceDiagram
    participant Client
    participant API
    participant Service
    participant MongoDB
    participant EventBus
    participant Activity
    participant Notifications
    participant SocketIO

    Client->>API: Perform project action
    API->>Service: Validated command
    Service->>MongoDB: Persist authoritative state
    MongoDB-->>Service: Success
    Service->>EventBus: Publish typed domain event

    par Independent subscribers
        EventBus->>Activity: Create activity entry
        EventBus->>Notifications: Create recipient notification
        EventBus->>SocketIO: Broadcast scoped real-time event
    end

    API-->>Client: Success response
    SocketIO-->>Client: Invalidate relevant cached data

Domain Events

The backend defines typed events for:

task creation;

task status changes;

task assignment;

task reordering;

document creation, update, archive, and restore;

discussion creation, update, deletion, pinning, and locking;

discussion reply creation, update, and deletion;

activity creation;

notification creation;

project membership ending;

workspace membership ending;

user session revocation.

Socket Scope

Real-time events are delivered through scoped rooms:

User room — personal notifications and session revocation

Workspace room — workspace-level activity and access updates

Project room — tasks, documents, discussions, and project activity

This prevents unrelated users from receiving updates for resources they cannot access.

Subscriber Isolation

The event bus uses independent subscriber execution. A failure in an activity, notification, or socket subscriber does not incorrectly report the already-persisted business operation as failed.

Security Architecture

Security is treated as part of the application architecture rather than a UI-only concern.

Authentication

Short-lived access tokens

Longer-lived refresh tokens

Tokens stored in HTTP-only cookies

sameSite: strict

secure cookies in production

Cookie-based browser authentication

Optional Bearer-token support for API clients

Axios refresh queue prevents multiple simultaneous refresh requests

Immediate Session Revocation

Every JWT carries a sessionVersion.

The server also stores the current version on the User record. Protected requests compare both values.

The version is incremented after security-sensitive operations such as:

logout;

password change;

password reset;

account deletion.

This immediately invalidates previously issued access and refresh tokens.

The backend also emits:

account:session-revoked

Connected tabs and devices clear their authentication state, clear cached data, disconnect Socket.IO, and return to login.

Password and Reset Security

Passwords are hashed before storage

Password fields are excluded from normal database queries

OTP reset attempts are limited

Reset responses do not reveal whether an account exists

Verified reset sessions are consumed

Password changes revoke all active sessions

API and Infrastructure Security

Helmet security headers

Credential-aware CORS configuration

Zod request validation

Mongoose schema validation

Centralized error handling

Private User fields removed from serialized responses

File type, file size, and file-signature checks for avatar uploads

Cloudinary credentials remain server-side

Graceful server shutdown for HTTP, Socket.IO, and MongoDB

Account Deletion

Account deletion is not a blind document removal.

Before deletion, SyncSpace checks whether the user:

owns a workspace;

is the last administrator of a project.

When deletion is allowed, access-related records are removed and the User document becomes an anonymized tombstone. Historical tasks, documents, discussions, comments, and activities can retain their author references without retaining the deleted user’s personal identity or authentication access.

Technology Stack

Frontend

Technology

Purpose

React 19

Component-based user interface

TypeScript

Static type safety

Vite

Development server and production build

Tailwind CSS 4

Styling and responsive design

React Router

Public and protected routing

TanStack Query

Server-state caching and invalidation

Zustand

Compact authentication state

Axios

REST API client and refresh interceptor

Socket.IO Client

Real-time communication

React Hook Form

Form state management

Zod

Runtime form and request validation

TipTap

Rich-text document editor

dnd-kit

Drag-and-drop task board

Framer Motion

Interface transitions

Lucide React

Icons

Sonner

Toast notifications

next-themes

Theme management

Backend

Technology

Purpose

Node.js

Server runtime

Express 5

REST API framework

TypeScript

Backend type safety

MongoDB

Primary database

Mongoose

Schemas, models, indexes, and transactions

Socket.IO

Real-time server and scoped rooms

JSON Web Tokens

Access, refresh, and reset tokens

bcrypt / bcryptjs

Password hashing and comparison

Zod

Request validation

Multer

Multipart avatar handling

Cloudinary

Managed avatar storage

Nodemailer

OTP email delivery

Helmet

HTTP security headers

CORS

Cross-origin policy

Compression

Response compression

Morgan

Development request logging

dotenv

Environment configuration

Data Model Overview

The backend is organized around focused domain models rather than one large embedded document.

erDiagram
    USER ||--o{ WORKSPACE_MEMBER : joins
    WORKSPACE ||--o{ WORKSPACE_MEMBER : contains
    USER ||--o{ WORKSPACE_INVITATION : receives
    WORKSPACE ||--o{ WORKSPACE_INVITATION : creates

    WORKSPACE ||--o{ PROJECT : contains
    USER ||--o{ PROJECT_MEMBER : joins
    PROJECT ||--o{ PROJECT_MEMBER : contains
    USER ||--o{ PROJECT_INVITATION : receives
    PROJECT ||--o{ PROJECT_INVITATION : creates

    PROJECT ||--o{ TASK : contains
    TASK ||--o{ TASK_ASSIGNEE : assigns
    USER ||--o{ TASK_ASSIGNEE : receives
    TASK ||--o{ TASK_COMMENT : has

    PROJECT ||--o{ DOCUMENT : contains
    PROJECT ||--o{ DISCUSSION : contains
    DISCUSSION ||--o{ DISCUSSION_REPLY : has

    USER ||--o{ NOTIFICATION : receives
    WORKSPACE ||--o{ ACTIVITY : records
    PROJECT ||--o{ ACTIVITY : records

Core Collections

Users

Workspaces

Workspace Members

Workspace Invitations

Projects

Project Members

Project Invitations

Tasks and Issues

Task Assignees

Task Comments

Documents

Discussions

Discussion Replies

Notifications

Activities

OTP records

Indexing Strategy

The Mongoose models include indexes for common access patterns such as:

workspace and project membership lookup;

project task status and ordering;

task due dates;

task type and archive filtering;

project-role lookup;

completed-task profile statistics;

unique membership constraints;

unique email and username constraints.

Repository Structure

syncspace/
├── client/
│   ├── src/
│   │   ├── app/                   # Router, providers, Zustand store
│   │   ├── components/
│   │   │   ├── navigation/        # Sidebar, topbar, account menus
│   │   │   └── ui/                # Reusable UI primitives
│   │   ├── features/
│   │   │   ├── activity/
│   │   │   ├── auth/
│   │   │   ├── discussions/
│   │   │   ├── documents/
│   │   │   ├── landing/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   ├── project-invitations/
│   │   │   ├── project-members/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── workspace-invitations/
│   │   │   ├── workspace-members/
│   │   │   └── workspaces/
│   │   ├── layouts/               # Authenticated application shell
│   │   ├── lib/                   # Axios, QueryClient, utilities
│   │   ├── realtime/              # Socket client and lifecycle
│   │   └── styles/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── events/                # Typed event bus and registration
│   │   ├── helpers/
│   │   ├── interfaces/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   │   ├── activity/
│   │   │   ├── auth/
│   │   │   ├── discussions/
│   │   │   ├── documents/
│   │   │   ├── mail/
│   │   │   ├── notifications/
│   │   │   ├── otp/
│   │   │   ├── project/
│   │   │   ├── projectInvitation/
│   │   │   ├── projectMember/
│   │   │   ├── system/
│   │   │   ├── taskAssignee/
│   │   │   ├── taskComment/
│   │   │   ├── tasks/
│   │   │   ├── users/
│   │   │   ├── workspace/
│   │   │   ├── workspace-member/
│   │   │   └── workspaceInvitation/
│   │   ├── routes/
│   │   ├── runtime/
│   │   ├── sockets/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── LICENSE
└── README.md

Feature Module Pattern

Frontend features generally contain:

feature/
├── api/
├── components/
├── hooks/
├── pages/
├── schemas/
├── types/
└── feature.queryKeys.ts

Backend modules generally separate:

module/
├── module.model.ts
├── module.validation.ts
├── module.service.ts
├── module.controller.ts
├── module.routes.ts
└── module.subscriber.ts       # when event-driven behavior is required

Getting Started

Prerequisites

Install or prepare:

Node.js and npm

MongoDB, locally or through MongoDB Atlas

An SMTP-capable email account for password-reset OTPs

A Cloudinary account for profile avatars

Git

1. Clone the Repository

git clone https://github.com/mishrasourav-prog/syncspace.git
cd syncspace

2. Install Server Dependencies

cd server
npm install

3. Create the Server Environment File

Linux/macOS:

cp .env.example .env

PowerShell:

Copy-Item .env.example .env

Fill in the real values described in Environment Variables.

4. Install Client Dependencies

cd ../client
npm install

The client environment file is optional during local development because Vite proxies /api and /socket.io to the backend on port 5000.

To create it explicitly:

Linux/macOS:

cp .env.example .env

PowerShell:

Copy-Item .env.example .env

5. Start the Server

From server/:

npm run dev

6. Start the Client

From client/ in another terminal:

npm run dev

Open:

http://localhost:5173

The API runs at:

http://localhost:5000/api/v1

Environment Variables

Server

Create server/.env.

Variable

Required

Purpose

CLIENT_URL

Yes

Frontend origin allowed by CORS

MONGODB_URI

Yes

MongoDB connection string

ACCESS_TOKEN_SECRET

Yes

Access-token signing secret

REFRESH_TOKEN_SECRET

Yes

Refresh-token signing secret

RESET_TOKEN_SECRET

Yes

Password-reset token secret

EMAIL_USER

Yes for password reset

Sender email account

EMAIL_PASSWORD

Yes for password reset

Email app password or SMTP credential

CLOUDINARY_CLOUD_NAME

Yes for avatars

Cloudinary cloud name

CLOUDINARY_API_KEY

Yes for avatars

Cloudinary API key

CLOUDINARY_API_SECRET

Yes for avatars

Cloudinary API secret

CLOUDINARY_AVATAR_FOLDER

No

Optional avatar folder; defaults to syncspace/avatars

PORT

No

Server port; defaults to 5000

NODE_ENV

No

Use production to enable secure cookies

Example:

NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb://127.0.0.1:27017/syncspace

ACCESS_TOKEN_SECRET=replace_with_a_long_random_access_secret
REFRESH_TOKEN_SECRET=replace_with_a_different_random_refresh_secret
RESET_TOKEN_SECRET=replace_with_a_different_random_reset_secret

EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_app_password

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_AVATAR_FOLDER=syncspace/avatars

Client

Create client/.env only when the client and server are hosted on different origins or when explicit URLs are preferred.

Variable

Required

Purpose

VITE_API_BASE_URL

No locally

REST API base URL

VITE_SOCKET_URL

No locally

Socket.IO server origin

VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000

Never commit real .env files. Commit only .env.example templates.

Available Scripts

Client

Run from client/.

Command

Description

npm run dev

Start the Vite development server

npm run build

Type-check and create the production build

npm run lint

Run ESLint

npm run preview

Preview the production build

Server

Run from server/.

Command

Description

npm run dev

Start the server with tsx watch

npm run build

Compile TypeScript into dist/

npm start

Start the compiled server

Recommended Verification

cd client
npm run lint
npm run build

cd ../server
npm run build

The backend package currently does not include an automated test suite.

API Overview

Base URL:

/api/v1

The table below lists representative routes rather than every endpoint.

Area

Example routes

Authentication

/auth/register, /auth/login, /auth/refresh, /auth/logout, /auth/me

Password reset

/auth/forgot-password, /auth/verify-reset-otp, /auth/reset-password

Workspaces

/workspaces, /workspaces/:workspaceId

Workspace members

/workspaces/:workspaceId/members, /workspaces/:workspaceId/leave

Workspace invitations

/workspaces/:workspaceId/invitations, /workspace-invitations

Projects

/workspaces/:workspaceId/projects, /projects/:projectId

Project members

/projects/:projectId/members, /projects/:projectId/leave

Project invitations

/projects/:projectId/invitations, /project-invitations/:invitationId/accept

Tasks and issues

/projects/:projectId/tasks, /tasks/:taskId, /projects/:projectId/tasks/reorder

Documents

/projects/:projectId/documents, /documents/:documentId

Discussions

/projects/:projectId/discussions, /discussions/:discussionId/replies

Activity

/workspaces/:workspaceId/activities, /projects/:projectId/activities

Notifications

/notifications, /notifications/unread-count, /notifications/read-all

Private profile

/users/me/profile, /users/me/avatar, /users/me/password

Account deletion

/users/me/deletion-readiness, /users/me

Member profile

/users/:userId/profile?workspaceId=...&projectId=...

Protected routes use the existing authenticated cookie session.

Engineering Decisions

Referenced Membership Collections

Workspace and project memberships are stored in dedicated collections rather than embedding all users inside workspace or project documents.

This supports:

unique membership constraints;

independent role updates;

efficient membership queries;

clean leave/remove operations;

future scaling of large teams.

Feature-Based Frontend

The frontend is organized by business feature instead of file type alone.

Each feature owns its API calls, query hooks, schemas, types, components, and pages. This keeps changes localized and reduces cross-feature coupling.

Thin Controllers, Service-Owned Rules

Backend controllers parse inputs and format responses. Services own authorization, business rules, transactions, and event publication.

This keeps HTTP concerns separate from domain logic.

REST Plus Socket.IO

REST remains the authoritative path for mutations and queries.

Socket.IO does not replace persistence. It informs connected clients that authoritative server data changed so they can invalidate and refetch the correct cache entries.

Context-Authorized Member Profiles

A member profile is not globally public.

The request must include a workspace or project context shared by both users. Unauthorized and nonexistent combinations return the same privacy-safe response.

Anonymization Instead of Destructive History Removal

Deleting an account should remove access and personal identity without destroying shared project history.

SyncSpace therefore anonymizes the User record while preserving references from collaborative resources.

URL-Driven Task Filters

Task filters are represented through URL search parameters. This allows filters and views to survive navigation and makes filtered task views shareable and restorable.

Graceful Shutdown

The server responds to termination signals by closing Socket.IO and HTTP traffic, disconnecting MongoDB, and using a timeout fallback to prevent stalled shutdowns.

Current Limitations

The repository does not yet include automated unit, integration, or end-to-end tests.

A production deployment URL is not yet included.

Application screenshots are pending.

Real-time scaling currently uses the single server process; a distributed Socket.IO adapter is not yet configured.

Email sending occurs through the current application flow rather than a dedicated background-job queue.

CI/CD workflows are not yet included in the repository.

Roadmap

Add polished application screenshots

Add a public deployment

Add unit tests for services and validation

Add API integration tests

Add browser end-to-end tests

Add GitHub Actions for lint, build, and tests

Add Redis-backed Socket.IO scaling

Move external email delivery to background jobs

Add workspace ownership transfer

Add workspace export

Add production monitoring and structured observability

Add deployment and architecture documentation

Contributing

Contributions, bug reports, and improvement suggestions are welcome.

Fork the repository.

Create a feature branch:

git checkout -b feat/your-feature

Make focused changes.

Verify the client and server:

cd client
npm run lint
npm run build

cd ../server
npm run build

Commit using a clear message:

git commit -m "feat: describe the change"

Push your branch and open a pull request.

Please avoid committing:

.env files;

node_modules;

dist;

logs;

credentials;

backup archives;

runtime uploads.

License

This project is licensed under the MIT License.

Author

Sourav Mishra

GitHub: @mishrasourav-prog

Project: SyncSpace

<div align="center">

Built to explore secure collaboration, real-time systems, modular backend design, and production-oriented full-stack engineering.

</div>