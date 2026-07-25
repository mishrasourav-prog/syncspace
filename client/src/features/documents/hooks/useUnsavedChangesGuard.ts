import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type PendingNavigation =
  | { kind: "route"; to: string }
  | { kind: "history-back" };

const HISTORY_GUARD_KEY = "__syncspaceDocumentUnsavedGuard";

export interface UseUnsavedChangesGuardResult {
  isBlocked: boolean;
  pendingTarget: string | null;
  confirmDiscardAndLeave: () => void;
  navigateToPendingAfterSave: () => void;
  navigateAfterSave: (to: string) => void;
  cancelNavigation: () => void;
  /** Wraps a same-app programmatic navigation with the same guard used for links. */
  guardedNavigate: (to: string) => void;
}

/**
 * Protects document drafts while the app is using BrowserRouter rather than a
 * data router. It covers in-app links, programmatic navigation routed through
 * this hook, tab close/refresh, and browser Back.
 *
 * Browser Back is intercepted with a same-URL history sentinel. Because the
 * first Back only reaches the original entry for the current URL, the route is
 * not allowed to change until the user explicitly discards or saves.
 */
export function useUnsavedChangesGuard(isDirty: boolean): UseUnsavedChangesGuardResult {
  const navigate = useNavigate();
  const isDirtyRef = useRef(isDirty);
  const sentinelActiveRef = useRef(false);
  const suppressNextPopRef = useRef(false);
  const navigationAfterPopRef = useRef<string | null>(null);
  const guardId = useId();

  const [pending, setPending] = useState<PendingNavigation | null>(null);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  const pushSentinel = useCallback(() => {
    if (sentinelActiveRef.current) return;

    window.history.pushState(
      {
        ...(typeof window.history.state === "object" && window.history.state !== null ? window.history.state : {}),
        [HISTORY_GUARD_KEY]: guardId,
      },
      "",
      window.location.href
    );
    sentinelActiveRef.current = true;
  }, [guardId]);

  const removeSentinelThenNavigate = useCallback(
    (to: string) => {
      isDirtyRef.current = false;
      setPending(null);

      if (!sentinelActiveRef.current) {
        navigate(to);
        return;
      }

      navigationAfterPopRef.current = to;
      suppressNextPopRef.current = true;
      window.history.back();
    },
    [navigate]
  );

  useEffect(() => {
    if (isDirty) {
      pushSentinel();
      return;
    }

    if (!sentinelActiveRef.current || suppressNextPopRef.current) return;

    // The draft became clean without leaving (for example after a normal
    // save). Remove the same-URL sentinel so it does not create a duplicate
    // Back stop later.
    suppressNextPopRef.current = true;
    window.history.back();
  }, [isDirty, pushSentinel]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    function handlePopState() {
      if (suppressNextPopRef.current) {
        suppressNextPopRef.current = false;
        sentinelActiveRef.current = false;

        const target = navigationAfterPopRef.current;
        navigationAfterPopRef.current = null;
        if (target) navigate(target);
        return;
      }

      if (!isDirtyRef.current) {
        sentinelActiveRef.current = false;
        return;
      }

      // Back moved from the sentinel to the original entry for this same URL.
      // Restore the sentinel immediately and ask for an explicit decision.
      sentinelActiveRef.current = false;
      pushSentinel();
      setPending({ kind: "history-back" });
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigate, pushSentinel]);

  useEffect(() => {
    function handleClickCapture(event: MouseEvent) {
      if (!isDirtyRef.current) return;
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as HTMLElement | null)?.closest("a[href]");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || anchor.target === "_blank") return;

      event.preventDefault();
      event.stopPropagation();
      setPending({ kind: "route", to: href });
    }

    window.document.addEventListener("click", handleClickCapture, true);
    return () => window.document.removeEventListener("click", handleClickCapture, true);
  }, []);

  const cancelNavigation = useCallback(() => setPending(null), []);

  const confirmDiscardAndLeave = useCallback(() => {
    if (!pending) return;

    isDirtyRef.current = false;
    setPending(null);

    if (pending.kind === "route") {
      removeSentinelThenNavigate(pending.to);
      return;
    }

    // Current entry is the restored sentinel. Skip both it and the original
    // same-URL entry to complete the Back navigation the user requested.
    sentinelActiveRef.current = false;
    suppressNextPopRef.current = true;
    window.history.go(-2);
  }, [pending, removeSentinelThenNavigate]);

  const navigateToPendingAfterSave = useCallback(() => {
    if (!pending) return;

    if (pending.kind === "route") {
      removeSentinelThenNavigate(pending.to);
      return;
    }

    isDirtyRef.current = false;
    setPending(null);
    sentinelActiveRef.current = false;
    suppressNextPopRef.current = true;
    window.history.go(-2);
  }, [pending, removeSentinelThenNavigate]);

  const navigateAfterSave = useCallback(
    (to: string) => {
      removeSentinelThenNavigate(to);
    },
    [removeSentinelThenNavigate]
  );

  const guardedNavigate = useCallback(
    (to: string) => {
      if (!isDirtyRef.current) {
        navigate(to);
        return;
      }
      setPending({ kind: "route", to });
    },
    [navigate]
  );

  return {
    isBlocked: pending !== null,
    pendingTarget: pending?.kind === "route" ? pending.to : null,
    confirmDiscardAndLeave,
    navigateToPendingAfterSave,
    navigateAfterSave,
    cancelNavigation,
    guardedNavigate,
  };
}
