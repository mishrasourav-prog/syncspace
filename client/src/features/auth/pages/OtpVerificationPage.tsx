import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { OtpInput } from "../components/OtpInput";
import { Button } from "@/components/ui/button";
import { useResendTimer } from "../hooks/useResendTimer";
import { useVerifyOtpMutation, useResendOtpMutation } from "../hooks/useAuthMutations";
import { otpSchema, type OtpFormValues } from "../schemas/auth.schemas";
import { type VerifyOtpResponse } from "../types/auth.types";

interface OtpVerificationPageProps {
  email: string;
  onSuccess?: (data: VerifyOtpResponse) => void;
}
export function OtpVerificationPage({ email, onSuccess }: OtpVerificationPageProps) {
  const verifyOtpMutation = useVerifyOtpMutation();
  const resendOtpMutation = useResendOtpMutation();
  const { canResend, formatted, reset:resetTimer } = useResendTimer(45);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    clearErrors,
    formState: { errors },
    
  } = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const otp = watch("otp");

  const onSubmit = (values: OtpFormValues) => {
    verifyOtpMutation.mutate(
  { email, otp: values.otp },
  {
    onSuccess: (data) => {
      onSuccess?.(data);
    },
  }
);
  };

  const handleResend = () => {
    if (!canResend) return;
    
    resendOtpMutation.mutate(email, { onSuccess: () =>{reset({otp:""}); resetTimer();} });

  };

  

  return (
    <AuthLayout>
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <Mail className="w-5 h-5 text-primary" />
      </div>
      <h1 className="text-h1 text-foreground mb-1">Verify your email</h1>
      <p className="text-body mb-6">
        We&apos;ve sent a 6-digit code to <span className="text-foreground">{email}</span>
      </p>

      {verifyOtpMutation.isError && (
        <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
          {verifyOtpMutation.error?.message ?? "Invalid code. Please try again."}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-6">
          <Controller
            name="otp"
            control={control}
            render={({ field }) => (
              <OtpInput value={field.value} onChange={(value) => {clearErrors("otp"); field.onChange(value);}} error={errors.otp?.message}/>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={verifyOtpMutation.isPending || otp.length !==6}>
          {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Continue"}
        </Button>
      </form>

      <p className="text-center text-caption mt-6">
        Didn&apos;t get a code?{" "}
        <button
          type="button"
          onClick={handleResend}
          
          disabled={!canResend || resendOtpMutation.isPending}
          className="text-primary hover:text-primary/80 font-medium transition-colors duration-150 disabled:text-muted disabled:cursor-not-allowed"
        >
          {resendOtpMutation.isPending
  ? "Sending..."
  : canResend
  ? "Resend code"
  : `Resend in ${formatted}`}
        </button>
      </p>
    </AuthLayout>
  );
}