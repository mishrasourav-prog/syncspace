import {
    useEffect,
} from "react";

import {
    useQuery,
} from "@tanstack/react-query";

import {
    useAuthStore,
} from "@/app/store";

import {
    getCurrentUserRequest,
} from "../api/auth.api";

export const authQueryKeys = {
    currentUser: [
        "auth",
        "current-user",
    ] as const,
};

export function useCurrentUserQuery() {
    const setUser =
        useAuthStore(
            (
                state
            ) =>
                state.setUser
        );

    const markAuthInitialized =
        useAuthStore(
            (
                state
            ) =>
                state
                    .markAuthInitialized
        );

    const query =
        useQuery({
            queryKey:
                authQueryKeys
                    .currentUser,

            queryFn:
                getCurrentUserRequest,

            retry:
                false,

            /*
            Do not repeatedly refetch authentication
            merely because the browser window regains focus.
            */
            refetchOnWindowFocus:
                false,
        });

    useEffect(
        () => {
            if (
                query.isSuccess
            ) {
                setUser(
                    query.data
                );

                markAuthInitialized();
            }
        },
        [
            query.isSuccess,
            query.data,
            setUser,
            markAuthInitialized,
        ]
    );

    useEffect(
        () => {
            if (
                query.isError
            ) {
                /*
                /auth/me failed even after the Axios refresh
                attempt, so there is no valid authenticated user.
                */

                setUser(
                    null
                );

                markAuthInitialized();
            }
        },
        [
            query.isError,
            setUser,
            markAuthInitialized,
        ]
    );

    return query;
}