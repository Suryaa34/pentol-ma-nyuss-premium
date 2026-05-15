import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Soup, Droplet } from "lucide-react";
import { SAUCE_OPTIONS, SauceKey } from "@/hooks/use-cart";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (cfg: { sauces: SauceKey[]; withBroth: boolean; quantity: number }) => void;
  itemName: string;
  itemImage: string;
  price: number;
}

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export function ConfigDialog({ open, onClose, onConfirm, itemName, itemImage, price }: Props) {
  const [sauces, setSauces] = useState<SauceKey[]>(["kacang-pedas-manis"]);
  const [withBroth, setWithBroth] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const toggleSauce = (k: SauceKey) => {
    setSauces((prev) => {
      if (k === "tanpa-saos") return prev.includes(k) ? [] : ["tanpa-saos"];
      const filtered = prev.filter((x) => x !== "tanpa-saos");
      return filtered.includes(k) ? filtered.filter((x) => x !== k) : [...filtered, k];
    });
  };

  const handleConfirm = () => {
    onConfirm({ sauces, withBroth, quantity });
    setSauces(["kacang-pedas-manis"]);
    setWithBroth(false);
    setQuantity(1);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] grid place-items-center p-4 bg-background/70 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 22, stiffness: 240 }}
            onClick={(e) => e.stopPropagation()}
            className="glass rounded-3xl w-full max-w-lg overflow-hidden shadow-card max-h-[90vh] flex flex-col"
          >
            <div className="relative">
              <img src={itemImage} alt={itemName} className="w-full h-40 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full glass hover:glow-flame"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                <h3 className="font-display font-extrabold text-2xl">{itemName}</h3>
                <span className="font-display font-bold text-lg text-gradient-flame">
                  {formatRp(price)}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Droplet className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">Pilih Saos (boleh lebih dari satu)</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SAUCE_OPTIONS.map((s) => {
                    const active = sauces.includes(s.key);
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => toggleSauce(s.key)}
                        className={`relative text-left text-xs px-3 py-2.5 rounded-xl border transition-all ${
                          active
                            ? "border-primary bg-primary/10 text-foreground glow-flame"
                            : "border-border/40 glass hover:border-primary/40"
                        }`}
                      >
                        <span className="font-medium">{s.label}</span>
                        {active && (
                          <Check className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Soup className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">Jenis Penyajian</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: true, label: "Berkuah" },
                    { v: false, label: "Tidak Berkuah" },
                  ].map((opt) => {
                    const active = withBroth === opt.v;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setWithBroth(opt.v)}
                        className={`text-sm font-medium px-3 py-3 rounded-xl border transition-all ${
                          active
                            ? "border-primary bg-primary/10 glow-flame"
                            : "border-border/40 glass hover:border-primary/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between glass rounded-2xl px-4 py-3">
                <span className="text-sm font-semibold">Jumlah</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 rounded-lg glass hover:glow-flame font-bold"
                  >
                    −
                  </button>
                  <span className="font-display font-bold text-lg w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="h-8 w-8 rounded-lg glass hover:glow-flame font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={handleConfirm}
                disabled={sauces.length === 0}
                className="w-full py-3.5 rounded-2xl bg-gradient-flame text-primary-foreground font-semibold hover:glow-flame transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              >
                Tambah ke Keranjang · {formatRp(price * quantity)}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
