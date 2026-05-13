import React from "react";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-[4px]">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[14px] font-[500] leading-[1.49] tracking-[0.28px] text-ink [font-feature-settings:'ss03']"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          className={[
            "bg-canvas-light text-ink",
            "font-body text-[16px] font-[420] leading-[1.5]",
            "[font-feature-settings:'ss03']",
            "px-[12px] py-[10px]",
            "rounded-md",
            "border",
            error ? "border-red-500" : "border-hairline-light",
            "outline-none",
            "focus:ring-2 focus:ring-ink/20 focus:border-ink",
            "placeholder:text-shade-40",
            "transition-colors duration-150",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-[13px] font-[500] text-red-600 leading-[1.5]"
            role="alert"
          >
            {error}
          </p>
        )}
        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="text-[13px] font-[500] text-shade-50 leading-[1.5]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
