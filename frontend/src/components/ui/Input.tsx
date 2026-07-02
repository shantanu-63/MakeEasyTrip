import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  rightIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      type,
      label,
      rightIcon,
      error,
      helperText,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;
    const hasRightElement = isPassword || !!rightIcon;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider">
            {label}
          </label>
        )}

        <div className="relative w-full">
          {/* INPUT */}
          <input
            ref={ref}
            type={inputType}
            disabled={disabled}
            className={[
              "h-[50px] w-full rounded-xl border-none",
              "bg-[#F1F5FF] text-[#0F172A] placeholder-[#64748B]",
              "text-[15px] outline-none",
              "focus:ring-2 focus:ring-orange-500",
              "transition-all",
              "pl-4",
              hasRightElement ? "pr-12" : "pr-4",
              error ? "ring-2 ring-red-500" : "",
              disabled ? "opacity-60 cursor-not-allowed" : "",
              className,
            ].filter(Boolean).join(" ")}
            {...props}
          />

          {/* RIGHT ICON — password toggle or custom icon */}
          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword
                ? <EyeOff className="w-[18px] h-[18px]" />
                : <Eye className="w-[18px] h-[18px]" />}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#64748B] pointer-events-none">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {/* Error / Helper text */}
        {error && (
          <span className="text-[11px] text-red-500 font-semibold">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span className="text-[11px] text-[#64748B]">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
