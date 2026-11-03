import { describe, expect, it } from "vitest";

import type { Product } from "@/lib/products";
import { isCartArray, isProductArray, normalizeCart } from "@/lib/storefront";

const product: Product = {
  id: "product-1",
  name: "Sample jacket",
  category: "Outerwear",
  price: 100,
  stock: 3,
  tagline: "Lightweight",
  description: "A sample product for tests.",
  image: "/sample.jpg",
};

describe("saved storefront data", () => {
  it("accepts a valid saved product list", () => {
    expect(isProductArray([product])).toBe(true);
  });

  it("rejects product data with invalid prices or stock", () => {
    expect(isProductArray([{ ...product, price: Number.POSITIVE_INFINITY }])).toBe(false);
    expect(isProductArray([{ ...product, stock: -2 }])).toBe(false);
    expect(isProductArray([{ ...product, category: "Unknown" }])).toBe(false);
  });

  it("validates cart quantities as positive whole numbers", () => {
    expect(isCartArray([{ id: "product-1", qty: 2 }])).toBe(true);
    expect(isCartArray([{ id: "product-1", qty: 1.5 }])).toBe(false);
    expect(isCartArray([{ id: "product-1", qty: 0 }])).toBe(false);
  });

  it("merges duplicate lines and caps quantity to available stock", () => {
    expect(
      normalizeCart(
        [
          { id: "product-1", qty: 2 },
          { id: "product-1", qty: 4 },
          { id: "missing-product", qty: 1 },
        ],
        [product],
      ),
    ).toEqual([{ id: "product-1", qty: 3 }]);
  });

  it("removes items that are out of stock", () => {
    expect(normalizeCart([{ id: "product-1", qty: 1 }], [{ ...product, stock: 0 }])).toEqual([]);
  });
});
