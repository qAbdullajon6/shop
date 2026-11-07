import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { formatPrice } from "@/lib/utils";
import { ROUTES } from "@/constants";
import { imgUrl } from "@/constants";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { addressesService } from "@/services/addresses.service";
import { ordersService } from "@/services/orders.service";
import { productName } from "@/lib/product";
import type { Address, CreateAddressPayload } from "@/types";
import { cn } from "@/lib/utils";

type CheckoutStep = "address" | "confirm" | "success";

const emptyForm: CreateAddressPayload = {
  title: "",
  city: "",
  district: "",
  street: "",
  zip_code: "",
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { items, total, clearCart } = useCartStore();

  const [step, setStep] = useState<CheckoutStep>("address");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [form, setForm] = useState<CreateAddressPayload>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Buyurtma joylashtirilgach savat tozalanadi — bunda muvaffaqiyat
    // ekranini ko'rsatamiz, bo'sh-savat qoidasi ishlamasligi kerak.
    if (step === "success" || orderId) return;
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }
    if (items.length === 0) {
      navigate(ROUTES.CART, { replace: true });
      return;
    }
    addressesService.getAll().then((list) => {
      setAddresses(list);
      const def = list.find((a) => a.is_default);
      if (def) {
        setSelectedAddressId(def.id);
      } else if (list.length > 0) {
        setSelectedAddressId(list[0].id);
      } else {
        setUseNewAddress(true);
      }
    }).catch(() => {
      setUseNewAddress(true);
    });
  }, [isAuthenticated, items.length, navigate, step, orderId]);

  /* Buyurtma muvaffaqiyatli — savatni endi tozalaymiz. Bu alohida effektda
     bo'lgani uchun bo'sh-savat qoidasi allaqachon 'success' step tomonidan
     to'silgan bo'ladi. */
  useEffect(() => {
    if (step === "success") clearCart();
  }, [step, clearCart]);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validateForm = (): string | null => {
    if (!form.city.trim()) return "Shahar kiritilmagan";
    if (!form.street.trim()) return "Ko'cha / uy manzili kiritilmagan";
    return null;
  };

  const handleContinue = async () => {
    if (useNewAddress) {
      const err = validateForm();
      if (err) { setFormError(err); return; }
    } else if (!selectedAddressId) {
      setFormError("Manzil tanlang");
      return;
    }
    setFormError(null);
    setStep("confirm");
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      let addressId = selectedAddressId!;
      if (useNewAddress) {
        const created = await addressesService.create({
          city: form.city.trim(),
          street: form.street.trim(),
          title: form.title?.trim() || undefined,
          district: form.district?.trim() || undefined,
          zip_code: form.zip_code?.trim() || undefined,
        });
        addressId = created.id;
      }
      const order = await ordersService.create({
        address_id: addressId,
        items: items.map((i) => ({ variant_id: i.variantId, quantity: i.quantity })),
        notes: note || undefined,
      });
      // Savatni bu yerda tozalamaymiz — bo'sh-savat qoidasi muvaffaqiyat
      // ekranini almashtirmasligi uchun tozalash step==='success' effektida
      // amalga oshiriladi (pastda).
      setOrderId(order.id);
      setStep("success");
    } catch (e: any) {
      setFormError(e?.message ?? "Xatolik yuz berdi. Qayta urining.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const shipping = total > 500000 ? 0 : 30000;
  const grandTotal = total + shipping;
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  if (step === "success") {
    return (
      <>
        <Helmet><title>Buyurtma qabul qilindi — Zahabi Parfüm</title></Helmet>
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-store-gold/10 border border-store-gold/30">
            <svg className="h-10 w-10 text-store-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-store-text">Buyurtmangiz qabul qilindi!</h1>
          <p className="mb-1 text-store-text-muted">Buyurtma raqami: <span className="font-mono text-store-gold">#{orderId?.slice(-8).toUpperCase()}</span></p>
          <p className="mb-8 text-sm text-store-text-dim">Tez orada operatorimiz siz bilan bog'lanadi.</p>
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="rounded-lg bg-store-gold px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Rasmiylashtirish — Zahabi Parfüm</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-8 text-xl font-bold text-store-text">Buyurtmani rasmiylashtirish</h1>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* ── Left column ─────────────────────────── */}
          <div className="space-y-5">

            {/* Step indicator */}
            <div className="flex items-center gap-2 text-xs text-store-text-muted">
              <span className={cn("font-semibold", step === "address" ? "text-store-gold" : "text-store-text-dim")}>
                1. Manzil
              </span>
              <span className="text-store-border">›</span>
              <span className={cn("font-semibold", step === "confirm" ? "text-store-gold" : "text-store-text-dim")}>
                2. Tasdiqlash
              </span>
            </div>

            {step === "address" && (
              <div className="rounded-xl border border-store-border bg-store-card p-5 space-y-5">
                <h2 className="text-base font-bold text-store-text">Yetkazib berish manzili</h2>

                {/* Saved addresses */}
                {addresses.length > 0 && (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                          !useNewAddress && selectedAddressId === addr.id
                            ? "border-store-gold bg-store-gold/5"
                            : "border-store-border hover:border-store-gold/40"
                        )}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={addr.id}
                          checked={!useNewAddress && selectedAddressId === addr.id}
                          onChange={() => { setSelectedAddressId(addr.id); setUseNewAddress(false); }}
                          className="mt-0.5 accent-store-gold"
                        />
                        <div className="text-sm">
                          <p className="font-semibold text-store-text">{addr.title || "Manzil"}</p>
                          <p className="text-store-text-muted">
                            {addr.city}{addr.district ? `, ${addr.district}` : ""}
                          </p>
                          <p className="text-store-text-dim">{addr.street}</p>
                        </div>
                      </label>
                    ))}

                    <label
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                        useNewAddress
                          ? "border-store-gold bg-store-gold/5"
                          : "border-store-border hover:border-store-gold/40"
                      )}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={useNewAddress}
                        onChange={() => setUseNewAddress(true)}
                        className="accent-store-gold"
                      />
                      <span className="text-sm font-semibold text-store-text">+ Yangi manzil qo'shish</span>
                    </label>
                  </div>
                )}

                {/* New address form */}
                {(useNewAddress || addresses.length === 0) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { name: "title", label: "Nomi (ixtiyoriy)", placeholder: "Uy, Ish..." },
                      { name: "city", label: "Shahar *", placeholder: "Toshkent" },
                      { name: "district", label: "Tuman", placeholder: "Yunusobod" },
                      { name: "zip_code", label: "Pochta indeksi", placeholder: "100000" },
                    ].map(({ name, label, placeholder }) => (
                      <div key={name}>
                        <label className="mb-1 block text-xs font-semibold text-store-text-muted">{label}</label>
                        <input
                          type="text"
                          name={name}
                          value={(form as any)[name]}
                          onChange={handleFieldChange}
                          placeholder={placeholder}
                          className="w-full rounded-lg border border-store-border bg-store-input px-3 py-2.5 text-sm text-store-text placeholder:text-store-text-dim focus:border-store-gold focus:outline-none"
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-xs font-semibold text-store-text-muted">Ko'cha / uy / xonadon *</label>
                      <input
                        type="text"
                        name="street"
                        value={form.street}
                        onChange={handleFieldChange}
                        placeholder="Navruz ko'chasi 12, 34-xonadon"
                        className="w-full rounded-lg border border-store-border bg-store-input px-3 py-2.5 text-sm text-store-text placeholder:text-store-text-dim focus:border-store-gold focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Note */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-store-text-muted">Izoh (ixtiyoriy)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Kuryer uchun izoh..."
                    className="w-full rounded-lg border border-store-border bg-store-input px-3 py-2.5 text-sm text-store-text placeholder:text-store-text-dim focus:border-store-gold focus:outline-none"
                  />
                </div>

                {formError && (
                  <p className="text-sm text-red-500">{formError}</p>
                )}

                <button
                  onClick={handleContinue}
                  className="w-full rounded-lg bg-store-gold px-6 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90"
                >
                  Davom etish →
                </button>
              </div>
            )}

            {step === "confirm" && (
              <div className="rounded-xl border border-store-border bg-store-card p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-store-text">Buyurtmani tasdiqlash</h2>
                  <button
                    onClick={() => setStep("address")}
                    className="text-xs text-store-gold hover:underline"
                  >
                    ← Orqaga
                  </button>
                </div>

                {/* Chosen address summary */}
                {!useNewAddress && selectedAddressId && (() => {
                  const addr = addresses.find((a) => a.id === selectedAddressId);
                  if (!addr) return null;
                  return (
                    <div className="rounded-lg border border-store-border p-3 text-sm">
                      <p className="font-semibold text-store-text">{addr.title || "Manzil"}</p>
                      <p className="text-store-text-muted">{[addr.city, addr.district, addr.street].filter(Boolean).join(", ")}</p>
                    </div>
                  );
                })()}
                {useNewAddress && (
                  <div className="rounded-lg border border-store-border p-3 text-sm">
                    <p className="font-semibold text-store-text">{form.title || "Yangi manzil"}</p>
                    <p className="text-store-text-muted">{[form.city, form.district, form.street].filter(Boolean).join(", ")}</p>
                  </div>
                )}

                {formError && (
                  <p className="text-sm text-red-500">{formError}</p>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-store-gold px-6 py-3 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-wait"
                >
                  {isSubmitting ? "Yuborilmoqda..." : `Buyurtmani tasdiqlash — ${formatPrice(grandTotal)}`}
                </button>
              </div>
            )}
          </div>

          {/* ── Right column — order summary ─────────── */}
          <div className="rounded-xl border border-store-border bg-store-card p-5 space-y-4 self-start">
            <h2 className="text-base font-bold text-store-text">Buyurtmangiz ({itemCount} ta)</h2>

            <div className="space-y-3 divide-y divide-store-border">
              {items.map((item) => {
                const img = imgUrl(item.product?.images?.[0]?.url) ?? "/placeholder.svg";
                const name = productName(item.product);
                const price = parseFloat(String(item.variant.price));
                return (
                  <div key={item.variantId} className="flex items-center gap-3 pt-3 first:pt-0">
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-store-border bg-store-bg">
                      <img src={img} alt={name} className="h-full w-full object-contain p-1" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-medium text-store-text">{name}</p>
                      {item.variant.volume && (
                        <p className="text-[10px] text-store-text-dim">{item.variant.volume}</p>
                      )}
                      <p className="text-xs text-store-text-muted">× {item.quantity}</p>
                    </div>
                    <p className="flex-shrink-0 text-sm font-bold text-store-text">
                      {formatPrice(price * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-store-border pt-3 space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-store-text-muted">
                <span>Mahsulotlar</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex items-center justify-between text-store-text-muted">
                <span>Yetkazib berish</span>
                <span className={shipping === 0 ? "text-green-500" : ""}>
                  {shipping === 0 ? "Bepul" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex items-center justify-between font-bold text-store-text pt-1 border-t border-store-border">
                <span>Jami</span>
                <span className="text-store-gold text-base">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
