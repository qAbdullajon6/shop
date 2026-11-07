import { useEffect, useState, type FormEvent } from "react";
import { MapPin, Plus, Pencil, Trash2, Star, Loader2, X } from "lucide-react";
import { addressesService } from "@/services/addresses.service";
import { cn } from "@/lib/utils";
import type { Address, CreateAddressPayload } from "@/types";

const EMPTY: CreateAddressPayload = {
  title: "",
  city: "",
  district: "",
  street: "",
  zip_code: "",
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-store-text">
        {label}
        {required && <span className="text-store-gold"> *</span>}
      </span>
      <input
        type="text"
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-md border border-store-border bg-store-input px-4 text-[13px] text-store-text outline-none transition-colors placeholder:text-store-text-dim focus:border-store-gold"
      />
    </label>
  );
}

function AddressForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial?: Address;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<CreateAddressPayload>(
    initial
      ? {
          title: initial.title ?? "",
          city: initial.city,
          district: initial.district ?? "",
          street: initial.street,
          zip_code: initial.zip_code ?? "",
        }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof CreateAddressPayload) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    /* Bo'sh ixtiyoriy maydonlar yuborilmaydi — backend bo'sh satrni rad etadi */
    const payload: CreateAddressPayload = {
      city: form.city.trim(),
      street: form.street.trim(),
      title: form.title?.trim() || undefined,
      district: form.district?.trim() || undefined,
      zip_code: form.zip_code?.trim() || undefined,
    };
    try {
      if (initial) await addressesService.update(initial.id, payload);
      else await addressesService.create(payload);
      onSaved();
    } catch {
      setError("Manzilni saqlab bo'lmadi. Maydonlarni tekshiring.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-store-gold/40 bg-store-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-[14px] font-medium text-store-text">
          {initial ? "Manzilni tahrirlash" : "Yangi manzil"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Yopish"
          className="flex h-8 w-8 items-center justify-center rounded-full text-store-text-dim transition-colors hover:text-store-text"
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nomi" value={form.title ?? ""} onChange={set("title")} placeholder="Uy, Ish..." />
        <Field label="Shahar" value={form.city} onChange={set("city")} placeholder="Toshkent" required />
        <Field label="Tuman" value={form.district ?? ""} onChange={set("district")} placeholder="Yunusobod" />
        <Field label="Pochta indeksi" value={form.zip_code ?? ""} onChange={set("zip_code")} placeholder="100000" />
      </div>

      <div className="mt-4">
        <Field
          label="Ko'cha, uy, xonadon"
          value={form.street}
          onChange={set("street")}
          placeholder="Amir Temur ko'chasi 1, 45-xonadon"
          required
        />
      </div>

      {error && <p className="mt-4 text-[12.5px] text-red-500">{error}</p>}

      <div className="mt-6 flex items-center gap-3 border-t border-store-border pt-5">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-store-gold px-6 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          Saqlash
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center rounded-md border border-store-border px-5 text-[13px] text-store-text-muted transition-colors hover:text-store-text"
        >
          Bekor qilish
        </button>
      </div>
    </form>
  );
}

function AddressCard({
  address,
  onEdit,
  onChanged,
}: {
  address: Address;
  onEdit: () => void;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const handleDefault = async () => {
    if (address.is_default || busy) return;
    setBusy(true);
    try {
      await addressesService.setDefault(address.id);
      onChanged();
    } catch { /* holat o'zgarmaydi */ }
    finally { setBusy(false); }
  };

  const handleDelete = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await addressesService.delete(address.id);
      onChanged();
    } catch { /* holat o'zgarmaydi */ }
    finally { setBusy(false); }
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-store-card p-5 transition-colors",
        address.is_default ? "border-store-gold/50" : "border-store-border"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-medium text-store-text">
              {address.title || "Manzil"}
            </span>
            {address.is_default && (
              <span className="rounded border border-store-gold/30 bg-store-gold/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-store-gold">
                Asosiy
              </span>
            )}
          </div>
          <p className="mt-2 text-[12.5px] leading-relaxed text-store-text-muted">
            {address.city}
            {address.district ? `, ${address.district}` : ""}
            <br />
            {address.street}
            {address.zip_code ? `, ${address.zip_code}` : ""}
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          {!address.is_default && (
            <button
              onClick={handleDefault}
              disabled={busy}
              aria-label="Asosiy qilish"
              title="Asosiy qilish"
              className="flex h-9 w-9 items-center justify-center rounded-md text-store-text-dim transition-colors hover:text-store-gold disabled:opacity-40"
            >
              <Star size={15} />
            </button>
          )}
          <button
            onClick={onEdit}
            aria-label="Tahrirlash"
            title="Tahrirlash"
            className="flex h-9 w-9 items-center justify-center rounded-md text-store-text-dim transition-colors hover:text-store-gold"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={handleDelete}
            disabled={busy}
            aria-label="O'chirish"
            title="O'chirish"
            className="flex h-9 w-9 items-center justify-center rounded-md text-store-text-dim transition-colors hover:text-red-500 disabled:opacity-40"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const load = () => {
    setLoading(true);
    setError(false);
    addressesService
      .getAll()
      .then(setAddresses)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSaved = () => {
    setCreating(false);
    setEditing(null);
    load();
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-[130px] animate-pulse rounded-xl border border-store-border bg-store-card" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-store-border bg-store-card py-16 text-center">
        <p className="text-[13px] text-store-text-muted">Manzillarni yuklab bo&apos;lmadi.</p>
        <button onClick={load} className="mt-3 text-[12.5px] font-medium text-store-gold hover:underline">
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {editing && (
        <AddressForm initial={editing} onCancel={() => setEditing(null)} onSaved={handleSaved} />
      )}
      {creating && <AddressForm onCancel={() => setCreating(false)} onSaved={handleSaved} />}

      {addresses.length === 0 && !creating ? (
        <div className="flex flex-col items-center gap-5 rounded-xl border border-store-border bg-store-card py-20 text-center">
          <div className="rounded-full border border-store-border bg-store-surface p-5">
            <MapPin size={34} strokeWidth={1.4} className="text-store-text-dim" />
          </div>
          <div className="space-y-1.5">
            <h2 className="font-serif text-[22px] font-medium text-store-text">
              Saqlangan manzil yo&apos;q
            </h2>
            <p className="text-[13px] text-store-text-muted">
              Manzil qo&apos;shsangiz, buyurtma berish tezroq bo&apos;ladi
            </p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="inline-flex h-11 items-center gap-2 rounded-md bg-store-gold px-6 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus size={16} />
            Manzil qo&apos;shish
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((a) => (
              <AddressCard
                key={a.id}
                address={a}
                onEdit={() => { setCreating(false); setEditing(a); }}
                onChanged={load}
              />
            ))}
          </div>

          {!creating && !editing && (
            <button
              onClick={() => setCreating(true)}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-store-gold px-6 text-[13px] font-medium text-store-gold transition-colors hover:bg-store-gold hover:text-white"
            >
              <Plus size={16} />
              Yangi manzil qo&apos;shish
            </button>
          )}
        </>
      )}
    </div>
  );
}
