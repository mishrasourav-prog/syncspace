import { useNavigate } from "react-router-dom";

import { endAuthenticatedSession } from "@/features/auth/session/endAuthenticatedSession";

import { useLogoutMutation } from "./useAuthMutations";

export function useLogout() {
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();

  const logout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        endAuthenticatedSession({
          navigate,
          reason: "logout",
          message: "Logged out successfully.",
          tone: "success",
        });
      },
    });
  };

  return {
    logout,
    isPending: logoutMutation.isPending,
  };
}
