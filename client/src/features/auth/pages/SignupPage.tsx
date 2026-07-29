import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, AtSign, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signupSchema, type SignupFormValues } from "../schemas/auth.schemas";
import { useSignupMutation } from "../hooks/useAuthMutations";
import type { PendingRegistrationResponse } from "../types/auth.types";

interface SignupPageProps {
  onSuccess?: (result: PendingRegistrationResponse) => void;
  onNavigateToLogin?: () => void;
}

export function SignupPage({ onSuccess, onNavigateToLogin }: SignupPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const signupMutation = useSignupMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: SignupFormValues): void => {
    signupMutation.mutate(
      {
        name: values.name,
        username: values.username,
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: (data) => onSuccess?.(data),
      }
    );
  };

  return (
    <AuthLayout>
      <h1 className="mb-1 text-h1 text-foreground">Create your account</h1>
      <p className="mb-6 text-body">Create an account, then verify your email to start your workspace.</p>

      {signupMutation.isError ? (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {signupMutation.error?.message ?? "Unable to create account. Please try again."}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
          <FormField label="Full name" htmlFor="fullName">
            <Input
              id="fullName"
              autoComplete="name"
              icon={User}
              placeholder="Alan Turing"
              error={errors.name?.message}
              {...register("name")}
            />
          </FormField>

          <FormField label="Username" htmlFor="username">
            <Input
              id="username"
              autoComplete="username"
              icon={AtSign}
              placeholder="alanturing"
              error={errors.username?.message}
              {...register("username")}
            />
          </FormField>
        </div>

        <FormField label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            icon={Mail}
            placeholder="you@company.com"
            error={errors.email?.message}
            {...register("email")}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2">
          <FormField label="Password" htmlFor="password">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              icon={Lock}
              placeholder="Strong password"
              error={errors.password?.message}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register("password")}
            />
          </FormField>

          <FormField label="Confirm password" htmlFor="confirmPassword">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              icon={Lock}
              placeholder="Repeat password"
              error={errors.confirmPassword?.message}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              {...register("confirmPassword")}
            />
          </FormField>
        </div>

        <p className="mb-4 text-xs leading-relaxed text-muted">
          Use 8–128 characters with uppercase, lowercase, number, and one special character: @ $ ! % * ? &amp;.
          You can add an avatar later from your Profile page.
        </p>

        <Button type="submit" className="w-full" disabled={signupMutation.isPending}>
          {signupMutation.isPending ? "Sending verification code..." : "Continue with email verification"}
          {!signupMutation.isPending ? <ArrowRight className="h-3.5 w-3.5" /> : null}
        </Button>
      </form>

      <p className="mt-6 text-center text-caption">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onNavigateToLogin}
          className="font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          Log in
        </button>
      </p>
    </AuthLayout>
  );
}
