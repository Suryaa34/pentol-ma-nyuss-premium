import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, Download } from "lucide-react";
import { CartItem, SAUCE_OPTIONS } from "@/hooks/use-cart";
import { CheckoutForm } from "./CheckoutDialog";

interface Props {
  open: boolean;
  onClose: () => void;
  orderNumber: string | null;
  form: CheckoutForm | null;
  items: CartItem[];
  total: number;
  paidAt: Date | null;
}

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
const sauceLabel = (k: string) =>
  SAUCE_OPTIONS.find((s) => s.key === k)?.label.replace(/^Saos /, "") ?? k;

const fmtDate = (d: Date) =>
  d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function ReceiptDialog({
  open,
  onClose,
  orderNumber,
  form,
  items,
  total,
  paidAt,
}: Props) {
  const handlePrint = () => window.print();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[140] bg-background/85 backdrop-blur-md print:hidden"
          />
          <div className="fixed inset-0 z-[145] grid place-items-center p-3 sm:p-4 overflow-y-auto print:static print:p-0 print:block">
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ type: "spring", damping: 24, stiffness: 280 }}
              className="w-full max-w-sm my-auto glass border border-border/40 rounded-3xl p-4 sm:p-5 space-y-4 max-h-[calc(100dvh-1.5rem)] overflow-y-auto print:max-h-none print:overflow-visible print:bg-transparent print:border-0 print:shadow-none print:p-0"
            >
              <div className="flex items-center justify-between print:hidden">
                <h3 className="font-display font-extrabold text-lg">Struk Pembayaran</h3>
                <button
                  onClick={onClose}
                  className="h-9 w-9 grid place-items-center rounded-full glass hover:glow-flame"
                  aria-label="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Receipt body — printable area */}
              <div
                id="print-receipt"
                className="bg-white text-black rounded-2xl p-5 font-mono text-[12px] leading-relaxed shadow-inner"
              >
                <div className="text-center border-b border-dashed border-black/40 pb-2 mb-2">
                  <h4 className="font-bold text-base tracking-wide">PENTOL BERKAH</h4>
                  <p className="font-bold text-sm">MA'NYUSS</p>
                  <p className="text-[10px] mt-1">Terima kasih atas pesanan Anda</p>
                </div>

                <div className="space-y-0.5 text-[11px]">
                  <Row k="No. Order" v={orderNumber ?? "-"} />
                  <Row k="Tanggal" v={paidAt ? fmtDate(paidAt) : "-"} />
                  <Row k="Pembeli" v={form?.buyerName ?? "-"} />
                  <Row k="WhatsApp" v={form?.buyerWhatsapp ?? "-"} />
                  <Row k="Pembayaran" v="QRIS" />
                </div>

                <div className="border-t border-dashed border-black/40 my-2" />

                <div className="space-y-2">
                  {items.map((i) => (
                    <div key={i.cartId} className="text-[11px]">
                      <div className="flex justify-between gap-2">
                        <span className="font-bold uppercase">{i.name}</span>
                        <span className="font-bold">{formatRp(i.price * i.quantity)}</span>
                      </div>
                      <div className="flex justify-between text-[10px]">
                        <span>
                          {i.quantity} x {formatRp(i.price)}
                        </span>
                        <span>{i.withBroth ? "Berkuah" : "Tidak berkuah"}</span>
                      </div>
                      {i.sauces.length > 0 && (
                        <div className="text-[10px]">
                          Saos: {i.sauces.map(sauceLabel).join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-black/40 my-2" />

                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL</span>
                  <span>{formatRp(total)}</span>
                </div>

                {form?.notes && (
                  <>
                    <div className="border-t border-dashed border-black/40 my-2" />
                    <div className="text-[10px]">
                      <div className="font-bold">Catatan:</div>
                      <div className="whitespace-pre-wrap break-words">{form.notes}</div>
                    </div>
                  </>
                )}

                <div className="border-t border-dashed border-black/40 my-2" />
                <div className="text-center text-[10px] space-y-0.5">
                  <p className="font-bold">~ MA'NYUSS ~</p>
                  <p>Simpan struk ini sebagai bukti pembayaran</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 print:hidden">
                <button
                  onClick={handlePrint}
                  className="py-3 rounded-2xl glass border border-border/40 font-semibold hover:bg-secondary/40 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Printer className="h-4 w-4" /> Cetak Struk
                </button>
                <button
                  onClick={handlePrint}
                  className="py-3 rounded-2xl bg-gradient-flame text-primary-foreground font-semibold hover:glow-flame transition-all hover:scale-[1.02] text-sm flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center print:hidden">
                Tip: pada dialog cetak, pilih "Save as PDF" untuk mengunduh.
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="opacity-70">{k}</span>
      <span className="font-semibold text-right break-all">{v}</span>
    </div>
  );
}
