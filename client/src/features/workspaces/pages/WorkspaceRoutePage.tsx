import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Clock, ShieldAlert } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useWorkspaceQuery } from "../hooks/useWorkspaceQueries";
import { formatDate } from "@/lib/date";
import { socket } from "@/realtime/socket";

const roleBadgeVariant: Record<string, "primary" | "secondary" | "neutral"> = {
  owner: "primary",
  admin: "secondary",
  member: "neutral",
  guest: "neutral",
};

export function WorkspaceRoutePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const workspaceQuery = useWorkspaceQuery(workspaceId);

  useEffect(() => {
    if (!workspaceId) return;

    socket.emit("workspace:join", workspaceId, (response) => {
      if (!response?.success) {
        // Room join failure isn't fatal — real-time updates simply won't arrive.
        console.warn("Unable to join workspace room:", response?.message);
      }
    });

    return () => {
      socket.emit("workspace:leave", workspaceId, () => {});
    };
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceQuery.isError && workspaceQuery.error?.status === 404) {
      toast.error("This workspace is no longer accessible.");
      navigate("/dashboard", { replace: true });
    }
  }, [workspaceQuery.isError, workspaceQuery.error, navigate]);

  if (!workspaceId) {
    return null;
  }

  if (workspaceQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <div className="rounded-xl border border-border bg-surface/60 p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (workspaceQuery.isError) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger/5 px-6 py-10 text-center">
        <p className="text-body">
          {workspaceQuery.error?.message ?? "Unable to load this workspace."}
        </p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate("/dashboard")}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  const workspace = workspaceQuery.data;
  if (!workspace) return null;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to dashboard
      </button>

      {workspace.isArchived && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          This workspace is archived and read-only.
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface/60 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar src={workspace.avatar} name={workspace.name} size="lg" square />
            <div>
              <h1 className="text-h1 text-foreground">{workspace.name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge variant={roleBadgeVariant[workspace.role]}>{workspace.role}</Badge>
                {workspace.isArchived && <Badge variant="warning">Archived</Badge>}
                <span className="flex items-center gap-1 text-caption">
                  <Clock className="h-3 w-3" />
                  Updated {formatDate(workspace.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-5 text-body">{workspace.description || "No description provided."}</p>

        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-border pt-5 sm:grid-cols-3">
          <InfoField label="Timezone" value={workspace.timezone} />
          <InfoField label="Slug" value={workspace.slug} />
          <InfoField label="Created" value={formatDate(workspace.createdAt)} />
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-surface/30 px-6 py-10 text-center text-caption">
        Projects, members, and activity for this workspace will appear here in a future update.
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-caption">{label}</p>
      <p className="mt-0.5 truncate text-sm text-foreground">{value}</p>
    </div>
  );
}
