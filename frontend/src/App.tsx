import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { HomePage } from "@/pages/HomePage";
import { ProductsPage } from "@/pages/ProductsPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { WishlistPage } from "@/pages/WishlistPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AboutPage } from "@/pages/AboutPage";
import { DeliveryPage } from "@/pages/DeliveryPage";
import { WarrantyPage } from "@/pages/WarrantyPage";
import { ContactsPage } from "@/pages/ContactsPage";
import { FaqPage } from "@/pages/FaqPage";
import { PartnershipPage } from "@/pages/PartnershipPage";
import { ProtectedRoute } from "@/components/ui/ProtectedRoute";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import { AdminCategoriesPage } from "@/pages/admin/AdminCategoriesPage";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminReviewsPage } from "@/pages/admin/AdminReviewsPage";
import { AdminBrandsPage } from "@/pages/admin/AdminBrandsPage";
import { AdminBannersPage } from "@/pages/admin/AdminBannersPage";
import { ROUTES } from "@/constants";
import { TopLoader } from "@/components/layout/TopLoader";
import { PhoneAuthModal } from "@/components/features/auth/PhoneAuthModal";
import { TelegramAutoAuth } from "@/components/features/auth/TelegramAutoAuth";
import { TelegramBackButton } from "@/components/features/auth/TelegramBackButton";

function AppRoutes() {
  return (
    <>
      <TopLoader />
      <Routes>
        {/* Auth pages — no layout */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        {/* Main pages — RootLayout (Header + Footer) */}
        <Route element={<RootLayout />}>
          <Route path={ROUTES.HOME} element={<HomePage />} />
          <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path={ROUTES.CART} element={<CartPage />} />
          <Route path={ROUTES.ABOUT} element={<AboutPage />} />
          <Route path={ROUTES.DELIVERY} element={<DeliveryPage />} />
          <Route path={ROUTES.WARRANTY} element={<WarrantyPage />} />
          <Route path={ROUTES.CONTACTS} element={<ContactsPage />} />
          <Route path={ROUTES.FAQ} element={<FaqPage />} />
          <Route path={ROUTES.PARTNERSHIP} element={<PartnershipPage />} />

          {/* Protected routes — login required */}
          <Route
            path={ROUTES.CHECKOUT}
            element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>}
          />
          <Route
            path={ROUTES.PROFILE}
            element={<ProfilePage />}
          />
          <Route
            path={ROUTES.WISHLIST}
            element={<WishlistPage />}
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Admin pages — no RootLayout */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<Navigate to="/admin/orders" replace />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="brands" element={<AdminBrandsPage />} />
          <Route path="banners" element={<AdminBannersPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
        </Route>
      </Routes>
      {/* Auth modal barcha sahifalarda ochilishi kerak (login sahifasi layoutdan tashqarida) */}
      <PhoneAuthModal />
      {/* Telegram Mini App ichida avtomatik kirish (brauzerda no-op) */}
      <TelegramAutoAuth />
      {/* Telegram Mini App native back button — brauzerda no-op */}
      <TelegramBackButton />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
