import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppConfigModule } from './common/config/config.module';
import { JwtAuthGuard } from './common/guards';
import { PrismaModule } from './common/prisma/prisma.module';
import { StorageModule } from './common/storage/storage.module';
import { MaintenanceService } from './common/tasks/maintenance.service';
import { AddressesModule } from './modules/addresses/addresses.module';
import { AuthModule } from './modules/auth/auth.module';
import { BannersModule } from './modules/banners/banners.module';
import { BrandsModule } from './modules/brands/brands.module';
import { CartModule } from './modules/cart/cart.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CategoryAttributesModule } from './modules/category-attributes/category-attributes.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { HealthModule } from './modules/health/health.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProductsModule } from './modules/products/products.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { UsersModule } from './modules/users/users.module';
import { VerificationModule } from './modules/verification/verification.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';

@Module({
  imports: [
    // Konfiguratsiya birinchi — qolgan modullar unga tayanadi.
    AppConfigModule,
    ScheduleModule.forRoot(),

    ThrottlerModule.forRoot([
      // Umumiy chegara. Alohida endpointlar @Throttle bilan qattiqroq
      // cheklanadi (masalan kod yuborish — 3/daqiqa).
      { name: 'default', ttl: 60_000, limit: 100 },
    ]),

    PrismaModule,
    StorageModule,

    AddressesModule,
    AuthModule,
    BannersModule,
    BrandsModule,
    CartModule,
    CategoriesModule,
    CategoryAttributesModule,
    CouponsModule,
    DeliveryModule,
    HealthModule,
    NotificationsModule,
    OrdersModule,
    PaymentsModule,
    ProductsModule,
    ReviewsModule,
    TelegramModule,
    UsersModule,
    VerificationModule,
    WarehouseModule,
    WishlistModule,
  ],
  providers: [
    MaintenanceService,
    // Tartib muhim: avval tezlik cheklovi, keyin autentifikatsiya.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
