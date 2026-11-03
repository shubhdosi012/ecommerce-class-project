import { CATEGORIES, type Product } from "./products";

export type CartLine = {
  id: string;
  qty: number;
};

export function isProductArray(value: unknown): value is Product[] {
  return (
    Array.isArray(value) &&
    value.every((entry: unknown) => {
      if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return false;
      const item = entry as Record<string, unknown>;

      return (
        typeof item.id === "string" &&
        item.id.trim().length > 0 &&
        typeof item.name === "string" &&
        item.name.trim().length > 0 &&
        typeof item.category === "string" &&
        CATEGORIES.includes(item.category) &&
        typeof item.price === "number" &&
        Number.isFinite(item.price) &&
        item.price > 0 &&
        typeof item.stock === "number" &&
        Number.isInteger(item.stock) &&
        item.stock >= 0 &&
        typeof item.tagline === "string" &&
        typeof item.description === "string" &&
        typeof item.image === "string"
      );
    })
  );
}

export function isCartArray(value: unknown): value is CartLine[] {
  return (
    Array.isArray(value) &&
    value.every((entry: unknown) => {
      if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return false;
      const item = entry as Record<string, unknown>;
      return (
        typeof item.id === "string" &&
        item.id.trim().length > 0 &&
        typeof item.qty === "number" &&
        Number.isInteger(item.qty) &&
        item.qty > 0
      );
    })
  );
}

/**
 * Keep restored cart data in sync with current products and stock.
 * Duplicate lines are merged and quantities are capped to available stock.
 */
export function normalizeCart(lines: CartLine[], products: Product[]): CartLine[] {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const quantitiesById = new Map<string, number>();

  for (const line of lines) {
    const product = productsById.get(line.id);
    if (!product || product.stock <= 0 || !Number.isInteger(line.qty) || line.qty <= 0) continue;

    const previousQuantity = quantitiesById.get(line.id) ?? 0;
    quantitiesById.set(line.id, Math.min(product.stock, previousQuantity + line.qty));
  }

  return Array.from(quantitiesById, ([id, qty]) => ({ id, qty }));
}
