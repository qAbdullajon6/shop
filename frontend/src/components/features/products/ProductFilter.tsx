import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ProductFilter as FilterType } from "@/types";

interface ProductFilterProps {
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
}

export function ProductFilter({ filters, onFilterChange }: ProductFilterProps) {
  const update = (key: keyof FilterType, value: string | number | undefined) =>
    onFilterChange({ ...filters, [key]: value, page: 1 });

  return (
    <aside className="space-y-5">
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-store-text-muted">
          Поиск
        </h3>
        <Input
          placeholder="Название товара..."
          value={filters.search ?? ""}
          onChange={(e) => update("search", e.target.value || undefined)}
        />
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-store-text-muted">
          Цена
        </h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="От"
            value={filters.min_price ?? ""}
            onChange={(e) => update("min_price", e.target.value ? Number(e.target.value) : undefined)}
          />
          <span className="text-store-text-muted">—</span>
          <Input
            type="number"
            placeholder="До"
            value={filters.max_price ?? ""}
            onChange={(e) => update("max_price", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-store-text-muted">
          Сортировка
        </h3>
        <select
          className="w-full rounded border border-store-border bg-store-input px-3 py-2 text-sm text-store-text focus:outline-none focus:ring-1 focus:ring-store-gold"
          value={filters.sort_by ?? ""}
          onChange={(e) => update("sort_by", (e.target.value as FilterType["sort_by"]) || undefined)}
        >
          <option value="">По умолчанию</option>
          <option value="price_asc">Цена: по возрастанию</option>
          <option value="price_desc">Цена: по убыванию</option>
          <option value="newest">Новинки</option>
          <option value="rating">По рейтингу</option>
        </select>
      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={() => onFilterChange({ page: 1 })}>
        Сбросить
      </Button>
    </aside>
  );
}
