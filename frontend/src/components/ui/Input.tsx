import React, { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
  loading?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = "",
      type,
      label,
      leftIcon,
      rightIcon,
      error,
      helperText,
      disabled,
      loading,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    const handleTogglePassword = (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();
      setShowPassword((prev) => !prev);
    };

    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="form-group flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative w-full">
          {/* LEFT ICON */}
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none z-10 flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          {/* INPUT */}
          <input
            ref={ref}
            type={inputType}
            disabled={disabled || loading}
            className={`h-12 w-full rounded-xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all pl-12
              ${isPassword || rightIcon ? "pr-12" : "pr-4"}
              ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}
              ${disabled ? "opacity-60 cursor-not-allowed" : ""}
              ${className}
            `}
            {...props}
          />

          {/* RIGHT ICON (Password / Custom) */}
          {isPassword ? (
            <button
              type="button"
              tabIndex={0}
              disabled={disabled || loading}
              onClick={handleTogglePassword}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleTogglePassword(e);
                }
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors z-10 flex items-center justify-center focus:outline-none rounded-lg cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10 flex items-center justify-center cursor-pointer">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {/* Error or Helper text */}
        {error ? (
          <span className="text-[10px] text-red-500 font-semibold mt-0.5 flex items-center gap-1">
            {error}
          </span>
        ) : (
          helperText && (
            <span className="text-[10px] text-gray-400 mt-0.5">
              {helperText}
            </span>
          )
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
