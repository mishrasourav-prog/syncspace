import {
  OtpVerificationForm,
} from "../components/OtpVerificationForm";

import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "../hooks/useAuthMutations";

import type {
  VerifyOtpResponse,
} from "../types/auth.types";

interface OtpVerificationPageProps {
  email: string;
  onSuccess: (
    data: VerifyOtpResponse
  ) => void;
  onChangeEmail?: () => void;
}

export function OtpVerificationPage({
  email,
  onSuccess,
  onChangeEmail,
}: OtpVerificationPageProps) {
  const verifyOtpMutation =
    useVerifyOtpMutation();

  const resendOtpMutation =
    useResendOtpMutation();

  return (
    <OtpVerificationForm
      title="Verify reset code"
      description="Enter the six-digit code we sent to continue resetting your password."
      email={email}
      verifyLabel="Verify code"
      errorMessage={
        verifyOtpMutation.error
          ?.message ??
        resendOtpMutation.error
          ?.message
      }
      isVerifying={
        verifyOtpMutation.isPending
      }
      isResending={
        resendOtpMutation.isPending
      }
      onCodeChange={() => {
        verifyOtpMutation.reset();
        resendOtpMutation.reset();
      }}
      onVerify={
        async (
          otp
        ) => {
          resendOtpMutation.reset();
          const result =
            await verifyOtpMutation.mutateAsync({
              email,
              otp,
            });

          onSuccess(
            result
          );
        }
      }
      onResend={
        async () => {
          verifyOtpMutation.reset();

          await resendOtpMutation.mutateAsync(
            email
          );

          return 60;
        }
      }
      onChangeEmail={
        onChangeEmail
      }
      changeEmailLabel="Use another email"
      initialCooldownSeconds={60}
    />
  );
}
