import { create } from "zustand";

import type { AuthUser } from "@/features/auth/types/auth.types";

interface AuthState {
  user: AuthUser | null;

  isAuthInitialized: boolean;

  setUser: (user: AuthUser | null) => void;

  markAuthInitialized: () => void;

  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,

  isAuthInitialized: false,

  setUser: (user) => {
    set({
      user,
    });
  },

  markAuthInitialized: () => {
    set({
      isAuthInitialized: true,
    });
  },

  clearSession: () => {
    set({
      user: null,
      isAuthInitialized: true,
    });
  },
}));
