import type { MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "projects", label: "Projects" },
  { id: "members", label: "Members" },
  { id: "activity", label: "Activity" },
  { id: "settings", label: "Settings" },
];

export function WorkspaceOverviewNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = location.hash ? location.hash.replace("#", "") : "overview";

  function handleTabClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    event.preventDefault();
    navigate({ hash: id }, { replace: false });
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <nav aria-label="Workspace sections" className="-mx-1 overflow-x-auto border-b border-border px-1">
      <div className="flex min-w-max gap-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              onClick={(event) => handleTabClick(event, tab.id)}
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
