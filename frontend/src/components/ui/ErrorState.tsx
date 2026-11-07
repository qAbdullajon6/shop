import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Ma'lumotlarni yuklashda xatolik yuz berdi.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <AlertCircle size={36} className="text-store-text-dim" />
      <p className="text-sm text-store-text-muted max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-xs text-store-gold border border-store-gold/40 px-4 py-2 rounded hover:bg-store-gold/10 transition-colors"
        >
          <RefreshCw size={13} />
          Qayta urinish
        </button>
      )}
    </div>
  );
}
