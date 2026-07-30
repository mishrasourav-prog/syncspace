import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";

import { useAuthStore } from "@/app/store";

import { MemberAboutCard } from "../components/MemberAboutCard";
import { MemberContextCard } from "../components/MemberContextCard";
import { MemberProfilePageSkeleton } from "../components/MemberProfilePageSkeleton";
import { MemberProfileSummary } from "../components/MemberProfileSummary";
import { ProfileErrorState } from "../components/ProfileErrorState";
import { useMemberProfileQuery } from "../hooks/useProfileQueries";
import type { MemberProfile } from "../types/profile.types";

interface BackNavigation {
  destination: string;
  label: string;
}

function getBackNavigation(
  workspaceId: string | undefined,
  projectId: string | undefined,
  member: MemberProfile | undefined,
): BackNavigation {
  if (workspaceId && projectId) {
    return {
      destination: `/workspaces/${workspaceId}/projects/${projectId}#members`,
      label: "Back to project members",
    };
  }

  if (workspaceId) {
    return {
      destination: `/workspaces/${workspaceId}#members`,
      label: "Back to workspace members",
    };
  }

  const returnedWorkspace = member?.context.workspace;
  const returnedProject = member?.context.project;

  if (returnedWorkspace && returnedProject) {
    return {
      destination: `/workspaces/${returnedWorkspace._id}/projects/${returnedProject._id}#members`,
      label: "Back to project members",
    };
  }

  return {
    destination: "/dashboard",
    label: "Back to Dashboard",
  };
}

export function MemberProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const currentUserId = useAuthStore((state) => state.user?._id);

  const workspaceId = searchParams.get("workspaceId")?.trim() || undefined;
  const projectId = searchParams.get("projectId")?.trim() || undefined;
  const hasContext = Boolean(workspaceId || projectId);
  const isSelf = Boolean(userId && currentUserId && userId === currentUserId);
  const canFetch = Boolean(userId) && hasContext && !isSelf;

  const memberProfileQuery = useMemberProfileQuery(
    userId,
    { workspaceId, projectId },
    canFetch,
  );

  if (isSelf) {
    return <Navigate to="/profile" replace />;
  }

  const backNavigation = memberProfileQuery.isError
    ? {
        destination: "/dashboard",
        label: "Back to Dashboard",
      }
    : getBackNavigation(workspaceId, projectId, memberProfileQuery.data);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header>
        <Link
          to={backNavigation.destination}
          className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {backNavigation.label}
        </Link>

        <h1 className="mt-3 text-h1 text-foreground">Member Profile</h1>
        <p className="mt-1 text-body">
          View this member&apos;s public SyncSpace profile and shared context.
        </p>
      </header>

      {!userId ? (
        <ProfileErrorState
          title="Member profile unavailable"
          message="A valid member identifier is required."
        />
      ) : null}

      {userId && !hasContext ? (
        <ProfileErrorState
          title="Member context required"
          message="A workspace or project context is required to view this member profile."
        />
      ) : null}

      {canFetch && memberProfileQuery.isLoading ? (
        <MemberProfilePageSkeleton />
      ) : null}

      {canFetch && memberProfileQuery.isError ? (
        <ProfileErrorState
          title="Member profile unavailable"
          message={
            memberProfileQuery.error.status === 404
              ? "This member profile is not available in the supplied context."
              : memberProfileQuery.error.message ||
                "Unable to load this member profile."
          }
          onRetry={() => {
            void memberProfileQuery.refetch();
          }}
        />
      ) : null}

      {canFetch && memberProfileQuery.isSuccess ? (
        <>
          <MemberProfileSummary member={memberProfileQuery.data} />

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
            <MemberAboutCard member={memberProfileQuery.data} />
            <MemberContextCard context={memberProfileQuery.data.context} />
          </div>
        </>
      ) : null}
    </div>
  );
}

export default MemberProfilePage;
