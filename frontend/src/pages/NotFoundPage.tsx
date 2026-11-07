import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants";

export function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 — Sahifa topilmadi — Zahabi Parfüm</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="font-serif text-[120px] leading-none font-light text-store-gold/20 select-none">
          404
        </p>
        <h1 className="text-2xl font-semibold text-store-text -mt-6">Sahifa topilmadi</h1>
        <p className="text-sm text-store-text-muted max-w-sm">
          So'ralgan sahifa mavjud emas yoki o'chirilgan. Bosh sahifaga qaytib davom eting.
        </p>
        <Link to={ROUTES.HOME}>
          <Button>Bosh sahifaga qaytish</Button>
        </Link>
      </div>
    </>
  );
}
