import { Link } from "react-router-dom";
import {
  Cpu,
  HardDrive,
  Monitor,
  Tablet,
  Smartphone,
  Laptop,
  Headphones,
  Mouse,
  Printer,
  Camera,
  Gamepad2,
  Wifi,
} from "lucide-react";
import { ROUTES } from "@/constants";

const CATALOG_ITEMS = [
  { icon: Laptop,     label: "Noutbuklar",           slug: "notebooks" },
  { icon: Smartphone, label: "Smartfonlar",           slug: "smartphones" },
  { icon: Monitor,    label: "Monitorlar",            slug: "monitors" },
  { icon: Cpu,        label: "Protsessorlar",         slug: "processors" },
  { icon: HardDrive,  label: "Disklar (SSD / HDD)",  slug: "storage" },
  { icon: Tablet,     label: "Planshetlar",           slug: "tablets" },
  { icon: Mouse,      label: "Periferiya",            slug: "peripherals" },
  { icon: Headphones, label: "Audio",                 slug: "audio" },
  { icon: Gamepad2,   label: "O'yin jihozlari",       slug: "gaming" },
  { icon: Camera,     label: "Foto va video",         slug: "photo" },
  { icon: Printer,    label: "Printerlar",            slug: "printers" },
  { icon: Wifi,       label: "Tarmoq uskunalari",     slug: "networking" },
];

export function CatalogSection() {
  return (
    <section className="mt-8">
      <div className="mx-auto max-w-content px-4">
        <h2 className="mb-3 text-lg font-bold text-store-text">Katalog</h2>
        <div className="mb-4 border-t border-store-border" />

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12">
          {CATALOG_ITEMS.map(({ icon: Icon, label, slug }) => (
            <Link
              key={slug}
              to={`${ROUTES.PRODUCTS}?category=${encodeURIComponent(slug)}`}
              className="group flex flex-col items-center gap-2 rounded-lg border border-store-border bg-store-card px-2 py-4 text-center hover:border-store-red hover:bg-store-card transition-colors"
            >
              <Icon
                size={28}
                className="text-store-text-muted group-hover:text-store-red transition-colors"
              />
              <span className="text-[11px] leading-tight text-store-text-muted group-hover:text-store-text transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
