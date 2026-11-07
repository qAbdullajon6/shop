import { Spinner } from "@/components/ui/Spinner";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types";

interface ProductListProps {
  products: Product[];
  isLoading?: boolean;
  error?: string | null;
}

export function ProductList({ products, isLoading, error }: ProductListProps) {

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="py-20 text-center text-sm text-store-gold">{error}</div>;
  }

  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-store-text-muted">
        Товары не найдены.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
