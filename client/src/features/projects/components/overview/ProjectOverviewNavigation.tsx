import type { MouseEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const HASH_TABS = [
  { id: "overview", label: "Overview" },
  { id: "members", label: "Members" },
  { id: "activity", label: "Activity" },
  { id: "settings", label: "Settings" },
];

/**
 * Tab strip shown on both the project overview page and the dedicated
 * tasks/documents/discussions pages. "Tasks & Issues", "Documents", and
 * "Discussions" are real routes,
 * not hash sections, so they navigate rather than scrolling — every other
 * tab scrolls a section on the overview page and navigates there first if
 * visited from elsewhere.
 */
export function ProjectOverviewNavigation() {
  const { workspaceId, projectId } = useParams<{ workspaceId: string; projectId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const overviewPath = `/workspaces/${workspaceId}/projects/${projectId}`;
  const tasksPath = `${overviewPath}/tasks`;
  const isTasksRoute = location.pathname === tasksPath || location.pathname.startsWith(`${tasksPath}/`);
  const documentsPath = `${overviewPath}/documents`;
  const isDocumentsRoute = location.pathname === documentsPath || location.pathname.startsWith(`${documentsPath}/`);
  const discussionsPath = `${overviewPath}/discussions`;
  const isDiscussionsRoute = location.pathname === discussionsPath || location.pathname.startsWith(`${discussionsPath}/`);
  const isRealRoute = isTasksRoute || isDocumentsRoute || isDiscussionsRoute;

  const activeHashTab = location.hash ? location.hash.replace("#", "") : "overview";

  function handleHashTabClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();

    if (isRealRoute) {
      navigate(`${overviewPath}#${id}`);
      return;
    }

    navigate({ hash: id }, { replace: false });
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <nav aria-label="Project sections" className="-mx-1 overflow-x-auto border-b border-border px-1">
      <div className="flex min-w-max gap-1">
        <a
          href={`${overviewPath}#overview`}
          onClick={(event) => handleHashTabClick(event, "overview")}
          aria-current={!isRealRoute && activeHashTab === "overview" ? "true" : undefined}
          className={cn(
            "relative whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
            !isRealRoute && activeHashTab === "overview" ? "text-primary" : "text-muted hover:text-foreground"
          )}
        >
          Overview
          {!isRealRoute && activeHashTab === "overview" && (
            <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />
          )}
        </a>

        <Link
          to={tasksPath}
          aria-current={isTasksRoute ? "true" : undefined}
          className={cn(
            "relative whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
            isTasksRoute ? "text-primary" : "text-muted hover:text-foreground"
          )}
        >
          Tasks &amp; Issues
          {isTasksRoute && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />}
        </Link>

        <Link
          to={documentsPath}
          aria-current={isDocumentsRoute ? "true" : undefined}
          className={cn(
            "relative whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
            isDocumentsRoute ? "text-primary" : "text-muted hover:text-foreground"
          )}
        >
          Documents
          {isDocumentsRoute && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />}
        </Link>

        <Link
          to={discussionsPath}
          aria-current={isDiscussionsRoute ? "true" : undefined}
          className={cn(
            "relative whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
            isDiscussionsRoute ? "text-primary" : "text-muted hover:text-foreground"
          )}
        >
          Discussions
          {isDiscussionsRoute && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />}
        </Link>

        {HASH_TABS.filter((tab) => tab.id !== "overview").map((tab) => {
          const isActive = !isRealRoute && activeHashTab === tab.id;

          return (
            <a
              key={tab.id}
              href={`${overviewPath}#${tab.id}`}
              onClick={(event) => handleHashTabClick(event, tab.id)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "relative whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "text-primary" : "text-muted hover:text-foreground"
              )}
            >
              {tab.label}
              {isActive && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary" />}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
