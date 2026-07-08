import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { SocialAuthButtons, AuthDivider } from "../components/SocialAuthButtons";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { loginSchema, type LoginFormValues } from "../schemas/auth.schemas";
import { useLoginMutation } from "../hooks/useAuthMutations";

interface LoginPageProps {
  onSuccess?: () => void;
  onNavigateToSignup?: () => void;
  onNavigateToForgotPassword?: () => void;
}

export function LoginPage({ onSuccess, onNavigateToSignup, onNavigateToForgotPassword }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, { onSuccess: () => onSuccess?.() });
    
  };

  return (
    <AuthLayout>
      <h1 className="text-h1 text-foreground mb-1">Welcome back</h1>
      <p className="text-body mb-6">Log in to continue</p>

      <SocialAuthButtons />
      <AuthDivider />

      {loginMutation.isError && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {loginMutation.error?.message ?? "Unable to log in. Please try again."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            icon={Mail}
            placeholder="you@company.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </FormField>

        <FormField label="Password" htmlFor="password">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            icon={Lock}
            placeholder="••••••••"
            error={errors.password?.message}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors duration-150"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register("password")}
          />
        </FormField>

        <div className="flex justify-end mb-6 -mt-2">
          <button
            type="button"
            onClick={onNavigateToForgotPassword}
            className="text-xs text-primary hover:text-primary/80 transition-colors duration-150"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Logging in..." : "Log in"}
          {!loginMutation.isPending && <ArrowRight className="w-3.5 h-3.5" />}
        </Button>
      </form>

      <p className="text-center text-caption mt-6">
        Don&apos;t have an account?{" "}
        <button
          onClick={onNavigateToSignup}
          className="text-primary hover:text-primary/80 font-medium transition-colors duration-150"
        >
          Sign up
        </button>
      </p>
    </AuthLayout>
  );
}