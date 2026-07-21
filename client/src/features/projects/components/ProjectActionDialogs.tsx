import {
    useNavigate,
} from "react-router-dom";

import {
    toast,
} from "sonner";

import {
    ConfirmDialog,
} from "@/components/ui/confirm-dialog";

import {
    useLeaveProjectMutation,
} from "@/features/project-members/hooks/useProjectMemberMutations";

import {
    useArchiveProjectMutation,
    useRestoreProjectMutation,
} from "../hooks/useProjectMutations";

import type {
    Project,
} from "../types/project.types";

export type ProjectActionType =
    | "archive"
    | "restore"
    | "leave";

export interface ProjectActionTarget {
    type:
        ProjectActionType;

    project:
        Project;
}

interface ProjectActionDialogsProps {
    target:
        ProjectActionTarget |
        null;

    workspaceId:
        string;

    onClose:
        () => void;
}

export function ProjectActionDialogs({
    target,
    workspaceId,
    onClose,
}: ProjectActionDialogsProps) {
    const navigate =
        useNavigate();

    const projectId =
        target?.project._id ??
        "";

    const archiveMutation =
        useArchiveProjectMutation(
            projectId,
            workspaceId
        );

    const restoreMutation =
        useRestoreProjectMutation(
            projectId,
            workspaceId
        );

    /*
    workspaceId is passed so the leave mutation can invalidate the
    parent workspace's project-list query after clearing project caches.
    */

    const leaveMutation =
        useLeaveProjectMutation(
            projectId,
            workspaceId
        );

    const activeMutation =
        target?.type ===
        "archive"
            ? archiveMutation
            : target?.type ===
                "restore"
              ? restoreMutation
              : leaveMutation;

    function handleClose(): void {
        if (
            activeMutation.isPending
        ) {
            return;
        }

        archiveMutation.reset();
        restoreMutation.reset();
        leaveMutation.reset();

        onClose();
    }

    function handleConfirm(): void {
        if (
            !target
        ) {
            return;
        }

        if (
            target.type ===
            "archive"
        ) {
            archiveMutation.mutate(
                undefined,
                {
                    onSuccess:
                        () => {
                            toast.success(
                                "Project archived."
                            );

                            onClose();
                        },
                }
            );

            return;
        }

        if (
            target.type ===
            "restore"
        ) {
            restoreMutation.mutate(
                undefined,
                {
                    onSuccess:
                        () => {
                            toast.success(
                                "Project restored."
                            );

                            onClose();
                        },
                }
            );

            return;
        }

        leaveMutation.mutate(
            undefined,
            {
                onSuccess:
                    () => {
                        /*
                        The hook clears all project caches before this local
                        success callback runs.
                        */

                        toast.success(
                            "You left the project."
                        );

                        navigate(
                            `/workspaces/${workspaceId}#projects`,
                            {
                                replace:
                                    true,
                            }
                        );

                        onClose();
                    },

                onError:
                    (
                        error
                    ) => {
                        toast.error(
                            error.message ??
                            "Unable to leave project."
                        );
                    },
            }
        );
    }

    if (
        !target
    ) {
        return null;
    }

    const copy: Record<
        ProjectActionType,
        {
            title:
                string;

            description:
                string;

            confirmLabel:
                string;

            tone:
                "danger" |
                "default";
        }
    > = {
        archive: {
            title:
                "Archive project?",

            description:
                `"${target.project.name}" will remain readable, but no further changes can be made until it's restored.`,

            confirmLabel:
                "Archive project",

            tone:
                "danger",
        },

        restore: {
            title:
                "Restore project?",

            description:
                `"${target.project.name}" will become active again and mutations will be re-enabled.`,

            confirmLabel:
                "Restore project",

            tone:
                "default",
        },

        leave: {
            title:
                "Leave project?",

            description:
                `You'll lose access to "${target.project.name}" and your task assignments in it will be revoked.`,

            confirmLabel:
                "Leave project",

            tone:
                "danger",
        },
    };

    const activeCopy =
        copy[
            target.type
        ];

    return (
        <ConfirmDialog
            open={
                Boolean(
                    target
                )
            }
            onClose={
                handleClose
            }
            onConfirm={
                handleConfirm
            }
            title={
                activeCopy.title
            }
            description={
                activeCopy.description
            }
            confirmLabel={
                activeCopy.confirmLabel
            }
            confirmVariant={
                activeCopy.tone ===
                "danger"
                    ? "danger"
                    : "primary"
            }
            tone={
                activeCopy.tone
            }
            isPending={
                activeMutation.isPending
            }
            errorMessage={
                activeMutation.error
                    ?.message
            }
        />
    );
}