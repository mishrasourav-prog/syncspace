import {
  useEffect,
  useState,
} from "react";

const DEFAULT_RESEND_COOLDOWN_SECONDS =
  60;

export function useResendTimer(
  initialSeconds: number =
    DEFAULT_RESEND_COOLDOWN_SECONDS
) {
  const [
    secondsRemaining,
    setSecondsRemaining,
  ] =
    useState(
      initialSeconds
    );

  useEffect(
    () => {
      if (
        secondsRemaining <=
        0
      ) {
        return;
      }

      const timeoutId =
        window.setTimeout(
          () => {
            setSecondsRemaining(
              (current) =>
                Math.max(
                  0,
                  current - 1
                )
            );
          },
          1000
        );

      return () => {
        window.clearTimeout(
          timeoutId
        );
      };
    },
    [secondsRemaining]
  );

  const reset = (
    seconds: number =
      initialSeconds
  ): void => {
    setSecondsRemaining(
      Math.max(
        0,
        seconds
      )
    );
  };

  const formatted =
    `${Math.floor(secondsRemaining / 60)}:${String(
      secondsRemaining % 60
    ).padStart(2, "0")}`;

  return {
    secondsRemaining,
    canResend:
      secondsRemaining ===
      0,
    formatted,
    reset,
  };
}
