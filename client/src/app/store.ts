import {
    create,
} from "zustand";

import type {
    AuthUser,
} from "@/features/auth/types/auth.types";

interface AuthState {
    user:
        AuthUser |
        null;

    /*
    False while the application is checking /auth/me.

    Route guards must not redirect until this becomes true.
    */
    isAuthInitialized:
        boolean;

    setUser: (
        user:
            AuthUser |
            null
    ) => void;

    markAuthInitialized:
        () => void;

    clearSession:
        () => void;
}

export const useAuthStore =
    create<AuthState>(
        (set) => ({
            user:
                null,

            isAuthInitialized:
                false,

            setUser: (
                user
            ) => {
                set({
                    user,
                });
            },

            markAuthInitialized:
                () => {
                    set({
                        isAuthInitialized:
                            true,
                    });
                },

            clearSession:
                () => {
                    set({
                        user:
                            null,
                            isAuthInitialized: true,
                    });
                },
        })
    );