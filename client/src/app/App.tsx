import { BrowserRouter } from "react-router-dom";

import { Providers } from "./providers";

import { AppRouter } from "./router";

import { useCurrentUserQuery } from "@/features/auth/hooks/useAuthQueries";

import { useAuthStore } from "./store";

function AuthLoadingScreen() {
  return (
    <div
      className="
                flex
                min-h-screen
                items-center
                justify-center
                bg-background
            "
    >
      <div
        className="
                    flex
                    flex-col
                    items-center
                    gap-3
                "
      >
        <div
          className="
                        h-8
                        w-8
                        animate-spin
                        rounded-full
                        border-2
                        border-muted
                        border-t-primary
                    "
        />

        <p
          className="
                        text-sm
                        text-muted-foreground
                    "
        >
          Loading SyncSpace...
        </p>
      </div>
    </div>
  );
}

function AuthInitializer() {
  useCurrentUserQuery();

  const isAuthInitialized = useAuthStore((state) => state.isAuthInitialized);

  if (!isAuthInitialized) {
    return <AuthLoadingScreen />;
  }

  return <AppRouter />;
}

export function App() {
  return (
    <Providers>
      <BrowserRouter>
        <AuthInitializer />
      </BrowserRouter>
    </Providers>
  );
}
