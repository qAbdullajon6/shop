import { useState, type FormEvent } from "react";
import { Check, Loader2 } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types";

interface Props {
  user: User;
}

export function ProfileInfoTab({ user }: Props) {
  const setUser = useAuthStore((s) => s.setUser);

  const [firstName, setFirstName] = useState(user.name ?? "");
  const [lastName, setLastName] = useState(user.last_name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const dirty =
    firstName !== (user.name ?? "") ||
    lastName !== (user.last_name ?? "") ||
    email !== (user.email ?? "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!dirty || saving) return;
    setSaving(true);
    setError("");
    try {
      const updated = await authService.updateProfile({
        name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        email: email.trim() || undefined,
      });
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Saqlashda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-store-border bg-store-card p-6 sm:p-7">
        <h2 className="font-serif text-[22px] font-medium text-store-text">Shaxsiy ma&apos;lumotlar</h2>
        <p className="mt-1 text-[13px] text-store-text-muted">
          Bu ma&apos;lumotlar buyurtma rasmiylashtirishda ishlatiladi.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-store-text">Ism</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ismingiz"
                className="h-11 w-full rounded-md border border-store-border bg-store-input px-4 text-[13px] text-store-text outline-none transition-colors placeholder:text-store-text-dim focus:border-store-gold"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-store-text">Familiya</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Familiyangiz"
                className="h-11 w-full rounded-md border border-store-border bg-store-input px-4 text-[13px] text-store-text outline-none transition-colors placeholder:text-store-text-dim focus:border-store-gold"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-store-text">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="h-11 w-full rounded-md border border-store-border bg-store-input px-4 text-[13px] text-store-text outline-none transition-colors placeholder:text-store-text-dim focus:border-store-gold"
            />
          </label>

          <div>
            <span className="mb-1.5 block text-[12px] font-medium text-store-text">Telefon raqam</span>
            <div className="flex h-11 items-center rounded-md border border-store-border bg-store-surface px-4">
              <span className="text-[13px] text-store-text-muted">{user.phone_number}</span>
            </div>
            <p className="mt-1.5 text-[11.5px] text-store-text-dim">
              Telefon raqam kirish uchun ishlatiladi va o&apos;zgartirilmaydi.
            </p>
          </div>

          {error && <p className="text-[12.5px] text-red-500">{error}</p>}

          <div className="flex items-center gap-4 border-t border-store-border pt-5">
            <button
              type="submit"
              disabled={!dirty || saving}
              className="inline-flex h-11 items-center gap-2 rounded-md bg-store-gold px-6 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              Saqlash
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-store-gold">
                <Check size={15} />
                Saqlandi
              </span>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-store-border bg-store-card p-6 sm:p-7">
        <h3 className="text-[13px] font-medium text-store-text">Hisob ma&apos;lumoti</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[11.5px] text-store-text-dim">Ro&apos;yxatdan o&apos;tgan sana</dt>
            <dd className="mt-0.5 text-[13px] text-store-text">{formatDate(user.created_at)}</dd>
          </div>
          <div>
            <dt className="text-[11.5px] text-store-text-dim">Holati</dt>
            <dd className="mt-0.5 text-[13px] text-store-text">
              {user.is_active ? "Faol" : "Bloklangan"}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
