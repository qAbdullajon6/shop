import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-store-text-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "block w-full rounded border border-store-border bg-store-input px-3 py-2 text-sm text-store-text",
            "placeholder:text-store-text-dim",
            "focus:border-store-gold focus:outline-none focus:ring-1 focus:ring-store-gold",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-store-gold">{error}</p>}
        {hint && !error && <p className="text-xs text-store-text-dim">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
