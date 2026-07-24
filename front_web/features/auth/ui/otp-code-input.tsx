"use client";

import { ClipboardEvent, KeyboardEvent, useRef } from "react";

type OtpCodeInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  hasError?: boolean;
};

const OTP_LENGTH = 6;

export function OtpCodeInput({ value, onChange, disabled, hasError }: OtpCodeInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  function updateDigit(index: number, rawValue: string) {
    const digit = rawValue.replace(/\D/g, "").slice(-1);
    const nextValue = [...value];
    nextValue[index] = digit;
    onChange(nextValue);

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);

    if (!digits) {
      return;
    }

    event.preventDefault();
    const nextValue = Array.from({ length: OTP_LENGTH }, (_, index) => digits[index] ?? "");
    onChange(nextValue);
    inputRefs.current[Math.min(digits.length, OTP_LENGTH) - 1]?.focus();
  }

  return (
    <div className="grid grid-cols-6 gap-[clamp(0.35rem,1.5vw,0.6rem)]" role="group" aria-label="Código de seguridad de seis dígitos" onPaste={handlePaste}>
      {Array.from({ length: OTP_LENGTH }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            inputRefs.current[index] = node;
          }}
          className={`aspect-square min-w-0 rounded-[0.65rem] border bg-otp-bg text-center font-mono text-[clamp(1rem,4vw,1.35rem)] font-bold text-ink outline-0 transition-[border-color,background-color,box-shadow] duration-200 focus:bg-white focus-visible:outline-[3px] focus-visible:outline-offset-3 ${hasError ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgb(186_59_70/14%)] focus-visible:outline-focus-ring-danger" : "border-line focus:border-accent focus:shadow-[0_0_0_3px_rgb(8_98_221/12%)] focus-visible:outline-focus-ring"}`}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          spellCheck={false}
          maxLength={1}
          value={value[index] ?? ""}
          onChange={(event) => updateDigit(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          aria-label={`Dígito ${index + 1}`}
          aria-invalid={hasError || undefined}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
