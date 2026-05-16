import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle2, QrCode, Clock, ShieldCheck, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import qrisImg from "@/assets/qris-dummy.png";

interface Props {
  open: boolean;
  total: number;
  submitting?: boolean;
  success?: boolean;
  orderNumber?: string | null;
  onPaid: () => Promise<void> | void;
  onCancel: () => void;
  onClose: () => void;
  onShowReceipt?: () => void;
}

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
const PAY_SECONDS = 10 * 60;

export function QrisDialog({
  open,
  total,
  submitting,
  success,
  orderNumber,
  onPaid,
  onCancel,
  onClose,
  onShowReceipt,
}: Props) {
  const [left, setLeft] = useState(PAY_SECONDS);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!open || success) return;
    startedAt.current = Date.now();
    setLeft(PAY_SECONDS);
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startedAt.current ?? Date.now())) / 1000);
      setLeft(Math.max(0, PAY_SECONDS - elapsed));
    }, 1000);
    return () => clearInterval(id);
  }, [open, success]);

  useEffect(() => {
    if (!success) return;
    const duration = 1800;
    const end = Date.now() + duration;
    const colors = ["#ff5722", "#ff9800", "#ffd54f", "#ffffff"];
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 0.7 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.5 },
      colors,
    });
  }, [success]);

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  const expired = left === 0 && !success;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={success ? onClose : undefined}
            className="fixed inset-0 z-[120] bg-background/85 backdrop-blur-md"
          />
          <div className="fixed inset-0 z-[125] grid place-items-center p-3 sm:p-4 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", damping: 24, stiffness: 280 }}
              className="pointer-events-auto w-full max-w-md my-auto glass border border-border/40 rounded-3xl p-5 sm:p-6 space-y-4 sm:space-y-5 max-h-[calc(100dvh-1.5rem)] overflow-y-auto"
            >
              {!success ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 grid place-items-center rounded-xl bg-gradient-flame text-primary-foreground">
                          <QrCode className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-display font-extrabold text-xl leading-tight">
                            Bayar dengan QRIS
                          </h3>
                          <p className="text-[11px] text-muted-foreground">
                            Scan kode dengan aplikasi e-wallet / mobile banking
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={onCancel}
                      disabled={submitting}
                      className="h-9 w-9 shrink-0 grid place-items-center rounded-full glass hover:glow-flame disabled:opacity-50"
                      aria-label="Tutup"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-3 glass rounded-2xl px-4 py-3 border border-border/30">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Nominal
                      </p>
                      <p className="font-display font-extrabold text-xl text-gradient-flame">
                        {formatRp(total)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" /> Sisa Waktu
                      </p>
                      <p
                        className={`font-mono font-bold text-xl tabular-nums ${
                          expired ? "text-destructive" : left < 60 ? "text-primary" : ""
                        }`}
                      >
                        {mm}:{ss}
                      </p>
                    </div>
                  </div>

                  <div className="relative mx-auto w-full max-w-[260px] aspect-square">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-flame opacity-20 blur-2xl" />
                    <div className="relative h-full w-full rounded-3xl bg-white p-4 shadow-xl">
                      <img
                        src={qrisImg}
                        alt="QRIS Dummy"
                        width={512}
                        height={512}
                        loading="lazy"
                        className={`h-full w-full object-contain ${expired ? "opacity-30 grayscale" : ""}`}
                      />
                      {expired && (
                        <div className="absolute inset-0 grid place-items-center">
                          <span className="px-3 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-bold">
                            KEDALUWARSA
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3 w-3 text-primary" />
                    Transaksi aman • QRIS dummy untuk simulasi
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={onCancel}
                      disabled={submitting}
                      className="py-3 rounded-2xl glass border border-border/40 font-semibold hover:bg-secondary/40 transition-colors disabled:opacity-50 text-sm"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => onPaid()}
                      disabled={submitting || expired}
                      className="py-3 rounded-2xl bg-gradient-flame text-primary-foreground font-semibold hover:glow-flame transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 text-sm"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Memproses
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" /> Saya Sudah Bayar
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-6 text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                    className="mx-auto h-20 w-20 grid place-items-center rounded-full bg-gradient-flame glow-flame"
                  >
                    <CheckCircle2 className="h-10 w-10 text-primary-foreground" strokeWidth={2.5} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-2"
                  >
                    <h3 className="font-display font-extrabold text-2xl">
                      Terima Kasih! <Sparkles className="inline h-5 w-5 text-primary" />
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Pembayaran berhasil. Pesanan kamu sedang kami siapkan.
                    </p>
                  </motion.div>
                  {orderNumber && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="glass rounded-2xl px-4 py-3 inline-flex flex-col"
                    >
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Nomor Pesanan
                      </span>
                      <span className="font-mono font-bold text-lg text-gradient-flame">
                        {orderNumber}
                      </span>
                    </motion.div>
                  )}
                  <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total Dibayar</span>
                    <span className="font-display font-extrabold text-lg text-gradient-flame">
                      {formatRp(total)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {onShowReceipt && (
                      <button
                        onClick={onShowReceipt}
                        className="py-3 rounded-2xl glass border border-border/40 font-semibold hover:bg-secondary/40 transition-colors text-sm"
                      >
                        Lihat Struk
                      </button>
                    )}
                    <button
                      onClick={onClose}
                      className={`py-3 rounded-2xl bg-gradient-flame text-primary-foreground font-semibold hover:glow-flame transition-all hover:scale-[1.02] text-sm ${onShowReceipt ? "" : "col-span-2"}`}
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
