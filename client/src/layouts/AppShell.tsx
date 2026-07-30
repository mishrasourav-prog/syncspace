import { useCallback, useState } from "react";

import { Outlet } from "react-router-dom";

import { AppSidebar } from "@/components/navigation/AppSidebar";

import { AppTopbar } from "@/components/navigation/AppTopbar";

import { MobileNavigationDrawer } from "@/components/navigation/MobileNavigationDrawer";

import { CreateWorkspaceDialog } from "@/features/workspaces/components/CreateWorkspaceDialog";

import { useSocketLifecycle } from "@/realtime/useSocketLifecycle";

export interface AppShellOutletContext {
  onCreateWorkspace: () => void;
}

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useSocketLifecycle();

  const openMobileNavigation = useCallback(() => {
    setMobileNavOpen(true);
  }, []);

  const closeMobileNavigation = useCallback(() => {
    setMobileNavOpen(false);
  }, []);

  const openCreateWorkspace = useCallback(() => {
    setCreateDialogOpen(true);
  }, []);

  const closeCreateWorkspace = useCallback(() => {
    setCreateDialogOpen(false);
  }, []);

  const outletContext: AppShellOutletContext = {
    onCreateWorkspace: openCreateWorkspace,
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <AppSidebar onCreateWorkspace={openCreateWorkspace} />

      <MobileNavigationDrawer
        open={mobileNavOpen}
        onClose={closeMobileNavigation}
        onCreateWorkspace={openCreateWorkspace}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppTopbar
          onOpenMobileNav={openMobileNavigation}
          onCreateWorkspace={openCreateWorkspace}
        />

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            <Outlet context={outletContext} />
          </div>
        </main>
      </div>

      <CreateWorkspaceDialog
        open={createDialogOpen}
        onClose={closeCreateWorkspace}
      />
    </div>
  );
}
