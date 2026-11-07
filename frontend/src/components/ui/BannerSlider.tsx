import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Banner {
  id: number;
  image: string;
  alt: string;
  href: string;
}

interface BannerSliderProps {
  banners: Banner[];
  autoPlayInterval?: number;
}

export function BannerSlider({ banners, autoPlayInterval = 5000 }: BannerSliderProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef<number | null>(null);
  const didDrag = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const prev = useCallback(() =>
    setCurrent((c) => (c - 1 + banners.length) % banners.length), [banners.length]);

  const next = useCallback(() =>
    setCurrent((c) => (c + 1) % banners.length), [banners.length]);

  useEffect(() => {
    if (paused || isDragging || banners.length <= 1) return;
    const id = setInterval(next, autoPlayInterval);
    return () => clearInterval(id);
  }, [paused, isDragging, next, autoPlayInterval, banners.length]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX;
    didDrag.current = false;
    setIsDragging(true);
    setDragOffset(0);
    setPaused(true);
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || startX.current === null) return;
    const diff = e.clientX - startX.current;
    if (Math.abs(diff) > 5) didDrag.current = true;
    setDragOffset(diff);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setPaused(false);
    const threshold = 50;
    if (dragOffset < -threshold) next();
    else if (dragOffset > threshold) prev();
    setDragOffset(0);
    startX.current = null;
  };

  if (banners.length === 0) return null;

  const containerWidth = containerRef.current?.offsetWidth ?? 1;
  const translateX = -(current * 100) + (dragOffset / containerWidth) * 100;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden bg-store-card select-none cursor-grab active:cursor-grabbing"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Slides */}
      <div
        className={cn(
          "flex h-[340px]",
          isDragging ? "" : "transition-transform duration-500 ease-in-out"
        )}
        style={{ transform: `translateX(${translateX}%)` }}
      >
        {banners.map((banner) => (
          <a
            key={banner.id}
            href={banner.href}
            className="relative min-w-full block"
            tabIndex={-1}
            draggable={false}
            onClick={(e) => { if (didDrag.current) e.preventDefault(); }}
          >
            <img
              src={banner.image}
              alt={banner.alt}
              className="h-full w-full object-cover"
              draggable={false}
            />
          </a>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          {/* Arrow — prev */}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={prev}
            aria-label="Oldingi banner"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10
              flex items-center justify-center
              w-9 h-14 bg-black/45 hover:bg-black/65
              transition-colors text-white cursor-pointer
              rounded-r-sm"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Arrow — next */}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={next}
            aria-label="Keyingi banner"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10
              flex items-center justify-center
              w-9 h-14 bg-black/45 hover:bg-black/65
              transition-colors text-white cursor-pointer
              rounded-l-sm"
          >
            <ChevronRight size={22} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setCurrent(i)}
                aria-label={`Banner ${i + 1}`}
                className={cn(
                  "h-[6px] w-8 rounded-sm border transition-all duration-300",
                  i === current
                    ? "bg-white/90 border-white/90"
                    : "bg-transparent border-white/55 hover:border-white/80"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
