export interface ITaskAssignmentRequestUser {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface ITaskAssignmentRequestResponse {
  _id: string;
  task: string;
  requester: ITaskAssignmentRequestUser;
  status: "pending" | "accepted";
  acceptedBy: ITaskAssignmentRequestUser | null;
  requestedAt: Date;
  acceptedAt: Date | null;
}

export interface ITaskAssignmentRequestsResponse {
  requests: ITaskAssignmentRequestResponse[];
}
