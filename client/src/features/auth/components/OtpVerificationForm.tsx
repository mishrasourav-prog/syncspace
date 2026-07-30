import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";

import { Controller, useForm } from "react-hook-form";

import { ArrowLeft, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AuthLayout } from "@/layouts/AuthLayout";

import { otpSchema, type OtpFormValues } from "../schemas/auth.schemas";

import { useResendTimer } from "../hooks/useResendTimer";

import { OtpInput } from "./OtpInput";

interface OtpVerificationFormProps {
  title: string;
  description: string;
  email: string;
  verifyLabel: string;
  verifyingLabel?: string;
  errorMessage?: string;
  isVerifying: boolean;
  isResending: boolean;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<number | void>;
  onChangeEmail?: () => void;
  onCodeChange?: () => void;
  changeEmailLabel?: string;
  initialCooldownSeconds?: number;
}

export function OtpVerificationForm({
  title,
  description,
  email,
  verifyLabel,
  verifyingLabel = "Verifying...",
  errorMessage,
  isVerifying,
  isResending,
  onVerify,
  onResend,
  onChangeEmail,
  onCodeChange,
  changeEmailLabel = "Change email",
  initialCooldownSeconds = 60,
}: OtpVerificationFormProps) {
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const {
    canResend,
    formatted,
    reset: resetTimer,
  } = useResendTimer(initialCooldownSeconds);

  const {
    control,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const submitCode = async (values: OtpFormValues): Promise<void> => {
    setResendMessage(null);

    try {
      await onVerify(values.otp);
    } catch {}
  };

  const resendCode = async (): Promise<void> => {
    if (!canResend || isResending) {
      return;
    }

    setResendMessage(null);

    try {
      const cooldown = await onResend();

      reset({
        otp: "",
      });

      clearErrors();

      resetTimer(
        typeof cooldown === "number" ? cooldown : initialCooldownSeconds,
      );

      setResendMessage("A new verification code has been sent.");
    } catch {}
  };

  return (
    <AuthLayout>
      {onChangeEmail ? (
        <button
          type="button"
          onClick={onChangeEmail}
          className="mb-5 inline-flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {changeEmailLabel}
        </button>
      ) : null}

      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
        <Mail className="h-5 w-5 text-primary" />
      </div>

      <h1 className="mb-1 text-h1 text-foreground">{title}</h1>

      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      <div className="mb-6 mt-3 rounded-lg border border-border bg-background/60 px-3 py-2.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
          Code sent to
        </p>
        <p className="mt-0.5 break-all text-sm font-medium text-foreground">
          {email}
        </p>
      </div>

      {errorMessage ? (
        <div
          className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs leading-relaxed text-danger"
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      {resendMessage ? (
        <div
          className="mb-4 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs leading-relaxed text-success"
          role="status"
        >
          {resendMessage}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(submitCode)} noValidate>
        <div className="mb-6">
          <Controller
            name="otp"
            control={control}
            render={({ field }) => (
              <OtpInput
                value={field.value}
                onChange={(value) => {
                  clearErrors("otp");
                  onCodeChange?.();
                  field.onChange(value);
                }}
                error={errors.otp?.message}
                disabled={isVerifying}
              />
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isVerifying}>
          {isVerifying ? verifyingLabel : verifyLabel}
        </Button>
      </form>

      <p className="mt-6 text-center text-caption">
        Didn&apos;t get a code?{" "}
        <button
          type="button"
          onClick={resendCode}
          disabled={!canResend || isResending}
          className="font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:text-muted"
        >
          {isResending
            ? "Sending..."
            : canResend
              ? "Resend code"
              : `Resend in ${formatted}`}
        </button>
      </p>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
        The code expires in 10 minutes. For your security, never share it with
        anyone.
      </p>
    </AuthLayout>
  );
}
