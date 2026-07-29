import {
  OtpVerificationForm,
} from "../components/OtpVerificationForm";

import {
  useResendEmailVerificationMutation,
  useVerifyEmailMutation,
} from "../hooks/useAuthMutations";

interface VerifyEmailPageProps {
  email: string;
  onSuccess: () => void;
  onChangeEmail: () => void;
}

export function VerifyEmailPage({
  email,
  onSuccess,
  onChangeEmail,
}: VerifyEmailPageProps) {
  const verifyMutation =
    useVerifyEmailMutation();

  const resendMutation =
    useResendEmailVerificationMutation();

  return (
    <OtpVerificationForm
      title="Verify your email"
      description="Enter the six-digit code we sent to finish creating your SyncSpace account."
      email={email}
      verifyLabel="Verify email"
      verifyingLabel="Creating account..."
      errorMessage={
        verifyMutation.error
          ?.message ??
        resendMutation.error
          ?.message
      }
      isVerifying={
        verifyMutation.isPending
      }
      isResending={
        resendMutation.isPending
      }
      onCodeChange={() => {
        verifyMutation.reset();
        resendMutation.reset();
      }}
      onVerify={
        async (
          otp
        ) => {
          resendMutation.reset();
          await verifyMutation.mutateAsync({
            email,
            otp,
          });

          onSuccess();
        }
      }
      onResend={
        async () => {
          verifyMutation.reset();

          const result =
            await resendMutation.mutateAsync(
              email
            );

          return result.resendAvailableInSeconds;
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
