import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, LineChart,
} from "recharts";
import {
  TrendingUp, ShoppingBag, Users, Package, Star, Loader2, Plus, Edit, Trash2, X, Crown,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useAdmin } from "@/hooks/use-admin";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin Dashboard — Pentol Berkah" }] }),
});

interface Menu { id: string; name: string; price: number; stock: number; tag: string | null; available: boolean; image_key: string | null; }
interface Order { id: string; order_number: string | null; user_id: string; status: string; total: number; buyer_name: string | null; buyer_whatsapp: string | null; created_at: string; }
interface Txn { id: string; order_id: string; status: string; amount: number; method: string | null; }
interface Review { id: string; menu_id: string; user_id: string; rating: number; content: string | null; created_at: string; }

const fmt = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;

function AdminPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isAdmin, checking } = useAdmin();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || checking) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center px-4">
        <div className="glass rounded-3xl p-10 max-w-md text-center space-y-4">
          <Crown className="h-12 w-12 mx-auto text-primary" />
          <h1 className="text-2xl font-display font-bold">Akses ditolak</h1>
          <p className="text-sm text-muted-foreground">
            Halaman ini khusus admin. Hubungi pemilik untuk mendapatkan akses.
          </p>
          <Link to="/" className="inline-block px-5 py-2.5 rounded-xl bg-gradient-flame text-primary-foreground font-semibold">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [tab, setTab] = useState<"overview" | "menu" | "orders" | "reviews">("overview");
  const [menus, setMenus] = useState<Menu[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [txns, setTxns] = useState<Txn[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  const load = async () => {
    const [{ data: m }, { data: o }, { data: t }, { data: r }] = await Promise.all([
      supabase.from("menu").select("*").order("created_at"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(200),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setMenus((m ?? []) as Menu[]);
    setOrders((o ?? []) as Order[]);
    setTxns((t ?? []) as Txn[]);
    setReviews((r ?? []) as Review[]);
    const ids = Array.from(new Set([...(o ?? []).map((x: any) => x.user_id), ...(r ?? []).map((x: any) => x.user_id)]));
    if (ids.length) {
      const { data: pr } = await supabase.from("profiles").select("id,full_name").in("id", ids);
      setProfiles(Object.fromEntries((pr ?? []).map((p: any) => [p.id, p.full_name ?? "Pelanggan"])));
    }
  };

  useEffect(() => {
    load();
    const ch = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "menu" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const stats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const month = new Date(today.getFullYear(), today.getMonth(), 1);
    const paid = orders.filter((o) => o.status === "paid");
    const daily = paid.filter((o) => new Date(o.created_at) >= today).reduce((s, o) => s + o.total, 0);
    const monthly = paid.filter((o) => new Date(o.created_at) >= month).reduce((s, o) => s + o.total, 0);
    const customers = new Set(orders.map((o) => o.user_id)).size;
    return { daily, monthly, totalOrders: orders.length, customers };
  }, [orders]);

  const chartData = useMemo(() => {
    const days: { day: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const total = orders
        .filter((o) => o.status === "paid" && new Date(o.created_at) >= d && new Date(o.created_at) < next)
        .reduce((s, o) => s + o.total, 0);
      days.push({ day: d.toLocaleDateString("id-ID", { weekday: "short" }), total });
    }
    return days;
  }, [orders]);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold">
              Admin <span className="text-gradient-flame">Dashboard</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Realtime — semua pesanan & menu terupdate otomatis.</p>
          </div>
          <Link to="/" className="px-4 py-2 rounded-xl glass text-sm font-medium">← Beranda</Link>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {([
            ["overview", "Ringkasan"],
            ["menu", "Menu & Stok"],
            ["orders", "Order"],
            ["reviews", "Review"],
          ] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                tab === k ? "bg-gradient-flame text-primary-foreground glow-flame" : "glass hover:bg-secondary/60"
              }`}
            >{l}</button>
          ))}
        </div>

        {tab === "overview" && <Overview stats={stats} chartData={chartData} orders={orders} txns={txns} menus={menus} reviews={reviews} profiles={profiles} />}
        {tab === "menu" && <MenuMgmt menus={menus} onChange={load} />}
        {tab === "orders" && <OrdersList orders={orders} txns={txns} profiles={profiles} />}
        {tab === "reviews" && <ReviewsList reviews={reviews} menus={menus} profiles={profiles} />}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={`h-5 w-5 ${accent ?? "text-primary"}`} />
      </div>
      <div className="mt-2 font-display font-extrabold text-2xl">{value}</div>
    </motion.div>
  );
}

function Overview({ stats, chartData, orders, menus, reviews, profiles }: any) {
  const bestMenu = useMemo(() => {
    const m: Record<string, number> = {};
    orders.filter((o: Order) => o.status === "paid").forEach((o: Order) => { m[o.id] = (m[o.id] ?? 0) + 1; });
    // best by count from reviews proxy
    const r: Record<string, { count: number; sum: number }> = {};
    reviews.forEach((rv: Review) => {
      r[rv.menu_id] = r[rv.menu_id] ?? { count: 0, sum: 0 };
      r[rv.menu_id].count++;
      r[rv.menu_id].sum += rv.rating;
    });
    return menus.map((mn: Menu) => ({
      ...mn,
      reviews: r[mn.id]?.count ?? 0,
      avg: r[mn.id] ? r[mn.id].sum / r[mn.id].count : 0,
    })).sort((a: any, b: any) => b.reviews - a.reviews).slice(0, 5);
  }, [orders, menus, reviews]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Penjualan Harian" value={fmt(stats.daily)} />
        <StatCard icon={TrendingUp} label="Penjualan Bulanan" value={fmt(stats.monthly)} />
        <StatCard icon={ShoppingBag} label="Total Order" value={stats.totalOrders} />
        <StatCard icon={Users} label="Pelanggan" value={stats.customers} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <h3 className="font-display font-bold text-lg mb-4">Penjualan 7 Hari Terakhir</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis dataKey="day" stroke="currentColor" fontSize={12} />
                <YAxis stroke="currentColor" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }}
                  formatter={(v: number) => fmt(v)}
                />
                <Bar dataKey="total" fill="url(#flameG)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="flameG" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.22 35)" />
                    <stop offset="100%" stopColor="oklch(0.62 0.25 18)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <h3 className="font-display font-bold text-lg mb-4">Menu Terlaris</h3>
          <ul className="space-y-3">
            {bestMenu.map((m: any, i: number) => (
              <li key={m.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-7 w-7 grid place-items-center rounded-lg bg-gradient-flame text-primary-foreground text-xs font-bold">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{m.name}</p>
                    <p className="text-xs text-muted-foreground">Stok {m.stock}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
                  {m.avg.toFixed(1)} <span className="text-muted-foreground">({m.reviews})</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <h3 className="font-display font-bold text-lg mb-4">Order Realtime</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="py-2">No Order</th><th>Pembeli</th><th>Total</th><th>Status</th><th>Waktu</th></tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((o: Order) => (
                <tr key={o.id} className="border-t border-border/40">
                  <td className="py-3 font-mono">{o.order_number ?? "-"}</td>
                  <td>{o.buyer_name ?? profiles[o.user_id] ?? "—"}</td>
                  <td>{fmt(o.total)}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      o.status === "paid" ? "bg-emerald-500/20 text-emerald-400" :
                      o.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                      "bg-rose-500/20 text-rose-400"
                    }`}>{o.status}</span>
                  </td>
                  <td className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MenuMgmt({ menus, onChange }: { menus: Menu[]; onChange: () => void }) {
  const [edit, setEdit] = useState<Partial<Menu> | null>(null);

  const save = async () => {
    if (!edit?.name || !edit?.price) return toast.error("Nama & harga wajib");
    const payload = {
      name: edit.name, price: Number(edit.price), stock: Number(edit.stock ?? 0),
      tag: edit.tag || null, available: edit.available ?? true, image_key: edit.image_key || null,
    };
    const { error } = edit.id
      ? await supabase.from("menu").update(payload).eq("id", edit.id)
      : await supabase.from("menu").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan");
    setEdit(null); onChange();
  };

  const del = async (id: string) => {
    if (!confirm("Hapus menu ini?")) return;
    const { error } = await supabase.from("menu").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Dihapus"); onChange();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setEdit({ available: true, stock: 0 })} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-flame text-primary-foreground font-semibold">
          <Plus className="h-4 w-4" /> Tambah Menu
        </button>
      </div>
      <div className="glass rounded-3xl p-2 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="px-4 py-3">Nama</th><th>Harga</th><th>Stok</th><th>Tag</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {menus.map((m) => (
              <tr key={m.id} className="border-t border-border/40">
                <td className="px-4 py-3 font-semibold">{m.name}</td>
                <td>{fmt(m.price)}</td>
                <td><span className={m.stock < 5 ? "text-rose-400 font-bold" : ""}>{m.stock}</span></td>
                <td>{m.tag ?? "-"}</td>
                <td>{m.available ? "Aktif" : "Nonaktif"}</td>
                <td className="px-4 text-right">
                  <button onClick={() => setEdit(m)} className="p-2 rounded-lg hover:bg-secondary/60"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => del(m.id)} className="p-2 rounded-lg hover:bg-secondary/60 text-rose-400"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {edit && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-background/80 backdrop-blur-md p-4" onClick={() => setEdit(null)}>
          <div onClick={(e) => e.stopPropagation()} className="glass rounded-3xl p-6 w-full max-w-md space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">{edit.id ? "Edit" : "Tambah"} Menu</h3>
              <button onClick={() => setEdit(null)}><X className="h-4 w-4" /></button>
            </div>
            <Field label="Nama"><input className="input" value={edit.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Harga"><input type="number" className="input" value={edit.price ?? ""} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })} /></Field>
              <Field label="Stok"><input type="number" className="input" value={edit.stock ?? 0} onChange={(e) => setEdit({ ...edit, stock: Number(e.target.value) })} /></Field>
            </div>
            <Field label="Tag (opsional)"><input className="input" value={edit.tag ?? ""} onChange={(e) => setEdit({ ...edit, tag: e.target.value })} /></Field>
            <Field label="Image key"><input className="input" value={edit.image_key ?? ""} onChange={(e) => setEdit({ ...edit, image_key: e.target.value })} placeholder="pentol-ikan" /></Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={edit.available ?? true} onChange={(e) => setEdit({ ...edit, available: e.target.checked })} /> Aktif
            </label>
            <button onClick={save} className="w-full py-3 rounded-2xl bg-gradient-flame text-primary-foreground font-semibold">Simpan</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function OrdersList({ orders, txns, profiles }: any) {
  return (
    <div className="glass rounded-3xl p-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr><th className="px-3 py-3">No Order</th><th>Pembeli</th><th>WA</th><th>Total</th><th>Status</th><th>Bayar</th><th>Waktu</th></tr>
        </thead>
        <tbody>
          {orders.map((o: Order) => {
            const tx = txns.find((t: Txn) => t.order_id === o.id);
            return (
              <tr key={o.id} className="border-t border-border/40">
                <td className="px-3 py-3 font-mono">{o.order_number ?? "-"}</td>
                <td>{o.buyer_name ?? profiles[o.user_id] ?? "-"}</td>
                <td className="text-muted-foreground">{o.buyer_whatsapp ?? "-"}</td>
                <td>{fmt(o.total)}</td>
                <td>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    o.status === "paid" ? "bg-emerald-500/20 text-emerald-400" :
                    o.status === "pending" ? "bg-amber-500/20 text-amber-400" :
                    "bg-rose-500/20 text-rose-400"
                  }`}>{o.status}</span>
                </td>
                <td className="text-xs">{tx ? `${tx.method ?? "-"} • ${tx.status}` : "—"}</td>
                <td className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("id-ID")}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ReviewsList({ reviews, menus, profiles }: any) {
  const names = Object.fromEntries(menus.map((m: Menu) => [m.id, m.name]));
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {reviews.map((r: Review) => (
        <div key={r.id} className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Array.from({ length: r.rating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString("id-ID")}</span>
          </div>
          <p className="mt-2 text-sm">{r.content || "—"}</p>
          <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-xs">
            <span className="font-semibold">{profiles[r.user_id] ?? "Pelanggan"}</span>
            <span className="text-muted-foreground">{names[r.menu_id] ?? "Menu"}</span>
          </div>
        </div>
      ))}
      {reviews.length === 0 && <p className="text-sm text-muted-foreground col-span-2 text-center py-8">Belum ada review.</p>}
    </div>
  );
}
