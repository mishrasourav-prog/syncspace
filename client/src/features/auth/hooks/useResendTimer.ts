import { useEffect, useRef, useState } from "react";

const RESEND_COOLDOWN_SECONDS = 45;

export function useResendTimer(initialSeconds: number = RESEND_COOLDOWN_SECONDS) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const reset = () => setSecondsRemaining(initialSeconds);
  const formatted = `${Math.floor(secondsRemaining / 60)}:${String(secondsRemaining % 60).padStart(2, "0")}`;

  return { secondsRemaining, canResend: secondsRemaining === 0, formatted, reset };
}