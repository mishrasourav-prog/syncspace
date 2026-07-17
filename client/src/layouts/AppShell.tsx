import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/navigation/AppSidebar";
import { AppTopbar } from "@/components/navigation/AppTopbar";
import { MobileNavigationDrawer } from "@/components/navigation/MobileNavigationDrawer";
import { useSocketLifecycle } from "@/realtime/useSocketLifecycle";

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useSocketLifecycle();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar />

      <MobileNavigationDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar onOpenMobileNav={() => setMobileNavOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
