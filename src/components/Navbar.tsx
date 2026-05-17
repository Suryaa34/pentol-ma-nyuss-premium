import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Menu, X, LogOut, User as UserIcon, ShoppingCart, Crown } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";
import { useCart } from "@/hooks/use-cart";
import logo from "@/assets/logo.png";

const links = [
  { href: "#home", label: "Home" },
  { href: "#menu", label: "Menu" },
  { href: "#reviews", label: "Ulasan" },
  { href: "#about", label: "Tentang" },
  { href: "#contact", label: "Kontak" },
];

export function Navbar() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const { count, setOpen: setCartOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all ${scrolled ? "py-2" : "py-4"}`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className={`glass rounded-2xl px-4 py-3 flex items-center justify-between transition-all ${scrolled ? "shadow-card" : ""}`}>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Pentol Berkah" className="h-9 w-9 rounded-lg object-contain" />
            <span className="font-display font-bold text-lg leading-none">
              Pentol <span className="text-gradient-flame">Berkah</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/60">
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCartOpen(true)}
              className="relative h-10 w-10 grid place-items-center rounded-xl glass hover:glow-flame transition-all"
              aria-label="Keranjang"
            >
              <ShoppingCart className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 grid place-items-center rounded-full bg-gradient-flame text-primary-foreground text-[10px] font-bold glow-flame">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => setDark((d) => !d)}
              className="h-10 w-10 grid place-items-center rounded-xl glass hover:glow-flame transition-all"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 glass px-3 py-2 rounded-xl">
                  <UserIcon className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium max-w-[140px] truncate">{user.email}</span>
                </div>
                <button onClick={() => signOut()} className="h-10 w-10 grid place-items-center rounded-xl glass hover:glow-flame" aria-label="Sign out">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/auth" className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-flame text-primary-foreground font-semibold text-sm hover:scale-105 transition-transform glow-flame">
                Masuk
              </Link>
            )}

            <button
              onClick={() => setOpen((o) => !o)}
              className="md:hidden h-10 w-10 grid place-items-center rounded-xl glass"
              aria-label="Menu"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-2 glass rounded-2xl p-4 flex flex-col gap-1"
          >
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg hover:bg-secondary/60 text-sm font-medium">
                {l.label}
              </a>
            ))}
            {user ? (
              <button onClick={() => signOut()} className="px-4 py-3 rounded-lg text-sm font-medium text-left flex items-center gap-2">
                <LogOut className="h-4 w-4" /> Keluar
              </button>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg bg-gradient-flame text-primary-foreground text-sm font-semibold text-center">
                Masuk / Daftar
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
