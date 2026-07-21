import {
    useQuery,
} from "@tanstack/react-query";

import type {
    ApiErrorShape,
} from "@/lib/axios";

import {
    getPendingProjectInvitationsRequest,
} from "../api/projectInvitation.api";

import {
    projectInvitationQueryKeys,
} from "../projectInvitation.queryKeys";

import type {
    ProjectInvitation,
} from "../types/projectInvitation.types";

export function useProjectInvitationsQuery(
    projectId:
        string |
        undefined,

    enabled =
        true
) {
    return useQuery<
        ProjectInvitation[],
        ApiErrorShape
    >({
        queryKey:
            projectInvitationQueryKeys
                .list(
                    projectId ??
                    ""
                ),

        queryFn:
            () => {
                if (
                    !projectId
                ) {
                    return Promise.resolve(
                        []
                    );
                }

                return getPendingProjectInvitationsRequest(
                    projectId
                );
            },

        enabled:
            Boolean(
                projectId
            ) &&
            enabled,
    });
}