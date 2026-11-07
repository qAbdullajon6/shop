import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-store-gold text-white hover:opacity-90 focus:ring-store-gold",
  secondary: "border border-store-border bg-store-card text-store-text hover:border-store-gold hover:text-store-gold focus:ring-store-border",
  outline: "border border-store-gold text-store-gold hover:bg-store-gold hover:text-white focus:ring-store-gold",
  ghost: "text-store-text-muted hover:bg-store-surface hover:text-store-text focus:ring-store-border",
  danger: "border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white focus:ring-red-500",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-4 text-[12px]",
  md: "h-11 px-5 text-[13px]",
  lg: "h-12 px-7 text-[14px]",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-all",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-store-bg",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
);

Button.displayName = "Button";

export { Button };
export type { ButtonProps };
