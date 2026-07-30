export interface ICreateProject {
  name: string;
  description?: string;
  icon?: string;
}

export interface IUpdateProject {
  name?: string;
  description?: string;
  icon?: string;
}

export interface IProjectResponse {
  _id: string;
  workspace: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  createdBy: string;

  settings: {
    allowMemberInvites: boolean;
    allowTaskCreation: boolean;
    allowDocumentCreation: boolean;
    allowFileUploads: boolean;
  };

  isArchived: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkspaceProjectsResponse {
  projects: IProjectResponse[];
}
