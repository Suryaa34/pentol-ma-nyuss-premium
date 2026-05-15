import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, User, Phone, MessageSquare } from "lucide-react";

export interface CheckoutForm {
  buyerName: string;
  buyerWhatsapp: string;
  notes: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (form: CheckoutForm) => Promise<void> | void;
  total: number;
  submitting?: boolean;
}

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export function CheckoutDialog({ open, onClose, onSubmit, total, submitting }: Props) {
  const [buyerName, setName] = useState("");
  const [buyerWhatsapp, setWa] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!buyerName.trim()) e.buyerName = "Nama wajib diisi";
    else if (buyerName.trim().length > 100) e.buyerName = "Maksimal 100 karakter";

    const wa = buyerWhatsapp.trim().replace(/\s|-/g, "");
    if (!wa) e.buyerWhatsapp = "Nomor WhatsApp wajib diisi";
    else if (!/^(\+?62|0)[0-9]{8,14}$/.test(wa)) e.buyerWhatsapp = "Format nomor tidak valid";

    if (!notes.trim()) e.notes = "Catatan wajib diisi";
    else if (notes.trim().length > 500) e.notes = "Maksimal 500 karakter";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    await onSubmit({
      buyerName: buyerName.trim(),
      buyerWhatsapp: buyerWhatsapp.trim().replace(/\s|-/g, ""),
      notes: notes.trim(),
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-background/80 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-[115] grid place-items-center p-4 pointer-events-none">
            <motion.form
              onSubmit={submit}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", damping: 24, stiffness: 280 }}
              className="pointer-events-auto w-full max-w-md glass border border-border/40 rounded-3xl p-6 space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-extrabold text-2xl">Detail Pesanan</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Lengkapi data sebelum checkout
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 w-9 grid place-items-center rounded-full glass hover:glow-flame"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3 w-3" /> Nama Pembeli
                </label>
                <input
                  value={buyerName}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  placeholder="Nama lengkap"
                  className="w-full h-11 px-4 rounded-xl glass border border-border/40 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {errors.buyerName && (
                  <p className="text-xs text-destructive">{errors.buyerName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> Nomor WhatsApp
                </label>
                <input
                  value={buyerWhatsapp}
                  onChange={(e) => setWa(e.target.value)}
                  inputMode="tel"
                  maxLength={20}
                  placeholder="08xxxxxxxxxx"
                  className="w-full h-11 px-4 rounded-xl glass border border-border/40 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {errors.buyerWhatsapp && (
                  <p className="text-xs text-destructive">{errors.buyerWhatsapp}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3" /> Catatan untuk Penjual
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Contoh: pedas level 3, antar sebelum jam 5"
                  className="w-full px-4 py-3 rounded-xl glass border border-border/40 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
                {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display font-extrabold text-xl text-gradient-flame">
                  {formatRp(total)}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-2xl bg-gradient-flame text-primary-foreground font-semibold hover:glow-flame transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  "Konfirmasi & Buat Pesanan"
                )}
              </button>
            </motion.form>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
