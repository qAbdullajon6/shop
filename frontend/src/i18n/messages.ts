/**
 * Zahabi Parfüm — localization dictionaries.
 *
 * Uzbek (`uz`) is the source of truth: its object literal defines `MessageKey`,
 * so `ru` and `en` are compile-time forced to stay in sync. Adding a key to
 * `uz` without adding it to the others is a TypeScript error.
 *
 * Keys are namespaced by area (`nav.*`, `bottomNav.*`, `product.*`, …) so the
 * dictionary stays scannable as the platform grows.
 */

export const LOCALES = ["uz", "ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** Uzbek remains the default — the platform's primary market. */
export const DEFAULT_LOCALE: Locale = "uz";

export const LOCALE_LABELS: Record<Locale, string> = {
  uz: "O'zbekcha",
  ru: "Русский",
  en: "English",
};

/** Short form for the header switcher. */
export const LOCALE_SHORT: Record<Locale, string> = {
  uz: "UZ",
  ru: "RU",
  en: "EN",
};

const uz = {
  /* ── Top-level header destinations ──────────────────────── */
  "nav.home": "Bosh sahifa",
  "nav.catalog": "Kataloglar",
  "nav.about": "Biz haqimizda",
  "nav.delivery": "Yetkazib berish",
  "nav.news": "Yangiliklar",

  /* ── Shopping categories (behind "Kataloglar") ──────────── */
  "nav.women": "Ayollar uchun",
  "nav.men": "Erkaklar uchun",
  "nav.niche": "Niche atirlar",
  "nav.body": "Body & Beauty",
  "nav.homeAroma": "Xona aromalari",
  "nav.sale": "Aksiyalar",
  "nav.sets": "Setlar",

  /* ── Mobile bottom navigation ───────────────────────────── */
  "bottomNav.home": "Bosh sahifa",
  "bottomNav.catalog": "Kataloglar",
  "bottomNav.wishlist": "Sevimlilar",
  "bottomNav.cart": "Savatcha",
  "bottomNav.profile": "Profil",

  /* ── Catalog bottom sheet ───────────────────────────────── */
  "catalog.title": "Kataloglar",
  "catalog.close": "Yopish",
  "catalog.viewAll": "Barcha mahsulotlar",

  /* ── Header actions ─────────────────────────────────────── */
  "header.menu": "Menyu",
  "header.search": "Qidirish",
  "header.searchPlaceholder": "Atir nomi, brend yoki kategoriya...",
  "header.lightMode": "Yorug' rejim",
  "header.darkMode": "Tungi rejim",
  "header.account": "Kabinet",
  "header.login": "Kirish",
  "header.wishlist": "Sevimlilar",
  "header.cart": "Savat",
  "header.language": "Til",

  /* ── Mobile drawer (secondary navigation) ───────────────── */
  "menu.title": "Menyu",
  "menu.about": "Biz haqimizda",
  "menu.delivery": "Yetkazib berish",
  "menu.warranty": "Kafolat va qaytarish",
  "menu.faq": "Savol-javob",
  "menu.contacts": "Kontaktlar",
  "menu.partnership": "Hamkorlik",
  "menu.settings": "Sozlamalar",

  /* ── Mega menu ──────────────────────────────────────────── */
  "megaMenu.categories": "Kategoriyalar",
  "megaMenu.brands": "Mashhur brendlar",
  "megaMenu.allBrands": "Barcha brendlar",
  "megaMenu.featured": "Tanlangan",
  "megaMenu.viewCategory": "Kategoriyani ko'rish",

  /* ── Home sections ──────────────────────────────────────── */
  "home.categories": "Kategoriyalar",
  "home.bestsellerEyebrow": "Bestseller",
  "home.bestsellerTitle": "Eng ko'p tanlanganlar",
  "home.newEyebrow": "Yangi kelganlar",
  "home.newTitle": "Yangi kolleksiya",
  "home.viewAll": "Barchasini ko'rish",
  "home.showMore": "Ko'proq ko'rish",

  /* ── Product card ───────────────────────────────────────── */
  "product.addToCart": "Savatchaga qo'shish",
  "product.adding": "Qo'shilmoqda...",
  "product.added": "Savatchaga qo'shildi",
  "product.outOfStock": "Tugagan",
  "product.bestseller": "Bestseller",
  "product.new": "Yangi",
  "product.addToWishlist": "Sevimlilarga qo'shish",
  "product.removeFromWishlist": "Sevimlilardan olib tashlash",
  "product.increase": "Ko'paytirish",
  "product.decrease": "Kamaytirish",
} as const;

export type MessageKey = keyof typeof uz;

const ru: Record<MessageKey, string> = {
  "nav.home": "Главная",
  "nav.catalog": "Каталог",
  "nav.about": "О нас",
  "nav.delivery": "Доставка",
  "nav.news": "Новинки",

  "nav.women": "Для женщин",
  "nav.men": "Для мужчин",
  "nav.niche": "Нишевая парфюмерия",
  "nav.body": "Body & Beauty",
  "nav.homeAroma": "Ароматы для дома",
  "nav.sale": "Акции",
  "nav.sets": "Наборы",

  "bottomNav.home": "Главная",
  "bottomNav.catalog": "Каталог",
  "bottomNav.wishlist": "Избранное",
  "bottomNav.cart": "Корзина",
  "bottomNav.profile": "Профиль",

  "catalog.title": "Каталог",
  "catalog.close": "Закрыть",
  "catalog.viewAll": "Все товары",

  "header.menu": "Меню",
  "header.search": "Поиск",
  "header.searchPlaceholder": "Название аромата, бренд или категория...",
  "header.lightMode": "Светлая тема",
  "header.darkMode": "Тёмная тема",
  "header.account": "Кабинет",
  "header.login": "Войти",
  "header.wishlist": "Избранное",
  "header.cart": "Корзина",
  "header.language": "Язык",

  "menu.title": "Меню",
  "menu.about": "О нас",
  "menu.delivery": "Доставка",
  "menu.warranty": "Гарантия и возврат",
  "menu.faq": "Вопросы и ответы",
  "menu.contacts": "Контакты",
  "menu.partnership": "Сотрудничество",
  "menu.settings": "Настройки",

  "megaMenu.categories": "Категории",
  "megaMenu.brands": "Популярные бренды",
  "megaMenu.allBrands": "Все бренды",
  "megaMenu.featured": "Выбор редакции",
  "megaMenu.viewCategory": "Смотреть категорию",

  "home.categories": "Категории",
  "home.bestsellerEyebrow": "Бестселлер",
  "home.bestsellerTitle": "Самые популярные",
  "home.newEyebrow": "Новинки",
  "home.newTitle": "Новая коллекция",
  "home.viewAll": "Смотреть все",
  "home.showMore": "Показать ещё",

  "product.addToCart": "В корзину",
  "product.adding": "Добавляем...",
  "product.added": "Добавлено в корзину",
  "product.outOfStock": "Нет в наличии",
  "product.bestseller": "Бестселлер",
  "product.new": "Новинка",
  "product.addToWishlist": "Добавить в избранное",
  "product.removeFromWishlist": "Удалить из избранного",
  "product.increase": "Увеличить",
  "product.decrease": "Уменьшить",
};

const en: Record<MessageKey, string> = {
  "nav.home": "Home",
  "nav.catalog": "Catalog",
  "nav.about": "About us",
  "nav.delivery": "Delivery",
  "nav.news": "New in",

  "nav.women": "For Women",
  "nav.men": "For Men",
  "nav.niche": "Niche Fragrances",
  "nav.body": "Body & Beauty",
  "nav.homeAroma": "Home Fragrances",
  "nav.sale": "Sale",
  "nav.sets": "Gift Sets",

  "bottomNav.home": "Home",
  "bottomNav.catalog": "Catalog",
  "bottomNav.wishlist": "Wishlist",
  "bottomNav.cart": "Cart",
  "bottomNav.profile": "Profile",

  "catalog.title": "Catalog",
  "catalog.close": "Close",
  "catalog.viewAll": "All products",

  "header.menu": "Menu",
  "header.search": "Search",
  "header.searchPlaceholder": "Fragrance name, brand or category...",
  "header.lightMode": "Light mode",
  "header.darkMode": "Dark mode",
  "header.account": "Account",
  "header.login": "Sign in",
  "header.wishlist": "Wishlist",
  "header.cart": "Cart",
  "header.language": "Language",

  "menu.title": "Menu",
  "menu.about": "About us",
  "menu.delivery": "Delivery",
  "menu.warranty": "Warranty & returns",
  "menu.faq": "FAQ",
  "menu.contacts": "Contacts",
  "menu.partnership": "Partnership",
  "menu.settings": "Settings",

  "megaMenu.categories": "Categories",
  "megaMenu.brands": "Popular brands",
  "megaMenu.allBrands": "All brands",
  "megaMenu.featured": "Featured",
  "megaMenu.viewCategory": "View category",

  "home.categories": "Categories",
  "home.bestsellerEyebrow": "Bestseller",
  "home.bestsellerTitle": "Most popular",
  "home.newEyebrow": "New arrivals",
  "home.newTitle": "New collection",
  "home.viewAll": "View all",
  "home.showMore": "Show more",

  "product.addToCart": "Add to cart",
  "product.adding": "Adding...",
  "product.added": "Added to cart",
  "product.outOfStock": "Out of stock",
  "product.bestseller": "Bestseller",
  "product.new": "New",
  "product.addToWishlist": "Add to wishlist",
  "product.removeFromWishlist": "Remove from wishlist",
  "product.increase": "Increase",
  "product.decrease": "Decrease",
};

export const MESSAGES: Record<Locale, Record<MessageKey, string>> = { uz, ru, en };
