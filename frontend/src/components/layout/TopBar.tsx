import { useState } from "react";
import {
  MapPin,
  ChevronDown,
  Truck,
  Phone,
  Headphones,
  ClipboardList,
} from "lucide-react";

const CITIES = ["Toshkent", "Samarqand", "Buxoro", "Namangan"];

export function TopBar() {
  const [city, setCity] = useState("Toshkent");
  const [cityOpen, setCityOpen] = useState(false);

  return (
    <div className="bg-store-topbar border-b border-white/10">
      <div className="mx-auto max-w-content px-4">
        <div className="flex h-9 items-center justify-between gap-6 text-xs text-white/60">

          {/* City selector */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setCityOpen((v) => !v)}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
              aria-label="Shahar tanlash"
            >
              <MapPin size={13} className="text-store-red" />
              <span>{city}</span>
              <ChevronDown
                size={11}
                className={`transition-transform ${cityOpen ? "rotate-180" : ""}`}
              />
            </button>

            {cityOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded border border-store-border bg-store-nav py-1 shadow-lg">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setCity(c); setCityOpen(false); }}
                    className={`flex w-full px-3 py-2 text-left text-xs hover:bg-store-card transition-colors ${
                      c === city ? "text-store-red" : "text-store-text-muted hover:text-store-text"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Delivery info */}
          <button className="flex items-center gap-1.5 hover:text-white transition-colors flex-shrink-0">
            <Truck size={13} />
            <span>Yetkazib berish usullari</span>
          </button>

          {/* Phones */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Phone size={13} />
            <a href="tel:+998712345678" className="hover:text-white transition-colors">
              +998 71 234-56-78
            </a>
            <span className="text-white/25">|</span>
            <a href="tel:+998909876543" className="font-medium text-white/90 hover:text-white transition-colors">
              +998 90 987-65-43
            </a>
          </div>

          {/* Consultation */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <Headphones size={13} />
            <span>Maslahat — 09:00 dan 21:00 gacha</span>
          </div>

          {/* Order tracking */}
          <button className="flex items-center gap-1.5 hover:text-white transition-colors flex-shrink-0">
            <ClipboardList size={13} />
            <span>Buyurtmam qayerda?</span>
          </button>

        </div>
      </div>
    </div>
  );
}
