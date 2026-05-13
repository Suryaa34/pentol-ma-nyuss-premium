import { motion } from "framer-motion";
import { ShoppingBag, Package } from "lucide-react";
import pentolIkan from "@/assets/pentol-ikan.jpg";
import pentolDaging from "@/assets/pentol-daging.jpg";
import siomay from "@/assets/siomay.jpg";
import tahuBakso from "@/assets/tahu-bakso.jpg";
import pentolGorengTelur from "@/assets/pentol-goreng-telur.jpg";

const items = [
  { name: "Pentol Ikan", price: 500, stock: 120, img: pentolIkan, tag: "Best Seller" },
  { name: "Pentol Daging", price: 1000, stock: 85, img: pentolDaging, tag: "Premium" },
  { name: "Siomay", price: 1000, stock: 60, img: siomay },
  { name: "Tahu Bakso", price: 500, stock: 95, img: tahuBakso },
  { name: "Pentol Goreng Telur", price: 1000, stock: 40, img: pentolGorengTelur, tag: "Spicy" },
];

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

export function Menu() {
  const buy = (name: string) => {
    const msg = encodeURIComponent(`Halo, saya mau pesan ${name} dari Pentol Berkah Ma'nyuss 🔥`);
    window.open(`https://wa.me/6281234567890?text=${msg}`, "_blank");
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
            Setiap menu dibuat fresh setiap hari dengan bahan pilihan terbaik.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.article
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="group glass rounded-3xl overflow-hidden shadow-card flex flex-col"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.img}
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
                  Stok tersedia: <span className="text-foreground font-medium">{item.stock} pcs</span>
                </p>
                <button
                  onClick={() => buy(item.name)}
                  className="mt-auto inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-flame text-primary-foreground font-semibold hover:glow-flame transition-all hover:scale-[1.02]"
                >
                  <ShoppingBag className="h-4 w-4" /> Beli Sekarang
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
