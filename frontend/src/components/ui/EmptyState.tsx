import { PackageOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "Mahsulot topilmadi",
  description = "Hozircha bu bo'limda mahsulotlar mavjud emas.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <PackageOpen size={36} className="text-store-text-dim" />
      <p className="font-serif text-xl text-store-text">{title}</p>
      <p className="text-sm text-store-text-muted max-w-xs">{description}</p>
    </div>
  );
}
