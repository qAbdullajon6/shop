import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Award, Truck, Gift, ChevronLeft, ChevronRight } from "lucide-react";
import { ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

interface Slide {
  id: number;
  eyebrow: string;
  title: string;
  titleGold: string;
  description: string;
  image: string;
  cta: { label: string; href: string };
}

const SLIDES: Slide[] = [
  {
    id: 0,
    eyebrow: "Zahabi Parfum",
    title: "Hid – bu sizning",
    titleGold: "uslubingiz",
    description:
      "Zahabi Parfum — nafaqat atirlar, balki kundalik parvarish va uyingiz uchun hashamatli aromalar.",
    image: "/slide/slide-1.png",
    cta: { label: "Kolleksiyani ko'rish", href: ROUTES.PRODUCTS },
  },
  {
    id: 1,
    eyebrow: "Body & Beauty",
    title: "Teringiz uchun",
    titleGold: "hashamatli parvarish",
    description:
      "Body mist, dush geli va xushbo'y sovun — tanangiz uchun har kungi kichik luksus.",
    image: "/slide/slide-2.png",
    cta: { label: "Body & Beauty ko'rish", href: `${ROUTES.PRODUCTS}?category_slug=body-mist` },
  },
  {
    id: 2,
    eyebrow: "Xona aromalari",
    title: "Uyingizga ham",
    titleGold: "o'ziga xos hid",
    description:
      "Xona spreylari va reed diffuserlar — yashash muhitingizni hashamatli aromatlarga to'ldiring.",
    image: "/slide/slide-3.png",
    cta: { label: "Xona aromalarini ko'rish", href: `${ROUTES.PRODUCTS}?category_slug=xona-aromalari` },
  },
];

const STATS = [
  { Icon: Award, label: "100% original",         sub: "Premium sifat" },
  { Icon: Truck, label: "Bepul yetkazib berish", sub: "500 000 so'mdan boshlab" },
  { Icon: Gift,  label: "Chiroyli qadoqlash",    sub: "Har bir buyurtmaga" },
];

const AUTOPLAY_MS = 6000;

export function HeroSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goNext = useCallback(() => setActive((a) => (a + 1) % SLIDES.length), []);
  const goPrev = useCallback(() => setActive((a) => (a - 1 + SLIDES.length) % SLIDES.length), []);
  const goTo   = useCallback((i: number) => setActive(i), []);

  useEffect(() => {
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(goNext, AUTOPLAY_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, goNext]);

  return (
    /* A contained, rounded banner card at every breakpoint — it sits inside the
       page gutter rather than bleeding to the edges, so the header stays the
       top-most element and the sections below remain reachable without a full
       screen of scrolling. The aspect ratio widens as the viewport grows. */
    <section
      aria-label="Bosh sahifa hero"
      className="bg-store-bg pt-3 sm:pt-4 lg:pt-5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
    <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-8 xl:px-10">
    <div className="relative aspect-[16/11] min-h-[228px] overflow-hidden rounded-2xl sm:aspect-[2/1] lg:aspect-auto lg:h-[clamp(400px,40vw,520px)]">
      {SLIDES.map((slide, idx) => {
        const isActive = idx === active;
        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            className={cn(
              "absolute inset-0 transition-opacity duration-[900ms] ease-in-out",
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            )}
          >
            {/* Background image. On mobile the subject is pushed right so the
                bottle sits beside the text instead of behind it. */}
            <img
              src={slide.image}
              alt=""
              aria-hidden
              draggable={false}
              loading={idx === 0 ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full select-none object-cover object-[78%_50%] sm:object-center"
            />

            {/* Gradient veil — theme-aware via store-bg token. Left-to-right on
                every breakpoint so the copy always sits on a legible ground. */}
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 w-[84%] bg-gradient-to-r from-store-bg via-store-bg/92 to-transparent sm:w-[78%] sm:from-store-bg/90 sm:via-store-bg/55 lg:w-[68%] lg:from-store-bg/85 lg:via-store-bg/35"
            />

            {/* Text overlay */}
            <div className="absolute inset-0 z-10 flex items-center">
              <div
                className={cn(
                  /* Left padding must clear the prev arrow (left-3 + 40px wide
                     at sm, left-5 at lg) or the copy renders underneath it. */
                  "w-full px-4 sm:pl-[68px] sm:pr-12 lg:pl-[76px] lg:pr-16 xl:pl-[92px]",
                  "transition-all duration-[700ms] ease-out",
                  isActive ? "opacity-100 translate-y-0 delay-150" : "opacity-0 translate-y-6"
                )}
              >
                <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-store-gold sm:text-[11px] sm:tracking-[0.28em] lg:text-[12px]">
                  {slide.eyebrow}
                </p>

                <h1 className="mt-1.5 font-serif text-[20px] font-medium leading-[1.14] tracking-[-0.01em] text-store-text sm:mt-3.5 sm:text-[34px] sm:leading-[1.08] lg:mt-4 lg:text-[clamp(2.4rem,3.4vw,3.25rem)]">
                  <span className="block">{slide.title}</span>
                  <span className="block text-store-gold">{slide.titleGold}</span>
                </h1>

                <p className="mt-2 max-w-[62%] text-[10px] leading-[1.45] text-store-text-muted sm:mt-4 sm:max-w-[330px] sm:text-[13px] sm:leading-[1.65] lg:mt-5 lg:max-w-[400px] lg:text-[15px]">
                  {slide.description}
                </p>

                <Link
                  to={slide.cta.href}
                  tabIndex={isActive ? 0 : -1}
                  className="group mt-3 inline-flex h-8 items-center gap-2 rounded-[3px] bg-store-gold px-3.5 text-[10.5px] font-medium text-white transition-colors hover:bg-store-gold-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-gold sm:mt-5 sm:h-11 sm:gap-4 sm:px-6 sm:text-[13px] lg:mt-7 lg:h-12 lg:gap-5 lg:px-7 lg:text-[14px]"
                >
                  {slide.cta.label}
                  <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-1 sm:h-4 sm:w-4" />
                </Link>

                <div className="mt-6 hidden flex-wrap items-center gap-x-7 gap-y-3 sm:flex lg:mt-9 lg:gap-x-10">
                  {STATS.map(({ Icon, label, sub }) => (
                    <div key={label} className="flex items-center gap-3">
                      <Icon size={22} strokeWidth={1.4} className="shrink-0 text-store-gold" />
                      <div>
                        <p className="text-[12.5px] font-semibold leading-tight text-store-text">{label}</p>
                        <p className="mt-0.5 text-[11.5px] leading-tight text-store-text-muted">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev / next — pointer affordance only; touch users get the dots and
          the autoplay, so these stay out of the way below sm. */}
      <button
        type="button"
        onClick={goPrev}
        aria-label={`${SLIDES[(active - 1 + SLIDES.length) % SLIDES.length].eyebrow}`}
        className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-store-border bg-store-card/85 text-store-text-muted backdrop-blur-sm transition-colors hover:border-store-gold/50 hover:text-store-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-gold sm:flex lg:left-5"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label={`${SLIDES[(active + 1) % SLIDES.length].eyebrow}`}
        className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-store-border bg-store-card/85 text-store-text-muted backdrop-blur-sm transition-colors hover:border-store-gold/50 hover:text-store-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-gold sm:flex lg:right-5"
      >
        <ChevronRight size={18} />
      </button>

      {/* Slide dots */}
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-5 sm:gap-3">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => goTo(i)}
            aria-label={`${i + 1}-slide: ${slide.eyebrow}`}
            aria-current={i === active}
            className={cn(
              "rounded-full transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-store-gold",
              i === active
                ? "h-[4px] w-6 bg-store-gold sm:h-[7px] sm:w-10"
                : "h-[6px] w-[6px] bg-store-gold/30 hover:bg-store-gold/65 sm:h-[12px] sm:w-[12px]"
            )}
          />
        ))}
      </div>
    </div>
    </div>
    </section>
  );
}
