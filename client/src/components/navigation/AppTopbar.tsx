import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { NotificationCenter } from "@/features/notifications/components/NotificationCenter";

interface AppTopbarProps {
  onOpenMobileNav: () => void;
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/workspaces/")) return "Workspace";
  return "Dashboard";
}

export function AppTopbar({ onOpenMobileNav }: AppTopbarProps) {
  const location = useLocation();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-border/40 hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="text-sm font-medium text-foreground">{getPageTitle(location.pathname)}</h1>
      </div>

      <div className="flex items-center gap-2">
        <NotificationCenter />
      </div>
    </header>
  );
}
