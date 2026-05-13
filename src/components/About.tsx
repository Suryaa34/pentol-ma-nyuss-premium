import { motion } from "framer-motion";
import { Sparkles, Truck, Award } from "lucide-react";

const features = [
  { icon: Sparkles, title: "Bahan Premium", desc: "Daging dan ikan segar pilihan setiap hari" },
  { icon: Award, title: "Resep Legendaris", desc: "Diwariskan turun-temurun sejak 1995" },
  { icon: Truck, title: "Antar Cepat", desc: "Pesan via WhatsApp, sampai dalam 30 menit" },
];

export function About() {
  return (
    <section id="about" className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-3xl p-6 space-y-3 hover:glow-flame transition-all"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-flame grid place-items-center glow-flame">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display font-bold text-xl">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
