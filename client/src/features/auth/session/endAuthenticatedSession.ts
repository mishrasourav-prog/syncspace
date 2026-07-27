import type { NavigateFunction } from "react-router-dom";
import { toast } from "sonner";

import { useAuthStore } from "@/app/store";
import { queryClient } from "@/lib/queryClient";
import { socket } from "@/realtime/socket";

import type { SessionRevocationReason } from "../types/session.types";

const SESSION_END_TOAST_ID = "syncspace-session-ended";

const DEFAULT_MESSAGES: Record<SessionRevocationReason, string> = {
  logout: "You were signed out.",
  password_changed: "Your password changed. Sign in again.",
  password_reset: "Your password was reset. Sign in again.",
  account_deleted: "This account has been deleted.",
};

interface EndAuthenticatedSessionOptions {
  navigate: NavigateFunction;
  reason: SessionRevocationReason;
  message?: string;
  tone?: "success" | "info";
}

/**
 * Clears the authenticated client state exactly once.
 *
 * An initiating HTTP mutation and the server's Socket.IO revocation event may
 * arrive in either order. The first path clears the current user; later paths
 * see that no authenticated user remains and become no-ops. This prevents
 * duplicate cache clears, redirects, and toasts.
 */
export function endAuthenticatedSession({
  navigate,
  reason,
  message,
  tone = "info",
}: EndAuthenticatedSessionOptions): boolean {
  const authState = useAuthStore.getState();

  if (!authState.user) {
    return false;
  }

  authState.clearSession();

  if (socket.connected) {
    socket.disconnect();
  }

  queryClient.clear();
  navigate("/login", { replace: true });

  const toastMessage = message ?? DEFAULT_MESSAGES[reason];

  if (tone === "success") {
    toast.success(toastMessage, { id: SESSION_END_TOAST_ID });
  } else {
    toast.info(toastMessage, { id: SESSION_END_TOAST_ID });
  }

  return true;
}
