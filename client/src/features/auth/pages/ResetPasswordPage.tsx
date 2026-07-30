import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useResetPasswordMutation } from "../hooks/useAuthMutations";
import type { ResetPasswordFormValues } from "../schemas/auth.schemas";
import { resetPasswordSchema } from "../schemas/auth.schemas";

interface ResetPasswordLocationState {
  email?: string;
  resetToken?: string;
}

export function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const resetPasswordMutation = useResetPasswordMutation();

  const { email, resetToken } = (location.state ??
    {}) as ResetPasswordLocationState;

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!isSuccess) return;

    const timeoutId = setTimeout(() => {
      navigate("/login");
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [isSuccess, navigate]);

  if (!email || !resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  const onSubmit = (values: ResetPasswordFormValues) => {
    resetPasswordMutation.mutate(
      {
        email,
        resetToken,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
      },
    );
  };

  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold">Create a new password</h1>

            <p className="text-sm text-muted-foreground">
              Choose a strong password that you haven&apos;t used before.
            </p>

            {resetPasswordMutation.isError && (
              <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
                {resetPasswordMutation.error?.message ??
                  "Unable to reset password."}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FormField label="New Password" htmlFor="newPassword">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  icon={Lock}
                  placeholder="Enter new password"
                  error={errors.newPassword?.message}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors duration-150"
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  {...register("newPassword")}
                />
              </FormField>

              <FormField label="Confirm Password" htmlFor="confirmPassword">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  icon={Lock}
                  placeholder="Confirm new password"
                  error={errors.confirmPassword?.message}
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors duration-150"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                  {...register("confirmPassword")}
                />
              </FormField>

              <Button type="submit" disabled={resetPasswordMutation.isPending}>
                {resetPasswordMutation.isPending
                  ? "Updating password..."
                  : "Update password"}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-center py-2"
          >
            <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center mb-4 mx-auto">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <h1 className="text-h2 text-foreground mb-1">Password updated</h1>
            <p className="text-body">
              Your password has been updated successfully. You can now log in..
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
