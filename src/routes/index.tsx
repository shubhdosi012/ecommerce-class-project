import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import hero from "@/assets/hero.jpg";
import { CATEGORIES, FALLBACK_IMAGE, initialProducts, type Product } from "@/lib/products";
import { isCartArray, isProductArray, normalizeCart, type CartLine } from "@/lib/storefront";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VELO — Cold-weather running gear" },
      {
        name: "description",
        content:
          "Shop engineered running layers and footwear, with a live inventory panel for stock and pricing.",
      },
      { property: "og:title", content: "VELO — Cold-weather running gear" },
      {
        property: "og:description",
        content: "Engineered layers for sub-zero mornings. Shop shells, base layers and footwear.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function readStoredJson(key: string): unknown {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? null : (JSON.parse(saved) as unknown);
  } catch (error) {
    console.warn(`Could not read saved storefront data for "${key}".`, error);
    return null;
  }
}

const money = (n: number) => `${n.toFixed(n % 1 ? 2 : 0)}`;

const input =
  "w-full px-4 py-3 rounded-xl bg-glass border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60";
const btnPrimary =
  "px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/85 transition-colors disabled:opacity-40 disabled:pointer-events-none";

function Logo() {
  return (
    <span className="font-display text-2xl tracking-tight">
      VELO<span className="text-primary">.</span>
    </span>
  );
}

function Index() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [detail, setDetail] = useState<Product | null>(null);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedProducts = readStoredJson("velo-products");
    const restoredProducts = isProductArray(storedProducts) ? storedProducts : null;

    if (restoredProducts) {
      setProducts(restoredProducts);
    } else if (storedProducts !== null) {
      console.warn("Saved product data was invalid; default products will be used.");
    }

    const storedCart = readStoredJson("velo-cart");
    if (isCartArray(storedCart)) {
      setCart(normalizeCart(storedCart, restoredProducts ?? initialProducts));
    } else if (storedCart !== null) {
      console.warn("Saved cart data was invalid; the cart will start empty.");
    }

    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem("velo-products", JSON.stringify(products));
      localStorage.setItem("velo-cart", JSON.stringify(cart));
    } catch (error) {
      console.warn("Could not save storefront data in this browser.", error);
    }
  }, [products, cart, loaded]);

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2000);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!q || `${p.name} ${p.tagline} ${p.category}`.toLowerCase().includes(q)),
    );
  }, [products, query, category]);

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const cartItems = cart
    .map((l) => ({ ...l, product: products.find((p) => p.id === l.id) }))
    .filter((l): l is CartLine & { product: Product } => !!l.product);
  const subtotal = cartItems.reduce((s, l) => s + l.qty * l.product.price, 0);

  const addToCart = (p: Product) => {
    const inCart = cart.find((l) => l.id === p.id)?.qty ?? 0;
    if (inCart >= p.stock) return flash("No more stock available");
    setCart((c) =>
      c.some((l) => l.id === p.id)
        ? c.map((l) => (l.id === p.id ? { ...l, qty: l.qty + 1 } : l))
        : [...c, { id: p.id, qty: 1 }],
    );
    flash(`${p.name} added to cart`);
  };
  const setQty = (id: string, qty: number) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    const q = Math.min(qty, p.stock);
    setCart((c) =>
      q <= 0 ? c.filter((l) => l.id !== id) : c.map((l) => (l.id === id ? { ...l, qty: q } : l)),
    );
  };
  const checkout = () => {
    const safeCart = normalizeCart(cart, products);
    const cartUnchanged =
      safeCart.length === cart.length &&
      safeCart.every((line) =>
        cart.some((savedLine) => savedLine.id === line.id && savedLine.qty === line.qty),
      );

    if (!cartUnchanged) {
      setCart(safeCart);
      flash("Cart refreshed to available stock. Review it before checkout.");
      return;
    }
    if (safeCart.length === 0) return flash("Your cart is empty.");

    const quantities = new Map(safeCart.map((line) => [line.id, line.qty]));
    setProducts((currentProducts) =>
      currentProducts.map((product) => ({
        ...product,
        stock: Math.max(0, product.stock - (quantities.get(product.id) ?? 0)),
      })),
    );
    setCart([]);
    setCartOpen(false);
    flash("Demo checkout complete — browser-local stock updated.");
  };

  const saveProduct = (p: Product) => {
    const updatedProducts = products.some((product) => product.id === p.id)
      ? products.map((product) => (product.id === p.id ? p : product))
      : [p, ...products];
    setProducts(updatedProducts);
    setCart((currentCart) => normalizeCart(currentCart, updatedProducts));
    setEditing(null);
    flash("Product saved");
  };
  const deleteProduct = (p: Product) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    setProducts((ps) => ps.filter((x) => x.id !== p.id));
    setCart((c) => c.filter((l) => l.id !== p.id));
    flash("Product deleted");
  };

  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const stockValue = products.reduce((s, p) => s + p.stock * p.price, 0);
  const lowCount = products.filter((p) => p.stock < 10).length;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-12 py-4 bg-background/80 backdrop-blur-xl border-b border-border">
        <a href="#top">
          <Logo />
        </a>
        <nav className="hidden md:flex gap-8 text-sm text-muted-foreground">
          <a href="#shop" className="hover:text-foreground">
            Shop
          </a>
          <a href="#contact" className="hover:text-foreground">
            Contact
          </a>
          <a href="#inventory" className="hover:text-foreground">
            Inventory
          </a>
        </nav>
        <button
          onClick={() => setCartOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
        >
          Cart <span className="font-mono">{cartCount}</span>
        </button>
      </header>

      {/* Hero */}
      <section id="top" className="relative h-[560px] md:h-[620px] overflow-hidden">
        <img
          src={hero}
          alt="Runner sprinting on a foggy city track"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/40 to-transparent" />
        <div className="hidden md:block absolute -top-20 -right-20 w-[560px] h-[560px] rotate-12 bg-glass-strong backdrop-blur-md border border-border rounded-[2rem]" />
        <div className="hidden md:block absolute top-24 right-24 w-40 h-40 -rotate-6 bg-primary/25 backdrop-blur-sm rounded-3xl border border-border" />
        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 max-w-4xl">
          <div className="font-mono text-xs text-primary uppercase tracking-[0.25em] animate-rise">
            New drop · FW26
          </div>
          <h1 className="font-display text-6xl md:text-8xl leading-[0.86] uppercase tracking-tight mt-4 animate-clip">
            Run the
            <br />
            city cold
          </h1>
          <p className="mt-6 max-w-[42ch] text-foreground/70 text-pretty animate-rise [animation-delay:250ms]">
            Engineered layers for sub-zero mornings. Built to move, tuned to disappear.
          </p>
          <a
            href="#shop"
            className={`${btnPrimary} mt-8 w-fit hover:translate-x-1 transition-all duration-300 animate-rise [animation-delay:400ms]`}
          >
            Shop the drop →
          </a>
        </div>
      </section>

      {/* Shop */}
      <section id="shop" className="px-6 md:px-12 py-14 scroll-mt-16">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative w-full md:w-96">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-sm">
              ⌕
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gear, layers, footwear…"
              className="w-full pl-11 pr-4 py-3 rounded-full bg-glass border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/60"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", ...CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={
                  c === category
                    ? "px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm"
                    : "px-4 py-2 rounded-full bg-glass border border-border text-foreground/70 text-sm hover:text-foreground"
                }
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-16 text-center text-muted-foreground font-mono text-sm">
            No products match your search.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
            {filtered.map((p, i) => (
              <article
                key={p.id}
                className="group bg-glass border border-border rounded-[18px] overflow-hidden backdrop-blur-sm animate-rise"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <button
                  onClick={() => setDetail(p)}
                  className="relative block w-full aspect-[4/5] overflow-hidden"
                  aria-label={`View ${p.name}`}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    width={800}
                    height={960}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {p.stock === 0 && (
                    <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-wider bg-background/80 px-2 py-1 rounded-full">
                      Sold out
                    </span>
                  )}
                  {p.stock > 0 && p.stock < 10 && (
                    <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-wider bg-primary text-primary-foreground px-2 py-1 rounded-full">
                      Only {p.stock} left
                    </span>
                  )}
                </button>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg uppercase">{p.name}</h3>
                    <span className="font-mono text-sm">{money(p.price)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.tagline}</p>
                  <button
                    disabled={p.stock === 0}
                    onClick={() => addToCart(p)}
                    className="mt-4 w-full py-2 rounded-full bg-glass-strong text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-200 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {p.stock === 0 ? "Out of stock" : "Add to cart"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Inventory */}
      <section
        id="inventory"
        className="px-6 md:px-12 py-14 bg-muted border-y border-border scroll-mt-16"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-3xl uppercase tracking-tight">Inventory panel</h2>
            <p className="text-xs font-mono text-muted-foreground mt-1">stock · pricing · live</p>
          </div>
          <button
            onClick={() => setEditing("new")}
            className="px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/85 transition-colors"
          >
            + Add product
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            ["Products", products.length],
            ["Units in stock", totalUnits],
            ["Stock value", money(stockValue)],
            ["Low / out", lowCount],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-border bg-glass p-4">
              <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {k}
              </div>
              <div className="font-display text-2xl mt-1">{v}</div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-glass text-muted-foreground font-mono text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">Product</th>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-left px-5 py-3">Stock</th>
                <th className="text-left px-5 py-3">Price</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p, i) => (
                <tr
                  key={p.id}
                  className="animate-slide hover:bg-glass"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt=""
                        loading="lazy"
                        width={40}
                        height={48}
                        className="h-12 w-10 rounded-md object-cover"
                      />
                      <span className="font-display uppercase">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 font-mono">
                      <button
                        onClick={() => saveProduct({ ...p, stock: Math.max(0, p.stock - 1) })}
                        className="h-7 w-7 rounded-full bg-glass-strong hover:bg-primary hover:text-primary-foreground"
                        aria-label="Decrease stock"
                      >
                        −
                      </button>
                      <span
                        className={
                          p.stock === 0
                            ? "text-muted-foreground"
                            : p.stock < 10
                              ? "text-primary"
                              : "text-success"
                        }
                      >
                        {p.stock === 0 ? "0 out" : `${p.stock} in stock`}
                      </span>
                      <button
                        onClick={() => saveProduct({ ...p, stock: p.stock + 1 })}
                        className="h-7 w-7 rounded-full bg-glass-strong hover:bg-primary hover:text-primary-foreground"
                        aria-label="Increase stock"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono">{money(p.price)}</td>
                  <td className="px-5 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => setEditing(p)}
                      className="text-foreground/60 hover:text-primary mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProduct(p)}
                      className="text-foreground/40 hover:text-primary"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-muted-foreground font-mono"
                  >
                    No products. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <ContactSection onDemoSubmit={() => flash("Demo only — no message was sent.")} />

      <footer className="px-6 md:px-12 py-10 border-t border-border flex flex-col md:flex-row justify-between gap-6 text-sm text-muted-foreground">
        <span className="text-foreground">
          <Logo />
        </span>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground">
            Instagram
          </a>
          <a href="#" className="hover:text-foreground">
            Returns
          </a>
          <a href="#" className="hover:text-foreground">
            Privacy
          </a>
        </div>
        <div className="font-mono text-xs">© 2026 VELO — run the city cold</div>
      </footer>

      {/* Product details */}
      {detail && (
        <Overlay onClose={() => setDetail(null)}>
          <div className="grid md:grid-cols-2">
            <img
              src={detail.image}
              alt={detail.name}
              width={800}
              height={960}
              className="w-full h-72 md:h-full object-cover"
            />
            <div className="p-6 md:p-8 flex flex-col">
              <span className="font-mono text-xs text-primary uppercase tracking-[0.2em]">
                {detail.category}
              </span>
              <h2 className="font-display text-4xl uppercase mt-2">{detail.name}</h2>
              <p className="text-xs text-muted-foreground mt-1">{detail.tagline}</p>
              <p className="text-foreground/75 mt-5 text-pretty">{detail.description}</p>
              <div className="mt-6 flex items-center justify-between font-mono">
                <span className="text-2xl">{money(detail.price)}</span>
                <span
                  className={
                    detail.stock === 0
                      ? "text-muted-foreground text-sm"
                      : detail.stock < 10
                        ? "text-primary text-sm"
                        : "text-success text-sm"
                  }
                >
                  {detail.stock === 0 ? "Out of stock" : `${detail.stock} in stock`}
                </span>
              </div>
              <button
                disabled={detail.stock === 0}
                onClick={() => {
                  addToCart(detail);
                  setDetail(null);
                }}
                className={`${btnPrimary} mt-auto pt-3`}
              >
                Add to cart
              </button>
            </div>
          </div>
        </Overlay>
      )}

      {/* Product form */}
      {editing && (
        <Overlay onClose={() => setEditing(null)} narrow>
          <ProductForm
            initial={editing === "new" ? null : editing}
            onSave={saveProduct}
            onCancel={() => setEditing(null)}
          />
        </Overlay>
      )}

      {/* Cart drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-popover border-l border-border flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-display text-2xl uppercase">Your cart</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-muted-foreground hover:text-foreground font-mono"
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 && (
                <p className="text-muted-foreground font-mono text-sm">Your cart is empty.</p>
              )}
              {cartItems.map(({ product: p, qty }) => (
                <div key={p.id} className="flex gap-4">
                  <img
                    src={p.image}
                    alt=""
                    width={64}
                    height={80}
                    className="h-20 w-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between gap-2">
                      <span className="font-display uppercase">{p.name}</span>
                      <span className="font-mono text-sm">{money(p.price * qty)}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 font-mono text-sm">
                      <button
                        onClick={() => setQty(p.id, qty - 1)}
                        className="h-7 w-7 rounded-full bg-glass-strong"
                      >
                        −
                      </button>
                      <span className="w-6 text-center">{qty}</span>
                      <button
                        onClick={() => setQty(p.id, qty + 1)}
                        className="h-7 w-7 rounded-full bg-glass-strong"
                      >
                        +
                      </button>
                      <button
                        onClick={() => setQty(p.id, 0)}
                        className="ml-auto text-muted-foreground hover:text-primary"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-border">
              <div className="flex justify-between font-mono mb-4">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <button
                disabled={!cartItems.length}
                onClick={checkout}
                className={`${btnPrimary} w-full`}
              >
                Checkout →
              </button>
            </div>
          </aside>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-full bg-popover border border-border text-sm font-mono animate-rise">
          {toast}
        </div>
      )}
    </div>
  );
}

function Overlay({
  children,
  onClose,
  narrow,
}: {
  children: React.ReactNode;
  onClose: () => void;
  narrow?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${narrow ? "max-w-lg" : "max-w-3xl"} max-h-[90vh] overflow-y-auto rounded-[18px] bg-popover border border-border animate-in fade-in zoom-in-95 duration-200`}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 h-8 w-8 rounded-full bg-background/70 font-mono text-sm"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

function ProductForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Product | null;
  onSave: (p: Product) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState({
    name: initial?.name ?? "",
    category: initial?.category ?? CATEGORIES[0],
    price: String(initial?.price ?? ""),
    stock: String(initial?.stock ?? ""),
    tagline: initial?.tagline ?? "",
    description: initial?.description ?? "",
  });
  const [err, setErr] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const price = Number(f.price),
      stock = Number(f.stock);
    if (!f.name.trim()) return setErr("Name is required");
    if (!Number.isFinite(price) || price <= 0)
      return setErr("Price must be a finite number greater than 0");
    if (!Number.isInteger(stock) || stock < 0) return setErr("Stock must be a whole number ≥ 0");
    onSave({
      id: initial?.id ?? `p${Date.now()}`,
      image: initial?.image ?? FALLBACK_IMAGE,
      name: f.name.trim().slice(0, 60),
      category: f.category ?? "Outerwear",
      price,
      stock,
      tagline: f.tagline.trim().slice(0, 60),
      description: f.description.trim().slice(0, 400),
    });
  };
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF({ ...f, [k]: e.target.value });
  return (
    <form onSubmit={submit} className="p-6 md:p-8 space-y-4">
      <h2 className="font-display text-3xl uppercase">
        {initial ? "Edit product" : "Add product"}
      </h2>
      <input className={input} placeholder="Product name" value={f.name} onChange={set("name")} />
      <select className={input} value={f.category} onChange={set("category")}>
        {CATEGORIES.map((c) => (
          <option key={c} className="bg-popover">
            {c}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-3">
        <input
          className={input}
          type="number"
          step="0.01"
          min="0"
          placeholder="Price ($)"
          value={f.price}
          onChange={set("price")}
        />
        <input
          className={input}
          type="number"
          min="0"
          placeholder="Stock qty"
          value={f.stock}
          onChange={set("stock")}
        />
      </div>
      <input
        className={input}
        placeholder="Short tagline"
        value={f.tagline}
        onChange={set("tagline")}
      />
      <textarea
        className={input}
        rows={3}
        placeholder="Description"
        value={f.description}
        onChange={set("description")}
      />
      {err && <p className="text-primary text-sm font-mono">{err}</p>}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-full bg-glass-strong text-sm"
        >
          Cancel
        </button>
        <button type="submit" className={btnPrimary}>
          Save
        </button>
      </div>
    </form>
  );
}

function ContactSection({ onDemoSubmit }: { onDemoSubmit: () => void }) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.currentTarget.reset();
    onDemoSubmit();
  };
  return (
    <section
      id="contact"
      className="px-6 md:px-12 py-16 grid md:grid-cols-2 gap-10 items-center scroll-mt-16"
    >
      <div>
        <h2 className="font-display text-4xl uppercase tracking-tight">Talk to the crew</h2>
        <p className="text-foreground/60 mt-3 max-w-[38ch] text-pretty">
          This demo does not connect to a support team or send messages. The form below only
          demonstrates client-side input and feedback.
        </p>
      </div>
      <form onSubmit={submit} className="space-y-4">
        <input required placeholder="Name" className={input} />
        <input required type="email" placeholder="Email" className={input} />
        <textarea required placeholder="Message" rows={3} className={input} />
        <button className={btnPrimary}>Preview message →</button>
      </form>
    </section>
  );
}
