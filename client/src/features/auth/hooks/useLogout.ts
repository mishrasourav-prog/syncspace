import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/app/store";
import { socket } from "@/realtime/socket";
import { useLogoutMutation } from "./useAuthMutations";

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);
  const logoutMutation = useLogoutMutation();

  const logout = () => {
    logoutMutation.mutate(undefined, {
      /*
      Always clear frontend state, even if the backend says the
      cookie has already expired.
      */
      onSettled: () => {
        clearSession();
        if (socket.connected) socket.disconnect();
        queryClient.clear();
        navigate("/", { replace: true });
      },
    });
  };

  return { logout, isPending: logoutMutation.isPending };
}
