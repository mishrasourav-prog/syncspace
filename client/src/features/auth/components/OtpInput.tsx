import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function OtpInput({ value, onChange, error }: OtpInputProps) {
  const digits = value.padEnd(OTP_LENGTH, " ").split("").slice(0, OTP_LENGTH);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const setDigit = (index: number, digit: string) => {
    const next = value.split("");
    next[index] = digit;
    onChange(next.join("").slice(0, OTP_LENGTH));
  };

  const handleChange = (index: number, rawValue: string) => {
    const digit = rawValue.replace(/\D/g, "").slice(-1);
    if (!digit) {
      setDigit(index, "");
      return;
    }
    setDigit(index, digit);
    if (index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index]?.trim() && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {inputsRef.current[i] = el}}
            value={digit.trim()}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(i)}
            onBlur={() => setFocusedIndex(null)}
            maxLength={1}
             type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
            className={`w-full h-12 text-center text-lg font-semibold text-foreground bg-background border rounded-md outline-none transition-colors duration-200 ${
              error ? "border-danger" : focusedIndex === i ? "border-muted/60" : "border-border"
            }`}
          />
        ))}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}