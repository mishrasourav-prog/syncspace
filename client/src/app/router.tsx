import type { ReactNode } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { OtpVerificationPage } from "@/features/auth/pages/OtpVerificationPage";
import { LandingPage as LandingPageComponent } from "@/features/landing/pages/LandingPage";
import { SignupPage } from "@/features/auth/pages/SignupPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { AppShell } from "@/layouts/AppShell";
import { WorkspaceDashboardPage } from "@/features/workspaces/pages/WorkspaceDashboardPage";
import { WorkspaceOverviewPage } from "@/features/workspaces/pages/WorkspaceOverviewPage";
import { ProjectOverviewPage } from "@/features/projects/pages/ProjectOverviewPage";
import { ProjectTasksPage } from "@/features/tasks/pages/ProjectTasksPage";
import { TaskDetailPage } from "@/features/tasks/pages/TaskDetailPage";
import { ProjectDocumentsPage } from "@/features/documents/pages/ProjectDocumentsPage";
import { DocumentEditorPage } from "@/features/documents/pages/DocumentEditorPage";
import { useAuthStore } from "./store";

function useIsAuthenticated() {
  return useAuthStore((state) => Boolean(state.user));
}

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
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
      onSuccess={() => navigate("/dashboard")}
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

  return (
    <OtpVerificationPage
      email={email}
      onSuccess={(data) =>
        navigate("/reset-password", {
          state: {
            email: data.email,
            resetToken: data.resetToken,
          },
        })
      }
    />
  );
}

function LandingRoute() {
  const navigate = useNavigate();

  return (
    <LandingPageComponent
      onLogin={() => navigate("/login")}
      onSignup={() => navigate("/signup")}
      onGetStarted={() => navigate("/signup")}
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

      {/* Authenticated application shell — sidebar/topbar stay mounted across nested routes. */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<WorkspaceDashboardPage />} />
        <Route path="/workspaces/:workspaceId" element={<WorkspaceOverviewPage />} />
        <Route path="/workspaces/:workspaceId/projects/:projectId" element={<ProjectOverviewPage />} />
        <Route path="/workspaces/:workspaceId/projects/:projectId/tasks" element={<ProjectTasksPage />} />
        <Route path="/workspaces/:workspaceId/projects/:projectId/documents" element={<ProjectDocumentsPage />} />
        <Route
          path="/workspaces/:workspaceId/projects/:projectId/documents/:documentId"
          element={<DocumentEditorPage />}
        />
        <Route path="/workspaces/:workspaceId/projects/:projectId/tasks/:taskId" element={<TaskDetailPage />} />
      </Route>

      {/* Preserve old bookmarks/links pointing at the previous /home route. */}
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

