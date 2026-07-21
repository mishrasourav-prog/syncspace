export interface ProjectSettings {
  allowMemberInvites: boolean;
  allowTaskCreation: boolean;
  allowDocumentCreation: boolean;
  allowFileUploads: boolean;
}

export interface Project {
  _id: string;
  workspace: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  createdBy: string;
  settings: ProjectSettings;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  icon?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  icon?: string;
}
