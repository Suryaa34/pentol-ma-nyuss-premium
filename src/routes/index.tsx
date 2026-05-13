import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Menu } from "@/components/Menu";
import { About } from "@/components/About";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Loader } from "@/components/Loader";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Pentol Berkah Ma'nyuss — Pentol Premium Legendaris" },
      { name: "description", content: "Nikmati pentol ikan, pentol daging, siomay & tahu bakso premium dari Pentol Berkah Ma'nyuss. Resep legendaris, rasa bikin nagih." },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen dark">
      <Loader />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Menu />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
