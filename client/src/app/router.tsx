import type { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { OtpVerificationPage } from "@/features/auth/pages/OtpVerificationPage";
import { LandingPage as LandingPageComponent } from "@/features/landing/pages/LandingPage";
import { SignupPage } from "@/features/auth/pages/SignupPage";
import { useAuthStore } from "./store";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { useLogoutMutation } from "@/features/auth/hooks/useAuthMutations";

function useIsAuthenticated() {
    return useAuthStore(state => Boolean(state.user));
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!useIsAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function LoginRoute() {
  const navigate = useNavigate();

  return (
    <LoginPage
      onSuccess={() => navigate("/home")}
      onNavigateToSignup={() => navigate("/signup")}
      onNavigateToForgotPassword={() => navigate("/forgot-password")}
    />
  );
}

function SignupRoute() {
  const navigate = useNavigate();

  return (
    <SignupPage
      onSuccess={() => navigate("/login")}
      onNavigateToLogin={() => navigate("/login")}
    />
  );
}

function ForgotPasswordRoute() {
  const navigate = useNavigate();

  return <ForgotPasswordPage onNavigateToLogin={() => navigate("/login")} />;
}

function OtpVerificationRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email;

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  return <OtpVerificationPage
  email={email}
  onSuccess={(data) =>
    navigate("/reset-password", {
      state: {
        email: data.email,
        resetToken: data.resetToken,
      },
    })
  }
/>;
}


function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const logoutMutation = useLogoutMutation();

  const handleLogout = () => {
  logoutMutation.mutate(undefined, {
    onSuccess: () => {
      clearSession();
      navigate("/");
    },
  });
};

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <h1 className="text-h1 text-foreground">Welcome{user ? `, ${user.name}` : ""}</h1>
      <p className="text-body mt-2">You&apos;re signed in to SyncSpace.</p>
      <Button
  variant="secondary"
  className="mt-6"
  onClick={handleLogout}
  disabled={logoutMutation.isPending}
>
  {logoutMutation.isPending ? "Logging out..." : "Log out"}
</Button>
    </div>
  );
}

function LandingRoute() {
  const navigate = useNavigate();

  return (
    <LandingPageComponent
      onLogin={() => navigate("/login")}
      onSignup={() => navigate("/signup")}
      onGetStarted={()=>navigate("/signup")}
    />
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginRoute />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignupRoute />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordRoute />
          </PublicOnlyRoute>
        }
      />
      
      <Route
        path="/otp-verification"
        element={
          <PublicOnlyRoute>
            <OtpVerificationRoute />
          </PublicOnlyRoute>
        }
      />

      <Route
  path="/reset-password"
  element={
    <PublicOnlyRoute>
      <ResetPasswordPage />
    </PublicOnlyRoute>
  }
/>

      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <LandingRoute />
          </PublicOnlyRoute>
        }
      />
      <Route
  path="/home"
  element={
    <ProtectedRoute>
      <HomePage />
    </ProtectedRoute>
  }
/>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
