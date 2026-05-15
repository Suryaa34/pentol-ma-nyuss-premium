import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type SauceKey =
  | "kacang-pedas-manis"
  | "manis"
  | "pedas"
  | "kecap-pedas"
  | "kecap-manis"
  | "tanpa-saos";

export const SAUCE_OPTIONS: { key: SauceKey; label: string }[] = [
  { key: "kacang-pedas-manis", label: "Saos Kacang Pedas Manis" },
  { key: "manis", label: "Saos Manis" },
  { key: "pedas", label: "Saos Pedas" },
  { key: "kecap-pedas", label: "Saos Kecap Pedas" },
  { key: "kecap-manis", label: "Kecap Manis" },
  { key: "tanpa-saos", label: "Tanpa Saos" },
];

export interface CartItem {
  cartId: string;
  menuId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  sauces: SauceKey[];
  withBroth: boolean;
}

interface CartCtx {
  items: CartItem[];
  add: (i: Omit<CartItem, "cartId">) => void;
  remove: (cartId: string) => void;
  updateQty: (cartId: string, qty: number) => void;
  clear: () => void;
  subtotal: number;
  total: number;
  count: number;
  open: boolean;
  setOpen: (v: boolean) => void;
}

const Ctx = createContext<CartCtx | null>(null);
const STORAGE = "pentol-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE, JSON.stringify(items));
  }, [items, hydrated]);

  const add: CartCtx["add"] = (i) => {
    setItems((prev) => [
      ...prev,
      { ...i, cartId: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` },
    ]);
  };
  const remove: CartCtx["remove"] = (id) =>
    setItems((p) => p.filter((x) => x.cartId !== id));
  const updateQty: CartCtx["updateQty"] = (id, qty) =>
    setItems((p) =>
      p.map((x) => (x.cartId === id ? { ...x, quantity: Math.max(1, qty) } : x))
    );
  const clear = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );
  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  return (
    <Ctx.Provider
      value={{
        items,
        add,
        remove,
        updateQty,
        clear,
        subtotal,
        total: subtotal,
        count,
        open,
        setOpen,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
