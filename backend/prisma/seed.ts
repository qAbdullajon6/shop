/**
 * Zahabi Parfume — Development / Staging seed
 *
 * Categories: 12 | Brands: 36 | Products: 150+
 * Includes test users, delivered orders, and APPROVED/PENDING reviews so the
 * verified-purchase review flow can be tested end-to-end without a real
 * purchase cycle.
 *
 * ─── ENVIRONMENTS ────────────────────────────────────────────────────────────
 *
 *  development  npm run seed
 *               Full destructive reset, then fresh demo data.
 *               SEED_ADMIN_PASSWORD defaults to a clearly-dev value if unset.
 *
 *  staging      SEED_ALLOW_DESTRUCTIVE=true npm run seed
 *               Same as development but the DATABASE_URL points to a remote
 *               server, so the explicit opt-in flag is required.
 *               SEED_ADMIN_PASSWORD must be set.
 *
 *  production   NOT SUPPORTED. The seed aborts immediately if
 *               NODE_ENV=production is detected.
 *
 * ─── REQUIRED ENV VARS ───────────────────────────────────────────────────────
 *
 *  DATABASE_URL          PostgreSQL connection string
 *  SEED_ADMIN_PASSWORD   Admin account password (required unless NODE_ENV=development)
 *
 * ─── OPTIONAL ENV VARS ───────────────────────────────────────────────────────
 *
 *  SEED_ALLOW_DESTRUCTIVE=true   Required when DATABASE_URL is non-localhost
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

import {
  OrderSource,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  PrismaClient,
  ReviewStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { CATEGORIES, BRANDS, PRODUCTS } from './seed/catalog.data';
import {
  clearGeneratedImages,
  generateBannerImage,
  generateBrandLogo,
  generateCategoryImage,
  generateProductImages,
} from './seed/images';

dotenv.config();

// ─── Production safety ────────────────────────────────────────────────────────

/**
 * Aborts the process if a production or non-local database is detected.
 * Called BEFORE any destructive operation — including the Pool constructor.
 */
function assertSeedSafe(): void {
  const nodeEnv = (process.env.NODE_ENV ?? 'development').toLowerCase();

  if (nodeEnv === 'production') {
    console.error(
      '\n' +
      'FATAL: seed refused — NODE_ENV=production.\n' +
      'This command DESTROYS ALL DATA. It must never run against a production database.\n',
    );
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL ?? '';
  const isLocal =
    dbUrl === '' ||
    /localhost|127\.0\.0\.1|::1/.test(dbUrl) ||
    dbUrl.startsWith('file:');

  if (!isLocal && process.env.SEED_ALLOW_DESTRUCTIVE !== 'true') {
    console.error(
      '\n' +
      'FATAL: seed refused — DATABASE_URL points to a non-local server.\n' +
      'Running this seed will DESTROY ALL DATA on that database.\n' +
      'If you are absolutely sure this is a disposable non-production database,\n' +
      'set SEED_ALLOW_DESTRUCTIVE=true in your environment and retry.\n' +
      'NEVER set SEED_ALLOW_DESTRUCTIVE=true in production.\n',
    );
    process.exit(1);
  }
}

/**
 * Returns the bcrypt-hashed admin password.
 * Reads SEED_ADMIN_PASSWORD from env. Falls back to a clearly-dev-only value
 * only when NODE_ENV=development (never silently in staging/production).
 */
async function resolveAdminPassword(nodeEnv: string): Promise<{ hash: string; plain: string }> {
  const raw = process.env.SEED_ADMIN_PASSWORD;

  if (raw && raw.length >= 8) {
    return { hash: await bcrypt.hash(raw, 10), plain: raw };
  }

  if (nodeEnv !== 'development' && nodeEnv !== 'test') {
    console.error(
      '\n' +
      'FATAL: SEED_ADMIN_PASSWORD is required for non-development seeds.\n' +
      'Set it: SEED_ADMIN_PASSWORD="<strong_password>" npm run seed\n',
    );
    process.exit(1);
  }

  // Development-only default — obviously not a real credential.
  const devDefault = 'dev-seed-only!2026';
  console.warn(
    '\nWARNING: SEED_ADMIN_PASSWORD not set.\n' +
    '  Using dev-only default: ' + devDefault + '\n' +
    '  Set SEED_ADMIN_PASSWORD=<strong_password> to override.\n',
  );
  return { hash: await bcrypt.hash(devDefault, 10), plain: devDefault };
}

// ─────────────────────────────────────────────────────────────────────────────

// assertSeedSafe must run before we open the connection pool.
assertSeedSafe();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient(
  { adapter } as ConstructorParameters<typeof PrismaClient>[0],
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

let orderSeq = 1;

function makeOrderNumber(date: Date): string {
  const y = String(date.getFullYear()).slice(2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `ZP-${y}${m}${d}-${String(orderSeq++).padStart(4, '0')}`;
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 86_400_000);
}

// ─── Static data ─────────────────────────────────────────────────────────────

const TEST_USERS = [
  { phone_number: '+998901234567', name: 'Alisher', last_name: 'Yusupov', email: 'alisher@demo.uz', city: 'Toshkent',  street: "Navoiy ko'chasi 12" },
  { phone_number: '+998907654321', name: 'Malika',  last_name: 'Rahimova', email: 'malika@demo.uz',  city: 'Samarqand', street: "Registon ko'chasi 5" },
  { phone_number: '+998901112233', name: 'Bobur',   last_name: 'Komilov',  email: 'bobur@demo.uz',  city: 'Toshkent',  street: 'Chilonzor 7-mavze' },
] as const;

/** One order per user; each order has 2 items. Indices map 1-to-1 to reviewSeeds. */
const DEMO_ORDER_LINES: Array<Array<[slug: string, sku: string]>> = [
  // User 0 — Alisher
  [['dior-sauvage-edp', 'ZP-DIOR-SAU-100'], ['creed-aventus', 'ZP-CREED-AVE-50']],
  // User 1 — Malika
  [['chanel-coco-mademoiselle-edp', 'ZP-CH-CCM-100'], ['ysl-libre-edp', 'ZP-YSL-LIB-90']],
  // User 2 — Bobur
  [['tom-ford-oud-wood', 'ZP-TF-OUD-50'], ['bleu-de-chanel-edp', 'ZP-CH-BDC-100']],
];

const BANNERS = [
  { slug: 'hero-yangi-kelganlar', title_uz: 'Yangi Kolleksiya',       subtitle_uz: '2026 — sharqona hidlar yangi nafasda',             title_ru: 'Новая Коллекция',    subtitle_ru: '2026 — восточные ароматы в новом дыхании',              palette: 'amber' as const, link: '/products?is_new_arrival=true',  sort_order: 1 },
  { slug: 'hero-bestseller',       title_uz: "Eng Ko'p Sotilganlar",  subtitle_uz: "Dunyoning eng mashhur atirlarini kashf eting",      title_ru: 'Хиты продаж',        subtitle_ru: 'Откройте для себя самые популярные ароматы мира',       palette: 'noir' as const,  link: '/products?is_bestseller=true',   sort_order: 2 },
  { slug: 'hero-sovga-qutilari',   title_uz: "Sovg'a Qutilari",       subtitle_uz: "Yaqinlaringizga xushbo'y sovg'a",                  title_ru: 'Подарочные наборы',  subtitle_ru: 'Ароматные подарки для близких',                          palette: 'rose' as const,  link: '/categories/gift-box',           sort_order: 3 },
];

// ─── Destructive clear ────────────────────────────────────────────────────────

async function clearAll(): Promise<void> {
  // Delete in FK-dependency order. Cascade-deletes handle deeper children,
  // but some relations are SET NULL (not Cascade) so we delete leaves first.
  await prisma.reviewVote.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.orderStatusEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.couponUse.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.stockTransaction.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.productView.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.categoryAttribute.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationCode.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const nodeEnv = (process.env.NODE_ENV ?? 'development').toLowerCase();

  console.log('\nZahabi Parfume — demo seed');
  console.log(`environment : ${nodeEnv}`);
  console.log(`database    : ${(process.env.DATABASE_URL ?? '').replace(/:[^@]+@/, ':***@')}\n`);

  const adminCreds = await resolveAdminPassword(nodeEnv);

  // ── 0. Clear ────────────────────────────────────────────────────────────────
  process.stdout.write('Clearing all tables... ');
  await clearAll();
  console.log('done');

  process.stdout.write('Clearing generated SVG placeholders... ');
  clearGeneratedImages();  // Only removes *.svg — real uploaded photos untouched
  console.log('done\n');

  // ── 1. Categories ───────────────────────────────────────────────────────────
  console.log(`Creating ${CATEGORIES.length} categories...`);
  const catMap = new Map<string, string>(); // slug → id

  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    const img = generateCategoryImage({ slug: cat.slug, title: cat.name_uz, palette: cat.palette, shape: cat.shape });

    const { id } = await prisma.category.create({
      data: {
        slug:           cat.slug,
        name_uz:        cat.name_uz,
        name_ru:        cat.name_ru,
        name_en:        cat.name_en,
        description_uz: cat.desc_uz,
        is_active:      true,
        is_featured:    cat.featured ?? false,
        sort_order:     i + 1,
        image_uz:       img,
        image_ru:       img,
        image_en:       img,
      },
    });
    catMap.set(cat.slug, id);
    console.log(`  [${i + 1}/${CATEGORIES.length}] ${cat.slug}`);
  }
  console.log();

  // ── 2. Brands ───────────────────────────────────────────────────────────────
  console.log(`Creating ${BRANDS.length} brands...`);
  const brandMap = new Map<string, string>(); // slug → id

  for (let i = 0; i < BRANDS.length; i++) {
    const brand = BRANDS[i];
    const logo = generateBrandLogo({ slug: brand.slug, name: brand.name });

    const { id } = await prisma.brand.create({
      data: {
        name:        brand.name,
        slug:        brand.slug,
        logo,
        country:     brand.country,
        is_featured: brand.featured ?? false,
        is_active:   true,
        sort_order:  i + 1,
      },
    });
    brandMap.set(brand.slug, id);
  }
  console.log(`  created ${BRANDS.length} brands\n`);

  // ── 3. Products ─────────────────────────────────────────────────────────────
  console.log(`Creating ${PRODUCTS.length} products...`);

  type VariantRef = {
    variantId:   string;
    productId:   string;
    productSlug: string;
    productName: string;
    sku:         string;
    volume:      string;
    price:       number;
    imgUrl:      string;
  };

  const variantBySku = new Map<string, VariantRef>();
  const NOW = Date.now();
  let skipped = 0;

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const catId   = catMap.get(p.category);
    const brandId = brandMap.get(p.brand);

    if (!catId)   { console.warn(`  SKIP (unknown category "${p.category}"): ${p.slug}`); skipped++; continue; }
    if (!brandId) { console.warn(`  SKIP (unknown brand "${p.brand}"): ${p.slug}`);       skipped++; continue; }
    if (p.variants.length === 0) { console.warn(`  SKIP (no variants): ${p.slug}`);       skipped++; continue; }

    // Denormalized fields computed from variants so they are consistent on first load
    // without waiting for the maintenance cron.
    const minPrice   = Math.min(...p.variants.map(v => v.price));
    const maxPrice   = Math.max(...p.variants.map(v => v.price));
    const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);

    // First 30 products are "new arrivals"; older ones spread across 6 months.
    const isNew     = i < 30;
    const createdAt = new Date(NOW - (isNew ? i * 3 : 90 + (i - 30) * 10) * 86_400_000);

    const images = generateProductImages({
      slug:    p.slug,
      brand:   p.brand,
      name:    p.name,
      volume:  p.variants[0].volume,
      palette: p.palette,
      shape:   p.shape,
    });

    const product = await prisma.product.create({
      data: {
        slug:           p.slug,
        name_uz:        p.name,
        name_ru:        p.name_ru ?? p.name,
        name_en:        p.name,
        short_uz:       p.short,
        short_ru:       p.short,
        short_en:       p.short,
        description_uz: p.description,
        description_ru: p.description,
        description_en: p.description,
        category_id:    catId,
        brand_id:       brandId,
        gender:         p.gender,
        concentration:  p.concentration,
        top_notes:      p.top    ?? [],
        heart_notes:    p.heart  ?? [],
        base_notes:     p.base   ?? [],
        longevity:      p.longevity ?? null,
        sillage:        p.sillage   ?? null,
        country:        p.country   ?? null,
        release_year:   p.year      ?? null,
        is_active:      true,
        is_bestseller:  p.bestseller ?? false,
        is_new_arrival: isNew,
        is_featured:    p.featured   ?? false,
        min_price:      minPrice,
        max_price:      maxPrice,
        total_stock:    totalStock,
        created_at:     createdAt,
      },
    });

    // Two product-level images (not variant-specific): front view + hover/detail.
    await prisma.productImage.createMany({
      data: [
        { product_id: product.id, url: images.primary, alt: p.name,                is_primary: true,  sort_order: 0 },
        { product_id: product.id, url: images.hover,   alt: `${p.name} — detail`, is_primary: false, sort_order: 1 },
      ],
    });

    for (let vi = 0; vi < p.variants.length; vi++) {
      const v = p.variants[vi];

      const variant = await prisma.productVariant.create({
        data: {
          product_id:       product.id,
          sku:              v.sku,
          volume:           v.volume,
          price:            v.price,
          compare_at_price: v.compare ?? null,
          cost_price:       v.cost,
          stock:            v.stock,
          is_active:        true,
          is_default:       vi === 0,
          sort_order:       vi,
        },
      });

      variantBySku.set(v.sku, {
        variantId:   variant.id,
        productId:   product.id,
        productSlug: p.slug,
        productName: p.name,
        sku:         v.sku,
        volume:      v.volume,
        price:       v.price,
        imgUrl:      images.primary,
      });
    }

    if ((i + 1) % 25 === 0 || i === PRODUCTS.length - 1) {
      process.stdout.write(`  ${i + 1 - skipped}/${PRODUCTS.length - skipped} created (${i + 1} processed)\n`);
    }
  }
  console.log();

  // ── 4. Admin + test customers ────────────────────────────────────────────────
  console.log('Creating users...');

  const admin = await prisma.user.create({
    data: {
      phone_number: process.env.SEED_ADMIN_PHONE ?? '+998900000001',
      name:         'Admin',
      last_name:    'Zahabi',
      email:        process.env.SEED_ADMIN_EMAIL ?? 'admin@zahabi.uz',
      password:     adminCreds.hash,
      // Birlamchi do'kon egasi — to'liq huquqli SUPER_ADMIN (foydalanuvchilarni
      // va boshqa adminlarni boshqara oladi). Oddiy ADMIN'lar keyin qo'shiladi.
      role:         'SUPER_ADMIN',
      is_active:    true,
    },
  });

  type TestUserRow = { id: string; addressId: string; phone: string; name: string; lastName: string; city: string; street: string };
  const testUsers: TestUserRow[] = [];

  for (const tu of TEST_USERS) {
    const user = await prisma.user.create({
      data: {
        phone_number: tu.phone_number,
        name:         tu.name,
        last_name:    tu.last_name,
        email:        tu.email,
        is_active:    true,
      },
    });
    const addr = await prisma.address.create({
      data: { user_id: user.id, city: tu.city, street: tu.street, is_default: true },
    });
    testUsers.push({
      id:        user.id,
      addressId: addr.id,
      phone:     tu.phone_number,
      name:      tu.name,
      lastName:  tu.last_name,
      city:      tu.city,
      street:    tu.street,
    });
  }

  console.log(`  admin : ${admin.id}`);
  console.log(`  users : ${testUsers.length} customers with addresses\n`);

  // ── 5. Delivered orders ──────────────────────────────────────────────────────
  console.log('Creating delivered orders (one per user, two items each)...');

  // Track items with their actual owner so reviews can be correctly attributed.
  type DeliveredItem = { orderItemId: string; variantRef: VariantRef; userId: string };
  const deliveredItems: DeliveredItem[] = [];

  for (let u = 0; u < testUsers.length; u++) {
    const tu   = testUsers[u];
    const lines = DEMO_ORDER_LINES[u];

    if (!lines || lines.length === 0) continue;

    const variantRefs: VariantRef[] = lines
      .map(([, sku]) => variantBySku.get(sku))
      .filter((v): v is VariantRef => {
        if (!v) console.warn(`  WARN: SKU not found, skipping order line`);
        return v !== undefined;
      });

    if (variantRefs.length === 0) continue;

    const subtotal   = variantRefs.reduce((s, l) => s + l.price, 0);
    const orderDate  = daysAgo(30 + u * 7);
    const orderNum   = makeOrderNumber(orderDate);

    const order = await prisma.order.create({
      data: {
        order_number:    orderNum,
        user_id:         tu.id,
        address_id:      tu.addressId,
        source:          OrderSource.WEB,
        status:          OrderStatus.DELIVERED,
        payment_status:  PaymentStatus.PAID,
        payment_method:  PaymentMethod.CASH,
        customer_name:   `${tu.name} ${tu.lastName}`,
        customer_phone:  tu.phone,
        ship_city:       tu.city,
        ship_street:     tu.street,
        subtotal_amount: subtotal,
        discount_amount: 0,
        shipping_fee:    30_000,
        total_amount:    subtotal + 30_000,
        confirmed_at:    new Date(orderDate.getTime() +       3_600_000),
        delivered_at:    new Date(orderDate.getTime() + 3 * 86_400_000),
        created_at:      orderDate,

        items: {
          create: variantRefs.map(l => ({
            variant_id:     l.variantId,
            product_id:     l.productId,
            product_name:   l.productName,
            product_slug:   l.productSlug,
            variant_sku:    l.sku,
            variant_volume: l.volume,
            image_url:      l.imgUrl,
            quantity:       1,
            unit_price:     l.price,
            unit_cost:      Math.round(l.price * 0.4),
            line_total:     l.price,
          })),
        },

        // Full transition chain matching ORDER_TRANSITIONS in order-state-machine.ts:
        // PENDING → CONFIRMED → PROCESSING → READY_FOR_DELIVERY → OUT_FOR_DELIVERY → DELIVERED
        status_events: {
          create: [
            { from_status: null,                              to_status: OrderStatus.PENDING,              note: 'Buyurtma yaratildi',  created_at: orderDate },
            { from_status: OrderStatus.PENDING,              to_status: OrderStatus.CONFIRMED,            note: 'Tasdiqlandi',         created_at: new Date(orderDate.getTime() +       3_600_000) },
            { from_status: OrderStatus.CONFIRMED,            to_status: OrderStatus.PROCESSING,           note: 'Tayyorlanmoqda',      created_at: new Date(orderDate.getTime() +  24 * 3_600_000) },
            { from_status: OrderStatus.PROCESSING,           to_status: OrderStatus.READY_FOR_DELIVERY,  note: 'Yetkazishga tayyor',  created_at: new Date(orderDate.getTime() +  36 * 3_600_000) },
            { from_status: OrderStatus.READY_FOR_DELIVERY,  to_status: OrderStatus.OUT_FOR_DELIVERY,     note: "Yo'lda",              created_at: new Date(orderDate.getTime() + 2 * 86_400_000) },
            { from_status: OrderStatus.OUT_FOR_DELIVERY,    to_status: OrderStatus.DELIVERED,            note: 'Yetkazildi',          created_at: new Date(orderDate.getTime() + 3 * 86_400_000) },
          ],
        },
      },
      include: { items: { select: { id: true, variant_id: true } } },
    });

    for (const item of order.items) {
      const ref = variantRefs.find(l => l.variantId === item.variant_id);
      if (ref) deliveredItems.push({ orderItemId: item.id, variantRef: ref, userId: tu.id });
    }

    // Increment sold_count on each product (matches onDelivered() in orders.service.ts)
    for (const ref of variantRefs) {
      await prisma.product.update({
        where: { id: ref.productId },
        data:  { sold_count: { increment: 1 } },
      });
    }

    console.log(`  order ${orderNum} — ${tu.name} (${variantRefs.length} items)`);
  }
  console.log();

  // ── 6. Reviews ──────────────────────────────────────────────────────────────
  console.log('Creating reviews...');

  /**
   * Each entry maps to deliveredItems[itemIdx].
   * userId is taken from the item's actual owner (deliveredItems[i].userId)
   * to satisfy the foreign-key + DB CHECK on is_verified/order_item_id.
   */
  const REVIEW_SEEDS: Array<{
    itemIdx:          number;
    rating:           number;
    title:            string;
    comment:          string;
    status:           ReviewStatus;
    ratingLongevity?: number;
    ratingQuality?:   number;
    ratingValue?:     number;
  }> = [
    // User 0 — Alisher (items 0 = Dior Sauvage, 1 = Creed Aventus)
    { itemIdx: 0, rating: 5, status: ReviewStatus.APPROVED, title: 'Ajoyib!',           comment: "Bir hafta bo'ldi kiyib yuraman — hid hali ham bor. Sillaj kuchli, lekin juda ortiqcha emas.",           ratingLongevity: 5, ratingQuality: 5, ratingValue: 4 },
    { itemIdx: 1, rating: 5, status: ReviewStatus.APPROVED, title: 'Legendar atir',     comment: "Creed Aventus haqida eshitgan edim, endi o'zim ham egasi bo'ldim. Ananas va tutun — klassik kombinatsiya.", ratingLongevity: 5, ratingQuality: 5, ratingValue: 3 },
    // User 1 — Malika (items 2 = Chanel CCM, 3 = YSL Libre)
    { itemIdx: 2, rating: 4, status: ReviewStatus.APPROVED, title: 'Chanel sifati',     comment: "Coco Mademoiselle — klassik, zamonaviy ayol uchun. Apelsin va patchouli — muvozanat yaxshi.",           ratingLongevity: 4, ratingQuality: 4, ratingValue: 4 },
    { itemIdx: 3, rating: 5, status: ReviewStatus.APPROVED, title: 'Eng yaxshi tanlov', comment: "YSL Libre — ofisda ham, kechki uchrashuvda ham o'rinli. Shisha ham juda chiroyli.",                       ratingLongevity: 4, ratingQuality: 5, ratingValue: 5 },
    // User 2 — Bobur (items 4 = TF Oud Wood, 5 = Bleu de Chanel) — PENDING (awaiting moderation)
    { itemIdx: 4, rating: 4, status: ReviewStatus.PENDING,  title: 'Oud Wood — yoqdi', comment: "Odatda oud og'ir bo'ladi, bu esa yoqimli va yumshoq. Xotinimga ham yoqdi.",                               ratingLongevity: 4, ratingQuality: 5, ratingValue: 4 },
    { itemIdx: 5, rating: 3, status: ReviewStatus.PENDING,  title: 'Yaxshi, lekin...', comment: 'Bleu de Chanel yoqdi, lekin sillaj biroz past. 3-4 soatdan keyin hid kamayganga o\'xshaydi.',             ratingLongevity: 3, ratingQuality: 4, ratingValue: 3 },
  ];

  let reviewCount = 0;

  for (const rs of REVIEW_SEEDS) {
    const item = deliveredItems[rs.itemIdx];
    if (!item) {
      console.warn(`  WARN: deliveredItems[${rs.itemIdx}] missing, skipping review`);
      continue;
    }

    await prisma.review.create({
      data: {
        // userId comes from the actual order owner — not a heuristic.
        user_id:          item.userId,
        product_id:       item.variantRef.productId,
        order_item_id:    item.orderItemId,
        rating:           rs.rating,
        title:            rs.title,
        comment:          rs.comment,
        status:           rs.status,
        is_verified:      true,
        rating_longevity: rs.ratingLongevity ?? null,
        rating_quality:   rs.ratingQuality   ?? null,
        rating_value:     rs.ratingValue     ?? null,
      },
    });
    reviewCount++;

    // Update denormalized rating — mirrors recalculateProductRating() in reviews.service.ts
    // (APPROVED only, Decimal rounded to 2dp to stay consistent with getRatingSummary()).
    if (rs.status === ReviewStatus.APPROVED) {
      const stats = await prisma.review.aggregate({
        where:  { product_id: item.variantRef.productId, status: ReviewStatus.APPROVED },
        _avg:   { rating: true },
        _count: { rating: true },
      });

      await prisma.product.update({
        where: { id: item.variantRef.productId },
        data:  {
          rating_avg:   stats._avg.rating
            ? new Prisma.Decimal(stats._avg.rating).toDecimalPlaces(2)
            : new Prisma.Decimal(0),
          rating_count: stats._count.rating,
        },
      });
    }
  }

  console.log(`  ${reviewCount} reviews (${REVIEW_SEEDS.filter(r => r.status === ReviewStatus.APPROVED).length} APPROVED, ${REVIEW_SEEDS.filter(r => r.status === ReviewStatus.PENDING).length} PENDING)\n`);

  // ── 7. Banners ──────────────────────────────────────────────────────────────
  console.log('Creating banners...');

  for (const b of BANNERS) {
    const img = generateBannerImage({ slug: b.slug, title: b.title_uz, subtitle: b.subtitle_uz, palette: b.palette });
    await prisma.banner.create({
      data: {
        type:        'HERO',
        title_uz:    b.title_uz,
        title_ru:    b.title_ru,
        title_en:    b.title_uz,
        subtitle_uz: b.subtitle_uz,
        subtitle_ru: b.subtitle_ru,
        subtitle_en: b.subtitle_uz,
        image_uz:    img,
        image_ru:    img,
        image_en:    img,
        link:        b.link,
        sort_order:  b.sort_order,
        is_active:   true,
      },
    });
  }

  console.log(`  ${BANNERS.length} banners\n`);

  // ── Summary ─────────────────────────────────────────────────────────────────
  const [
    nCategories, nBrands,   nProducts, nVariants,
    nImages,     nUsers,    nOrders,   nOrderItems,
    nReviews,    nBanners,
  ] = await Promise.all([
    prisma.category.count(),
    prisma.brand.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.productImage.count(),
    prisma.user.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
    prisma.review.count(),
    prisma.banner.count(),
  ]);

  const approvedReviews = REVIEW_SEEDS.filter(r => r.status === ReviewStatus.APPROVED).length;
  const pendingReviews  = REVIEW_SEEDS.filter(r => r.status === ReviewStatus.PENDING).length;

  console.log('Seed complete!\n');
  console.log(`  categories  : ${nCategories}`);
  console.log(`  brands      : ${nBrands}`);
  console.log(`  products    : ${nProducts}`);
  console.log(`  variants    : ${nVariants}`);
  console.log(`  images      : ${nImages}`);
  console.log(`  users       : ${nUsers} (1 admin + ${nUsers - 1} customers)`);
  console.log(`  orders      : ${nOrders} (all DELIVERED)`);
  console.log(`  order items : ${nOrderItems}`);
  console.log(`  reviews     : ${nReviews} (${approvedReviews} APPROVED, ${pendingReviews} PENDING)`);
  console.log(`  banners     : ${nBanners}`);
  console.log();
  console.log(`  Admin phone    : ${admin.phone_number}`);
  console.log(`  Admin password : ${adminCreds.plain}`);
  console.log(`  Test users     : ${testUsers.map(u => u.phone).join(', ')}`);
  console.log(`  Test user auth : OTP via VERIFICATION_CHANNEL=dev driver`);
  console.log();
}

main()
  .catch((e) => {
    console.error('\nSeed FAILED:', e instanceof Error ? e.message : e);
    if (e instanceof Error && e.stack) console.error(e.stack);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
