import {
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";

const OTP_LENGTH =
  6;

interface OtpInputProps {
  value: string;
  onChange: (
    value: string
  ) => void;
  error?: string;
  disabled?: boolean;
}

export function OtpInput({
  value,
  onChange,
  error,
  disabled = false,
}: OtpInputProps) {
  const digits =
    Array.from(
      {
        length:
          OTP_LENGTH,
      },
      (_, index) =>
        value[index] ??
        ""
    );

  const inputsRef =
    useRef<
      Array<
        HTMLInputElement |
        null
      >
    >([]);

  const [
    focusedIndex,
    setFocusedIndex,
  ] =
    useState<
      number |
      null
    >(null);

  const commitDigits = (
    nextDigits: string[]
  ): void => {
    onChange(
      nextDigits
        .join("")
        .replace(
          /\D/g,
          ""
        )
        .slice(
          0,
          OTP_LENGTH
        )
    );
  };

  const handleChange = (
    index: number,
    rawValue: string
  ): void => {
    const numericValue =
      rawValue.replace(
        /\D/g,
        ""
      );

    if (
      numericValue.length >
      1
    ) {
      const nextDigits =
        [...digits];

      numericValue
        .slice(
          0,
          OTP_LENGTH -
            index
        )
        .split("")
        .forEach(
          (
            digit,
            offset
          ) => {
            nextDigits[
              index +
                offset
            ] =
              digit;
          }
        );

      commitDigits(
        nextDigits
      );

      const nextIndex =
        Math.min(
          index +
            numericValue.length,
          OTP_LENGTH -
            1
        );

      inputsRef.current[
        nextIndex
      ]?.focus();

      return;
    }

    const nextDigits =
      [...digits];

    if (!numericValue) {
      for (
        let nextIndex = index;
        nextIndex < OTP_LENGTH;
        nextIndex += 1
      ) {
        nextDigits[nextIndex] =
          "";
      }
    } else {
      nextDigits[index] =
        numericValue.slice(
          -1
        );
    }

    commitDigits(
      nextDigits
    );

    if (
      numericValue &&
      index <
        OTP_LENGTH - 1
    ) {
      inputsRef.current[
        index + 1
      ]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ): void => {
    if (
      event.key ===
      "ArrowLeft" &&
      index > 0
    ) {
      event.preventDefault();
      inputsRef.current[
        index - 1
      ]?.focus();

      return;
    }

    if (
      event.key ===
        "ArrowRight" &&
      index <
        OTP_LENGTH - 1
    ) {
      event.preventDefault();
      inputsRef.current[
        index + 1
      ]?.focus();

      return;
    }

    if (
      event.key ===
        "Backspace" &&
      !digits[index] &&
      index > 0
    ) {
      event.preventDefault();

      const nextDigits =
        [...digits];

      nextDigits[
        index - 1
      ] =
        "";

      commitDigits(
        nextDigits
      );

      inputsRef.current[
        index - 1
      ]?.focus();
    }
  };

  const handlePaste = (
    event: ClipboardEvent<HTMLInputElement>
  ): void => {
    event.preventDefault();

    const pasted =
      event.clipboardData
        .getData(
          "text"
        )
        .replace(
          /\D/g,
          ""
        )
        .slice(
          0,
          OTP_LENGTH
        );

    onChange(
      pasted
    );

    const focusIndex =
      pasted.length >=
      OTP_LENGTH
        ? OTP_LENGTH - 1
        : pasted.length;

    inputsRef.current[
      focusIndex
    ]?.focus();
  };

  return (
    <div>
      <div
        className="grid grid-cols-6 gap-1.5 sm:gap-2"
        role="group"
        aria-label="Six-digit verification code"
      >
        {digits.map(
          (
            digit,
            index
          ) => (
            <input
              key={index}
              ref={(
                element
              ) => {
                inputsRef.current[
                  index
                ] =
                  element;
              }}
              value={digit}
              onChange={(
                event
              ) =>
                handleChange(
                  index,
                  event.target
                    .value
                )
              }
              onKeyDown={(
                event
              ) =>
                handleKeyDown(
                  index,
                  event
                )
              }
              onPaste={
                handlePaste
              }
              onFocus={() =>
                setFocusedIndex(
                  index
                )
              }
              onBlur={() =>
                setFocusedIndex(
                  null
                )
              }
              autoFocus={
                index === 0
              }
              maxLength={1}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={
                index === 0
                  ? "one-time-code"
                  : "off"
              }
              aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
              aria-invalid={
                Boolean(
                  error
                )
              }
              disabled={
                disabled
              }
              className={`h-12 min-w-0 rounded-md border bg-background text-center text-base font-semibold text-foreground outline-none transition-colors sm:h-14 sm:text-lg ${
                error
                  ? "border-danger"
                  : focusedIndex ===
                      index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            />
          )
        )}
      </div>

      {error ? (
        <p
          className="mt-2 text-xs text-danger"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
