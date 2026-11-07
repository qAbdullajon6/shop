// BACKEND NOTE: Newsletter/email subscription endpoint does not exist yet.
// Wire the form submit to /newsletter or /subscriptions when backend adds this endpoint.

import { useState, type FormEvent } from "react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: POST /newsletter when backend adds this endpoint
    setSubmitted(true);
  };

  return (
    <section className="relative overflow-hidden bg-store-surface" aria-label="Obuna">
      {/* Fon rasmi — yo'q bo'lsa surface rangi qoladi */}
      <img
        src="/showcase/gift-box.png"
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
      {/* Matn o'qilishi uchun parda */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-[#F3EFE7] via-[#F3EFE7]/80 to-[#F3EFE7]/0 dark:from-[#0D0D0D] dark:via-[#0D0D0D]/80 dark:to-[#0D0D0D]/0"
      />

      <div className="relative mx-auto max-w-content px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="font-serif text-[28px] leading-tight text-store-text sm:text-[34px] lg:text-[40px]">
            Yangiliklar va aksiyalardan xabardor bo'ling
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-store-text-muted">
            Eng birinchi bo'lib yangi kolleksiyalar, maxsus takliflar va chegirmalar haqida bilib oling.
          </p>

          {submitted ? (
            <p className="mt-9 text-[13px] font-medium text-store-gold">
              Rahmat! Obuna bo'ldingiz.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex max-w-md flex-col items-stretch gap-2 sm:flex-row"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Email manzilingiz"
                className="flex-1 rounded-md border border-store-border bg-store-card px-4 py-3 text-[13px] text-store-text outline-none transition-colors placeholder:text-store-text-dim focus:border-store-gold"
              />
              <button
                type="submit"
                className="whitespace-nowrap rounded-md bg-store-gold px-7 py-3 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Obuna bo'lish
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
