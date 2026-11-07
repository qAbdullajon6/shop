import type { Palette, ShapeKind } from './images';

/**
 * Zahabi Parfume katalogi.
 *
 * Har bir yozuv NOYOB mahsulot: o'z nomi, brendi, hid piramidasi, narxi va
 * zaxirasi bilan. Bu ataylab qilingan — bosh sahifa bloklari (bestseller,
 * yangi kelganlar, shamlar, avtomobil aromalari) bir xil bir nechta
 * mahsulotni qayta-qayta ko'rsatmasligi kerak.
 *
 * Narxlar so'mda va O'zbekiston bozoriga yaqin.
 */

export interface VariantSeed {
  sku: string;
  volume: string;
  price: number;
  /** Chegirmagacha narx — faqat aksiyadagi mahsulotlarda. */
  compare?: number;
  cost: number;
  stock: number;
}

export interface ProductSeed {
  slug: string;
  name: string;
  name_ru?: string;
  brand: string;
  category: string;
  gender: 'MALE' | 'FEMALE' | 'UNISEX' | 'NOT_APPLICABLE';
  concentration:
    | 'PARFUM'
    | 'EAU_DE_PARFUM'
    | 'EAU_DE_TOILETTE'
    | 'EAU_DE_COLOGNE'
    | 'EAU_FRAICHE'
    | 'EXTRAIT'
    | 'BODY_MIST'
    | 'NOT_APPLICABLE';
  top?: string[];
  heart?: string[];
  base?: string[];
  longevity?: number;
  sillage?: number;
  country?: string;
  year?: number;
  palette: Palette;
  shape: ShapeKind;
  short: string;
  description: string;
  variants: VariantSeed[];
  bestseller?: boolean;
  featured?: boolean;
}

export const CATEGORIES = [
  {
    slug: 'erkaklar-atiri',
    name_uz: 'Erkaklar atiri',
    name_ru: 'Мужская парфюмерия',
    name_en: "Men's Fragrances",
    desc_uz: 'Kundalik va maxsus kunlar uchun erkaklar atirlari — yangi sitrusdan qadimiy oudgacha.',
    palette: 'noir' as Palette,
    shape: 'flacon' as ShapeKind,
    featured: true,
  },
  {
    slug: 'ayollar-atiri',
    name_uz: 'Ayollar atiri',
    name_ru: 'Женская парфюмерия',
    name_en: "Women's Fragrances",
    desc_uz: "Gulli, shirin va sharqona notalar — har bir kayfiyat uchun ayollar atirlari.",
    palette: 'rose' as Palette,
    shape: 'flacon' as ShapeKind,
    featured: true,
  },
  {
    slug: 'niche-atir',
    name_uz: 'Niche atirlar',
    name_ru: 'Нишевая парфюмерия',
    name_en: 'Niche Fragrances',
    desc_uz: "Cheklangan tirajli, mualliflik kolleksiyalari — takrorlanmas hid izlayotganlar uchun.",
    palette: 'plum' as Palette,
    shape: 'flacon' as ShapeKind,
    featured: true,
  },
  {
    slug: 'body-mist',
    name_uz: 'Body Mist',
    name_ru: 'Спрей для тела',
    name_en: 'Body Mist',
    desc_uz: "Yengil tana spreylari — kun davomida yangilanish uchun.",
    palette: 'azure' as Palette,
    shape: 'tall' as ShapeKind,
    featured: true,
  },
  {
    slug: 'dush-geli',
    name_uz: 'Dush geli',
    name_ru: 'Гель для душа',
    name_en: 'Shower Gel',
    desc_uz: "Parfyumeriya sifatidagi dush gellari — hid ertalabdan boshlanadi.",
    palette: 'emerald' as Palette,
    shape: 'tube' as ShapeKind,
    featured: true,
  },
  {
    slug: 'xushboy-sovun',
    name_uz: "Xushbo'y sovun",
    name_ru: 'Ароматное мыло',
    name_en: 'Luxury Soap',
    desc_uz: "Qo'lda quyilgan hashamatli sovunlar — vannaxonangiz uchun kichik marosim.",
    palette: 'ivory' as Palette,
    shape: 'bar' as ShapeKind,
    featured: true,
  },
  {
    slug: 'soch-parfum',
    name_uz: 'Soch parfumi',
    name_ru: 'Парфюм для волос',
    name_en: 'Hair Fragrance',
    desc_uz: "Sochni quritmaydigan maxsus formula — hid kun bo'yi hamrohingiz.",
    palette: 'citrus' as Palette,
    shape: 'tall' as ShapeKind,
    featured: true,
  },
  {
    slug: 'xona-aromalari',
    name_uz: 'Xona aromalari',
    name_ru: 'Ароматы для дома',
    name_en: 'Home Fragrance',
    desc_uz: "Tayoqchali diffuzorlar va xona spreylari — uyingizning o'z hidi.",
    palette: 'amber' as Palette,
    shape: 'diffuser' as ShapeKind,
    featured: true,
  },
  {
    slug: 'avtomobil-aroma',
    name_uz: 'Avtomobil aromalari',
    name_ru: 'Ароматы для авто',
    name_en: 'Car Fragrances',
    desc_uz: "Salon uchun nafis aromalar — yo'l ham yoqimli bo'lsin.",
    palette: 'azure' as Palette,
    shape: 'car' as ShapeKind,
    featured: true,
  },
  {
    slug: 'shamlar',
    name_uz: "Xushbo'y shamlar",
    name_ru: 'Ароматические свечи',
    name_en: 'Scented Candles',
    desc_uz: "Tabiiy mumdan quyilgan shamlar — issiq muhit va yoqimli hid.",
    palette: 'amber' as Palette,
    shape: 'candle' as ShapeKind,
    featured: true,
  },
  {
    slug: 'parfyum-set',
    name_uz: 'Parfyumeriya setlari',
    name_ru: 'Парфюмерные наборы',
    name_en: 'Fragrance Sets',
    desc_uz: "Atir va tana mahsulotlari birgalikda — to'liq parvarish to'plami.",
    palette: 'plum' as Palette,
    shape: 'box' as ShapeKind,
    featured: true,
  },
  {
    slug: 'gift-box',
    name_uz: 'Gift Box',
    name_ru: 'Подарочные наборы',
    name_en: 'Gift Sets',
    desc_uz: "Tayyor sovg'a o'ramlari — bayramlar va maxsus kunlar uchun.",
    palette: 'rose' as Palette,
    shape: 'box' as ShapeKind,
    featured: true,
  },
];

export const BRANDS = [
  { name: 'Tom Ford', slug: 'tom-ford', country: 'AQSh', featured: true },
  { name: 'Chanel', slug: 'chanel', country: 'Fransiya', featured: true },
  { name: 'Dior', slug: 'dior', country: 'Fransiya', featured: true },
  { name: 'Creed', slug: 'creed', country: 'Buyuk Britaniya', featured: true },
  { name: 'Maison Francis Kurkdjian', slug: 'mfk', country: 'Fransiya', featured: true },
  { name: 'Yves Saint Laurent', slug: 'ysl', country: 'Fransiya', featured: true },
  { name: 'Versace', slug: 'versace', country: 'Italiya', featured: true },
  { name: 'Lancôme', slug: 'lancome', country: 'Fransiya' },
  { name: 'Jo Malone London', slug: 'jo-malone', country: 'Buyuk Britaniya', featured: true },
  { name: 'Byredo', slug: 'byredo', country: 'Shvetsiya', featured: true },
  { name: 'Giorgio Armani', slug: 'armani', country: 'Italiya', featured: true },
  { name: 'Dolce & Gabbana', slug: 'dolce-gabbana', country: 'Italiya' },
  { name: 'Xerjoff', slug: 'xerjoff', country: 'Italiya', featured: true },
  { name: 'Prada', slug: 'prada', country: 'Italiya' },
  { name: 'Carolina Herrera', slug: 'carolina-herrera', country: 'Ispaniya' },
  { name: 'Jean Paul Gaultier', slug: 'jean-paul-gaultier', country: 'Fransiya' },
  { name: 'Montblanc', slug: 'montblanc', country: 'Germaniya' },
  { name: 'Hermès', slug: 'hermes', country: 'Fransiya', featured: true },
  { name: 'Narciso Rodriguez', slug: 'narciso-rodriguez', country: 'AQSh' },
  { name: 'Givenchy', slug: 'givenchy', country: 'Fransiya' },
  { name: 'Parfums de Marly', slug: 'parfums-de-marly', country: 'Fransiya', featured: true },
  { name: 'Initio', slug: 'initio', country: 'Fransiya' },
  { name: 'Amouage', slug: 'amouage', country: 'Ummon', featured: true },
  { name: 'Nishane', slug: 'nishane', country: 'Turkiya' },
  { name: 'Le Labo', slug: 'le-labo', country: 'AQSh', featured: true },
  { name: 'Diptyque', slug: 'diptyque', country: 'Fransiya', featured: true },
  { name: 'Molton Brown', slug: 'molton-brown', country: 'Buyuk Britaniya' },
  { name: 'Rituals', slug: 'rituals', country: 'Niderlandiya' },
  { name: "L'Occitane en Provence", slug: 'loccitane', country: 'Fransiya' },
  { name: 'Yankee Candle', slug: 'yankee-candle', country: 'AQSh' },
  { name: 'Bath & Body Works', slug: 'bath-body-works', country: 'AQSh' },
  { name: 'Victoria\'s Secret', slug: 'victorias-secret', country: 'AQSh' },
  { name: 'Zahabi Maison', slug: 'zahabi-maison', country: "O'zbekiston", featured: true },
  { name: 'Lattafa', slug: 'lattafa', country: 'BAA' },
  { name: 'Armaf', slug: 'armaf', country: 'BAA' },
  { name: 'Ajmal', slug: 'ajmal', country: 'BAA' },
];

// ─────────────────────────────────────────────────────────────────────────────
// ERKAKLAR ATIRI
// ─────────────────────────────────────────────────────────────────────────────

const MEN: ProductSeed[] = [
  {
    slug: 'dior-sauvage-edp', name: 'Dior Sauvage', brand: 'dior', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Bergamot', 'Kalabriya sitrusi'], heart: ['Sichuan qalampiri', 'Lavanda'], base: ['Ambroksan', 'Vanil'],
    longevity: 4, sillage: 5, country: 'Fransiya', year: 2018, palette: 'azure', shape: 'flacon',
    short: 'Yovvoyi va erkin — zamonaviy erkak klassikasi.',
    description: "Sahro shamoli va yorqin bergamot. Sichuan qalampiri hidga o'tkirlik beradi, ambroksan esa uni terida soatlab ushlab turadi. Kechqurun uchrashuvlardan tortib kundalik ishgacha — universal tanlov.",
    variants: [
      { sku: 'ZP-DIOR-SAU-60', volume: '60ml', price: 1_150_000, cost: 440_000, stock: 34 },
      { sku: 'ZP-DIOR-SAU-100', volume: '100ml', price: 1_750_000, compare: 1_990_000, cost: 670_000, stock: 28 },
      { sku: 'ZP-DIOR-SAU-200', volume: '200ml', price: 2_650_000, cost: 1_020_000, stock: 9 },
    ],
    bestseller: true, featured: true,
  },
  {
    slug: 'creed-aventus', name: 'Creed Aventus', brand: 'creed', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Ananas', 'Qora smorodina', 'Olma'], heart: ['Qayin', 'Pachuli', 'Marokash yasemini'], base: ['Muskus', 'Eman moxi', 'Vanil'],
    longevity: 5, sillage: 5, country: 'Buyuk Britaniya', year: 2010, palette: 'noir', shape: 'flacon',
    short: "G'alaba hidi — dunyodagi eng mashhur niche atirlardan biri.",
    description: "Ananasning shirin tutuni va qayin tutunining kombinatsiyasi. Aventus muvaffaqiyat bilan bog'lanadi va shu sababli o'n yildan beri eng ko'p sotiladigan erkaklar atiri bo'lib qolmoqda.",
    variants: [
      { sku: 'ZP-CREED-AVE-50', volume: '50ml', price: 2_450_000, cost: 980_000, stock: 11 },
      { sku: 'ZP-CREED-AVE-100', volume: '100ml', price: 4_200_000, cost: 1_680_000, stock: 7 },
    ],
    bestseller: true, featured: true,
  },
  {
    slug: 'tom-ford-oud-wood', name: 'Tom Ford Oud Wood', brand: 'tom-ford', category: 'erkaklar-atiri',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Nodir oud', 'Palisandr', 'Kardamon'], heart: ['Sandal', 'Vetiver', 'Tonka'], base: ['Amber', 'Vanil', 'Amberkris'],
    longevity: 5, sillage: 4, country: 'AQSh', year: 2007, palette: 'amber', shape: 'flacon',
    short: "Yumshoq oud — sharqona hidga birinchi qadam.",
    description: "Oud odatda og'ir bo'ladi, Oud Wood esa uni sandal va vanil bilan yumshatadi. Sharqona atirlar dunyosiga kirish uchun eng qulay yo'l.",
    variants: [
      { sku: 'ZP-TF-OUD-50', volume: '50ml', price: 1_850_000, cost: 740_000, stock: 15 },
      { sku: 'ZP-TF-OUD-100', volume: '100ml', price: 2_950_000, compare: 3_400_000, cost: 1_180_000, stock: 12 },
    ],
    bestseller: true,
  },
  {
    slug: 'bleu-de-chanel-edp', name: 'Bleu de Chanel', brand: 'chanel', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Greypfrut', 'Limon', 'Yalpiz'], heart: ['Zanjabil', 'Muskat yong\'og\'i', 'Yasemin'], base: ['Ladan', 'Sandal', 'Sadr'],
    longevity: 4, sillage: 4, country: 'Fransiya', year: 2014, palette: 'azure', shape: 'flacon',
    short: 'Ofisdan kechki taomgacha — mукammal muvozanat.',
    description: "Sitrus ochilishi darhol yangilik beradi, sadr va ladan esa hidga jiddiylik qo'shadi. Har qanday vaziyatda o'rinli bo'lgan kam sonli atirlardan biri.",
    variants: [
      { sku: 'ZP-CH-BDC-50', volume: '50ml', price: 1_390_000, cost: 556_000, stock: 22 },
      { sku: 'ZP-CH-BDC-100', volume: '100ml', price: 1_980_000, cost: 792_000, stock: 18 },
      { sku: 'ZP-CH-BDC-150', volume: '150ml', price: 2_680_000, cost: 1_072_000, stock: 6 },
    ],
    bestseller: true,
  },
  {
    slug: 'ysl-y-edp', name: 'Yves Saint Laurent Y', brand: 'ysl', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Bergamot', 'Zanjabil', 'Olma'], heart: ['Adaçayı', 'Yasemin'], base: ['Sadr', 'Tonka', 'Amberwood'],
    longevity: 4, sillage: 4, country: 'Fransiya', year: 2018, palette: 'noir', shape: 'tall',
    short: "Zamonaviy, toza va o'ziga ishongan.",
    description: "Yorqin olma va zanjabil ochilishi, so'ngra adaçayı va sadrning quruq izi. Kunduzi ham, kechqurun ham kiyish mumkin.",
    variants: [
      { sku: 'ZP-YSL-Y-60', volume: '60ml', price: 1_120_000, cost: 448_000, stock: 26 },
      { sku: 'ZP-YSL-Y-100', volume: '100ml', price: 1_580_000, compare: 1_820_000, cost: 632_000, stock: 19 },
    ],
  },
  {
    slug: 'armani-acqua-di-gio-profondo', name: 'Acqua di Giò Profondo', brand: 'armani', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Dengiz notalari', 'Bergamot', 'Yashil mandarin'], heart: ['Rozmarin', 'Lavanda', 'Kipari'], base: ['Pachuli', 'Muskus', 'Amber'],
    longevity: 4, sillage: 3, country: 'Italiya', year: 2020, palette: 'azure', shape: 'flacon',
    short: "Chuqur dengiz — yozning eng toza hidi.",
    description: "Klassik Acqua di Giò ning quyuqroq versiyasi. Dengiz notalari kipari va pachuli bilan chuqurlashadi — issiq kunlar uchun ideal.",
    variants: [
      { sku: 'ZP-ARM-ADGP-40', volume: '40ml', price: 890_000, cost: 356_000, stock: 24 },
      { sku: 'ZP-ARM-ADGP-75', volume: '75ml', price: 1_420_000, cost: 568_000, stock: 17 },
      { sku: 'ZP-ARM-ADGP-125', volume: '125ml', price: 1_950_000, cost: 780_000, stock: 8 },
    ],
  },
  {
    slug: 'versace-eros-edt', name: 'Versace Eros', brand: 'versace', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_TOILETTE',
    top: ['Yalpiz', 'Yashil olma', 'Limon'], heart: ['Tonka', 'Geran', 'Ambroksan'], base: ['Vanil', 'Sadr', 'Vetiver'],
    longevity: 4, sillage: 5, country: 'Italiya', year: 2012, palette: 'emerald', shape: 'flacon',
    short: "Yorqin, shirin va e'tiborni tortadi.",
    description: "Yalpiz va olmaning sovuq ochilishi, keyin tonka va vanilning issiq izi. Yosh auditoriya orasida eng mashhur atirlardan.",
    variants: [
      { sku: 'ZP-VER-EROS-50', volume: '50ml', price: 720_000, cost: 288_000, stock: 31 },
      { sku: 'ZP-VER-EROS-100', volume: '100ml', price: 1_050_000, compare: 1_250_000, cost: 420_000, stock: 25 },
    ],
  },
  {
    slug: 'pdm-layton', name: 'Parfums de Marly Layton', brand: 'parfums-de-marly', category: 'erkaklar-atiri',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Olma', 'Bergamot', 'Lavanda'], heart: ['Geran', 'Binafsha', 'Yasemin'], base: ['Vanil', 'Sandal', 'Pachuli'],
    longevity: 5, sillage: 5, country: 'Fransiya', year: 2016, palette: 'plum', shape: 'flacon',
    short: "Shirin-ziravorli — sovuq mavsum uchun.",
    description: "Olma va lavandaning ochilishi vanil va sandalning issiq yostig'iga tushadi. Kuz va qishda ayniqsa yaxshi ochiladi.",
    variants: [
      { sku: 'ZP-PDM-LAY-75', volume: '75ml', price: 2_780_000, cost: 1_112_000, stock: 9 },
      { sku: 'ZP-PDM-LAY-125', volume: '125ml', price: 3_850_000, cost: 1_540_000, stock: 5 },
    ],
    bestseller: true,
  },
  {
    slug: 'jpg-le-male-le-parfum', name: 'Jean Paul Gaultier Le Male Le Parfum', brand: 'jean-paul-gaultier', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'PARFUM',
    top: ['Kardamon'], heart: ['Lavanda'], base: ['Vanil', 'Kakao', 'Benzoin'],
    longevity: 5, sillage: 4, country: 'Fransiya', year: 2020, palette: 'noir', shape: 'flacon',
    short: 'Kardamon va vanil — issiq va yodda qoladi.',
    description: "Le Male oilasining eng quyuq a'zosi. Kardamon ziravorligi, lavanda tozaligi va vanil-kakao asosi birga uzoq davom etuvchi shlef yaratadi.",
    variants: [
      { sku: 'ZP-JPG-LMLP-75', volume: '75ml', price: 1_290_000, cost: 516_000, stock: 20 },
      { sku: 'ZP-JPG-LMLP-125', volume: '125ml', price: 1_720_000, cost: 688_000, stock: 12 },
    ],
  },
  {
    slug: 'montblanc-explorer', name: 'Montblanc Explorer', brand: 'montblanc', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Bergamot', 'Pushti qalampir'], heart: ['Vetiver', 'Chirmovuq'], base: ['Pachuli', 'Kakao', 'Muskus'],
    longevity: 4, sillage: 4, country: 'Germaniya', year: 2019, palette: 'emerald', shape: 'flacon',
    short: "Aventusga yaqin — arzonroq narxda.",
    description: "Bergamot va vetiverning sayohatchi ruhi. Ko'pchilik uni Aventusning munosib va ancha hamyonbop muqobili deb biladi.",
    variants: [
      { sku: 'ZP-MB-EXP-60', volume: '60ml', price: 680_000, cost: 272_000, stock: 28 },
      { sku: 'ZP-MB-EXP-100', volume: '100ml', price: 940_000, compare: 1_150_000, cost: 376_000, stock: 22 },
    ],
  },
  {
    slug: 'prada-luna-rossa-carbon', name: 'Prada Luna Rossa Carbon', brand: 'prada', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_TOILETTE',
    top: ['Bergamot', 'Lavanda'], heart: ['Metall notalar', 'Kokos'], base: ['Pachuli', 'Sadr', 'Amber'],
    longevity: 4, sillage: 3, country: 'Italiya', year: 2017, palette: 'noir', shape: 'flacon',
    short: "Metall va lavanda — sport eleganti.",
    description: "Sovuq metall notalari va yumshoq kokos. Zamonaviy, toza va ish kuni uchun mos.",
    variants: [
      { sku: 'ZP-PRA-LRC-50', volume: '50ml', price: 890_000, cost: 356_000, stock: 18 },
      { sku: 'ZP-PRA-LRC-100', volume: '100ml', price: 1_320_000, cost: 528_000, stock: 14 },
    ],
  },
  {
    slug: 'dg-the-one-men', name: 'Dolce & Gabbana The One for Men', brand: 'dolce-gabbana', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Greypfrut', 'Koriandr', 'Rayhon'], heart: ['Kardamon', 'Zanjabil', 'Apelsin gullari'], base: ['Kedr', 'Tamaki', 'Amber'],
    longevity: 4, sillage: 4, country: 'Italiya', year: 2015, palette: 'amber', shape: 'flacon',
    short: 'Tamaki va ziravor — kechki tanlov.',
    description: "Ziravorli ochilish va tamaki-amber asosi. Sovuq oqshomlar va rasmiy tadbirlar uchun.",
    variants: [
      { sku: 'ZP-DG-ONE-50', volume: '50ml', price: 980_000, cost: 392_000, stock: 16 },
      { sku: 'ZP-DG-ONE-100', volume: '100ml', price: 1_420_000, cost: 568_000, stock: 13 },
    ],
  },
  {
    slug: 'initio-oud-for-greatness', name: 'Initio Oud for Greatness', brand: 'initio', category: 'erkaklar-atiri',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Zaʼfaron', 'Muskat yong\'og\'i'], heart: ['Oud', 'Marokash yasemini'], base: ['Muskus', 'Sandal'],
    longevity: 5, sillage: 5, country: 'Fransiya', year: 2018, palette: 'amber', shape: 'flacon',
    short: "Kuchli oud — kam miqdorda ham yetarli.",
    description: "Zaʼfaron va oudning to'yingan kombinatsiyasi. Bir-ikki purkash kifoya — hid kun bo'yi qoladi.",
    variants: [
      { sku: 'ZP-INI-OFG-90', volume: '90ml', price: 3_450_000, cost: 1_380_000, stock: 6 },
    ],
  },
  {
    slug: 'armaf-club-de-nuit-intense', name: 'Armaf Club de Nuit Intense Man', brand: 'armaf', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_TOILETTE',
    top: ['Limon', 'Ananas', 'Qora smorodina'], heart: ['Qayin', 'Yasemin', 'Atirgul'], base: ['Muskus', 'Vanil', 'Amber'],
    longevity: 4, sillage: 5, country: 'BAA', year: 2015, palette: 'noir', shape: 'flacon',
    short: "Hamyonbop klassika — kuchli shlef.",
    description: "Aventus uslubidagi ananas-qayin kombinatsiyasi. Narx-sifat nisbati bo'yicha katalogimizdagi eng kuchli takliflardan.",
    variants: [
      { sku: 'ZP-ARF-CDNI-105', volume: '105ml', price: 420_000, compare: 520_000, cost: 168_000, stock: 42 },
    ],
    bestseller: true,
  },
  {
    slug: 'lattafa-khamrah', name: 'Lattafa Khamrah', brand: 'lattafa', category: 'erkaklar-atiri',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Dolchin', 'Muskat yong\'og\'i', 'Bergamot'], heart: ['Xurmo', 'Praline', 'Tuberoza'], base: ['Vanil', 'Benzoin', 'Tonka'],
    longevity: 5, sillage: 4, country: 'BAA', year: 2022, palette: 'amber', shape: 'flacon',
    short: "Xurmo va dolchin — sharqona shirinlik.",
    description: "Xurmo, dolchin va vanilning to'q kombinatsiyasi. Qishda ayniqsa chiroyli ochiladi va uzoq turadi.",
    variants: [
      { sku: 'ZP-LAT-KHA-100', volume: '100ml', price: 380_000, cost: 152_000, stock: 48 },
    ],
    bestseller: true,
  },
  {
    slug: 'hermes-terre-dhermes', name: "Hermès Terre d'Hermès", brand: 'hermes', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_TOILETTE',
    top: ['Greypfrut', 'Apelsin'], heart: ['Qalampir', 'Pelargoniya'], base: ['Vetiver', 'Sadr', 'Benzoin'],
    longevity: 4, sillage: 3, country: 'Fransiya', year: 2006, palette: 'citrus', shape: 'flacon',
    short: "Yer va sitrus — vaqt sinovidan o'tgan.",
    description: "Greypfrutning yorqinligi vetiver va sadrning quruq mineral asosiga tushadi. Yetuk va vazmin tanlov.",
    variants: [
      { sku: 'ZP-HER-TDH-50', volume: '50ml', price: 1_180_000, cost: 472_000, stock: 15 },
      { sku: 'ZP-HER-TDH-100', volume: '100ml', price: 1_680_000, cost: 672_000, stock: 11 },
    ],
  },
  {
    slug: 'givenchy-gentleman-society', name: 'Givenchy Gentleman Society', brand: 'givenchy', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Adaçayı', 'Vodka akkordi'], heart: ['Narcis', 'Apelsin gullari'], base: ['Vetiver', 'Sadr', 'Pachuli'],
    longevity: 4, sillage: 4, country: 'Fransiya', year: 2022, palette: 'emerald', shape: 'flacon',
    short: 'Zamonaviy janob — toza va yashil.',
    description: "Adaçayı va narcisning yashil ochilishi vetiver asosiga o'tadi. Ofis uchun juda mos.",
    variants: [
      { sku: 'ZP-GIV-GS-60', volume: '60ml', price: 1_050_000, cost: 420_000, stock: 17 },
      { sku: 'ZP-GIV-GS-100', volume: '100ml', price: 1_480_000, cost: 592_000, stock: 12 },
    ],
  },
  {
    slug: 'nishane-hacivat', name: 'Nishane Hacivat', brand: 'nishane', category: 'erkaklar-atiri',
    gender: 'UNISEX', concentration: 'EXTRAIT',
    top: ['Ananas', 'Greypfrut', 'Bergamot'], heart: ['Yasemin', 'Pachuli'], base: ['Oud', 'Sadr', 'Muskus'],
    longevity: 5, sillage: 5, country: 'Turkiya', year: 2017, palette: 'plum', shape: 'flacon',
    short: "Ananas va oud — kutilmagan uyg'unlik.",
    description: "Yorqin ananas ochilishi oud va sadrning quyuq asosiga aylanadi. Istanbul niche parfyumeriyasining vizit kartasi.",
    variants: [
      { sku: 'ZP-NIS-HAC-50', volume: '50ml', price: 2_150_000, cost: 860_000, stock: 8 },
      { sku: 'ZP-NIS-HAC-100', volume: '100ml', price: 3_380_000, cost: 1_352_000, stock: 5 },
    ],
  },
  {
    slug: 'zahabi-nur-royal', name: 'Zahabi Nur Royal', brand: 'zahabi-maison', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Bergamot', 'Zaʼfaron'], heart: ['Atirgul', 'Oud'], base: ['Amber', 'Sandal', 'Muskus'],
    longevity: 5, sillage: 4, country: "O'zbekiston", year: 2025, palette: 'amber', shape: 'flacon',
    short: "Zahabi mualliflik kolleksiyasi — sharqona nafislik.",
    description: "Zaʼfaron va atirgulning sharqona uyg'unligi, oud va amberning chuqur asosi. Zahabi Maison ustaxonasida O'zbekistonda yaratilgan.",
    variants: [
      { sku: 'ZP-ZM-NUR-50', volume: '50ml', price: 690_000, cost: 245_000, stock: 30 },
      { sku: 'ZP-ZM-NUR-100', volume: '100ml', price: 1_090_000, compare: 1_290_000, cost: 385_000, stock: 24 },
    ],
    featured: true,
  },
  {
    slug: 'ajmal-amber-wood', name: 'Ajmal Amber Wood', brand: 'ajmal', category: 'erkaklar-atiri',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Zaʼfaron', 'Bergamot'], heart: ['Atirgul', 'Sandal'], base: ['Amber', 'Oud', 'Muskus'],
    longevity: 5, sillage: 4, country: 'BAA', year: 2016, palette: 'amber', shape: 'flacon',
    short: "Amber va yog'och — arab parfyumeriyasi klassikasi.",
    description: "Sandal va amberning issiq yostig'i, zaʼfaronning nozik ziravorligi bilan. Sharqona atirlarni yoqtiradiganlar uchun.",
    variants: [
      { sku: 'ZP-AJM-AW-100', volume: '100ml', price: 620_000, cost: 248_000, stock: 26 },
    ],
  },
  {
    slug: 'xerjoff-naxos', name: 'Xerjoff Naxos', brand: 'xerjoff', category: 'erkaklar-atiri',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Bergamot', 'Limon', 'Lavanda'], heart: ['Asal', 'Dolchin', 'Adaçayı'], base: ['Tamaki', 'Tonka', 'Vanil'],
    longevity: 5, sillage: 5, country: 'Italiya', year: 2015, palette: 'citrus', shape: 'flacon',
    short: "Asal va tamaki — Sitsiliya quyoshi.",
    description: "Asal notasining shirinligi tamaki bargining quruqligi bilan muvozanatlanadi. Xerjoff ning eng tanilgan ishi.",
    variants: [
      { sku: 'ZP-XER-NAX-50', volume: '50ml', price: 3_180_000, cost: 1_272_000, stock: 5 },
      { sku: 'ZP-XER-NAX-100', volume: '100ml', price: 4_850_000, cost: 1_940_000, stock: 3 },
    ],
  },
  {
    slug: 'dior-homme-intense', name: 'Dior Homme Intense', brand: 'dior', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Lavanda'], heart: ['Iris', 'Amber'], base: ['Vetiver', 'Sadr'],
    longevity: 5, sillage: 4, country: 'Fransiya', year: 2011, palette: 'plum', shape: 'flacon',
    short: 'Iris va pudra — nafis va nostandart.',
    description: "Irisning pudrali nafisligi erkaklar atiri uchun kamdan-kam uchraydi. Kechki tadbirlar uchun mukammal.",
    variants: [
      { sku: 'ZP-DIOR-DHI-50', volume: '50ml', price: 1_290_000, cost: 516_000, stock: 14 },
      { sku: 'ZP-DIOR-DHI-100', volume: '100ml', price: 1_890_000, cost: 756_000, stock: 10 },
    ],
  },
  {
    slug: 'le-labo-santal-33', name: 'Le Labo Santal 33', brand: 'le-labo', category: 'erkaklar-atiri',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Kardamon', 'Iris', 'Binafsha'], heart: ['Sandal', 'Sadr'], base: ['Amber', 'Muskus', 'Charm'],
    longevity: 5, sillage: 4, country: 'AQSh', year: 2011, palette: 'ivory', shape: 'tall',
    short: "Sandal va charm — shahar niche klassikasi.",
    description: "Quruq sandal, tutunli sadr va charmning nozik izi. O'ziga xos va darhol tanib olinadigan hid.",
    variants: [
      { sku: 'ZP-LL-S33-50', volume: '50ml', price: 3_290_000, cost: 1_316_000, stock: 7 },
      { sku: 'ZP-LL-S33-100', volume: '100ml', price: 4_680_000, cost: 1_872_000, stock: 4 },
    ],
    featured: true,
  },
  {
    slug: 'versace-dylan-blue', name: 'Versace Dylan Blue', brand: 'versace', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_TOILETTE',
    top: ['Bergamot', 'Greypfrut', 'Fig bargi'], heart: ['Qora qalampir', 'Pachuli'], base: ['Muskus', 'Ladan', 'Tonka'],
    longevity: 4, sillage: 4, country: 'Italiya', year: 2016, palette: 'azure', shape: 'flacon',
    short: 'Yangi va zamonaviy — kundalik uchun.',
    description: "Fig bargi va bergamotning yashil ochilishi, pachuli va muskusning toza asosi. Kunduzgi kiyish uchun juda mos.",
    variants: [
      { sku: 'ZP-VER-DYL-50', volume: '50ml', price: 690_000, cost: 276_000, stock: 27 },
      { sku: 'ZP-VER-DYL-100', volume: '100ml', price: 980_000, cost: 392_000, stock: 21 },
    ],
  },
  {
    slug: 'pdm-herod', name: 'Parfums de Marly Herod', brand: 'parfums-de-marly', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Dolchin', 'Qora qalampir'], heart: ['Osmanthus', 'Tamaki bargi'], base: ['Vanil', 'Vetiver', 'Sadr'],
    longevity: 5, sillage: 4, country: 'Fransiya', year: 2012, palette: 'amber', shape: 'flacon',
    short: 'Vanilli tamaki — qish uchun tug\'ilgan.',
    description: "Shirin tamaki va vanilning issiq kombinatsiyasi, dolchinning ziravorligi bilan. Sovuq havoda eng yaxshi ochiladi.",
    variants: [
      { sku: 'ZP-PDM-HER-75', volume: '75ml', price: 2_680_000, cost: 1_072_000, stock: 8 },
      { sku: 'ZP-PDM-HER-125', volume: '125ml', price: 3_690_000, cost: 1_476_000, stock: 4 },
    ],
  },
  {
    slug: 'amouage-interlude-man', name: 'Amouage Interlude Man', brand: 'amouage', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Bergamot', 'Rayhon', 'Kориandr'], heart: ['Ladan', 'Kehribar', 'Oregano'], base: ['Charm', 'Oud', 'Muskus'],
    longevity: 5, sillage: 5, country: 'Ummon', year: 2012, palette: 'noir', shape: 'flacon',
    short: 'Tutunli ladan — kuchli xarakter.',
    description: "Ladanning tutuni va oudning quyuqligi. Bu atir nozik emas — u xonaga kirganingizni e'lon qiladi.",
    variants: [
      { sku: 'ZP-AMO-INT-100', volume: '100ml', price: 4_290_000, cost: 1_716_000, stock: 4 },
    ],
  },
  {
    slug: 'carolina-herrera-bad-boy', name: 'Carolina Herrera Bad Boy', brand: 'carolina-herrera', category: 'erkaklar-atiri',
    gender: 'MALE', concentration: 'EAU_DE_TOILETTE',
    top: ['Bergamot', 'Qora qalampir'], heart: ['Adaçayı', 'Sadr'], base: ['Kakao', 'Tonka', 'Amber'],
    longevity: 4, sillage: 4, country: 'Ispaniya', year: 2019, palette: 'noir', shape: 'flacon',
    short: 'Kakao va qalampir — yosh va jasur.',
    description: "Chaqmoq shaklidagi flakon va kakao-tonka asosi. Kechqurun chiqishlar uchun.",
    variants: [
      { sku: 'ZP-CH-BB-50', volume: '50ml', price: 880_000, cost: 352_000, stock: 19 },
      { sku: 'ZP-CH-BB-100', volume: '100ml', price: 1_280_000, compare: 1_490_000, cost: 512_000, stock: 15 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AYOLLAR ATIRI
// ─────────────────────────────────────────────────────────────────────────────

const WOMEN: ProductSeed[] = [
  {
    slug: 'chanel-coco-mademoiselle', name: 'Chanel Coco Mademoiselle', brand: 'chanel', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Apelsin', 'Bergamot', 'Mandarin'], heart: ['Atirgul', 'Yasemin', 'Litchi'], base: ['Pachuli', 'Vetiver', 'Oq muskus'],
    longevity: 5, sillage: 4, country: 'Fransiya', year: 2001, palette: 'rose', shape: 'flacon',
    short: "Zamonaviy ayollik — eng ko'p sotiladigan Chanel.",
    description: "Sitrus ochilishi, gulli yurak va pachulining quruq izi. Yigirma yildan beri dunyoning eng ko'p sotiladigan ayollar atirlaridan biri.",
    variants: [
      { sku: 'ZP-CH-CCM-35', volume: '35ml', price: 1_180_000, cost: 472_000, stock: 24 },
      { sku: 'ZP-CH-CCM-50', volume: '50ml', price: 1_620_000, cost: 648_000, stock: 20 },
      { sku: 'ZP-CH-CCM-100', volume: '100ml', price: 2_450_000, compare: 2_790_000, cost: 980_000, stock: 12 },
    ],
    bestseller: true, featured: true,
  },
  {
    slug: 'mfk-baccarat-rouge-540', name: 'MFK Baccarat Rouge 540', brand: 'mfk', category: 'ayollar-atiri',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Zaʼfaron', 'Achchiq bodom'], heart: ['Sadr', 'Yasemin'], base: ['Amberkris', 'Qarag\'ay smolasi'],
    longevity: 5, sillage: 5, country: 'Fransiya', year: 2015, palette: 'rose', shape: 'flacon',
    short: "Dunyodagi eng taniqli niche atir.",
    description: "Zaʼfaron va amberkrisning shirin-mineral kombinatsiyasi. Terida shakar-yong'oq izi qoldiradi va soatlab yo'qolmaydi.",
    variants: [
      { sku: 'ZP-MFK-BR540-35', volume: '35ml', price: 2_890_000, cost: 1_156_000, stock: 9 },
      { sku: 'ZP-MFK-BR540-70', volume: '70ml', price: 4_690_000, cost: 1_876_000, stock: 6 },
      { sku: 'ZP-MFK-BR540-200', volume: '200ml', price: 9_800_000, cost: 3_920_000, stock: 2 },
    ],
    bestseller: true, featured: true,
  },
  {
    slug: 'dior-jadore-edp', name: "Dior J'adore", brand: 'dior', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Ylang-ylang', 'Damask atirguli'], heart: ['Yasemin', 'Magnoliya'], base: ['Sandal', 'Vanil', 'Muskus'],
    longevity: 4, sillage: 4, country: 'Fransiya', year: 1999, palette: 'citrus', shape: 'flacon',
    short: 'Oltin gullar — abadiy klassika.',
    description: "Ylang-ylang va yaseminning boy gulli buketi. Nafis, ayollik va har doim o'rinli.",
    variants: [
      { sku: 'ZP-DIOR-JAD-30', volume: '30ml', price: 1_050_000, cost: 420_000, stock: 22 },
      { sku: 'ZP-DIOR-JAD-50', volume: '50ml', price: 1_580_000, cost: 632_000, stock: 18 },
      { sku: 'ZP-DIOR-JAD-100', volume: '100ml', price: 2_390_000, cost: 956_000, stock: 11 },
    ],
    bestseller: true,
  },
  {
    slug: 'ysl-libre-edp', name: 'Yves Saint Laurent Libre', brand: 'ysl', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Mandarin', 'Qora smorodina', 'Lavanda'], heart: ['Yasemin', 'Apelsin gullari'], base: ['Vanil', 'Sadr', 'Muskus'],
    longevity: 4, sillage: 4, country: 'Fransiya', year: 2019, palette: 'ivory', shape: 'flacon',
    short: 'Lavanda va vanil — erkinlik hidi.',
    description: "Lavandaning nozikligi vanilning issiqligi bilan uchrashadi. Zamonaviy va o'ziga ishongan.",
    variants: [
      { sku: 'ZP-YSL-LIB-30', volume: '30ml', price: 980_000, cost: 392_000, stock: 20 },
      { sku: 'ZP-YSL-LIB-50', volume: '50ml', price: 1_480_000, cost: 592_000, stock: 16 },
      { sku: 'ZP-YSL-LIB-90', volume: '90ml', price: 2_180_000, compare: 2_450_000, cost: 872_000, stock: 9 },
    ],
    bestseller: true,
  },
  {
    slug: 'lancome-la-vie-est-belle', name: 'Lancôme La Vie Est Belle', brand: 'lancome', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Qora smorodina', 'Nok'], heart: ['Iris', 'Yasemin', 'Apelsin gullari'], base: ['Praline', 'Vanil', 'Pachuli'],
    longevity: 5, sillage: 4, country: 'Fransiya', year: 2012, palette: 'rose', shape: 'flacon',
    short: 'Praline va iris — shirin baxt.',
    description: "Iris va pralinening shirin kombinatsiyasi. Hayotning go'zalligi haqidagi hid — nomiga mos.",
    variants: [
      { sku: 'ZP-LAN-LVEB-30', volume: '30ml', price: 890_000, cost: 356_000, stock: 21 },
      { sku: 'ZP-LAN-LVEB-50', volume: '50ml', price: 1_390_000, cost: 556_000, stock: 17 },
      { sku: 'ZP-LAN-LVEB-100', volume: '100ml', price: 2_090_000, cost: 836_000, stock: 10 },
    ],
  },
  {
    slug: 'chanel-chance-eau-tendre', name: 'Chanel Chance Eau Tendre', brand: 'chanel', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Greypfrut', 'Behi'], heart: ['Yasemin', 'Giatsint'], base: ['Oq muskus', 'Sadr'],
    longevity: 4, sillage: 3, country: 'Fransiya', year: 2019, palette: 'rose', shape: 'flacon',
    short: "Yumshoq va yengil — bahor uchun.",
    description: "Greypfrut va behining nozik ochilishi, oq muskusning toza izi. Kunduzgi kiyish uchun ideal.",
    variants: [
      { sku: 'ZP-CH-CET-35', volume: '35ml', price: 1_150_000, cost: 460_000, stock: 19 },
      { sku: 'ZP-CH-CET-50', volume: '50ml', price: 1_540_000, cost: 616_000, stock: 15 },
      { sku: 'ZP-CH-CET-100', volume: '100ml', price: 2_290_000, cost: 916_000, stock: 8 },
    ],
  },
  {
    slug: 'narciso-rodriguez-for-her', name: 'Narciso Rodriguez For Her', brand: 'narciso-rodriguez', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Apelsin gullari', 'Osmanthus'], heart: ['Muskus', 'Amber'], base: ['Vanil', 'Pachuli', 'Vetiver'],
    longevity: 4, sillage: 3, country: 'AQSh', year: 2006, palette: 'noir', shape: 'flacon',
    short: "Muskus klassikasi — teri hidiga yaqin.",
    description: "Toza muskusning nozik shlefi. Bu atir e'tiborni tortmaydi — u sizga yaqin kelgan odamgagina ochiladi.",
    variants: [
      { sku: 'ZP-NR-FH-30', volume: '30ml', price: 890_000, cost: 356_000, stock: 18 },
      { sku: 'ZP-NR-FH-50', volume: '50ml', price: 1_290_000, cost: 516_000, stock: 14 },
      { sku: 'ZP-NR-FH-100', volume: '100ml', price: 1_890_000, cost: 756_000, stock: 8 },
    ],
  },
  {
    slug: 'dg-light-blue', name: 'Dolce & Gabbana Light Blue', brand: 'dolce-gabbana', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_TOILETTE',
    top: ['Sitsiliya limoni', 'Olma', 'Sadr'], heart: ['Bambuk', 'Jasmin', 'Oq atirgul'], base: ['Sadr', 'Amber', 'Muskus'],
    longevity: 3, sillage: 3, country: 'Italiya', year: 2001, palette: 'azure', shape: 'flacon',
    short: "O'rta yer dengizi yozi — engil va toza.",
    description: "Sitsiliya limoni va olmaning yorqin ochilishi. Issiq kunlar uchun eng ko'p tanlanadigan atir.",
    variants: [
      { sku: 'ZP-DG-LB-25', volume: '25ml', price: 620_000, cost: 248_000, stock: 26 },
      { sku: 'ZP-DG-LB-50', volume: '50ml', price: 980_000, cost: 392_000, stock: 20 },
      { sku: 'ZP-DG-LB-100', volume: '100ml', price: 1_390_000, compare: 1_620_000, cost: 556_000, stock: 13 },
    ],
  },
  {
    slug: 'carolina-herrera-good-girl', name: 'Carolina Herrera Good Girl', brand: 'carolina-herrera', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Bodom', 'Qahva'], heart: ['Tuberoza', 'Yasemin'], base: ['Kakao', 'Tonka', 'Sandal'],
    longevity: 5, sillage: 5, country: 'Ispaniya', year: 2016, palette: 'noir', shape: 'tall',
    short: "Qahva va tuberoza — kechki kuch.",
    description: "Poyabzal shaklidagi flakon va qahva-kakao asosi. Kechqurun uchun yaratilgan, kunduzi ancha og'ir bo'lishi mumkin.",
    variants: [
      { sku: 'ZP-CH-GG-30', volume: '30ml', price: 980_000, cost: 392_000, stock: 20 },
      { sku: 'ZP-CH-GG-50', volume: '50ml', price: 1_450_000, cost: 580_000, stock: 16 },
      { sku: 'ZP-CH-GG-80', volume: '80ml', price: 1_980_000, cost: 792_000, stock: 9 },
    ],
    bestseller: true,
  },
  {
    slug: 'versace-bright-crystal', name: 'Versace Bright Crystal', brand: 'versace', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_TOILETTE',
    top: ['Anor', 'Yuzu', 'Muzli notalar'], heart: ['Lotos', 'Magnoliya', 'Pion'], base: ['Amber', 'Qizil daraxt', 'Muskus'],
    longevity: 3, sillage: 3, country: 'Italiya', year: 2006, palette: 'rose', shape: 'flacon',
    short: 'Anor va lotos — yorqin va yengil.',
    description: "Anorning shirinligi va lotosning tozaligi. Kundalik kiyish uchun juda qulay.",
    variants: [
      { sku: 'ZP-VER-BC-30', volume: '30ml', price: 590_000, cost: 236_000, stock: 24 },
      { sku: 'ZP-VER-BC-50', volume: '50ml', price: 820_000, cost: 328_000, stock: 19 },
      { sku: 'ZP-VER-BC-90', volume: '90ml', price: 1_180_000, cost: 472_000, stock: 12 },
    ],
  },
  {
    slug: 'givenchy-linterdit', name: "Givenchy L'Interdit", brand: 'givenchy', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Nok', 'Bergamot'], heart: ['Apelsin gullari', 'Tuberoza', 'Yasemin'], base: ['Vetiver', 'Pachuli', 'Vanil'],
    longevity: 4, sillage: 4, country: 'Fransiya', year: 2018, palette: 'ivory', shape: 'flacon',
    short: "Oq gullar va vetiver — taqiqlangan nafislik.",
    description: "Tuberozaning oq gulli yurak va vetiverning quruq asosi. Nafis, lekin xarakterli.",
    variants: [
      { sku: 'ZP-GIV-LI-35', volume: '35ml', price: 1_050_000, cost: 420_000, stock: 17 },
      { sku: 'ZP-GIV-LI-50', volume: '50ml', price: 1_420_000, cost: 568_000, stock: 13 },
      { sku: 'ZP-GIV-LI-80', volume: '80ml', price: 1_980_000, cost: 792_000, stock: 8 },
    ],
  },
  {
    slug: 'pdm-delina', name: 'Parfums de Marly Delina', brand: 'parfums-de-marly', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Litchi', 'Ravon', 'Bergamot'], heart: ['Turk atirguli', 'Pion', 'Vanil'], base: ['Sadr', 'Muskus', 'Vetiver'],
    longevity: 5, sillage: 4, country: 'Fransiya', year: 2017, palette: 'rose', shape: 'flacon',
    short: 'Litchi va atirgul — zamonaviy nafislik.',
    description: "Litchining shirinligi turk atirgulining boyligi bilan. Niche atirlar orasida eng ko'p sotiladigan ayollar hidlaridan.",
    variants: [
      { sku: 'ZP-PDM-DEL-75', volume: '75ml', price: 2_890_000, cost: 1_156_000, stock: 7 },
      { sku: 'ZP-PDM-DEL-30', volume: '30ml', price: 1_580_000, cost: 632_000, stock: 12 },
    ],
    featured: true,
  },
  {
    slug: 'tom-ford-lost-cherry', name: 'Tom Ford Lost Cherry', brand: 'tom-ford', category: 'ayollar-atiri',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Gilos', 'Achchiq bodom', 'Likyor'], heart: ['Turk atirguli', 'Yasemin', 'Gilos gullari'], base: ['Tonka', 'Vanil', 'Sandal'],
    longevity: 5, sillage: 5, country: 'AQSh', year: 2018, palette: 'plum', shape: 'flacon',
    short: 'Gilos likyori — shirin va jozibali.',
    description: "Gilos va bodomning likyorli shirinligi. Tom Ford Private Blend kolleksiyasining eng talab qilingan hidi.",
    variants: [
      { sku: 'ZP-TF-LC-30', volume: '30ml', price: 2_290_000, cost: 916_000, stock: 8 },
      { sku: 'ZP-TF-LC-50', volume: '50ml', price: 3_480_000, cost: 1_392_000, stock: 5 },
    ],
    bestseller: true, featured: true,
  },
  {
    slug: 'byredo-blanche', name: 'Byredo Blanche', brand: 'byredo', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Pushti qalampir', 'Aldegidlar'], heart: ['Binafsha', 'Atirgul', 'Neroli'], base: ['Muskus', 'Sandal', 'Blond yog\'och'],
    longevity: 4, sillage: 3, country: 'Shvetsiya', year: 2009, palette: 'ivory', shape: 'tall',
    short: "Toza choyshab hidi — minimalizm.",
    description: "Yangi yuvilgan oq mato hidi. Byredo ning eng sof va tinch ishi — ortiqcha hech narsa yo'q.",
    variants: [
      { sku: 'ZP-BYR-BLA-50', volume: '50ml', price: 2_480_000, cost: 992_000, stock: 8 },
      { sku: 'ZP-BYR-BLA-100', volume: '100ml', price: 3_680_000, cost: 1_472_000, stock: 4 },
    ],
  },
  {
    slug: 'prada-paradoxe', name: 'Prada Paradoxe', brand: 'prada', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Neroli', 'Bergamot'], heart: ['Yasemin', 'Amber'], base: ['Oq muskus', 'Vanil'],
    longevity: 4, sillage: 3, country: 'Italiya', year: 2022, palette: 'ivory', shape: 'flacon',
    short: 'Neroli va muskus — zamonaviy ayollik.',
    description: "Nerolining yorqinligi amber va muskusning issiqligi bilan. Qayta to'ldiriladigan flakonda.",
    variants: [
      { sku: 'ZP-PRA-PDX-30', volume: '30ml', price: 980_000, cost: 392_000, stock: 18 },
      { sku: 'ZP-PRA-PDX-50', volume: '50ml', price: 1_420_000, cost: 568_000, stock: 14 },
      { sku: 'ZP-PRA-PDX-90', volume: '90ml', price: 2_090_000, cost: 836_000, stock: 8 },
    ],
  },
  {
    slug: 'lancome-idole', name: 'Lancôme Idôle', brand: 'lancome', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Bergamot', 'Nok'], heart: ['Turk atirguli', 'Yasemin'], base: ['Oq muskus', 'Vanil', 'Patchouli'],
    longevity: 4, sillage: 3, country: 'Fransiya', year: 2019, palette: 'rose', shape: 'tall',
    short: "Toza atirgul — yorqin va zamonaviy.",
    description: "Atirgul va yaseminning shaffof buketi, muskusning toza asosi. Yupqa flakonda.",
    variants: [
      { sku: 'ZP-LAN-IDO-25', volume: '25ml', price: 790_000, cost: 316_000, stock: 20 },
      { sku: 'ZP-LAN-IDO-50', volume: '50ml', price: 1_290_000, cost: 516_000, stock: 15 },
      { sku: 'ZP-LAN-IDO-75', volume: '75ml', price: 1_720_000, cost: 688_000, stock: 9 },
    ],
  },
  {
    slug: 'armani-si-edp', name: 'Giorgio Armani Sì', brand: 'armani', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Qora smorodina', 'Mandarin'], heart: ['Atirgul', 'Freziya'], base: ['Vanil', 'Pachuli', 'Amber'],
    longevity: 4, sillage: 4, country: 'Italiya', year: 2013, palette: 'plum', shape: 'flacon',
    short: 'Smorodina va vanil — muvozanatli chypre.',
    description: "Qora smorodinaning mevali ochilishi va vanil-pachuli asosi. Kundalik va kechki kiyish uchun.",
    variants: [
      { sku: 'ZP-ARM-SI-30', volume: '30ml', price: 890_000, cost: 356_000, stock: 19 },
      { sku: 'ZP-ARM-SI-50', volume: '50ml', price: 1_320_000, cost: 528_000, stock: 15 },
      { sku: 'ZP-ARM-SI-100', volume: '100ml', price: 1_980_000, cost: 792_000, stock: 8 },
    ],
  },
  {
    slug: 'jo-malone-peony-blush-suede', name: 'Jo Malone Peony & Blush Suede', brand: 'jo-malone', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_COLOGNE',
    top: ['Qizil olma'], heart: ['Pion', 'Jasmin', 'Atirgul'], base: ['Zamsha'],
    longevity: 3, sillage: 3, country: 'Buyuk Britaniya', year: 2013, palette: 'rose', shape: 'tall',
    short: "Pion va zamsha — ingliz bog'i.",
    description: "Pionning to'liq gulli buketi zamshaning yumshoq asosida. Boshqa Jo Malone hidlari bilan qatlamlash uchun ideal.",
    variants: [
      { sku: 'ZP-JM-PBS-30', volume: '30ml', price: 890_000, cost: 356_000, stock: 21 },
      { sku: 'ZP-JM-PBS-100', volume: '100ml', price: 1_890_000, compare: 2_150_000, cost: 756_000, stock: 11 },
    ],
    bestseller: true,
  },
  {
    slug: 'mfk-oud-satin-mood', name: 'MFK Oud Satin Mood', brand: 'mfk', category: 'ayollar-atiri',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Vanil', 'Bulgar atirguli'], heart: ['Binafsha', 'Oud'], base: ['Benzoin', 'Amber'],
    longevity: 5, sillage: 5, country: 'Fransiya', year: 2015, palette: 'plum', shape: 'flacon',
    short: 'Atlas kabi yumshoq oud.',
    description: "Bulgar atirguli va oudning atlas kabi silliq kombinatsiyasi. Sharqona, lekin og'ir emas.",
    variants: [
      { sku: 'ZP-MFK-OSM-70', volume: '70ml', price: 4_290_000, cost: 1_716_000, stock: 4 },
    ],
  },
  {
    slug: 'chanel-no5-edp', name: 'Chanel N°5', brand: 'chanel', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Aldegidlar', 'Neroli', 'Limon'], heart: ['Iris', 'Yasemin', 'May atirguli'], base: ['Sandal', 'Vanil', 'Vetiver'],
    longevity: 5, sillage: 4, country: 'Fransiya', year: 1921, palette: 'ivory', shape: 'flacon',
    short: "Parfyumeriya tarixidagi eng mashhur atir.",
    description: "1921-yildan beri o'zgarmagan formula. Aldegidlarning nurli ochilishi va iris-sandalning ipak asosi.",
    variants: [
      { sku: 'ZP-CH-N5-35', volume: '35ml', price: 1_450_000, cost: 580_000, stock: 14 },
      { sku: 'ZP-CH-N5-50', volume: '50ml', price: 1_980_000, cost: 792_000, stock: 11 },
      { sku: 'ZP-CH-N5-100', volume: '100ml', price: 2_890_000, cost: 1_156_000, stock: 6 },
    ],
    featured: true,
  },
  {
    slug: 'dior-miss-dior-edp', name: 'Dior Miss Dior', brand: 'dior', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Sitsiliya mandarini'], heart: ['Grasse atirguli', 'Pion', 'Iris'], base: ['Oq muskus', 'Palisandr'],
    longevity: 4, sillage: 4, country: 'Fransiya', year: 2021, palette: 'rose', shape: 'flacon',
    short: 'Grasse atirguli — gulli buket.',
    description: "Grasse atirguli va pionning to'liq gulli buketi, oq muskusning toza izi. Bantik bilan bezatilgan flakonda.",
    variants: [
      { sku: 'ZP-DIOR-MD-30', volume: '30ml', price: 1_090_000, cost: 436_000, stock: 18 },
      { sku: 'ZP-DIOR-MD-50', volume: '50ml', price: 1_620_000, cost: 648_000, stock: 14 },
      { sku: 'ZP-DIOR-MD-100', volume: '100ml', price: 2_450_000, cost: 980_000, stock: 8 },
    ],
  },
  {
    slug: 'ysl-black-opium', name: 'Yves Saint Laurent Black Opium', brand: 'ysl', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Pushti qalampir', 'Apelsin gullari', 'Nok'], heart: ['Qahva', 'Yasemin'], base: ['Vanil', 'Pachuli', 'Sadr'],
    longevity: 5, sillage: 5, country: 'Fransiya', year: 2014, palette: 'noir', shape: 'flacon',
    short: 'Qahva va vanil — kechki energiya.',
    description: "Qahvaning achchiqligi vanilning shirinligi bilan. Kechqurun chiqishlar uchun eng ko'p tanlanadigan hidlardan.",
    variants: [
      { sku: 'ZP-YSL-BO-30', volume: '30ml', price: 950_000, cost: 380_000, stock: 22 },
      { sku: 'ZP-YSL-BO-50', volume: '50ml', price: 1_420_000, cost: 568_000, stock: 17 },
      { sku: 'ZP-YSL-BO-90', volume: '90ml', price: 2_090_000, compare: 2_390_000, cost: 836_000, stock: 10 },
    ],
    bestseller: true,
  },
  {
    slug: 'hermes-twilly-dhermes', name: "Hermès Twilly d'Hermès", brand: 'hermes', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Zanjabil'], heart: ['Tuberoza'], base: ['Sandal'],
    longevity: 4, sillage: 3, country: 'Fransiya', year: 2017, palette: 'citrus', shape: 'tall',
    short: 'Zanjabil va tuberoza — yosh va o\'ynoqi.',
    description: "Faqat uch nota: zanjabil, tuberoza va sandal. Sodda, lekin juda esda qolarli.",
    variants: [
      { sku: 'ZP-HER-TWI-30', volume: '30ml', price: 1_050_000, cost: 420_000, stock: 16 },
      { sku: 'ZP-HER-TWI-50', volume: '50ml', price: 1_480_000, cost: 592_000, stock: 12 },
      { sku: 'ZP-HER-TWI-85', volume: '85ml', price: 2_090_000, cost: 836_000, stock: 7 },
    ],
  },
  {
    slug: 'byredo-gypsy-water', name: 'Byredo Gypsy Water', brand: 'byredo', category: 'ayollar-atiri',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Bergamot', 'Limon', 'Qalampir', 'Archa'], heart: ['Ladan', 'Pushti qalampir', 'Iris'], base: ['Amber', 'Sandal', 'Vanil'],
    longevity: 4, sillage: 3, country: 'Shvetsiya', year: 2008, palette: 'emerald', shape: 'tall',
    short: "Gulxan va o'rmon — sarson ruh.",
    description: "Archa va ladanning o'rmon tutuni, vanilning yumshoq izi bilan. Byredo ning eng sevimli ishlaridan.",
    variants: [
      { sku: 'ZP-BYR-GW-50', volume: '50ml', price: 2_480_000, cost: 992_000, stock: 7 },
      { sku: 'ZP-BYR-GW-100', volume: '100ml', price: 3_680_000, cost: 1_472_000, stock: 4 },
    ],
  },
  {
    slug: 'lattafa-yara', name: 'Lattafa Yara', brand: 'lattafa', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Tropik mevalar', 'Orxideya'], heart: ['Gelotropin', 'Vanil'], base: ['Sandal', 'Muskus'],
    longevity: 4, sillage: 5, country: 'BAA', year: 2020, palette: 'rose', shape: 'flacon',
    short: 'Shirin va kuchli — hamyonbop.',
    description: "Orxideya va vanilning to'q shirinligi. Narxiga qaramay juda kuchli shlef beradi.",
    variants: [
      { sku: 'ZP-LAT-YAR-100', volume: '100ml', price: 320_000, compare: 390_000, cost: 128_000, stock: 52 },
    ],
    bestseller: true,
  },
  {
    slug: 'zahabi-samarqand-rose', name: 'Zahabi Samarqand Rose', brand: 'zahabi-maison', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Bergamot', 'Litchi'], heart: ['Damask atirguli', 'Pion'], base: ['Sandal', 'Muskus', 'Amber'],
    longevity: 4, sillage: 4, country: "O'zbekiston", year: 2025, palette: 'rose', shape: 'flacon',
    short: "Samarqand atirguli — mahalliy mualliflik ishi.",
    description: "Damask atirgulining boy buketi sandal va amberning issiq asosida. Zahabi Maison ning O'zbekistonga bag'ishlangan hidi.",
    variants: [
      { sku: 'ZP-ZM-SAM-50', volume: '50ml', price: 640_000, cost: 228_000, stock: 32 },
      { sku: 'ZP-ZM-SAM-100', volume: '100ml', price: 990_000, compare: 1_190_000, cost: 352_000, stock: 26 },
    ],
    featured: true,
  },
  {
    slug: 'amouage-love-tuberose', name: 'Amouage Love Tuberose', brand: 'amouage', category: 'ayollar-atiri',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Mandarin', 'Kokos'], heart: ['Tuberoza', 'Ylang-ylang'], base: ['Vanil', 'Sandal', 'Muskus'],
    longevity: 5, sillage: 5, country: 'Ummon', year: 2020, palette: 'ivory', shape: 'flacon',
    short: "Tuberoza to'liq kuchida.",
    description: "Tuberozaning eng to'liq va boy talqini, kokos va vanilning kremli asosi bilan.",
    variants: [
      { sku: 'ZP-AMO-LT-100', volume: '100ml', price: 4_490_000, cost: 1_796_000, stock: 3 },
    ],
  },
  {
    slug: 'xerjoff-erba-pura', name: 'Xerjoff Erba Pura', brand: 'xerjoff', category: 'ayollar-atiri',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Sitsiliya apelsini', 'Limon', 'Bergamot'], heart: ['Tropik mevalar', 'Oq gullar'], base: ['Muskus', 'Amber', 'Vanil'],
    longevity: 5, sillage: 5, country: 'Italiya', year: 2014, palette: 'citrus', shape: 'flacon',
    short: 'Mevali va yorqin — universal sevimli.',
    description: "Sitrus va tropik mevalarning shirin portlashi, amber-vanil asosida. Erkak ham, ayol ham bemalol kiya oladi.",
    variants: [
      { sku: 'ZP-XER-EP-50', volume: '50ml', price: 2_980_000, cost: 1_192_000, stock: 6 },
      { sku: 'ZP-XER-EP-100', volume: '100ml', price: 4_490_000, cost: 1_796_000, stock: 3 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// NICHE ATIRLAR
// ─────────────────────────────────────────────────────────────────────────────

const NICHE: ProductSeed[] = [
  {
    slug: 'le-labo-another-13', name: 'Le Labo Another 13', brand: 'le-labo', category: 'niche-atir',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Ambrette', 'Nok'], heart: ['Yasemin', 'Muskus'], base: ['Amberkris', 'Muskus', 'Moss'],
    longevity: 5, sillage: 4, country: 'AQSh', year: 2010, palette: 'ivory', shape: 'tall',
    short: 'Molekulyar muskus — teri hidining kuchaytirilgani.',
    description: "Deyarli hid emas — bu sizning teringizning yaxshilangan versiyasi. Boshqalar sizga yaqin kelganda seziladi.",
    variants: [
      { sku: 'ZP-LL-A13-50', volume: '50ml', price: 3_190_000, cost: 1_276_000, stock: 6 },
      { sku: 'ZP-LL-A13-100', volume: '100ml', price: 4_580_000, cost: 1_832_000, stock: 3 },
    ],
  },
  {
    slug: 'mfk-grand-soir', name: 'MFK Grand Soir', brand: 'mfk', category: 'niche-atir',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Amber', 'Benzoin'], heart: ['Labdanum', 'Vanil'], base: ['Tonka', 'Benzoin smolasi'],
    longevity: 5, sillage: 4, country: 'Fransiya', year: 2016, palette: 'amber', shape: 'flacon',
    short: "Parij oqshomi — sof amber.",
    description: "Amber va benzoinning oltin issiqligi. Murakkab emas, lekin nihoyatda chiroyli va issiq.",
    variants: [
      { sku: 'ZP-MFK-GS-70', volume: '70ml', price: 3_890_000, cost: 1_556_000, stock: 5 },
    ],
    featured: true,
  },
  {
    slug: 'nishane-ani', name: 'Nishane Ani', brand: 'nishane', category: 'niche-atir',
    gender: 'UNISEX', concentration: 'EXTRAIT',
    top: ['Bergamot', 'Pushti qalampir'], heart: ['Vanil', 'Kakao'], base: ['Amber', 'Muskus', 'Sadr'],
    longevity: 5, sillage: 5, country: 'Turkiya', year: 2019, palette: 'amber', shape: 'flacon',
    short: 'Vanil va kakao — issiq quchoq.',
    description: "Vanil va kakaoning kremli asosi. Sovuq kunlarda ayniqsa yaxshi ishlaydi.",
    variants: [
      { sku: 'ZP-NIS-ANI-50', volume: '50ml', price: 2_180_000, cost: 872_000, stock: 7 },
      { sku: 'ZP-NIS-ANI-100', volume: '100ml', price: 3_420_000, cost: 1_368_000, stock: 4 },
    ],
  },
  {
    slug: 'byredo-bal-dafrique', name: "Byredo Bal d'Afrique", brand: 'byredo', category: 'niche-atir',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Bergamot', 'Limon', 'Neroli', 'Marigold'], heart: ['Binafsha', 'Yasemin', 'Siklamen'], base: ['Sadr', 'Amber', 'Muskus', 'Vetiver'],
    longevity: 4, sillage: 4, country: 'Shvetsiya', year: 2009, palette: 'citrus', shape: 'tall',
    short: "Afrika oqshomi — issiq sitrus va yog'och.",
    description: "1920-yillardagi Parij va Afrika madaniyatining uchrashuvi. Sitrus, gullar va vetiverning issiq aralashmasi.",
    variants: [
      { sku: 'ZP-BYR-BDA-50', volume: '50ml', price: 2_480_000, cost: 992_000, stock: 7 },
      { sku: 'ZP-BYR-BDA-100', volume: '100ml', price: 3_680_000, cost: 1_472_000, stock: 4 },
    ],
  },
  {
    slug: 'tom-ford-tobacco-vanille', name: 'Tom Ford Tobacco Vanille', brand: 'tom-ford', category: 'niche-atir',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Tamaki bargi', 'Ziravorli notalar'], heart: ['Vanil', 'Kakao', 'Tonka'], base: ['Quritilgan meva', 'Shirin quyuq'],
    longevity: 5, sillage: 5, country: 'AQSh', year: 2007, palette: 'amber', shape: 'flacon',
    short: 'Tamaki va vanil — qish klassikasi.',
    description: "Tamaki bargining quruqligi va vanilning shirinligi. Sovuq havoda mукammal, yozda esa juda og'ir.",
    variants: [
      { sku: 'ZP-TF-TV-50', volume: '50ml', price: 3_380_000, cost: 1_352_000, stock: 6 },
      { sku: 'ZP-TF-TV-100', volume: '100ml', price: 5_180_000, cost: 2_072_000, stock: 3 },
    ],
    featured: true,
  },
  {
    slug: 'amouage-reflection-man', name: 'Amouage Reflection Man', brand: 'amouage', category: 'niche-atir',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Rozmarin', 'Pushti qalampir', 'Neroli'], heart: ['Iris', 'Yasemin', 'Orxideya'], base: ['Sandal', 'Vetiver', 'Sadr'],
    longevity: 5, sillage: 4, country: 'Ummon', year: 2007, palette: 'ivory', shape: 'flacon',
    short: 'Oq gullar va iris — nozik erkak.',
    description: "Erkaklar atiri uchun kutilmagan darajada gulli va nozik. Ofis va rasmiy tadbirlar uchun ajoyib.",
    variants: [
      { sku: 'ZP-AMO-RM-100', volume: '100ml', price: 4_190_000, cost: 1_676_000, stock: 4 },
    ],
  },
  {
    slug: 'initio-side-effect', name: 'Initio Side Effect', brand: 'initio', category: 'niche-atir',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Rom', 'Dolchin'], heart: ['Tamaki', 'Vanil'], base: ['Sandal', 'Muskus'],
    longevity: 5, sillage: 5, country: 'Fransiya', year: 2016, palette: 'plum', shape: 'flacon',
    short: 'Rom va tamaki — kechki ta\'sir.',
    description: "Rom va dolchinning mast qiluvchi ochilishi, tamaki-vanil asosi. Kechqurun uchun.",
    variants: [
      { sku: 'ZP-INI-SE-90', volume: '90ml', price: 3_290_000, cost: 1_316_000, stock: 5 },
    ],
  },
  {
    slug: 'xerjoff-more-than-words', name: 'Xerjoff More Than Words', brand: 'xerjoff', category: 'niche-atir',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Bergamot', 'Kardamon'], heart: ['Iris', 'Atirgul'], base: ['Vanil', 'Muskus', 'Sandal'],
    longevity: 5, sillage: 4, country: 'Italiya', year: 2021, palette: 'ivory', shape: 'flacon',
    short: "Iris va vanil — so'zdan ortiq.",
    description: "Irisning pudrali nafisligi vanil va muskusning yumshoq yostig'ida. Nozik, lekin uzoq davom etadi.",
    variants: [
      { sku: 'ZP-XER-MTW-50', volume: '50ml', price: 3_290_000, cost: 1_316_000, stock: 5 },
    ],
  },
  {
    slug: 'le-labo-rose-31', name: 'Le Labo Rose 31', brand: 'le-labo', category: 'niche-atir',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Atirgul', 'Kumin', 'Qalampir'], heart: ['Sadr', 'Vetiver'], base: ['Oud', 'Muskus', 'Amber'],
    longevity: 5, sillage: 4, country: 'AQSh', year: 2006, palette: 'plum', shape: 'tall',
    short: "Atirgul, lekin ayollarcha emas.",
    description: "Kumin va sadr atirgulni butunlay boshqacha yo'nalishga buradi. Unisex atirgulning eng yaxshi namunasi.",
    variants: [
      { sku: 'ZP-LL-R31-50', volume: '50ml', price: 3_190_000, cost: 1_276_000, stock: 6 },
      { sku: 'ZP-LL-R31-100', volume: '100ml', price: 4_580_000, cost: 1_832_000, stock: 3 },
    ],
  },
  {
    slug: 'pdm-oajan', name: 'Parfums de Marly Oajan', brand: 'parfums-de-marly', category: 'niche-atir',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Zaʼfaron', 'Pushti qalampir'], heart: ['Oud', 'Atirgul'], base: ['Amber', 'Muskus', 'Vanil'],
    longevity: 5, sillage: 5, country: 'Fransiya', year: 2015, palette: 'amber', shape: 'flacon',
    short: 'Sharqona oud — Marly uslubida.',
    description: "Zaʼfaron va oudning arab an'anasi fransuz nafisligi bilan uchrashadi.",
    variants: [
      { sku: 'ZP-PDM-OAJ-125', volume: '125ml', price: 3_980_000, cost: 1_592_000, stock: 4 },
    ],
  },
  {
    slug: 'mfk-amyris-homme', name: 'MFK Amyris Homme', brand: 'mfk', category: 'niche-atir',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Limon', 'Rozmarin'], heart: ['Amyris yog\'ochi', 'Iris'], base: ['Vetiver', 'Tonka', 'Sadr'],
    longevity: 4, sillage: 3, country: 'Fransiya', year: 2012, palette: 'emerald', shape: 'flacon',
    short: "Yamayka yog'ochi — toza va nafis.",
    description: "Amyris yog'ochining nozik yorqinligi vetiver va tonka bilan. Kunduzgi kiyish uchun ideal.",
    variants: [
      { sku: 'ZP-MFK-AH-70', volume: '70ml', price: 3_490_000, cost: 1_396_000, stock: 5 },
    ],
  },
  {
    slug: 'nishane-fan-your-flames', name: 'Nishane Fan Your Flames', brand: 'nishane', category: 'niche-atir',
    gender: 'UNISEX', concentration: 'EXTRAIT',
    top: ['Kokos', 'Shaftoli'], heart: ['Tamaki', 'Asal'], base: ['Vanil', 'Tonka', 'Sandal'],
    longevity: 5, sillage: 5, country: 'Turkiya', year: 2017, palette: 'amber', shape: 'flacon',
    short: "Tamaki va asal — quyuq va shirin.",
    description: "Kokos va tamakining kutilmagan uyg'unligi. Sovuq mavsumda ayniqsa chiroyli ochiladi.",
    variants: [
      { sku: 'ZP-NIS-FYF-50', volume: '50ml', price: 2_290_000, cost: 916_000, stock: 6 },
    ],
  },
  {
    slug: 'byredo-mojave-ghost', name: 'Byredo Mojave Ghost', brand: 'byredo', category: 'niche-atir',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Ambrette', 'Nok'], heart: ['Binafsha', 'Magnoliya', 'Sandal'], base: ['Sadr', 'Muskus', 'Amber'],
    longevity: 4, sillage: 3, country: 'Shvetsiya', year: 2014, palette: 'ivory', shape: 'tall',
    short: "Sahro ruhi — quruq va nozik.",
    description: "Mojave sahrosining quruq havosi. Yumshoq, deyarli shaffof, lekin esda qoladi.",
    variants: [
      { sku: 'ZP-BYR-MG-50', volume: '50ml', price: 2_480_000, cost: 992_000, stock: 7 },
      { sku: 'ZP-BYR-MG-100', volume: '100ml', price: 3_680_000, cost: 1_472_000, stock: 4 },
    ],
  },
  {
    slug: 'tom-ford-bitter-peach', name: 'Tom Ford Bitter Peach', brand: 'tom-ford', category: 'niche-atir',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Shaftoli', 'Qon apelsin', 'Kardamon'], heart: ['Rom', 'Yasemin', 'Hindiston yong\'og\'i'], base: ['Sandal', 'Vanil', 'Tonka'],
    longevity: 5, sillage: 5, country: 'AQSh', year: 2020, palette: 'citrus', shape: 'flacon',
    short: 'Shaftoli va rom — quyuq mevali.',
    description: "Shaftolining shirinligi rom va kardamonning ziravorligi bilan. Juda kuchli va o'ziga xos.",
    variants: [
      { sku: 'ZP-TF-BP-50', volume: '50ml', price: 3_480_000, cost: 1_392_000, stock: 5 },
    ],
  },
  {
    slug: 'amouage-jubilation-xxv', name: 'Amouage Jubilation XXV', brand: 'amouage', category: 'niche-atir',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Blackberry', 'Koriandr', 'Bergamot'], heart: ['Ladan', 'Asal', 'Atirgul'], base: ['Oud', 'Pachuli', 'Moss'],
    longevity: 5, sillage: 5, country: 'Ummon', year: 2008, palette: 'noir', shape: 'flacon',
    short: "Ladan va asal — Ummon hashamati.",
    description: "Amouage ning eng murakkab ishlaridan biri. Meva, ladan va oudning ko'p qatlamli kompozitsiyasi.",
    variants: [
      { sku: 'ZP-AMO-JXXV-100', volume: '100ml', price: 4_690_000, cost: 1_876_000, stock: 3 },
    ],
  },
  {
    slug: 'initio-rehab', name: 'Initio Rehab', brand: 'initio', category: 'niche-atir',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Pushti qalampir'], heart: ['Atirgul', 'Ladan'], base: ['Vanil', 'Muskus', 'Amber'],
    longevity: 5, sillage: 4, country: 'Fransiya', year: 2020, palette: 'plum', shape: 'flacon',
    short: 'Vanil va ladan — jozibali va issiq.',
    description: "Vanilning shirinligi ladanning tutuni bilan muvozanatlanadi. Teriga juda yaqin ishlaydi.",
    variants: [
      { sku: 'ZP-INI-REH-90', volume: '90ml', price: 3_190_000, cost: 1_276_000, stock: 5 },
    ],
  },
  {
    slug: 'xerjoff-alexandria-ii', name: 'Xerjoff Alexandria II', brand: 'xerjoff', category: 'niche-atir',
    gender: 'UNISEX', concentration: 'PARFUM',
    top: ['Bergamot', 'Limon', 'Lavanda'], heart: ['Atirgul', 'Yasemin', 'Iris'], base: ['Oud', 'Amber', 'Vanil'],
    longevity: 5, sillage: 5, country: 'Italiya', year: 2010, palette: 'amber', shape: 'flacon',
    short: "Xerjoff ning toji — hashamat cho'qqisi.",
    description: "Kollektsiyaning eng qimmat va eng murakkab ishi. Oud, atirgul va amberning boy kompozitsiyasi.",
    variants: [
      { sku: 'ZP-XER-A2-100', volume: '100ml', price: 8_900_000, cost: 3_560_000, stock: 2 },
    ],
  },
  {
    slug: 'zahabi-buxoro-oud', name: 'Zahabi Buxoro Oud', brand: 'zahabi-maison', category: 'niche-atir',
    gender: 'UNISEX', concentration: 'EXTRAIT',
    top: ['Zaʼfaron', 'Kardamon'], heart: ['Oud', 'Damask atirguli'], base: ['Sandal', 'Amber', 'Muskus'],
    longevity: 5, sillage: 5, country: "O'zbekiston", year: 2025, palette: 'amber', shape: 'flacon',
    short: "Buxoro ipak yo'li — mualliflik oud.",
    description: "Ipak yo'li ziravorlari va oudning uyg'unligi. Zahabi Maison ning eng quyuq va eng uzoq davom etuvchi ishi.",
    variants: [
      { sku: 'ZP-ZM-BUX-50', volume: '50ml', price: 1_290_000, cost: 458_000, stock: 18 },
      { sku: 'ZP-ZM-BUX-100', volume: '100ml', price: 1_990_000, compare: 2_390_000, cost: 706_000, stock: 12 },
    ],
    featured: true, bestseller: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// BODY MIST
// ─────────────────────────────────────────────────────────────────────────────

const BODY_MIST: ProductSeed[] = [
  {
    slug: 'vs-bare-vanilla-mist', name: "Victoria's Secret Bare Vanilla Mist", brand: 'victorias-secret', category: 'body-mist',
    gender: 'FEMALE', concentration: 'BODY_MIST',
    top: ['Vanil'], heart: ['Kakao'], base: ['Muskus'],
    longevity: 2, sillage: 2, country: 'AQSh', year: 2015, palette: 'ivory', shape: 'tall',
    short: 'Yumshoq vanil — kundalik yangilanish.',
    description: "Vanil va kakaoning yumshoq kremli hidi. Dushdan keyin yoki kun davomida yangilanish uchun.",
    variants: [
      { sku: 'ZP-VS-BV-250', volume: '250ml', price: 185_000, cost: 74_000, stock: 45 },
    ],
    bestseller: true,
  },
  {
    slug: 'vs-velvet-petals-mist', name: "Victoria's Secret Velvet Petals Mist", brand: 'victorias-secret', category: 'body-mist',
    gender: 'FEMALE', concentration: 'BODY_MIST',
    top: ['Pion'], heart: ['Yasemin', 'Atirgul'], base: ['Muskus', 'Vanil'],
    longevity: 2, sillage: 2, country: 'AQSh', year: 2016, palette: 'rose', shape: 'tall',
    short: "Gulli va yengil — bahor kayfiyati.",
    description: "Pion va yaseminning yumshoq gulli buketi. Yengil va toza.",
    variants: [
      { sku: 'ZP-VS-VP-250', volume: '250ml', price: 185_000, cost: 74_000, stock: 42 },
    ],
  },
  {
    slug: 'bbw-japanese-cherry-blossom-mist', name: 'Bath & Body Works Japanese Cherry Blossom Mist', brand: 'bath-body-works', category: 'body-mist',
    gender: 'FEMALE', concentration: 'BODY_MIST',
    top: ['Gilos gullari', 'Nok'], heart: ['Mimoza', 'Atirgul'], base: ['Sandal', 'Vanil'],
    longevity: 2, sillage: 2, country: 'AQSh', year: 2006, palette: 'rose', shape: 'tall',
    short: 'Sakura — nozik yapon gullari.',
    description: "Gilos gullari va mimozaning nozik hidi. Bath & Body Works ning eng mashhur mahsuloti.",
    variants: [
      { sku: 'ZP-BBW-JCB-236', volume: '236ml', price: 165_000, cost: 66_000, stock: 38 },
    ],
    bestseller: true,
  },
  {
    slug: 'bbw-a-thousand-wishes-mist', name: 'Bath & Body Works A Thousand Wishes Mist', brand: 'bath-body-works', category: 'body-mist',
    gender: 'FEMALE', concentration: 'BODY_MIST',
    top: ['Pushti shampan', 'Kumquat'], heart: ['Pion', 'Amber'], base: ['Vanil', 'Sandal'],
    longevity: 2, sillage: 2, country: 'AQSh', year: 2013, palette: 'citrus', shape: 'tall',
    short: 'Shampan va pion — bayram kayfiyati.',
    description: "Pushti shampan va pionning bayramona kombinatsiyasi.",
    variants: [
      { sku: 'ZP-BBW-ATW-236', volume: '236ml', price: 165_000, compare: 195_000, cost: 66_000, stock: 34 },
    ],
  },
  {
    slug: 'jo-malone-wood-sage-cologne', name: 'Jo Malone Wood Sage & Sea Salt', brand: 'jo-malone', category: 'body-mist',
    gender: 'UNISEX', concentration: 'EAU_DE_COLOGNE',
    top: ['Ambrette'], heart: ['Dengiz tuzi'], base: ['Adaçayı', 'Qizil suv o\'ti'],
    longevity: 3, sillage: 3, country: 'Buyuk Britaniya', year: 2014, palette: 'azure', shape: 'tall',
    short: 'Dengiz tuzi va adaçayı — sohil havosi.',
    description: "Ingliz sohilining shamoli. Dengiz tuzi va yovvoyi adaçayı — juda toza va tinch.",
    variants: [
      { sku: 'ZP-JM-WSSS-30', volume: '30ml', price: 890_000, cost: 356_000, stock: 18 },
      { sku: 'ZP-JM-WSSS-100', volume: '100ml', price: 1_890_000, cost: 756_000, stock: 10 },
    ],
    featured: true,
  },
  {
    slug: 'rituals-sakura-body-mist', name: 'Rituals Sakura Body Mist', brand: 'rituals', category: 'body-mist',
    gender: 'FEMALE', concentration: 'BODY_MIST',
    top: ['Gilos gullari'], heart: ['Guruch suti'], base: ['Oq muskus'],
    longevity: 2, sillage: 2, country: 'Niderlandiya', year: 2018, palette: 'rose', shape: 'tall',
    short: "Sakura va guruch suti — sokin marosim.",
    description: "Yapon marosimlaridan ilhomlangan yumshoq hid. Guruch suti va gilos gullari.",
    variants: [
      { sku: 'ZP-RIT-SAK-50', volume: '50ml', price: 245_000, cost: 98_000, stock: 30 },
    ],
  },
  {
    slug: 'molton-brown-orange-bergamot-mist', name: 'Molton Brown Orange & Bergamot Mist', brand: 'molton-brown', category: 'body-mist',
    gender: 'UNISEX', concentration: 'BODY_MIST',
    top: ['Apelsin', 'Bergamot'], heart: ['Neroli'], base: ['Muskus', 'Sadr'],
    longevity: 2, sillage: 2, country: 'Buyuk Britaniya', year: 2012, palette: 'citrus', shape: 'tall',
    short: 'Yorqin sitrus — ertalabki energiya.',
    description: "Apelsin va bergamotning yorqin ochilishi. Ertalab uyg'onish uchun.",
    variants: [
      { sku: 'ZP-MB-OB-100', volume: '100ml', price: 320_000, cost: 128_000, stock: 26 },
    ],
  },
  {
    slug: 'zahabi-oq-muskus-mist', name: 'Zahabi Oq Muskus Body Mist', brand: 'zahabi-maison', category: 'body-mist',
    gender: 'UNISEX', concentration: 'BODY_MIST',
    top: ['Bergamot'], heart: ['Oq gullar'], base: ['Oq muskus', 'Sandal'],
    longevity: 2, sillage: 2, country: "O'zbekiston", year: 2025, palette: 'ivory', shape: 'tall',
    short: "Toza oq muskus — kundalik hamroh.",
    description: "Toza va yengil oq muskus. Har qanday atir bilan qatlamlash mumkin.",
    variants: [
      { sku: 'ZP-ZM-OM-200', volume: '200ml', price: 145_000, cost: 52_000, stock: 55 },
    ],
  },
  {
    slug: 'vs-love-spell-mist', name: "Victoria's Secret Love Spell Mist", brand: 'victorias-secret', category: 'body-mist',
    gender: 'FEMALE', concentration: 'BODY_MIST',
    top: ['Gilos', 'Nok'], heart: ['Freziya', 'Pion'], base: ['Oq muskus'],
    longevity: 2, sillage: 2, country: 'AQSh', year: 2008, palette: 'rose', shape: 'tall',
    short: "Gilos va freziya — o'smirlar sevimlisi.",
    description: "Gilos va nokning mevali shirinligi, gulli yurak bilan.",
    variants: [
      { sku: 'ZP-VS-LS-250', volume: '250ml', price: 185_000, cost: 74_000, stock: 40 },
    ],
  },
  {
    slug: 'bbw-in-the-stars-mist', name: 'Bath & Body Works In The Stars Mist', brand: 'bath-body-works', category: 'body-mist',
    gender: 'UNISEX', concentration: 'BODY_MIST',
    top: ['Bergamot', 'Nok'], heart: ['Yasemin', 'Iris'], base: ['Sandal', 'Amber'],
    longevity: 2, sillage: 2, country: 'AQSh', year: 2020, palette: 'plum', shape: 'tall',
    short: 'Yulduzli osmon — tinch va sirli.',
    description: "Iris va sandalning tungi tinchligi. Uxlashdan oldin uchun ajoyib.",
    variants: [
      { sku: 'ZP-BBW-ITS-236', volume: '236ml', price: 165_000, cost: 66_000, stock: 32 },
    ],
  },
  {
    slug: 'rituals-karma-body-mist', name: 'Rituals Karma Body Mist', brand: 'rituals', category: 'body-mist',
    gender: 'UNISEX', concentration: 'BODY_MIST',
    top: ['Oq choy'], heart: ['Nilufar'], base: ['Sandal', 'Muskus'],
    longevity: 2, sillage: 2, country: 'Niderlandiya', year: 2016, palette: 'emerald', shape: 'tall',
    short: 'Oq choy va nilufar — muvozanat.',
    description: "Oq choy va nilufarning tinchlantiruvchi hidi. Yoga va meditatsiya uchun.",
    variants: [
      { sku: 'ZP-RIT-KAR-50', volume: '50ml', price: 245_000, cost: 98_000, stock: 28 },
    ],
  },
  {
    slug: 'zahabi-citrus-fresh-mist', name: 'Zahabi Citrus Fresh Body Mist', brand: 'zahabi-maison', category: 'body-mist',
    gender: 'UNISEX', concentration: 'BODY_MIST',
    top: ['Limon', 'Greypfrut'], heart: ['Neroli', 'Yalpiz'], base: ['Oq muskus'],
    longevity: 2, sillage: 2, country: "O'zbekiston", year: 2025, palette: 'citrus', shape: 'tall',
    short: 'Sitrus energiyasi — yozgi yangilik.',
    description: "Limon va greypfrutning yorqin portlashi. Issiq kunlar uchun yaratilgan.",
    variants: [
      { sku: 'ZP-ZM-CF-200', volume: '200ml', price: 145_000, compare: 175_000, cost: 52_000, stock: 48 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DUSH GELI
// ─────────────────────────────────────────────────────────────────────────────

const SHOWER: ProductSeed[] = [
  {
    slug: 'molton-brown-black-pepper-gel', name: 'Molton Brown Black Pepper Bath & Shower Gel', brand: 'molton-brown', category: 'dush-geli',
    gender: 'UNISEX', concentration: 'NOT_APPLICABLE',
    top: ['Qora qalampir', 'Bergamot'], heart: ['Koriandr'], base: ['Vetiver', 'Sadr'],
    country: 'Buyuk Britaniya', palette: 'noir', shape: 'tube',
    short: "Qora qalampir — ertalabki uyg'onish.",
    description: "Qora qalampir va vetiverning issiq ziravorligi. Molton Brown ning eng mashhur dush geli.",
    variants: [
      { sku: 'ZP-MB-BPG-300', volume: '300ml', price: 385_000, cost: 154_000, stock: 24 },
    ],
    bestseller: true,
  },
  {
    slug: 'molton-brown-orange-bergamot-gel', name: 'Molton Brown Orange & Bergamot Shower Gel', brand: 'molton-brown', category: 'dush-geli',
    gender: 'UNISEX', concentration: 'NOT_APPLICABLE',
    top: ['Apelsin', 'Bergamot'], heart: ['Neroli'], base: ['Muskus'],
    country: 'Buyuk Britaniya', palette: 'citrus', shape: 'tube',
    short: 'Sitrus energiyasi dushda.',
    description: "Apelsin va bergamotning yorqin hidi — ertalab uchun mукammal.",
    variants: [
      { sku: 'ZP-MB-OBG-300', volume: '300ml', price: 385_000, cost: 154_000, stock: 22 },
    ],
  },
  {
    slug: 'rituals-sakura-shower-foam', name: 'Rituals Sakura Foaming Shower Gel', brand: 'rituals', category: 'dush-geli',
    gender: 'UNISEX', concentration: 'NOT_APPLICABLE',
    top: ['Gilos gullari'], heart: ['Guruch suti'], base: ['Muskus'],
    country: 'Niderlandiya', palette: 'rose', shape: 'tube',
    short: 'Ko\'pikli sakura — yumshoq parvarish.',
    description: "Terida ko'pikka aylanadigan gel. Gilos gullari va guruch suti bilan.",
    variants: [
      { sku: 'ZP-RIT-SAKG-200', volume: '200ml', price: 195_000, cost: 78_000, stock: 34 },
    ],
    bestseller: true,
  },
  {
    slug: 'rituals-karma-shower-foam', name: 'Rituals Karma Foaming Shower Gel', brand: 'rituals', category: 'dush-geli',
    gender: 'UNISEX', concentration: 'NOT_APPLICABLE',
    top: ['Oq choy'], heart: ['Nilufar'], base: ['Sandal'],
    country: 'Niderlandiya', palette: 'emerald', shape: 'tube',
    short: 'Oq choy — sokin boshlanish.',
    description: "Nilufar va oq choyning tinchlantiruvchi hidi.",
    variants: [
      { sku: 'ZP-RIT-KARG-200', volume: '200ml', price: 195_000, cost: 78_000, stock: 31 },
    ],
  },
  {
    slug: 'loccitane-verbena-shower-gel', name: "L'Occitane Verbena Shower Gel", brand: 'loccitane', category: 'dush-geli',
    gender: 'UNISEX', concentration: 'NOT_APPLICABLE',
    top: ['Verbena', 'Limon'], heart: ['Geran'], base: ['Muskus'],
    country: 'Fransiya', palette: 'citrus', shape: 'tube',
    short: 'Provans verbenasi — toza va yorqin.',
    description: "Provans verbenasining yangi hidi. Yoz uchun eng yaxshi tanlov.",
    variants: [
      { sku: 'ZP-LOC-VER-250', volume: '250ml', price: 275_000, cost: 110_000, stock: 27 },
    ],
  },
  {
    slug: 'loccitane-almond-shower-oil', name: "L'Occitane Almond Shower Oil", brand: 'loccitane', category: 'dush-geli',
    gender: 'FEMALE', concentration: 'NOT_APPLICABLE',
    top: ['Bodom'], heart: ['Oq gullar'], base: ['Muskus', 'Vanil'],
    country: 'Fransiya', palette: 'ivory', shape: 'tube',
    short: 'Bodom moyi — terini yumshatadi.',
    description: "Suvda ko'pikka aylanadigan bodom moyi. Quruq teri uchun ideal.",
    variants: [
      { sku: 'ZP-LOC-ALM-250', volume: '250ml', price: 395_000, compare: 465_000, cost: 158_000, stock: 21 },
    ],
    bestseller: true,
  },
  {
    slug: 'bbw-champagne-toast-shower-gel', name: 'Bath & Body Works Champagne Toast Shower Gel', brand: 'bath-body-works', category: 'dush-geli',
    gender: 'FEMALE', concentration: 'NOT_APPLICABLE',
    top: ['Shampan', 'Qora smorodina'], heart: ['Shaftoli'], base: ['Vanil'],
    country: 'AQSh', palette: 'citrus', shape: 'tube',
    short: 'Shampan pufakchalari — bayram.',
    description: "Shampan va shaftolining bayramona hidi.",
    variants: [
      { sku: 'ZP-BBW-CT-295', volume: '295ml', price: 155_000, cost: 62_000, stock: 36 },
    ],
  },
  {
    slug: 'molton-brown-coco-sandalwood-gel', name: 'Molton Brown Coco & Sandalwood Shower Gel', brand: 'molton-brown', category: 'dush-geli',
    gender: 'UNISEX', concentration: 'NOT_APPLICABLE',
    top: ['Kokos'], heart: ['Sandal'], base: ['Vanil', 'Muskus'],
    country: 'Buyuk Britaniya', palette: 'ivory', shape: 'tube',
    short: 'Kokos va sandal — tropik yumshoqlik.',
    description: "Kokos sutining kremliligi va sandalning issiqligi.",
    variants: [
      { sku: 'ZP-MB-CS-300', volume: '300ml', price: 385_000, cost: 154_000, stock: 19 },
    ],
  },
  {
    slug: 'zahabi-amber-shower-gel', name: 'Zahabi Amber Dush Geli', brand: 'zahabi-maison', category: 'dush-geli',
    gender: 'UNISEX', concentration: 'NOT_APPLICABLE',
    top: ['Bergamot'], heart: ['Amber'], base: ['Sandal', 'Vanil'],
    country: "O'zbekiston", palette: 'amber', shape: 'tube',
    short: "Amber issiqligi — kundalik hashamat.",
    description: "Amber va sandalning issiq hidi. Zahabi Nur Royal atiri bilan qatlamlash uchun.",
    variants: [
      { sku: 'ZP-ZM-AMG-300', volume: '300ml', price: 125_000, cost: 45_000, stock: 44 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// XUSHBO'Y SOVUN
// ─────────────────────────────────────────────────────────────────────────────

const SOAP: ProductSeed[] = [
  {
    slug: 'loccitane-shea-verbena-soap', name: "L'Occitane Shea Verbena Soap", brand: 'loccitane', category: 'xushboy-sovun',
    gender: 'UNISEX', concentration: 'NOT_APPLICABLE',
    top: ['Verbena'], heart: ['Limon'], base: ['Shea yog\'i'],
    country: 'Fransiya', palette: 'citrus', shape: 'bar',
    short: "Shea yog'i bilan — terini quritmaydi.",
    description: "Provansda qo'lda quyilgan sovun. Shea yog'i 20% — teri yumshoq qoladi.",
    variants: [
      { sku: 'ZP-LOC-SVS-100', volume: '100g', price: 95_000, cost: 38_000, stock: 52 },
      { sku: 'ZP-LOC-SVS-250', volume: '250g', price: 185_000, cost: 74_000, stock: 30 },
    ],
    bestseller: true,
  },
  {
    slug: 'loccitane-shea-lavender-soap', name: "L'Occitane Shea Lavender Soap", brand: 'loccitane', category: 'xushboy-sovun',
    gender: 'UNISEX', concentration: 'NOT_APPLICABLE',
    top: ['Lavanda'], heart: ['Rozmarin'], base: ['Shea yog\'i'],
    country: 'Fransiya', palette: 'plum', shape: 'bar',
    short: 'Provans lavandasi — tinchlantiruvchi.',
    description: "Haqiqiy Provans lavandasi bilan. Uxlashdan oldin vanna uchun ideal.",
    variants: [
      { sku: 'ZP-LOC-SLS-100', volume: '100g', price: 95_000, cost: 38_000, stock: 48 },
    ],
  },
  {
    slug: 'molton-brown-black-pepper-soap', name: 'Molton Brown Black Pepper Soap', brand: 'molton-brown', category: 'xushboy-sovun',
    gender: 'MALE', concentration: 'NOT_APPLICABLE',
    top: ['Qora qalampir'], heart: ['Koriandr'], base: ['Vetiver'],
    country: 'Buyuk Britaniya', palette: 'noir', shape: 'bar',
    short: "Ziravorli va erkakcha.",
    description: "Qora qalampir va vetiverning quruq hidi. Erkaklar uchun hashamatli sovun.",
    variants: [
      { sku: 'ZP-MB-BPS-150', volume: '150g', price: 165_000, cost: 66_000, stock: 26 },
    ],
  },
  {
    slug: 'diptyque-rose-soap', name: 'Diptyque Rose Soap', brand: 'diptyque', category: 'xushboy-sovun',
    gender: 'FEMALE', concentration: 'NOT_APPLICABLE',
    top: ['Atirgul'], heart: ['Pion'], base: ['Muskus'],
    country: 'Fransiya', palette: 'rose', shape: 'bar',
    short: 'Bulgar atirguli — hashamatli sovun.',
    description: "Diptyque ning haqiqiy atirgul hidi sovun ko'rinishida.",
    variants: [
      { sku: 'ZP-DIP-ROS-150', volume: '150g', price: 285_000, cost: 114_000, stock: 18 },
    ],
  },
  {
    slug: 'rituals-sakura-soap', name: 'Rituals Sakura Bar Soap', brand: 'rituals', category: 'xushboy-sovun',
    gender: 'UNISEX', concentration: 'NOT_APPLICABLE',
    top: ['Gilos gullari'], heart: ['Guruch suti'], base: ['Muskus'],
    country: 'Niderlandiya', palette: 'rose', shape: 'bar',
    short: 'Sakura sovuni — nozik va yumshoq.',
    description: "Guruch suti va gilos gullari bilan boyitilgan sovun.",
    variants: [
      { sku: 'ZP-RIT-SAKS-100', volume: '100g', price: 85_000, cost: 34_000, stock: 42 },
    ],
  },
  {
    slug: 'bbw-vanilla-bean-soap', name: 'Bath & Body Works Vanilla Bean Soap', brand: 'bath-body-works', category: 'xushboy-sovun',
    gender: 'FEMALE', concentration: 'NOT_APPLICABLE',
    top: ['Vanil'], heart: ['Kakao'], base: ['Muskus'],
    country: 'AQSh', palette: 'ivory', shape: 'bar',
    short: 'Vanil doni — shirin va issiq.',
    description: "Haqiqiy vanil doni ekstrakti bilan.",
    variants: [
      { sku: 'ZP-BBW-VBS-140', volume: '140g', price: 75_000, cost: 30_000, stock: 46 },
    ],
  },
  {
    slug: 'zahabi-zaytun-sovun', name: 'Zahabi Zaytun Sovuni', brand: 'zahabi-maison', category: 'xushboy-sovun',
    gender: 'UNISEX', concentration: 'NOT_APPLICABLE',
    top: ['Zaytun bargi'], heart: ['Lavanda'], base: ['Zaytun moyi'],
    country: "O'zbekiston", palette: 'emerald', shape: 'bar',
    short: "Sof zaytun moyi — an'anaviy retsept.",
    description: "An'anaviy usulda, sof zaytun moyidan qo'lda quyilgan sovun. Sezgir teri uchun mos.",
    variants: [
      { sku: 'ZP-ZM-ZAY-120', volume: '120g', price: 45_000, cost: 16_000, stock: 68 },
    ],
  },
  {
    slug: 'diptyque-figuier-soap', name: 'Diptyque Figuier Soap', brand: 'diptyque', category: 'xushboy-sovun',
    gender: 'UNISEX', concentration: 'NOT_APPLICABLE',
    top: ['Anjir bargi'], heart: ['Anjir mevasi'], base: ['Yog\'och notalar'],
    country: 'Fransiya', palette: 'emerald', shape: 'bar',
    short: "Anjir bargi — O'rta yer dengizi bog'i.",
    description: "Anjir daraxtining barglari va mevasi. Yashil, sut kabi va yozgi.",
    variants: [
      { sku: 'ZP-DIP-FIG-150', volume: '150g', price: 285_000, cost: 114_000, stock: 16 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SOCH PARFUMI
// ─────────────────────────────────────────────────────────────────────────────

const HAIR: ProductSeed[] = [
  {
    slug: 'chanel-coco-mademoiselle-hair-mist', name: 'Chanel Coco Mademoiselle Hair Mist', brand: 'chanel', category: 'soch-parfum',
    gender: 'FEMALE', concentration: 'EAU_DE_TOILETTE',
    top: ['Apelsin', 'Bergamot'], heart: ['Atirgul', 'Yasemin'], base: ['Pachuli', 'Muskus'],
    longevity: 3, sillage: 3, country: 'Fransiya', year: 2018, palette: 'rose', shape: 'tall',
    short: "Sochni quritmaydigan formula — spirtsiz.",
    description: "Coco Mademoiselle hidi maxsus soch formulasida. Spirtsiz, shuning uchun sochni quritmaydi.",
    variants: [
      { sku: 'ZP-CH-CCMH-35', volume: '35ml', price: 890_000, cost: 356_000, stock: 16 },
    ],
    bestseller: true,
  },
  {
    slug: 'dior-jadore-hair-mist', name: "Dior J'adore Hair Mist", brand: 'dior', category: 'soch-parfum',
    gender: 'FEMALE', concentration: 'EAU_DE_TOILETTE',
    top: ['Ylang-ylang'], heart: ['Yasemin', 'Atirgul'], base: ['Sandal', 'Muskus'],
    longevity: 3, sillage: 3, country: 'Fransiya', year: 2016, palette: 'citrus', shape: 'tall',
    short: "J'adore hidi sochlaringizda.",
    description: "Gulli J'adore kompozitsiyasi sochni himoya qiluvchi formulada.",
    variants: [
      { sku: 'ZP-DIOR-JADH-40', volume: '40ml', price: 820_000, cost: 328_000, stock: 14 },
    ],
  },
  {
    slug: 'byredo-gypsy-water-hair-perfume', name: 'Byredo Gypsy Water Hair Perfume', brand: 'byredo', category: 'soch-parfum',
    gender: 'UNISEX', concentration: 'EAU_DE_TOILETTE',
    top: ['Bergamot', 'Archa'], heart: ['Ladan', 'Iris'], base: ['Vanil', 'Sandal'],
    longevity: 3, sillage: 3, country: 'Shvetsiya', year: 2019, palette: 'emerald', shape: 'tall',
    short: "Gypsy Water — soch uchun.",
    description: "Byredo ning eng mashhur hidi soch parfumi formatida.",
    variants: [
      { sku: 'ZP-BYR-GWH-75', volume: '75ml', price: 1_480_000, cost: 592_000, stock: 9 },
    ],
  },
  {
    slug: 'ysl-black-opium-hair-mist', name: 'YSL Black Opium Hair Mist', brand: 'ysl', category: 'soch-parfum',
    gender: 'FEMALE', concentration: 'EAU_DE_TOILETTE',
    top: ['Pushti qalampir'], heart: ['Qahva', 'Yasemin'], base: ['Vanil'],
    longevity: 3, sillage: 3, country: 'Fransiya', year: 2017, palette: 'noir', shape: 'tall',
    short: 'Qahva va vanil — sochlarda ham.',
    description: "Black Opium ning qahva-vanil hidi soch uchun moslashtirilgan.",
    variants: [
      { sku: 'ZP-YSL-BOH-30', volume: '30ml', price: 690_000, compare: 820_000, cost: 276_000, stock: 18 },
    ],
  },
  {
    slug: 'lattafa-yara-hair-mist', name: 'Lattafa Yara Hair Mist', brand: 'lattafa', category: 'soch-parfum',
    gender: 'FEMALE', concentration: 'EAU_DE_TOILETTE',
    top: ['Orxideya'], heart: ['Gelotropin'], base: ['Vanil', 'Sandal'],
    longevity: 3, sillage: 3, country: 'BAA', year: 2022, palette: 'rose', shape: 'tall',
    short: 'Hamyonbop soch parfumi.',
    description: "Yara ning shirin hidi soch uchun. Narxi bo'yicha eng qulay variantlardan.",
    variants: [
      { sku: 'ZP-LAT-YARH-50', volume: '50ml', price: 165_000, cost: 66_000, stock: 38 },
    ],
  },
  {
    slug: 'jo-malone-english-pear-hair-mist', name: 'Jo Malone English Pear & Freesia Hair Mist', brand: 'jo-malone', category: 'soch-parfum',
    gender: 'FEMALE', concentration: 'EAU_DE_COLOGNE',
    top: ['Nok'], heart: ['Freziya'], base: ['Pachuli', 'Amber'],
    longevity: 3, sillage: 2, country: 'Buyuk Britaniya', year: 2020, palette: 'emerald', shape: 'tall',
    short: 'Nok va freziya — kuzgi bog\'.',
    description: "Pishgan nok va oq freziya. Jo Malone ning eng sevimli hidlaridan biri.",
    variants: [
      { sku: 'ZP-JM-EPFH-30', volume: '30ml', price: 780_000, cost: 312_000, stock: 15 },
    ],
  },
  {
    slug: 'zahabi-soch-parfumi-atirgul', name: 'Zahabi Atirgul Soch Parfumi', brand: 'zahabi-maison', category: 'soch-parfum',
    gender: 'FEMALE', concentration: 'EAU_DE_TOILETTE',
    top: ['Bergamot'], heart: ['Damask atirguli'], base: ['Muskus', 'Sandal'],
    longevity: 3, sillage: 2, country: "O'zbekiston", year: 2025, palette: 'rose', shape: 'tall',
    short: "Samarqand atirguli — sochlar uchun.",
    description: "Spirtsiz formula, argan moyi bilan boyitilgan. Sochni quritmaydi va yaltiroq qiladi.",
    variants: [
      { sku: 'ZP-ZM-SPA-100', volume: '100ml', price: 185_000, cost: 66_000, stock: 34 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// XONA AROMALARI
// ─────────────────────────────────────────────────────────────────────────────

const HOME: ProductSeed[] = [
  {
    slug: 'diptyque-baies-diffuser', name: 'Diptyque Baies Reed Diffuser', brand: 'diptyque', category: 'xona-aromalari',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Qora smorodina'], heart: ['Bulgar atirguli'], base: ['Yashil barglar'],
    country: 'Fransiya', palette: 'plum', shape: 'diffuser',
    short: "Diptyque ning eng mashhur uy hidi.",
    description: "Qora smorodina barglari va bulgar atirguli. 2-3 oy davomida xonani to'ldiradi.",
    variants: [
      { sku: 'ZP-DIP-BAID-200', volume: '200ml', price: 1_290_000, cost: 516_000, stock: 14 },
    ],
    bestseller: true, featured: true,
  },
  {
    slug: 'diptyque-figuier-diffuser', name: 'Diptyque Figuier Reed Diffuser', brand: 'diptyque', category: 'xona-aromalari',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Anjir bargi'], heart: ['Anjir'], base: ['Yog\'och'],
    country: 'Fransiya', palette: 'emerald', shape: 'diffuser',
    short: "Anjir daraxti — O'rta yer dengizi.",
    description: "Anjir daraxtining barglari, mevasi va yog'ochi. Yashil va sokin.",
    variants: [
      { sku: 'ZP-DIP-FIGD-200', volume: '200ml', price: 1_290_000, cost: 516_000, stock: 11 },
    ],
  },
  {
    slug: 'jo-malone-lime-basil-diffuser', name: 'Jo Malone Lime Basil & Mandarin Diffuser', brand: 'jo-malone', category: 'xona-aromalari',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Laym', 'Mandarin'], heart: ['Rayhon'], base: ['Amber', 'Pachuli'],
    country: 'Buyuk Britaniya', palette: 'citrus', shape: 'diffuser',
    short: 'Laym va rayhon — Jo Malone klassikasi.',
    description: "Laym, rayhon va mandarinning yorqin kombinatsiyasi. Oshxona va yashash xonasi uchun.",
    variants: [
      { sku: 'ZP-JM-LBMD-165', volume: '165ml', price: 980_000, cost: 392_000, stock: 16 },
    ],
    bestseller: true,
  },
  {
    slug: 'rituals-karma-fragrance-sticks', name: 'Rituals Karma Fragrance Sticks', brand: 'rituals', category: 'xona-aromalari',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Oq choy'], heart: ['Nilufar'], base: ['Sandal'],
    country: 'Niderlandiya', palette: 'emerald', shape: 'diffuser',
    short: 'Oq choy va nilufar — tinchlik.',
    description: "Yotoqxona va meditatsiya xonasi uchun sokin hid.",
    variants: [
      { sku: 'ZP-RIT-KARD-250', volume: '250ml', price: 385_000, cost: 154_000, stock: 24 },
    ],
  },
  {
    slug: 'rituals-sakura-fragrance-sticks', name: 'Rituals Sakura Fragrance Sticks', brand: 'rituals', category: 'xona-aromalari',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Gilos gullari'], heart: ['Guruch suti'], base: ['Muskus'],
    country: 'Niderlandiya', palette: 'rose', shape: 'diffuser',
    short: 'Sakura — bahor uyda.',
    description: "Gilos gullari va guruch sutining nozik hidi.",
    variants: [
      { sku: 'ZP-RIT-SAKD-250', volume: '250ml', price: 385_000, cost: 154_000, stock: 22 },
    ],
  },
  {
    slug: 'zahabi-oud-xona-diffuser', name: 'Zahabi Oud Xona Diffuzori', brand: 'zahabi-maison', category: 'xona-aromalari',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Zaʼfaron'], heart: ['Oud', 'Atirgul'], base: ['Amber', 'Sandal'],
    country: "O'zbekiston", palette: 'amber', shape: 'diffuser',
    short: "Sharqona oud — mehmonxona uchun.",
    description: "Oud va atirgulning sharqona uyg'unligi. Mehmon kutish xonasi uchun ideal.",
    variants: [
      { sku: 'ZP-ZM-OUDD-200', volume: '200ml', price: 345_000, compare: 425_000, cost: 122_000, stock: 30 },
    ],
    featured: true,
  },
  {
    slug: 'zahabi-yasemin-xona-spray', name: 'Zahabi Yasemin Xona Spreyi', brand: 'zahabi-maison', category: 'xona-aromalari',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Bergamot'], heart: ['Yasemin', 'Neroli'], base: ['Oq muskus'],
    country: "O'zbekiston", palette: 'ivory', shape: 'tall',
    short: 'Tez ta\'sir — bir purkash yetarli.',
    description: "Yasemin va nerolining yengil hidi. Xonani tez yangilash uchun.",
    variants: [
      { sku: 'ZP-ZM-YXS-250', volume: '250ml', price: 125_000, cost: 45_000, stock: 46 },
    ],
  },
  {
    slug: 'molton-brown-orange-bergamot-diffuser', name: 'Molton Brown Orange & Bergamot Diffuser', brand: 'molton-brown', category: 'xona-aromalari',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Apelsin', 'Bergamot'], heart: ['Neroli'], base: ['Sadr'],
    country: 'Buyuk Britaniya', palette: 'citrus', shape: 'diffuser',
    short: 'Sitrus — kirish eshigi uchun.',
    description: "Apelsin va bergamotning yorqin hidi. Koridor va kirish qismi uchun.",
    variants: [
      { sku: 'ZP-MB-OBD-150', volume: '150ml', price: 685_000, cost: 274_000, stock: 18 },
    ],
  },
  {
    slug: 'jo-malone-english-pear-diffuser', name: 'Jo Malone English Pear & Freesia Diffuser', brand: 'jo-malone', category: 'xona-aromalari',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Nok'], heart: ['Freziya'], base: ['Pachuli', 'Amber'],
    country: 'Buyuk Britaniya', palette: 'emerald', shape: 'diffuser',
    short: "Nok va freziya — kuzgi uy.",
    description: "Pishgan nok va oq freziyaning yumshoq hidi.",
    variants: [
      { sku: 'ZP-JM-EPFD-165', volume: '165ml', price: 980_000, cost: 392_000, stock: 15 },
    ],
  },
  {
    slug: 'diptyque-tubereuse-diffuser', name: 'Diptyque Tubéreuse Reed Diffuser', brand: 'diptyque', category: 'xona-aromalari',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Tuberoza'], heart: ['Oq gullar'], base: ['Muskus'],
    country: 'Fransiya', palette: 'ivory', shape: 'diffuser',
    short: 'Tuberoza — to\'liq gulli uy.',
    description: "Tuberozaning boy oq gulli hidi. Yashash xonasi uchun.",
    variants: [
      { sku: 'ZP-DIP-TUBD-200', volume: '200ml', price: 1_290_000, cost: 516_000, stock: 9 },
    ],
  },
  {
    slug: 'loccitane-lavender-home-spray', name: "L'Occitane Lavender Home Spray", brand: 'loccitane', category: 'xona-aromalari',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Lavanda'], heart: ['Rozmarin'], base: ['Muskus'],
    country: 'Fransiya', palette: 'plum', shape: 'tall',
    short: 'Provans lavandasi — yotoqxona uchun.',
    description: "Haqiqiy Provans lavandasi. Yostiq va choyshabga purkash mumkin.",
    variants: [
      { sku: 'ZP-LOC-LHS-100', volume: '100ml', price: 285_000, cost: 114_000, stock: 26 },
    ],
  },
  {
    slug: 'zahabi-choy-limon-diffuser', name: 'Zahabi Choy va Limon Diffuzori', brand: 'zahabi-maison', category: 'xona-aromalari',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Limon', 'Bergamot'], heart: ['Yashil choy'], base: ['Oq muskus'],
    country: "O'zbekiston", palette: 'citrus', shape: 'diffuser',
    short: 'Yashil choy — oshxona uchun.',
    description: "Yashil choy va limonning toza hidi. Oshxonadagi hidlarni neytrallashtiradi.",
    variants: [
      { sku: 'ZP-ZM-CHLD-200', volume: '200ml', price: 295_000, cost: 105_000, stock: 32 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// AVTOMOBIL AROMALARI
// ─────────────────────────────────────────────────────────────────────────────

const CAR: ProductSeed[] = [
  {
    slug: 'montblanc-explorer-car-diffuser', name: 'Montblanc Explorer Car Diffuser', brand: 'montblanc', category: 'avtomobil-aroma',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Bergamot'], heart: ['Vetiver'], base: ['Pachuli', 'Kakao'],
    country: 'Germaniya', palette: 'emerald', shape: 'car',
    short: 'Explorer hidi salonda.',
    description: "Explorer atirining salon uchun moslashtirilgan versiyasi. Havo shamollatgichga o'rnatiladi.",
    variants: [
      { sku: 'ZP-MB-EXPC-8', volume: '8ml', price: 320_000, cost: 128_000, stock: 22 },
    ],
    bestseller: true,
  },
  {
    slug: 'zahabi-oud-avto-aroma', name: 'Zahabi Oud Avtomobil Aromasi', brand: 'zahabi-maison', category: 'avtomobil-aroma',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Zaʼfaron'], heart: ['Oud'], base: ['Amber', 'Sandal'],
    country: "O'zbekiston", palette: 'amber', shape: 'car',
    short: "Sharqona oud — 45 kun davomida.",
    description: "Oud va amberning sharqona hidi. Metall klipsa bilan, 45 kungacha ishlaydi.",
    variants: [
      { sku: 'ZP-ZM-OUDC-10', volume: '10ml', price: 89_000, compare: 115_000, cost: 32_000, stock: 64 },
    ],
    featured: true,
  },
  {
    slug: 'zahabi-citrus-avto-aroma', name: 'Zahabi Citrus Avtomobil Aromasi', brand: 'zahabi-maison', category: 'avtomobil-aroma',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Limon', 'Greypfrut'], heart: ['Neroli'], base: ['Oq muskus'],
    country: "O'zbekiston", palette: 'citrus', shape: 'car',
    short: 'Sitrus — uzoq yo\'lda hushyorlik.',
    description: "Limon va greypfrutning yorqin hidi. Uzoq yo'llarda diqqatni saqlashga yordam beradi.",
    variants: [
      { sku: 'ZP-ZM-CITC-10', volume: '10ml', price: 89_000, cost: 32_000, stock: 58 },
    ],
  },
  {
    slug: 'zahabi-vanil-avto-aroma', name: 'Zahabi Vanil Avtomobil Aromasi', brand: 'zahabi-maison', category: 'avtomobil-aroma',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Bergamot'], heart: ['Vanil'], base: ['Tonka', 'Muskus'],
    country: "O'zbekiston", palette: 'ivory', shape: 'car',
    short: 'Yumshoq vanil — oilaviy sayohat.',
    description: "Yumshoq va shirin vanil. Bolalar bilan sayohat uchun juda mos.",
    variants: [
      { sku: 'ZP-ZM-VANC-10', volume: '10ml', price: 89_000, cost: 32_000, stock: 52 },
    ],
  },
  {
    slug: 'armaf-club-de-nuit-car', name: 'Armaf Club de Nuit Car Perfume', brand: 'armaf', category: 'avtomobil-aroma',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Ananas', 'Limon'], heart: ['Qayin'], base: ['Muskus', 'Amber'],
    country: 'BAA', palette: 'noir', shape: 'car',
    short: 'Club de Nuit — salonda.',
    description: "Club de Nuit Intense ning avtomobil versiyasi. Kuchli va uzoq davom etadi.",
    variants: [
      { sku: 'ZP-ARF-CDNC-8', volume: '8ml', price: 145_000, cost: 58_000, stock: 38 },
    ],
  },
  {
    slug: 'lattafa-khamrah-car', name: 'Lattafa Khamrah Car Freshener', brand: 'lattafa', category: 'avtomobil-aroma',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Dolchin'], heart: ['Xurmo', 'Praline'], base: ['Vanil'],
    country: 'BAA', palette: 'amber', shape: 'car',
    short: 'Xurmo va dolchin — qishki salon.',
    description: "Khamrah atirining shirin sharqona hidi salon uchun.",
    variants: [
      { sku: 'ZP-LAT-KHAC-10', volume: '10ml', price: 125_000, cost: 50_000, stock: 42 },
    ],
  },
  {
    slug: 'zahabi-yashil-choy-avto', name: 'Zahabi Yashil Choy Avtomobil Aromasi', brand: 'zahabi-maison', category: 'avtomobil-aroma',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Limon'], heart: ['Yashil choy', 'Yalpiz'], base: ['Muskus'],
    country: "O'zbekiston", palette: 'emerald', shape: 'car',
    short: 'Yashil choy — toza va neytral.',
    description: "Yengil va bezovta qilmaydigan hid. Hidlarga sezgir yo'lovchilar uchun.",
    variants: [
      { sku: 'ZP-ZM-YCHC-10', volume: '10ml', price: 89_000, cost: 32_000, stock: 60 },
    ],
  },
  {
    slug: 'ajmal-amber-wood-car', name: 'Ajmal Amber Wood Car Diffuser', brand: 'ajmal', category: 'avtomobil-aroma',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Zaʼfaron'], heart: ['Sandal'], base: ['Amber', 'Oud'],
    country: 'BAA', palette: 'amber', shape: 'car',
    short: "Amber Wood — hashamatli salon.",
    description: "Sandal va amberning issiq hidi. Premium avtomobillar uchun.",
    variants: [
      { sku: 'ZP-AJM-AWC-10', volume: '10ml', price: 185_000, cost: 74_000, stock: 28 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// XUSHBO'Y SHAMLAR
// ─────────────────────────────────────────────────────────────────────────────

const CANDLES: ProductSeed[] = [
  {
    slug: 'diptyque-baies-candle', name: 'Diptyque Baies Candle', brand: 'diptyque', category: 'shamlar',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Qora smorodina'], heart: ['Bulgar atirguli'], base: ['Yashil barglar'],
    country: 'Fransiya', palette: 'plum', shape: 'candle',
    short: "Dunyodagi eng mashhur xushbo'y sham.",
    description: "Qora smorodina barglari va bulgar atirguli. 60 soat yonadi va butun xonani to'ldiradi.",
    variants: [
      { sku: 'ZP-DIP-BAIC-70', volume: '70g', price: 485_000, cost: 194_000, stock: 26 },
      { sku: 'ZP-DIP-BAIC-190', volume: '190g', price: 985_000, compare: 1_150_000, cost: 394_000, stock: 16 },
    ],
    bestseller: true, featured: true,
  },
  {
    slug: 'diptyque-figuier-candle', name: 'Diptyque Figuier Candle', brand: 'diptyque', category: 'shamlar',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Anjir bargi'], heart: ['Anjir'], base: ['Yog\'och'],
    country: 'Fransiya', palette: 'emerald', shape: 'candle',
    short: "Anjir daraxti — yashil va sut kabi.",
    description: "Anjir daraxtining barglari, mevasi va yog'ochi. Yozgi kechalar uchun.",
    variants: [
      { sku: 'ZP-DIP-FIGC-190', volume: '190g', price: 985_000, cost: 394_000, stock: 13 },
    ],
  },
  {
    slug: 'jo-malone-lime-basil-candle', name: 'Jo Malone Lime Basil & Mandarin Candle', brand: 'jo-malone', category: 'shamlar',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Laym', 'Mandarin'], heart: ['Rayhon'], base: ['Amber'],
    country: 'Buyuk Britaniya', palette: 'citrus', shape: 'candle',
    short: 'Laym va rayhon — yorqin va toza.',
    description: "Jo Malone ning eng tanilgan hidi sham ko'rinishida. 45 soat yonadi.",
    variants: [
      { sku: 'ZP-JM-LBMC-200', volume: '200g', price: 890_000, cost: 356_000, stock: 18 },
    ],
    bestseller: true,
  },
  {
    slug: 'yankee-candle-vanilla-cupcake', name: 'Yankee Candle Vanilla Cupcake', brand: 'yankee-candle', category: 'shamlar',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Sariyog\''], heart: ['Vanil', 'Shakar'], base: ['Kremli notalar'],
    country: 'AQSh', palette: 'ivory', shape: 'candle',
    short: 'Pishirilgan kek — issiq va shirin.',
    description: "Yangi pishirilgan vanilli kek hidi. 110-150 soat yonadi.",
    variants: [
      { sku: 'ZP-YC-VC-411', volume: '411g', price: 385_000, cost: 154_000, stock: 30 },
      { sku: 'ZP-YC-VC-104', volume: '104g', price: 165_000, cost: 66_000, stock: 42 },
    ],
    bestseller: true,
  },
  {
    slug: 'yankee-candle-black-cherry', name: 'Yankee Candle Black Cherry', brand: 'yankee-candle', category: 'shamlar',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Gilos'], heart: ['Olcha'], base: ['Vanil'],
    country: 'AQSh', palette: 'plum', shape: 'candle',
    short: 'Qora gilos — mevali va boy.',
    description: "Pishgan qora gilosning shirin hidi. Yankee Candle ning eng sotiladigan hidlaridan.",
    variants: [
      { sku: 'ZP-YC-BC-411', volume: '411g', price: 385_000, cost: 154_000, stock: 27 },
    ],
  },
  {
    slug: 'yankee-candle-clean-cotton', name: 'Yankee Candle Clean Cotton', brand: 'yankee-candle', category: 'shamlar',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Limon'], heart: ['Nilufar', 'Yasemin'], base: ['Oq muskus'],
    country: 'AQSh', palette: 'azure', shape: 'candle',
    short: 'Toza paxta — yangi yuvilgan choyshab.',
    description: "Quyoshda quritilgan choyshab hidi. Yotoqxona uchun ideal.",
    variants: [
      { sku: 'ZP-YC-CC-411', volume: '411g', price: 385_000, cost: 154_000, stock: 25 },
    ],
  },
  {
    slug: 'bbw-mahogany-teakwood-candle', name: 'Bath & Body Works Mahogany Teakwood Candle', brand: 'bath-body-works', category: 'shamlar',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Lavanda'], heart: ['Mahogani', 'Tik yog\'ochi'], base: ['Amber', 'Muskus'],
    country: 'AQSh', palette: 'noir', shape: 'candle',
    short: "Yog'och va charm — erkakcha uy hidi.",
    description: "Mahogani va tik yog'ochining issiq hidi. Ish kabineti uchun ajoyib.",
    variants: [
      { sku: 'ZP-BBW-MT-411', volume: '411g', price: 320_000, compare: 390_000, cost: 128_000, stock: 34 },
    ],
    bestseller: true,
  },
  {
    slug: 'bbw-eucalyptus-spearmint-candle', name: 'Bath & Body Works Eucalyptus Spearmint Candle', brand: 'bath-body-works', category: 'shamlar',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Yalpiz'], heart: ['Evkalipt'], base: ['Oq muskus'],
    country: 'AQSh', palette: 'emerald', shape: 'candle',
    short: 'Evkalipt va yalpiz — spa muhiti.',
    description: "Evkalipt va yalpizning tetiklashtiruvchi hidi. Vannaxona uchun.",
    variants: [
      { sku: 'ZP-BBW-ES-411', volume: '411g', price: 320_000, cost: 128_000, stock: 29 },
    ],
  },
  {
    slug: 'rituals-sakura-candle', name: 'Rituals Sakura Scented Candle', brand: 'rituals', category: 'shamlar',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Gilos gullari'], heart: ['Guruch suti'], base: ['Muskus'],
    country: 'Niderlandiya', palette: 'rose', shape: 'candle',
    short: 'Sakura — nozik va tinch.',
    description: "Guruch suti va gilos gullarining yumshoq hidi. 40 soat yonadi.",
    variants: [
      { sku: 'ZP-RIT-SAKC-290', volume: '290g', price: 385_000, cost: 154_000, stock: 22 },
    ],
  },
  {
    slug: 'zahabi-oud-sham', name: "Zahabi Oud Xushbo'y Sham", brand: 'zahabi-maison', category: 'shamlar',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Zaʼfaron'], heart: ['Oud', 'Atirgul'], base: ['Amber', 'Sandal'],
    country: "O'zbekiston", palette: 'amber', shape: 'candle',
    short: "Sharqona oud — soya mumidan.",
    description: "100% soya mumi va tabiiy paxta piltasi. Oud va atirgulning sharqona hidi, 50 soat yonadi.",
    variants: [
      { sku: 'ZP-ZM-OUDS-200', volume: '200g', price: 165_000, compare: 210_000, cost: 58_000, stock: 46 },
    ],
    featured: true,
  },
  {
    slug: 'zahabi-vanil-sham', name: "Zahabi Vanil Xushbo'y Sham", brand: 'zahabi-maison', category: 'shamlar',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Bergamot'], heart: ['Vanil'], base: ['Tonka', 'Sandal'],
    country: "O'zbekiston", palette: 'ivory', shape: 'candle',
    short: 'Yumshoq vanil — issiq oqshomlar.',
    description: "Soya mumi va vanil ekstrakti. Kuzgi va qishki oqshomlar uchun.",
    variants: [
      { sku: 'ZP-ZM-VANS-200', volume: '200g', price: 145_000, cost: 52_000, stock: 52 },
    ],
  },
  {
    slug: 'diptyque-tubereuse-candle', name: 'Diptyque Tubéreuse Candle', brand: 'diptyque', category: 'shamlar',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Tuberoza'], heart: ['Oq gullar'], base: ['Muskus'],
    country: 'Fransiya', palette: 'ivory', shape: 'candle',
    short: 'Tuberoza — to\'liq gulli.',
    description: "Tuberozaning boy oq gulli hidi. Mehmonlar kutilayotganda yoqing.",
    variants: [
      { sku: 'ZP-DIP-TUBC-190', volume: '190g', price: 985_000, cost: 394_000, stock: 10 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PARFYUMERIYA SETLARI
// ─────────────────────────────────────────────────────────────────────────────

const SETS: ProductSeed[] = [
  {
    slug: 'dior-sauvage-set', name: 'Dior Sauvage Parfyumeriya Seti', brand: 'dior', category: 'parfyum-set',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Bergamot'], heart: ['Sichuan qalampiri'], base: ['Ambroksan'],
    country: 'Fransiya', palette: 'azure', shape: 'box',
    short: 'Atir 100ml + dush geli + deodorant.',
    description: "Sauvage EDP 100ml, dush geli 50ml va deodorant stik. To'liq parvarish to'plami — sovg'a uchun tayyor.",
    variants: [
      { sku: 'ZP-SET-DIOR-SAU', volume: "To'plam", price: 2_190_000, compare: 2_480_000, cost: 876_000, stock: 12 },
    ],
    bestseller: true,
  },
  {
    slug: 'chanel-coco-mademoiselle-set', name: 'Chanel Coco Mademoiselle Seti', brand: 'chanel', category: 'parfyum-set',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Apelsin'], heart: ['Atirgul'], base: ['Pachuli'],
    country: 'Fransiya', palette: 'rose', shape: 'box',
    short: 'Atir 50ml + tana losioni.',
    description: "Coco Mademoiselle EDP 50ml va tana losioni 100ml. Chanel firma o'ramida.",
    variants: [
      { sku: 'ZP-SET-CH-CCM', volume: "To'plam", price: 2_290_000, cost: 916_000, stock: 9 },
    ],
    bestseller: true,
  },
  {
    slug: 'rituals-sakura-ritual-set', name: 'Rituals Sakura Parvarish Seti', brand: 'rituals', category: 'parfyum-set',
    gender: 'FEMALE', concentration: 'NOT_APPLICABLE',
    top: ['Gilos gullari'], heart: ['Guruch suti'], base: ['Muskus'],
    country: 'Niderlandiya', palette: 'rose', shape: 'box',
    short: "Dush geli + skrab + krem + mist.",
    description: "Sakura kolleksiyasining to'liq to'plami: ko'pikli dush geli, tana skrabi, tana kremi va body mist.",
    variants: [
      { sku: 'ZP-SET-RIT-SAK', volume: "To'plam", price: 685_000, compare: 820_000, cost: 274_000, stock: 20 },
    ],
    bestseller: true,
  },
  {
    slug: 'loccitane-shea-hand-care-set', name: "L'Occitane Shea Qo'l Parvarishi Seti", brand: 'loccitane', category: 'parfyum-set',
    gender: 'FEMALE', concentration: 'NOT_APPLICABLE',
    top: ['Shea'], heart: ['Lavanda'], base: ['Muskus'],
    country: 'Fransiya', palette: 'ivory', shape: 'box',
    short: "Qo'l kremi ×3 + sovun.",
    description: "Uch xil hidli qo'l kremi (Shea, Lavanda, Verbena) va shea sovuni. Qishki sovg'a uchun ideal.",
    variants: [
      { sku: 'ZP-SET-LOC-SHEA', volume: "To'plam", price: 485_000, cost: 194_000, stock: 24 },
    ],
  },
  {
    slug: 'zahabi-nur-royal-set', name: 'Zahabi Nur Royal Seti', brand: 'zahabi-maison', category: 'parfyum-set',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Zaʼfaron'], heart: ['Oud'], base: ['Amber'],
    country: "O'zbekiston", palette: 'amber', shape: 'box',
    short: "Atir 100ml + dush geli + avto aroma.",
    description: "Nur Royal EDP 100ml, Amber dush geli 300ml va Oud avtomobil aromasi. Zahabi firma o'ramida.",
    variants: [
      { sku: 'ZP-SET-ZM-NUR', volume: "To'plam", price: 1_190_000, compare: 1_403_000, cost: 420_000, stock: 26 },
    ],
    featured: true,
  },
  {
    slug: 'molton-brown-discovery-set', name: 'Molton Brown Discovery Seti', brand: 'molton-brown', category: 'parfyum-set',
    gender: 'UNISEX', concentration: 'NOT_APPLICABLE',
    top: ['Bergamot'], heart: ['Qalampir'], base: ['Vetiver'],
    country: 'Buyuk Britaniya', palette: 'noir', shape: 'box',
    short: "6 ta mini dush geli — sevimlingizni toping.",
    description: "Molton Brown ning oltita eng mashhur hidi 30ml formatda. Sayohat uchun ham qulay.",
    variants: [
      { sku: 'ZP-SET-MB-DISC', volume: '6×30ml', price: 585_000, cost: 234_000, stock: 18 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// GIFT BOX
// ─────────────────────────────────────────────────────────────────────────────

const GIFTS: ProductSeed[] = [
  {
    slug: 'jo-malone-discovery-collection', name: 'Jo Malone Discovery Kolleksiyasi', brand: 'jo-malone', category: 'gift-box',
    gender: 'UNISEX', concentration: 'EAU_DE_COLOGNE',
    top: ['Laym'], heart: ['Pion'], base: ['Zamsha'],
    country: 'Buyuk Britaniya', palette: 'rose', shape: 'box',
    short: "5 ta mini kolonya — sovg'a uchun tayyor.",
    description: "Jo Malone ning beshta eng sevimli hidi 9ml formatda, firma qutisida va lentasi bilan.",
    variants: [
      { sku: 'ZP-GIFT-JM-DISC', volume: '5×9ml', price: 1_850_000, cost: 740_000, stock: 11 },
    ],
    bestseller: true, featured: true,
  },
  {
    slug: 'tom-ford-private-blend-discovery', name: 'Tom Ford Private Blend Discovery', brand: 'tom-ford', category: 'gift-box',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Oud'], heart: ['Gilos'], base: ['Vanil'],
    country: 'AQSh', palette: 'noir', shape: 'box',
    short: '10 ta mini atir — Private Blend.',
    description: "Private Blend kolleksiyasidan o'nta mini atir 2ml formatda. Sevimlingizni topish uchun ideal boshlanish.",
    variants: [
      { sku: 'ZP-GIFT-TF-DISC', volume: '10×2ml', price: 1_480_000, compare: 1_720_000, cost: 592_000, stock: 9 },
    ],
    featured: true,
  },
  {
    slug: 'zahabi-premium-gift-box', name: 'Zahabi Premium Sovg\'a Quti', brand: 'zahabi-maison', category: 'gift-box',
    gender: 'UNISEX', concentration: 'EAU_DE_PARFUM',
    top: ['Zaʼfaron'], heart: ['Atirgul', 'Oud'], base: ['Amber'],
    country: "O'zbekiston", palette: 'amber', shape: 'box',
    short: "Atir + sham + sovun — bepul o'ram.",
    description: "Zahabi Nur Royal 50ml, Oud sham 200g va zaytun sovuni. Ipak lenta va tabrik kartasi bilan — o'rash bepul.",
    variants: [
      { sku: 'ZP-GIFT-ZM-PREM', volume: "To'plam", price: 890_000, compare: 1_060_000, cost: 315_000, stock: 32 },
    ],
    bestseller: true, featured: true,
  },
  {
    slug: 'diptyque-candle-trio-gift', name: 'Diptyque Sham Triosi', brand: 'diptyque', category: 'gift-box',
    gender: 'NOT_APPLICABLE', concentration: 'NOT_APPLICABLE',
    top: ['Qora smorodina'], heart: ['Anjir'], base: ['Tuberoza'],
    country: 'Fransiya', palette: 'plum', shape: 'box',
    short: '3 ta mini sham — Baies, Figuier, Tubéreuse.',
    description: "Diptyque ning uchta eng mashhur hidi 70g formatda, firma qutisida.",
    variants: [
      { sku: 'ZP-GIFT-DIP-TRIO', volume: '3×70g', price: 1_390_000, cost: 556_000, stock: 12 },
    ],
  },
  {
    slug: 'bbw-signature-gift-set', name: 'Bath & Body Works Signature Sovg\'a Seti', brand: 'bath-body-works', category: 'gift-box',
    gender: 'FEMALE', concentration: 'NOT_APPLICABLE',
    top: ['Gilos gullari'], heart: ['Pion'], base: ['Vanil'],
    country: 'AQSh', palette: 'rose', shape: 'box',
    short: 'Mist + dush geli + krem + sovun.',
    description: "Japanese Cherry Blossom kolleksiyasi: body mist, dush geli, tana kremi va sovun. Sovg'a paketida.",
    variants: [
      { sku: 'ZP-GIFT-BBW-SIG', volume: "To'plam", price: 465_000, compare: 560_000, cost: 186_000, stock: 28 },
    ],
    bestseller: true,
  },
  {
    slug: 'zahabi-atirgul-gift-box', name: "Zahabi Atirgul Sovg'a Quti", brand: 'zahabi-maison', category: 'gift-box',
    gender: 'FEMALE', concentration: 'EAU_DE_PARFUM',
    top: ['Litchi'], heart: ['Damask atirguli'], base: ['Sandal'],
    country: "O'zbekiston", palette: 'rose', shape: 'box',
    short: "Ayollar uchun to'liq atirgul to'plami.",
    description: "Samarqand Rose 50ml, atirgul soch parfumi va zaytun sovuni. 8-mart va tug'ilgan kunlar uchun.",
    variants: [
      { sku: 'ZP-GIFT-ZM-ROSE', volume: "To'plam", price: 790_000, compare: 950_000, cost: 280_000, stock: 34 },
    ],
    featured: true,
  },
  {
    slug: 'rituals-luxury-gift-box', name: 'Rituals Hashamatli Sovg\'a Quti', brand: 'rituals', category: 'gift-box',
    gender: 'UNISEX', concentration: 'NOT_APPLICABLE',
    top: ['Oq choy'], heart: ['Nilufar'], base: ['Sandal'],
    country: 'Niderlandiya', palette: 'emerald', shape: 'box',
    short: "Karma kolleksiyasi — to'liq to'plam.",
    description: "Karma dush geli, skrab, tana kremi, body mist va sham. Katta o'lchamli sovg'a qutisida.",
    variants: [
      { sku: 'ZP-GIFT-RIT-LUX', volume: "To'plam", price: 985_000, cost: 394_000, stock: 16 },
    ],
  },
  {
    slug: 'zahabi-erkaklar-gift-box', name: "Zahabi Erkaklar Sovg'a Quti", brand: 'zahabi-maison', category: 'gift-box',
    gender: 'MALE', concentration: 'EAU_DE_PARFUM',
    top: ['Bergamot'], heart: ['Oud'], base: ['Sandal', 'Amber'],
    country: "O'zbekiston", palette: 'noir', shape: 'box',
    short: "Atir + avto aroma + sovun.",
    description: "Buxoro Oud 50ml, Oud avtomobil aromasi va zaytun sovuni. Qora ipak o'ramda.",
    variants: [
      { sku: 'ZP-GIFT-ZM-MEN', volume: "To'plam", price: 1_290_000, compare: 1_468_000, cost: 458_000, stock: 22 },
    ],
    bestseller: true,
  },
];

export const PRODUCTS: ProductSeed[] = [
  ...MEN,
  ...WOMEN,
  ...NICHE,
  ...BODY_MIST,
  ...SHOWER,
  ...SOAP,
  ...HAIR,
  ...HOME,
  ...CAR,
  ...CANDLES,
  ...SETS,
  ...GIFTS,
];
