import { generateBannerImage, generateBrandLogo, generateCategoryImage, generateProductImages, clearGeneratedImages } from './images';

const CATEGORIES = [
  { slug: 'erkaklar-atiri',  name_uz: 'Erkaklar atiri',   palette: 'amber' as const, shape: 'hexagon' as const },
  { slug: 'ayollar-atiri',   name_uz: "Ayollar atiri",    palette: 'rose'  as const, shape: 'circle'  as const },
  { slug: 'niche-atir',      name_uz: 'Niche atir',       palette: 'noir'  as const, shape: 'diamond' as const },
  { slug: 'body-mist',       name_uz: 'Body Mist',        palette: 'rose'  as const, shape: 'circle'  as const },
  { slug: 'dush-geli',       name_uz: 'Dush geli',        palette: 'amber' as const, shape: 'hexagon' as const },
  { slug: 'xushboy-sovun',   name_uz: "Xushbo'y sovun",   palette: 'rose'  as const, shape: 'circle'  as const },
  { slug: 'shamlar',         name_uz: 'Shamlar',          palette: 'amber' as const, shape: 'hexagon' as const },
  { slug: 'xona-aromalari',  name_uz: 'Xona aromalari',   palette: 'noir'  as const, shape: 'diamond' as const },
  { slug: 'soch-parfum',     name_uz: 'Soch parfumi',     palette: 'rose'  as const, shape: 'circle'  as const },
  { slug: 'avtomobil-aroma', name_uz: 'Avtomobil aroma',  palette: 'noir'  as const, shape: 'diamond' as const },
  { slug: 'gift-box',        name_uz: "Sovg'a qutilari",  palette: 'amber' as const, shape: 'hexagon' as const },
  { slug: 'parfyum-set',     name_uz: 'Parfyum set',      palette: 'rose'  as const, shape: 'circle'  as const },
];

const BRANDS = [
  'ajmal','amouage','armaf','armani','bath-body-works','byredo','carolina-herrera',
  'chanel','creed','dior','diptyque','givenchy','hermes','initio','jo-malone',
  'jpg','lancome','lattafa','le-labo','loccitane','mfk','molton-brown','montblanc',
  'narciso-rodriguez','nishane','pdm','prada','rituals','tom-ford','versace',
  'victoria-secret','xerjoff','yankee-candle','ysl','zahabi',
];

const BANNERS = [
  { slug: 'hero-yangi-kelganlar', title_uz: 'Yangi Kolleksiya',      subtitle_uz: '2026 sharqona hidlar yangi nafasda',           palette: 'amber' as const },
  { slug: 'hero-bestseller',      title_uz: "Eng Ko'p Sotilganlar",  subtitle_uz: 'Dunyoning eng mashhur atirlarini kashf eting', palette: 'noir'  as const },
  { slug: 'hero-sovga-qutilari',  title_uz: "Sovg'a Qutilari",       subtitle_uz: "Yaqinlaringizga xushbo'y sovga",               palette: 'rose'  as const },
];

clearGeneratedImages();

for (const c of CATEGORIES) {
  generateCategoryImage({ slug: c.slug, title: c.name_uz, palette: c.palette, shape: c.shape });
}
console.log(`Categories: ${CATEGORIES.length}`);

for (const slug of BRANDS) {
  generateBrandLogo({ slug, name: slug.replace(/-/g, ' ') });
}
console.log(`Brands: ${BRANDS.length}`);

for (const b of BANNERS) {
  generateBannerImage({ slug: b.slug, title: b.title_uz, subtitle: b.subtitle_uz, palette: b.palette });
}
console.log(`Banners: ${BANNERS.length}`);

console.log('Images generated successfully');
