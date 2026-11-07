import { Helmet } from "react-helmet-async";
import { ROUTES } from "@/constants";

import { HeroSection }             from "@/components/features/home/HeroSection";
import { CategoryDiscoverySection }from "@/components/features/home/CategoryDiscoverySection";
import { ProductsSection }         from "@/components/features/home/ProductsSection";
import { ServiceBenefits }         from "@/components/features/home/ServiceBenefits";
import { BeautyBodySection }       from "@/components/features/home/BeautyBodySection";
import { CategoryShowcaseSection } from "@/components/features/home/CategoryShowcaseSection";
import { BrandsSection }           from "@/components/features/home/BrandsSection";
import { PromoBannerSection }      from "@/components/features/home/PromoBannerSection";
import { NewsletterSection }       from "@/components/features/home/NewsletterSection";

export function HomePage() {
  return (
    <>
      <Helmet>
        <title>Zahabi Parfüm — Premium Atirlar va Beauty Mahsulotlari | O'zbekiston</title>
        <meta
          name="description"
          content="Zahabi Parfüm — O'zbekistondagi premium parfyumeriya va beauty mahsulotlari onlayn do'koni. Atirlar, body mist, shamlar, sovg'a to'plamlari va ko'p narsalar. Toshkentda va butun O'zbekistonda yetkazib berish."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://zahabi.uz/" />
      </Helmet>

      {/* 1. Cinematic hero */}
      <HeroSection />

      {/* 2. Kategoriya stripi */}
      <CategoryDiscoverySection />

      {/* 3. Bestseller — 2 ustun mobil, 3 planshet, 6 desktop */}
      <ProductsSection
        eyebrowKey="home.bestsellerEyebrow"
        titleKey="home.bestsellerTitle"
        filters={{ is_bestseller: true, sort_by: "created_at", sort_order: "desc", limit: 6 }}
        viewAllHref={`${ROUTES.PRODUCTS}?is_bestseller=true`}
        sectionClassName="bg-store-bg"
        collapseOnMobile
      />

      {/* 4. Yangi kolleksiya */}
      <ProductsSection
        eyebrowKey="home.newEyebrow"
        titleKey="home.newTitle"
        filters={{ sort_by: "created_at", sort_order: "desc", limit: 6 }}
        viewAllHref={`${ROUTES.PRODUCTS}?sort_by=created_at&sort_order=desc`}
        sectionClassName="bg-store-bg"
        headerVariant="serif"
        cardBadge="new"
      />

      {/* 5. Beauty & Body */}
      <BeautyBodySection />

      {/* 6. Xona aromalari */}
      <CategoryShowcaseSection
        eyebrow="Xona aromalari"
        title="Uyingizga ham o'ziga xos hid"
        categorySlug="xona-aromalari"
        image="/showcase/xona-aromalari.png"
        imageAlt="Xona aromalari — reed diffuser va sham"
        crossLinks={[
          { label: "Xushbo'y shamlarni ko'rish", href: `${ROUTES.PRODUCTS}?category_slug=shamlar` },
          { label: "Avtomobil aromalari",        href: `${ROUTES.PRODUCTS}?category_slug=avtomobil-aroma` },
        ]}
      />

      {/* 7. Avtomobil aromalari */}
      <CategoryShowcaseSection
        eyebrow="Avtomobil aromalari"
        title="Yo'lda ham sevimli hidlar"
        categorySlug="avtomobil-aroma"
        image="/showcase/avtomobil-aroma.png"
        imageAlt="Avtomobil salonidagi aroma"
      />

      {/* 8. Xushbo'y shamlar */}
      <CategoryShowcaseSection
        eyebrow="Xushbo'y shamlar"
        title="Issiq muhit va yoqimli hid"
        categorySlug="shamlar"
        image="/showcase/xona-aromalari.png"
        imageAlt="Yoqilgan xushbo'y sham"
      />

      {/* 9. Parfyumeriya setlari */}
      <CategoryShowcaseSection
        eyebrow="Parfyumeriya setlari"
        title="Sovg'a qilish uchun eng yaxshi tanlov"
        categorySlug="gift-box"
        image="/showcase/gift-box.png"
        imageAlt="Maxsus sovg'a o'rami"
        promo={{
          eyebrow: "Maxsus sovg'a o'ram",
          title: <>Bepul qo'shimcha<br />xizmatimiz</>,
          cta: { label: "Batafsil ma'lumot", href: `${ROUTES.PRODUCTS}?category_slug=gift-box` },
        }}
      />

      {/* 10. Banner (API) */}
      <PromoBannerSection />

      {/* 11. Xizmat afzalliklari */}
      <ServiceBenefits />

      {/* 12. Obuna */}
      <NewsletterSection />

      {/* 13. Brendlar */}
      <BrandsSection />
    </>
  );
}
