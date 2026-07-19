// // import { useLocation } from "react-router-dom";
// // import { Menu } from "lucide-react";
// // import { NotificationCenter } from "@/features/notifications/components/NotificationCenter";

// // interface AppTopbarProps {
// //   onOpenMobileNav: () => void;
// // }

// // function getPageTitle(pathname: string): string {
// //   if (pathname.startsWith("/workspaces/")) return "Workspace";
// //   return "Dashboard";
// // }

// // export function AppTopbar({ onOpenMobileNav }: AppTopbarProps) {
// //   const location = useLocation();

// //   return (
// //     <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
// //       <div className="flex items-center gap-3">
// //         <button
// //           type="button"
// //           onClick={onOpenMobileNav}
// //           aria-label="Open navigation menu"
// //           className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-border/40 hover:text-foreground lg:hidden"
// //         >
// //           <Menu className="h-5 w-5" />
// //         </button>

// //         <h1 className="text-sm font-medium text-foreground">{getPageTitle(location.pathname)}</h1>
// //       </div>

// //       <div className="flex items-center gap-2">
// //         <NotificationCenter />
// //       </div>
// //     </header>
// //   );
// // }


// // import { useEffect, useRef } from "react";
// // import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
// // import { Menu, Plus, Search, X } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { NotificationCenter } from "@/features/notifications/components/NotificationCenter";

// // interface AppTopbarProps {
// //   onOpenMobileNav: () => void;
// //   onCreateWorkspace: () => void;
// // }

// // function getPageTitle(pathname: string): string {
// //   if (pathname.startsWith("/workspaces/")) return "Workspace";
// //   return "Dashboard";
// // }

// // export function AppTopbar({ onOpenMobileNav, onCreateWorkspace }: AppTopbarProps) {
// //   const location = useLocation();
// //   const navigate = useNavigate();
// //   const [searchParams, setSearchParams] = useSearchParams();
// //   const searchInputRef = useRef<HTMLInputElement>(null);

// //   const isDashboard = location.pathname === "/dashboard";
// //   const searchValue = isDashboard ? searchParams.get("q") ?? "" : "";

// //   useEffect(() => {
// //     function handleKeyDown(event: KeyboardEvent) {
// //       const target = event.target as HTMLElement | null;
// //       const isTypingElsewhere =
// //         target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

// //       if ((event.key === "/" && !isTypingElsewhere) || ((event.metaKey || event.ctrlKey) && event.key === "k")) {
// //         event.preventDefault();
// //         searchInputRef.current?.focus();
// //       }
// //     }

// //     document.addEventListener("keydown", handleKeyDown);
// //     return () => document.removeEventListener("keydown", handleKeyDown);
// //   }, []);

// //   function handleSearchChange(value: string) {
// //     if (!isDashboard) {
// //       navigate(value ? `/dashboard?q=${encodeURIComponent(value)}` : "/dashboard");
// //       return;
// //     }

// //     const next = new URLSearchParams(searchParams);
// //     if (value) {
// //       next.set("q", value);
// //     } else {
// //       next.delete("q");
// //     }
// //     setSearchParams(next, { replace: true });
// //   }

// //   return (
// //     <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
// //       <div className="flex min-w-0 flex-1 items-center gap-3">
// //         <button
// //           type="button"
// //           onClick={onOpenMobileNav}
// //           aria-label="Open navigation menu"
// //           className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-border/40 hover:text-foreground lg:hidden"
// //         >
// //           <Menu className="h-5 w-5" />
// //         </button>

// //         <h1 className="hidden shrink-0 text-sm font-medium text-foreground lg:block">
// //           {getPageTitle(location.pathname)}
// //         </h1>

// //         <Input
// //           ref={searchInputRef}
// //           icon={Search}
// //           value={searchValue}
// //           onChange={(event) => handleSearchChange(event.target.value)}
// //           onKeyDown={(event) => {
// //             if (event.key === "Escape") searchInputRef.current?.blur();
// //           }}
// //           placeholder="Search workspaces…"
// //           aria-label="Search workspaces"
// //           className="max-w-xs"
// //           rightSlot={
// //             searchValue ? (
// //               <button
// //                 type="button"
// //                 onClick={() => handleSearchChange("")}
// //                 aria-label="Clear search"
// //                 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
// //               >
// //                 <X className="h-3.5 w-3.5" />
// //               </button>
// //             ) : undefined
// //           }
// //         />
// //       </div>

// //       <div className="flex shrink-0 items-center gap-2">
// //         <Button size="sm" onClick={onCreateWorkspace} className="hidden sm:inline-flex">
// //           <Plus className="h-4 w-4" />
// //           New workspace
// //         </Button>
// //         <Button size="icon" variant="secondary" onClick={onCreateWorkspace} className="sm:hidden" aria-label="New workspace">
// //           <Plus className="h-4 w-4" />
// //         </Button>

// //         <NotificationCenter />
// //       </div>
// //     </header>
// //   );
// // }


// import { useEffect, useRef } from "react";
// import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
// import { Menu, Plus, Search, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { NotificationCenter } from "@/features/notifications/components/NotificationCenter";

// interface AppTopbarProps {
//   onOpenMobileNav: () => void;
//   onCreateWorkspace: () => void;
// }

// function getPageTitle(pathname: string): string {
//   if (pathname.startsWith("/workspaces/")) return "Workspace";
//   return "Dashboard";
// }

// export function AppTopbar({ onOpenMobileNav, onCreateWorkspace }: AppTopbarProps) {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const searchInputRef = useRef<HTMLInputElement>(null);

//   const isDashboard = location.pathname === "/dashboard";
//   const searchValue = isDashboard ? searchParams.get("q") ?? "" : "";

//   useEffect(() => {
//     function handleKeyDown(event: KeyboardEvent) {
//       const target = event.target as HTMLElement | null;
//       const isTypingElsewhere =
//         target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

//       if ((event.key === "/" && !isTypingElsewhere) || ((event.metaKey || event.ctrlKey) && event.key === "k")) {
//         event.preventDefault();
//         searchInputRef.current?.focus();
//       }
//     }

//     document.addEventListener("keydown", handleKeyDown);
//     return () => document.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   function handleSearchChange(value: string) {
//     if (!isDashboard) {
//       navigate(value ? `/dashboard?q=${encodeURIComponent(value)}` : "/dashboard");
//       return;
//     }

//     const next = new URLSearchParams(searchParams);
//     if (value) {
//       next.set("q", value);
//     } else {
//       next.delete("q");
//     }
//     setSearchParams(next, { replace: true });
//   }

//   return (
//     <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
//       <div className="flex min-w-0 flex-1 items-center gap-3">
//         <button
//           type="button"
//           onClick={onOpenMobileNav}
//           aria-label="Open navigation menu"
//           className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-border/40 hover:text-foreground lg:hidden"
//         >
//           <Menu className="h-5 w-5" />
//         </button>

//         <h1 className="hidden shrink-0 text-sm font-medium text-foreground lg:block">
//           {getPageTitle(location.pathname)}
//         </h1>

//         <Input
//           ref={searchInputRef}
//           icon={Search}
//           value={searchValue}
//           onChange={(event) => handleSearchChange(event.target.value)}
//           onKeyDown={(event) => {
//             if (event.key === "Escape") searchInputRef.current?.blur();
//           }}
//           placeholder="Search workspaces…"
//           aria-label="Search workspaces"
//           className="max-w-xs"
//           rightSlot={
//             searchValue ? (
//               <button
//                 type="button"
//                 onClick={() => handleSearchChange("")}
//                 aria-label="Clear search"
//                 className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
//               >
//                 <X className="h-3.5 w-3.5" />
//               </button>
//             ) : undefined
//           }
//         />
//       </div>

//       <div className="flex shrink-0 items-center gap-2">
//         <Button size="sm" onClick={onCreateWorkspace} className="hidden sm:inline-flex">
//           <Plus className="h-4 w-4" />
//           New workspace
//         </Button>
//         <Button size="icon" variant="secondary" onClick={onCreateWorkspace} className="sm:hidden" aria-label="New workspace">
//           <Plus className="h-4 w-4" />
//         </Button>

//         <NotificationCenter />
//       </div>
//     </header>
//   );
// }

import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronRight, Menu, Plus, Search, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationCenter } from "@/features/notifications/components/NotificationCenter";
import { useWorkspaceQuery } from "@/features/workspaces/hooks/useWorkspaceQueries";
import { useAuthStore } from "@/app/store";
import { useLogout } from "@/features/auth/hooks/useLogout";

interface AppTopbarProps {
  onOpenMobileNav: () => void;
  onCreateWorkspace: () => void;
}

export function AppTopbar({ onOpenMobileNav, onCreateWorkspace }: AppTopbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { workspaceId } = useParams<{ workspaceId?: string }>();
  const isWorkspaceContext = location.pathname.startsWith("/workspaces/");
  const workspaceQuery = useWorkspaceQuery(isWorkspaceContext ? workspaceId : undefined);

  const user = useAuthStore((state) => state.user);
  const { logout, isPending: isLoggingOut } = useLogout();

  const isDashboard = location.pathname === "/dashboard";
  const searchValue = isDashboard || isWorkspaceContext ? searchParams.get("q") ?? "" : "";

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTypingElsewhere =
        target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      if ((event.key === "/" && !isTypingElsewhere) || ((event.metaKey || event.ctrlKey) && event.key === "k")) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSearchChange(value: string) {
    if (!isDashboard && !isWorkspaceContext) {
      navigate(value ? `/dashboard?q=${encodeURIComponent(value)}` : "/dashboard");
      return;
    }

    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set("q", value);
    } else {
      next.delete("q");
    }
    setSearchParams(next, { replace: true });
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open navigation menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-border/40 hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {isWorkspaceContext ? (
          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 text-sm lg:flex">
            <Link to="/dashboard" className="shrink-0 text-muted transition-colors hover:text-foreground">
              Workspaces
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted/60" />
            <span className="truncate font-medium text-foreground">
              {workspaceQuery.data?.name ?? "…"}
            </span>
          </nav>
        ) : (
          <h1 className="hidden shrink-0 text-sm font-medium text-foreground lg:block">Dashboard</h1>
        )}

        <Input
          ref={searchInputRef}
          icon={Search}
          value={searchValue}
          onChange={(event) => handleSearchChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") searchInputRef.current?.blur();
          }}
          placeholder={isWorkspaceContext ? "Search projects or members…" : "Search workspaces…"}
          aria-label={isWorkspaceContext ? "Search projects or members" : "Search workspaces"}
          className="max-w-xs"
          rightSlot={
            searchValue ? (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : undefined
          }
        />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {!isWorkspaceContext && (
          <>
            <Button size="sm" onClick={onCreateWorkspace} className="hidden sm:inline-flex">
              <Plus className="h-4 w-4" />
              New workspace
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={onCreateWorkspace}
              className="sm:hidden"
              aria-label="New workspace"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </>
        )}

        <NotificationCenter />

        {isWorkspaceContext && user && (
          <DropdownMenu>
            <DropdownMenuTrigger aria-label="Account menu" className="!h-9 !w-9 rounded-full p-0">
              <Avatar src={user.avatar} name={user.name} size="sm" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="danger" onClick={logout} disabled={isLoggingOut}>
                <LogOut className="h-3.5 w-3.5" />
                {isLoggingOut ? "Logging out..." : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

