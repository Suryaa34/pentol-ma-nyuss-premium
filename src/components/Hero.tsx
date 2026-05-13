import { motion } from "framer-motion";
import { Flame, Star } from "lucide-react";
import hero from "@/assets/hero.jpg";

export function Hero() {
  return (
    <section id="home" className="relative pt-32 md:pt-40 pb-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-medium">
            <Flame className="h-3.5 w-3.5 text-primary" />
            #1 Pentol Legendaris di Kotamu
          </span>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-[1.05]">
            Sensasi <span className="text-gradient-flame">Pentol</span>
            <br />
            Yang Bikin <span className="italic">Ma'nyusss</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Diolah dari bahan premium dengan resep turun-temurun. Setiap gigitan adalah berkah, setiap rasa bikin nagih.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#menu" className="px-7 py-3.5 rounded-2xl bg-gradient-flame text-primary-foreground font-semibold glow-flame hover:scale-105 transition-transform">
              Lihat Menu
            </a>
            <a href="#about" className="px-7 py-3.5 rounded-2xl glass font-semibold hover:bg-secondary/60 transition-colors">
              Tentang Kami
            </a>
          </div>
          <div className="flex items-center gap-6 pt-4">
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">2.500+ pelanggan puas</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-2xl font-display font-bold text-gradient-flame">10K+</p>
              <p className="text-xs text-muted-foreground">Pentol terjual</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-flame blur-3xl opacity-30 rounded-full" />
          <motion.img
            src={hero}
            alt="Pentol premium dengan saus pedas"
            width={1536}
            height={1024}
            className="relative rounded-3xl shadow-card w-full"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="absolute -bottom-4 -left-4 glass rounded-2xl p-4 flex items-center gap-3 shadow-card"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-flame grid place-items-center">
              <Flame className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mulai dari</p>
              <p className="font-display font-bold">Rp 500</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
