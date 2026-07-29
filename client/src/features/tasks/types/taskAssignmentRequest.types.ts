export interface TaskAssignmentRequestUser {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface TaskAssignmentRequest {
  _id: string;
  task: string;
  requester: TaskAssignmentRequestUser;
  status: "pending" | "accepted";
  acceptedBy: TaskAssignmentRequestUser | null;
  requestedAt: string;
  acceptedAt: string | null;
}
