import { useNavigate } from "react-router-dom";

import { endAuthenticatedSession } from "@/features/auth/session/endAuthenticatedSession";

import { useLogoutMutation } from "./useAuthMutations";

export function useLogout() {
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();

  const logout = () => {
    logoutMutation.mutate(undefined, {
      /*
      Always end the local session, even when the backend cookie has already
      expired. The shared helper also handles the HTTP/socket race safely.
      */
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
