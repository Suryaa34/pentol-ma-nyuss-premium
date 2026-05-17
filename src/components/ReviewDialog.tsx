import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { StarRating } from "./StarRating";

interface PurchasedMenu {
  menu_id: string;
  name: string;
}

export function ReviewDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [purchased, setPurchased] = useState<PurchasedMenu[]>([]);
  const [menuId, setMenuId] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    supabase
      .from("orders")
      .select("id, status, order_items(menu_id, menu:menu_id(name))")
      .eq("user_id", user.id)
      .eq("status", "paid")
      .then(({ data }) => {
        const map = new Map<string, string>();
        (data ?? []).forEach((o: any) =>
          o.order_items?.forEach((it: any) => {
            if (it.menu?.name) map.set(it.menu_id, it.menu.name);
          })
        );
        const list = Array.from(map, ([menu_id, name]) => ({ menu_id, name }));
        setPurchased(list);
        if (list[0]) setMenuId(list[0].menu_id);
      });
  }, [open, user]);

  const submit = async () => {
    if (!user) return toast.error("Silakan masuk");
    if (!menuId) return toast.error("Pilih menu");
    setSubmitting(true);
    try {
      let photo_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("reviews").upload(path, file);
        if (upErr) throw upErr;
        photo_url = path;
      }
      const { error } = await supabase.from("reviews").insert({
        user_id: user.id,
        menu_id: menuId,
        rating,
        content: content || null,
        photo_url,
      });
      if (error) throw error;
      toast.success("Ulasan terkirim, terima kasih!");
      setContent("");
      setFile(null);
      setRating(5);
      onClose();
    } catch (e: any) {
      toast.error(e.message ?? "Gagal mengirim ulasan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-background/80 backdrop-blur-md grid place-items-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass rounded-3xl w-full max-w-md p-6 shadow-card max-h-[90vh] overflow-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-xl">Tulis Ulasan</h3>
              <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-xl hover:bg-secondary/60">
                <X className="h-4 w-4" />
              </button>
            </div>

            {purchased.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                Hanya pelanggan dengan pesanan <span className="font-semibold text-foreground">sudah dibayar</span> yang dapat menulis ulasan.
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Menu</label>
                  <select
                    value={menuId}
                    onChange={(e) => setMenuId(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-secondary/40 border border-border px-3 py-2 text-sm"
                  >
                    {purchased.map((p) => (
                      <option key={p.menu_id} value={p.menu_id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-1">Rating</label>
                  <StarRating value={rating} onChange={setRating} readOnly={false} size={28} />
                </div>
                <div>
                  <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ulasan (opsional)</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value.slice(0, 500))}
                    rows={3}
                    placeholder="Bagaimana rasanya?"
                    className="mt-1 w-full rounded-xl bg-secondary/40 border border-border px-3 py-2 text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground cursor-pointer">
                    <ImagePlus className="h-4 w-4" /> Foto (opsional)
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {file && <p className="mt-1 text-xs text-muted-foreground truncate">{file.name}</p>}
                </div>
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="w-full py-3 rounded-2xl bg-gradient-flame text-primary-foreground font-semibold disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Kirim Ulasan
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
