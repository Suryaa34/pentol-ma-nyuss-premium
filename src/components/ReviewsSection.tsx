import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquarePlus, Quote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { StarRating } from "./StarRating";
import { ReviewDialog } from "./ReviewDialog";

interface Review {
  id: string;
  menu_id: string;
  user_id: string;
  rating: number;
  content: string | null;
  photo_url: string | null;
  created_at: string;
}

export function ReviewsSection() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [menus, setMenus] = useState<Record<string, string>>({});
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [signed, setSigned] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: rv } = await supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(50);
      setReviews((rv ?? []) as Review[]);
      const { data: m } = await supabase.from("menu").select("id,name");
      setMenus(Object.fromEntries((m ?? []).map((x: any) => [x.id, x.name])));
      const ids = Array.from(new Set((rv ?? []).map((r: any) => r.user_id)));
      if (ids.length) {
        const { data: pr } = await supabase.from("profiles").select("id,full_name").in("id", ids);
        setProfiles(Object.fromEntries((pr ?? []).map((p: any) => [p.id, p.full_name ?? "Pelanggan"])));
      }
    };
    load();
    const ch = supabase
      .channel("reviews-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  useEffect(() => {
    const paths = reviews.filter((r) => r.photo_url).map((r) => r.photo_url!) as string[];
    if (!paths.length || !user) return;
    supabase.storage.from("reviews").createSignedUrls(paths, 3600).then(({ data }) => {
      const map: Record<string, string> = {};
      (data ?? []).forEach((d: any) => {
        if (d.signedUrl && d.path) map[d.path] = d.signedUrl;
      });
      setSigned(map);
    });
  }, [reviews, user]);

  const avg = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  }, [reviews]);

  return (
    <section id="reviews" className="relative py-24 border-t border-border/40">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block glass px-4 py-1.5 rounded-full text-xs font-medium">Ulasan Pelanggan</span>
            <h2 className="mt-3 text-4xl md:text-5xl font-display font-extrabold">
              Suara <span className="text-gradient-flame">Pelanggan</span>
            </h2>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2 glass px-4 py-2 rounded-2xl">
                <Star className="h-5 w-5 fill-amber-400 stroke-amber-400" />
                <span className="font-display font-bold text-2xl">{avg.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">/ 5</span>
              </div>
              <span className="text-sm text-muted-foreground">{reviews.length} ulasan terverifikasi</span>
            </div>
          </motion.div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-flame text-primary-foreground font-semibold glow-flame hover:scale-105 transition-transform"
          >
            <MessageSquarePlus className="h-4 w-4" /> Tulis Ulasan
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center text-muted-foreground">
            Belum ada ulasan. Jadilah yang pertama setelah pesananmu selesai!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.slice(0, 9).map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl p-5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <StarRating value={r.rating} />
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("id-ID")}
                  </span>
                </div>
                <Quote className="h-5 w-5 text-primary/60" />
                <p className="text-sm text-foreground/90 line-clamp-4">{r.content || "—"}</p>
                {r.photo_url && signed[r.photo_url] && (
                  <img src={signed[r.photo_url]} alt="ulasan" className="rounded-xl aspect-video object-cover" />
                )}
                <div className="mt-auto pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                  <span className="font-semibold">{profiles[r.user_id] ?? "Pelanggan"}</span>
                  <span className="text-muted-foreground">{menus[r.menu_id] ?? "Menu"}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ReviewDialog open={open} onClose={() => setOpen(false)} />
    </section>
  );
}
