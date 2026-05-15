import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Minus, Plus, ShoppingBag, Loader2, Soup } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useCart, SAUCE_OPTIONS } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { CheckoutDialog, CheckoutForm } from "./CheckoutDialog";

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

const sauceLabel = (k: string) =>
  SAUCE_OPTIONS.find((s) => s.key === k)?.label.replace(/^Saos /, "") ?? k;

export function CartDrawer() {
  const { items, remove, updateQty, subtotal, total, open, setOpen, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const openCheckout = () => {
    if (items.length === 0) return;
    if (!user) {
      toast.info("Silakan masuk untuk melanjutkan");
      setOpen(false);
      navigate({ to: "/auth" });
      return;
    }
    setFormOpen(true);
  };

  const checkout = async (form: CheckoutForm) => {
    if (items.length === 0) return;
    if (!user) {
      toast.info("Silakan masuk untuk melanjutkan");
      setOpen(false);
      navigate({ to: "/auth" });
      return;
    }
    setSubmitting(true);
    try {
      const { data: order, error: oErr } = await supabase
        .from("orders")
        .insert({
          user_id: user!.id,
          total,
          status: "pending",
          buyer_name: form.buyerName,
          buyer_whatsapp: form.buyerWhatsapp,
          notes: form.notes,
        })
        .select()
        .single();
      if (oErr) throw oErr;

      const rows = items.map((i) => ({
        order_id: order.id,
        menu_id: i.menuId,
        quantity: i.quantity,
        unit_price: i.price,
        sauces: i.sauces,
        with_broth: i.withBroth,
      }));
      const { error: iErr } = await supabase.from("order_items").insert(rows);
      if (iErr) throw iErr;

      const grouped = new Map<string, number>();
      items.forEach((i) => grouped.set(i.menuId, (grouped.get(i.menuId) ?? 0) + i.quantity));
      for (const [menuId, qty] of grouped) {
        const { data: m } = await supabase.from("menu").select("stock").eq("id", menuId).single();
        if (m) await supabase.from("menu").update({ stock: Math.max(0, m.stock - qty) }).eq("id", menuId);
      }

      toast.success(`Pesanan ${order.order_number ?? ""} berhasil dibuat! 🔥`);
      clear();
      setFormOpen(false);
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message ?? "Gagal checkout");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[90] bg-background/70 backdrop-blur-md"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed top-0 right-0 z-[95] h-full w-full sm:max-w-md glass border-l border-border/40 flex flex-col"
          >
            <div className="p-5 flex items-center justify-between border-b border-border/30">
              <div>
                <h3 className="font-display font-extrabold text-xl">Keranjang</h3>
                <p className="text-xs text-muted-foreground">{items.length} item</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-9 w-9 grid place-items-center rounded-full glass hover:glow-flame"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <div className="h-full grid place-items-center text-center py-20">
                  <div className="space-y-3">
                    <div className="mx-auto h-16 w-16 grid place-items-center rounded-2xl glass">
                      <ShoppingBag className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm">Keranjang masih kosong</p>
                  </div>
                </div>
              ) : (
                items.map((i) => (
                  <motion.div
                    key={i.cartId}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 60 }}
                    className="glass rounded-2xl p-3 flex gap-3"
                  >
                    <img src={i.image} alt={i.name} className="h-20 w-20 rounded-xl object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm truncate">{i.name}</h4>
                        <button
                          onClick={() => remove(i.cartId)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {i.withBroth && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary flex items-center gap-1">
                            <Soup className="h-2.5 w-2.5" />
                            Berkuah
                          </span>
                        )}
                        {i.sauces.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground"
                          >
                            {sauceLabel(s)}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQty(i.cartId, i.quantity - 1)}
                            className="h-7 w-7 grid place-items-center rounded-lg glass hover:glow-flame"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-bold text-sm w-6 text-center">{i.quantity}</span>
                          <button
                            onClick={() => updateQty(i.cartId, i.quantity + 1)}
                            className="h-7 w-7 grid place-items-center rounded-lg glass hover:glow-flame"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="font-display font-bold text-sm text-gradient-flame">
                          {formatRp(i.price * i.quantity)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border/30 p-5 space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatRp(subtotal)}</span>
                </div>
                <div className="flex justify-between font-display font-extrabold text-lg">
                  <span>Total</span>
                  <span className="text-gradient-flame">{formatRp(total)}</span>
                </div>
                <button
                  onClick={openCheckout}
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl bg-gradient-flame text-primary-foreground font-semibold hover:glow-flame transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
                  Lanjut Checkout
                </button>
              </div>
            )}
          </motion.aside>
          <CheckoutDialog
            open={formOpen}
            onClose={() => !submitting && setFormOpen(false)}
            onSubmit={checkout}
            total={total}
            submitting={submitting}
          />
        </>
      )}
    </AnimatePresence>
  );
}
