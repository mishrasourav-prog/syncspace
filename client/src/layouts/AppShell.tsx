// import { useState } from "react";
// import { Outlet } from "react-router-dom";
// import { AppSidebar } from "@/components/navigation/AppSidebar";
// import { AppTopbar } from "@/components/navigation/AppTopbar";
// import { MobileNavigationDrawer } from "@/components/navigation/MobileNavigationDrawer";
// import { CreateWorkspaceDialog } from "@/features/workspaces/components/CreateWorkspaceDialog";
// import { useSocketLifecycle } from "@/realtime/useSocketLifecycle";

// export interface AppShellOutletContext {
//   onCreateWorkspace: () => void;
// }

// export function AppShell() {
//   const [mobileNavOpen, setMobileNavOpen] = useState(false);
//   const [createDialogOpen, setCreateDialogOpen] = useState(false);

//   useSocketLifecycle();

//   const outletContext: AppShellOutletContext = {
//     onCreateWorkspace: () => setCreateDialogOpen(true),
//   };

//   return (
//     <div className="flex h-screen w-full overflow-hidden bg-background">
//       <AppSidebar onCreateWorkspace={outletContext.onCreateWorkspace} />

//       <MobileNavigationDrawer
//         open={mobileNavOpen}
//         onClose={() => setMobileNavOpen(false)}
//         onCreateWorkspace={outletContext.onCreateWorkspace}
//       />

//       <div className="flex min-w-0 flex-1 flex-col">
//         <AppTopbar onOpenMobileNav={() => setMobileNavOpen(true)} onCreateWorkspace={outletContext.onCreateWorkspace} />

//         <main className="flex-1 overflow-y-auto">
//           <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
//             <Outlet context={outletContext} />
//           </div>
//         </main>
//       </div>

//       <CreateWorkspaceDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
//     </div>
//   );
// }


import { useState } from "react";
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

  const outletContext: AppShellOutletContext = {
    onCreateWorkspace: () => setCreateDialogOpen(true),
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar onCreateWorkspace={outletContext.onCreateWorkspace} />

      <MobileNavigationDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onCreateWorkspace={outletContext.onCreateWorkspace}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar onOpenMobileNav={() => setMobileNavOpen(true)} onCreateWorkspace={outletContext.onCreateWorkspace} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            <Outlet context={outletContext} />
          </div>
        </main>
      </div>

      <CreateWorkspaceDialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} />
    </div>
  );
}
