import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

/* Sahifalar orasida o'tishda tepada ko'rinadigan progress chizig'i.
   Kenglik bosqichlari Tailwind klasslari orqali beriladi (inline style yo'q). */
const STEPS = ["w-0", "w-[40%]", "w-[70%]", "w-[90%]", "w-full"] as const;
type Step = (typeof STEPS)[number];

export function TopLoader() {
  const location = useLocation();
  const [step, setStep] = useState<Step>("w-0");
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isFirst = useRef(true);

  const clear = () => timers.current.forEach(clearTimeout);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    clear();
    setStep("w-0");
    setVisible(true);

    timers.current = [
      setTimeout(() => setStep("w-[40%]"), 10),
      setTimeout(() => setStep("w-[70%]"), 120),
      setTimeout(() => setStep("w-[90%]"), 320),
      setTimeout(() => setStep("w-full"), 520),
      setTimeout(() => setVisible(false), 720),
      setTimeout(() => setStep("w-0"), 1020),
    ];

    return clear;
  }, [location.key]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-[9999] h-[3px] bg-store-gold",
        "shadow-[0_0_8px_rgb(var(--color-gold))]",
        "transition-[width,opacity] duration-200 ease-out",
        step,
        visible ? "opacity-100" : "opacity-0"
      )}
    />
  );
}
