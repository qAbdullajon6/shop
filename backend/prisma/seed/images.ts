import * as fs from 'fs';
import * as path from 'path';

/**
 * Mahsulot rasmlarini lokal ravishda yaratadi.
 *
 * Nima uchun uchinchi tomon CDN emas:
 *   • Eski seed rasmlarni fimgs.net dan "hotlink" qilardi — bu tashqi
 *     bog'liqlik va istalgan payt bloklanishi mumkin
 *   • Har bir variantga BIR XIL URL ikki marta yozilardi, ya'ni kartochkadagi
 *     hover almashuvi bir xil rasmni bir xil rasmga almashtirardi
 *
 * Bu yerda har bir mahsulot uchun ikkita TURLI kadr yaratiladi (old ko'rinish
 * va yaqindan) — hover effekti haqiqatan ishlaydi. Rasmlar SVG: ular kichik,
 * har qanday ekranda tiniq va `<img>` ichida skript bajarmaydi.
 *
 * Ishlab chiqarishda bular haqiqiy fotosuratlar bilan admin panel orqali
 * almashtiriladi (mahsulot → rasmlar → yuklash).
 */

const OUTPUT_DIR = path.join(process.cwd(), 'uploads', 'products');

/** Hid oilasiga qarab shisha rangi — katalog vizual jihatdan xilma-xil bo'ladi. */
export type Palette =
  | 'amber'      // sharqona, oud
  | 'rose'       // gulli, shirin
  | 'azure'      // yangi, suvli
  | 'emerald'    // fujer, o't
  | 'noir'       // qora, tutunli
  | 'ivory'      // muskus, pudra
  | 'citrus'     // sitrus
  | 'plum';      // mevali, chypre

const PALETTES: Record<Palette, { base: string; light: string; dark: string; cap: string }> = {
  amber:   { base: '#B87333', light: '#E3B778', dark: '#7A4A1E', cap: '#3A2A18' },
  rose:    { base: '#C4647A', light: '#E8A9B8', dark: '#8A3F52', cap: '#3A1E26' },
  azure:   { base: '#4A7FA5', light: '#9BC4DE', dark: '#2C5170', cap: '#16262F' },
  emerald: { base: '#4A7C59', light: '#9BC7A6', dark: '#2C4E36', cap: '#16281C' },
  noir:    { base: '#3A3A3A', light: '#7A7A7A', dark: '#1A1A1A', cap: '#0A0A0A' },
  ivory:   { base: '#D9CDB8', light: '#F2EADB', dark: '#A8967A', cap: '#4A4034' },
  citrus:  { base: '#D4A017', light: '#F0D278', dark: '#8F6B0F', cap: '#3A2E10' },
  plum:    { base: '#7A4A6B', light: '#B98CAC', dark: '#4E2C44', cap: '#2A1826' },
};

/** Mahsulot turi — silueti shunga qarab o'zgaradi. */
export type ShapeKind =
  | 'flacon'    // klassik atir flakoni
  | 'tall'      // baland/ingichka (EDT, body mist)
  | 'candle'    // sham banka
  | 'diffuser'  // tayoqchali diffuzor
  | 'tube'      // dush geli / tuba
  | 'bar'       // sovun
  | 'box'       // sovg'a to'plami
  | 'car';      // avtomobil aromasi

interface RenderOptions {
  brand: string;
  name: string;
  volume: string;
  palette: Palette;
  shape: ShapeKind;
  /** 'front' — mahsulot to'liq; 'detail' — yaqindan, hover uchun. */
  view: 'front' | 'detail';
}

/** XML ichida matn xavfsiz bo'lishi uchun. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function bottleShape(shape: ShapeKind, id: string): string {
  switch (shape) {
    case 'flacon':
      return `
        <rect x="150" y="230" width="200" height="240" rx="16" fill="url(#g${id})" stroke="url(#e${id})" stroke-width="2"/>
        <rect x="215" y="196" width="70" height="40" fill="url(#e${id})" opacity="0.85"/>
        <rect x="205" y="150" width="90" height="52" rx="6" fill="url(#c${id})"/>
        <rect x="176" y="300" width="148" height="112" rx="6" fill="#FFFFFF" opacity="0.14"/>`;
    case 'tall':
      return `
        <rect x="182" y="180" width="136" height="300" rx="14" fill="url(#g${id})" stroke="url(#e${id})" stroke-width="2"/>
        <rect x="228" y="146" width="44" height="38" fill="url(#e${id})" opacity="0.85"/>
        <rect x="216" y="104" width="68" height="46" rx="8" fill="url(#c${id})"/>
        <rect x="202" y="250" width="96" height="150" rx="6" fill="#FFFFFF" opacity="0.14"/>`;
    case 'candle':
      return `
        <rect x="158" y="250" width="184" height="210" rx="12" fill="url(#g${id})" stroke="url(#e${id})" stroke-width="2"/>
        <ellipse cx="250" cy="250" rx="92" ry="20" fill="url(#e${id})" opacity="0.6"/>
        <ellipse cx="250" cy="252" rx="74" ry="14" fill="#F5EFE3" opacity="0.85"/>
        <rect x="247" y="214" width="6" height="38" rx="3" fill="${PALETTES.noir.cap}"/>
        <path d="M250 178c14 18 20 28 20 38a20 20 0 0 1-40 0c0-10 6-20 20-38z" fill="#F5C97B" opacity="0.9"/>`;
    case 'diffuser':
      return `
        <path d="M186 300h128l14 150a16 16 0 0 1-16 18H188a16 16 0 0 1-16-18z" fill="url(#g${id})" stroke="url(#e${id})" stroke-width="2"/>
        <rect x="222" y="262" width="56" height="42" fill="url(#e${id})" opacity="0.8"/>
        <g stroke="url(#c${id})" stroke-width="7" stroke-linecap="round" opacity="0.9">
          <line x1="236" y1="268" x2="200" y2="120"/>
          <line x1="250" y1="266" x2="252" y2="104"/>
          <line x1="264" y1="268" x2="300" y2="126"/>
        </g>`;
    case 'tube':
      return `
        <rect x="196" y="168" width="108" height="300" rx="26" fill="url(#g${id})" stroke="url(#e${id})" stroke-width="2"/>
        <rect x="196" y="168" width="108" height="22" rx="10" fill="url(#e${id})" opacity="0.7"/>
        <rect x="220" y="126" width="60" height="46" rx="10" fill="url(#c${id})"/>
        <rect x="214" y="240" width="72" height="160" rx="6" fill="#FFFFFF" opacity="0.14"/>`;
    case 'bar':
      return `
        <rect x="140" y="250" width="220" height="150" rx="34" fill="url(#g${id})" stroke="url(#e${id})" stroke-width="2"/>
        <rect x="140" y="250" width="220" height="46" rx="24" fill="#FFFFFF" opacity="0.16"/>
        <circle cx="250" cy="326" r="42" fill="none" stroke="url(#c${id})" stroke-width="3" opacity="0.7"/>`;
    case 'box':
      return `
        <rect x="132" y="252" width="236" height="196" rx="10" fill="url(#g${id})" stroke="url(#e${id})" stroke-width="2"/>
        <rect x="132" y="252" width="236" height="44" rx="8" fill="url(#e${id})" opacity="0.75"/>
        <rect x="236" y="252" width="28" height="196" fill="url(#c${id})" opacity="0.55"/>
        <path d="M250 252c-26-34-58-40-70-24-10 14 6 24 70 24zm0 0c26-34 58-40 70-24 10 14-6 24-70 24z" fill="url(#c${id})" opacity="0.8"/>`;
    case 'car':
      return `
        <path d="M250 150l86 62v128l-86 62-86-62V212z" fill="url(#g${id})" stroke="url(#e${id})" stroke-width="2"/>
        <path d="M250 200l50 36v76l-50 36-50-36v-76z" fill="#FFFFFF" opacity="0.16"/>
        <line x1="250" y1="150" x2="250" y2="96" stroke="url(#c${id})" stroke-width="5" stroke-linecap="round"/>
        <circle cx="250" cy="92" r="12" fill="none" stroke="url(#c${id})" stroke-width="5"/>`;
  }
}

function render(options: RenderOptions): string {
  const p = PALETTES[options.palette];
  const id = Math.random().toString(36).slice(2, 8);
  const isDetail = options.view === 'detail';

  // "Detail" kadri — yaqindan olingan, boshqa fon va burchak. Shu tufayli
  // kartochkadagi hover almashuvi haqiqiy o'zgarishga o'xshaydi.
  const scale = isDetail ? 1.28 : 1;
  const rotate = isDetail ? -7 : 0;
  const backdrop = isDetail ? p.dark : '#FFFDF9';
  const textColor = isDetail ? '#F5EFE3' : '#2A2620';
  const subText = isDetail ? p.light : '#8A837A';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 620" width="500" height="620" role="img" aria-label="${escapeXml(options.brand)} ${escapeXml(options.name)}">
  <defs>
    <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.light}"/>
      <stop offset="52%" stop-color="${p.base}"/>
      <stop offset="100%" stop-color="${p.dark}"/>
    </linearGradient>
    <linearGradient id="e${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p.light}"/>
      <stop offset="100%" stop-color="${p.base}"/>
    </linearGradient>
    <linearGradient id="c${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#D4A852"/>
      <stop offset="100%" stop-color="${p.cap}"/>
    </linearGradient>
    <radialGradient id="bg${id}" cx="50%" cy="42%" r="62%">
      <stop offset="0%" stop-color="${isDetail ? p.base : '#FFFFFF'}" stop-opacity="${isDetail ? 0.45 : 1}"/>
      <stop offset="100%" stop-color="${backdrop}"/>
    </radialGradient>
  </defs>

  <rect width="500" height="620" fill="url(#bg${id})"/>

  <ellipse cx="250" cy="486" rx="118" ry="16" fill="#000000" opacity="${isDetail ? 0.28 : 0.1}"/>

  <g transform="translate(250 330) rotate(${rotate}) scale(${scale}) translate(-250 -330)">
    ${bottleShape(options.shape, id)}
  </g>

  <text x="250" y="546" text-anchor="middle" font-family="Georgia, serif" font-size="15"
        letter-spacing="4" fill="${subText}">${escapeXml(options.brand.toUpperCase())}</text>
  <text x="250" y="574" text-anchor="middle" font-family="Georgia, serif" font-size="21"
        fill="${textColor}">${escapeXml(options.name.slice(0, 34))}</text>
  <text x="250" y="598" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="12"
        letter-spacing="2" fill="${subText}">${escapeXml(options.volume)}</text>
</svg>`;
}

export interface GeneratedImages {
  primary: string;
  hover: string;
}

/**
 * Mahsulot uchun ikkita rasm yaratadi va nisbiy URL larni qaytaradi.
 * Fayl nomi slug asosida — takroriy seed bir xil natija beradi.
 */
export function generateProductImages(input: {
  slug: string;
  brand: string;
  name: string;
  volume: string;
  palette: Palette;
  shape: ShapeKind;
}): GeneratedImages {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const primaryFile = `${input.slug}-1.svg`;
  const hoverFile = `${input.slug}-2.svg`;

  fs.writeFileSync(
    path.join(OUTPUT_DIR, primaryFile),
    render({ ...input, view: 'front' }),
    'utf8',
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, hoverFile),
    render({ ...input, view: 'detail' }),
    'utf8',
  );

  return {
    primary: `uploads/products/${primaryFile}`,
    hover: `uploads/products/${hoverFile}`,
  };
}

/** Kategoriya kartochkasi uchun kengroq kadr. */
export function generateCategoryImage(input: {
  slug: string;
  title: string;
  palette: Palette;
  shape: ShapeKind;
}): string {
  const dir = path.join(process.cwd(), 'uploads', 'categories');
  fs.mkdirSync(dir, { recursive: true });

  const p = PALETTES[input.palette];
  const id = Math.random().toString(36).slice(2, 8);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000" role="img" aria-label="${escapeXml(input.title)}">
  <defs>
    <linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.light}"/>
      <stop offset="52%" stop-color="${p.base}"/>
      <stop offset="100%" stop-color="${p.dark}"/>
    </linearGradient>
    <linearGradient id="e${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${p.light}"/>
      <stop offset="100%" stop-color="${p.base}"/>
    </linearGradient>
    <linearGradient id="c${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#D4A852"/>
      <stop offset="100%" stop-color="${p.cap}"/>
    </linearGradient>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFFDF9"/>
      <stop offset="100%" stop-color="${p.light}" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#bg${id})"/>
  <ellipse cx="400" cy="760" rx="180" ry="24" fill="#000000" opacity="0.1"/>
  <g transform="translate(400 520) scale(1.5) translate(-250 -330)">
    ${bottleShape(input.shape, id)}
  </g>
  <text x="400" y="880" text-anchor="middle" font-family="Georgia, serif" font-size="42"
        fill="#2A2620">${escapeXml(input.title)}</text>
</svg>`;

  const file = `${input.slug}.svg`;
  fs.writeFileSync(path.join(dir, file), svg, 'utf8');

  return `uploads/categories/${file}`;
}

/** Bosh sahifadagi hero slaydlari uchun keng kadr. */
export function generateBannerImage(input: {
  slug: string;
  title: string;
  subtitle: string;
  palette: Palette;
}): string {
  const dir = path.join(process.cwd(), 'uploads', 'banners');
  fs.mkdirSync(dir, { recursive: true });

  const p = PALETTES[input.palette];
  const id = Math.random().toString(36).slice(2, 8);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 900" width="1920" height="900" role="img" aria-label="${escapeXml(input.title)}">
  <defs>
    <linearGradient id="bg${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${p.dark}"/>
      <stop offset="55%" stop-color="${p.base}"/>
      <stop offset="100%" stop-color="${p.light}"/>
    </linearGradient>
    <radialGradient id="glow${id}" cx="72%" cy="42%" r="46%">
      <stop offset="0%" stop-color="#F5E3BC" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1920" height="900" fill="url(#bg${id})"/>
  <rect width="1920" height="900" fill="url(#glow${id})"/>
  <g opacity="0.16" stroke="#F5E3BC" stroke-width="1.5" fill="none">
    <circle cx="1400" cy="450" r="220"/>
    <circle cx="1400" cy="450" r="300"/>
    <circle cx="1400" cy="450" r="380"/>
  </g>
  <text x="150" y="404" font-family="Helvetica, Arial, sans-serif" font-size="22"
        letter-spacing="10" fill="#E8D3A8">ZAHABI PARFUME</text>
  <text x="150" y="500" font-family="Georgia, serif" font-size="76"
        fill="#FFFDF9">${escapeXml(input.title)}</text>
  <text x="150" y="560" font-family="Helvetica, Arial, sans-serif" font-size="26"
        fill="#EFE3CC" opacity="0.92">${escapeXml(input.subtitle)}</text>
</svg>`;

  // PNG formatidagi custom rasm mavjud bo'lsa, uni ishlatamiz (seed o'chirmaydi)
  const pngFile = `${input.slug}.png`;
  if (fs.existsSync(path.join(dir, pngFile))) {
    return `uploads/banners/${pngFile}`;
  }

  const file = `${input.slug}.svg`;
  fs.writeFileSync(path.join(dir, file), svg, 'utf8');

  return `uploads/banners/${file}`;
}

/** Brend logotipi — matn asosidagi sodda belgi. */
export function generateBrandLogo(input: { slug: string; name: string }): string {
  const dir = path.join(process.cwd(), 'uploads', 'brands');
  fs.mkdirSync(dir, { recursive: true });

  const initials = input.name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160" width="320" height="160" role="img" aria-label="${escapeXml(input.name)}">
  <rect width="320" height="160" fill="none"/>
  <text x="160" y="72" text-anchor="middle" font-family="Georgia, serif" font-size="46"
        letter-spacing="6" fill="#B88A3B">${escapeXml(initials)}</text>
  <line x1="110" y1="90" x2="210" y2="90" stroke="#B88A3B" stroke-width="1.5" opacity="0.6"/>
  <text x="160" y="120" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="15"
        letter-spacing="3" fill="#69645D">${escapeXml(input.name.toUpperCase().slice(0, 26))}</text>
</svg>`;

  const file = `${input.slug}.svg`;
  fs.writeFileSync(path.join(dir, file), svg, 'utf8');

  return `uploads/brands/${file}`;
}

/** Seed qayta ishga tushganda papkalarni yaratadi. SVG fayllar o'chirilmaydi —
 *  foydalanuvchi o'zgartirgan custom SVGlar saqlanib qoladi. */
export function clearGeneratedImages(): void {
  for (const sub of ['products', 'categories', 'banners', 'brands']) {
    fs.mkdirSync(path.join(process.cwd(), 'uploads', sub), { recursive: true });
  }
}
