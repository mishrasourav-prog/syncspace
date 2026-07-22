export interface TaskAssigneeUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface TaskAssignee {
  _id: string;
  task: string;
  user: TaskAssigneeUser;
  assignedBy: string;
  assignedAt: string;
}
