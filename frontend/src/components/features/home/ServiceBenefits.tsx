import { BadgeCheck, Truck, AlarmClock, Gift } from "lucide-react";

const BENEFITS = [
  { icon: BadgeCheck, title: "100% original mahsulotlar", desc: "To'g'ridan-to'g'ri yetkazib berish" },
  { icon: Truck,      title: "Bepul yetkazib berish",     desc: "500 000 so'mdan boshlab" },
  { icon: AlarmClock, title: "Oson qaytarish",            desc: "14 kun ichida" },
  { icon: Gift,       title: "24/7 qo'llab-quvvatlash",   desc: "Har doim siz bilan" },
];

export function ServiceBenefits() {
  return (
    <section className="py-8 sm:py-10 bg-store-nav" aria-label="Xizmat afzalliklari">
      <div className="mx-auto max-w-content px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-center gap-4 rounded-xl border border-store-border bg-store-card px-5 py-5"
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-store-surface">
                <Icon size={22} strokeWidth={1.6} className="text-store-gold" />
              </span>
              <div className="min-w-0">
                <p className="text-[14px] font-medium leading-snug text-store-text">{title}</p>
                <p className="mt-1 text-[12px] leading-snug text-store-text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
