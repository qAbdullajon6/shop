import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  /** Overrides the localized default ("Barchasini ko'rish"). */
  hrefLabel?: string;
  variant?: "sans" | "serif";
  align?: "left" | "center";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  hrefLabel,
  variant = "serif",
  align = "left",
}: SectionHeaderProps) {
  const t = useT();
  const isCenter = align === "center";
  const linkLabel = hrefLabel ?? t("home.viewAll");

  return (
    <div
      className={cn(
        "mb-4 gap-4 sm:mb-6",
        isCenter ? "flex flex-col items-center text-center" : "flex items-end justify-between"
      )}
    >
      <div>
        {eyebrow && (
          <p className="mb-1 text-[9.5px] font-semibold uppercase tracking-[0.22em] text-store-gold sm:mb-1.5 sm:text-[10px]">
            {eyebrow}
          </p>
        )}
        {/* Mobile keeps section titles compact so a shelf header plus its first
            product row both land within one screen. */}
        <h2
          className={cn(
            "leading-tight text-store-text",
            variant === "serif"
              ? "font-serif text-[19px] font-medium sm:text-[26px] lg:text-[32px]"
              : "text-[16px] font-semibold tracking-tight sm:text-[22px] lg:text-[26px]"
          )}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-store-text-muted max-w-md">{description}</p>
        )}
      </div>
      {href && (
        <Link
          to={href}
          className={cn(
            "group flex flex-shrink-0 items-center gap-1.5 text-[11.5px] text-store-text-muted transition-colors hover:text-store-gold sm:text-[12px]",
            isCenter && "mt-1"
          )}
        >
          {linkLabel}
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
