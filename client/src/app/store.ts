import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/features/auth/types/auth.types";

interface AuthState {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
  (set) => ({
    user: null,
    accessToken: null,


    setUser: (user) => {
      set((state) => ({
        ...state,
        user,
      }));
    },

    clearSession: () => {
      localStorage.removeItem("syncspace_access_token");
      set({
        user: null,
      });
    },
  }),
  {
    name: "syncspace-auth",
  }
)
);