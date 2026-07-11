import { IProjectDocument } from "../modules/project/project.model";
import ApiError from "../utils/ApiError";
import Project from "../modules/project/project.model";
import { IProjectInvitationDocument } from "../modules/projectInvitation/projectInvitation.model";
import ProjectInvitation from "../modules/projectInvitation/projectInvitation.model";

export const getProjectOrThrow =
    async (projectId: string): 
    Promise<IProjectDocument> => {

    const project = await Project.findById(projectId);

    if (!project) {
        throw new ApiError(
            404,
            "Project not found."
        );
    }

    return project;
}

export const getInvitationOrThrow = 
    async (invitationId: string): 
    Promise<IProjectInvitationDocument> => {

    const invitation =
        await ProjectInvitation.findById(
            invitationId
        );

    if (!invitation) {
        throw new ApiError(
            404,
            "Invitation not found."
        );
    }

    return invitation;
}