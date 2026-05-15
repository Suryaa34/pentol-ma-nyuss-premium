import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/use-cart";
import { ConfigDialog } from "@/components/ConfigDialog";
import pentolIkan from "@/assets/pentol-ikan.jpg";
import pentolDaging from "@/assets/pentol-daging.jpg";
import siomay from "@/assets/siomay.jpg";
import tahuBakso from "@/assets/tahu-bakso.jpg";
import pentolGorengTelur from "@/assets/pentol-goreng-telur.jpg";

const imageMap: Record<string, string> = {
  "pentol-ikan": pentolIkan,
  "pentol-daging": pentolDaging,
  siomay,
  "tahu-bakso": tahuBakso,
  "pentol-goreng-telur": pentolGorengTelur,
};

interface MenuItem {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_key: string | null;
  tag: string | null;
  available: boolean;
}

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export function Menu() {
  const cart = useCart();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [configItem, setConfigItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("menu")
      .select("*")
      .eq("available", true)
      .order("price")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) toast.error("Gagal memuat menu");
        else setItems((data ?? []) as MenuItem[]);
        setLoading(false);
      });

    const channel = supabase
      .channel("menu-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu" }, (payload) => {
        setItems((prev) => {
          if (payload.eventType === "INSERT") return [...prev, payload.new as MenuItem];
          if (payload.eventType === "UPDATE")
            return prev.map((i) => (i.id === (payload.new as MenuItem).id ? (payload.new as MenuItem) : i));
          if (payload.eventType === "DELETE")
            return prev.filter((i) => i.id !== (payload.old as MenuItem).id);
          return prev;
        });
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const openBuy = (item: MenuItem) => {
    if (item.stock < 1) return toast.error("Stok habis");
    setConfigItem(item);
  };

  return (
    <section id="menu" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 space-y-3"
        >
          <span className="inline-block glass px-4 py-1.5 rounded-full text-xs font-medium">Menu Andalan</span>
          <h2 className="text-4xl md:text-5xl font-display font-extrabold">
            Pilih <span className="text-gradient-flame">Favoritmu</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Stok update real-time. Pesanan masuk langsung ke dapur kami.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => {
              const img = imageMap[item.image_key ?? ""] ?? pentolIkan;
              const out = item.stock < 1;
              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  className="group glass rounded-3xl overflow-hidden shadow-card flex flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={img}
                      alt={item.name}
                      width={768}
                      height={576}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                    {item.tag && (
                      <span className="absolute top-3 left-3 bg-gradient-flame text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full glow-flame">
                        {item.tag}
                      </span>
                    )}
                    <span className="absolute top-3 right-3 glass px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                      <Package className="h-3 w-3" /> {item.stock}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-bold text-xl">{item.name}</h3>
                      <p className="font-display font-extrabold text-xl text-gradient-flame whitespace-nowrap">
                        {formatRp(item.price)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Stok: <span className={`font-medium ${out ? "text-destructive" : "text-foreground"}`}>{out ? "Habis" : `${item.stock} pcs`}</span>
                    </p>
                    <button
                      onClick={() => openBuy(item)}
                      disabled={out}
                      className="mt-auto inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-flame text-primary-foreground font-semibold hover:glow-flame transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {out ? "Stok Habis" : "Beli Sekarang"}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
