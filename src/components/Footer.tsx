import { Instagram, Facebook, Twitter, MapPin, Phone, Mail } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer id="contact" className="relative mt-20 border-t border-border">
      <div className="absolute inset-0 bg-gradient-flame opacity-[0.04] pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-4 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Logo" className="h-10 w-10 rounded-xl object-contain" />
              <span className="font-display font-bold text-xl">
                Pentol <span className="text-gradient-flame">Berkah Ma'nyuss</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              UMKM kuliner dengan cita rasa autentik. Dibuat dengan cinta, disajikan dengan berkah.
            </p>
            <div className="flex gap-2">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="h-10 w-10 grid place-items-center rounded-xl glass hover:glow-flame transition-all">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-bold">Navigasi</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#home" className="hover:text-foreground">Home</a></li>
              <li><a href="#menu" className="hover:text-foreground">Menu</a></li>
              <li><a href="#about" className="hover:text-foreground">Tentang</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-bold">Kontak</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +62 812-3456-7890</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> halo@pentolberkah.id</li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Malang, Indonesia</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Pentol Berkah Ma'nyuss. All rights reserved.</p>
          <p>Crafted with 🔥 in Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
