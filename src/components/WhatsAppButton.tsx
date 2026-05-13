import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/6281234567890?text=Halo%20Pentol%20Berkah%20Ma'nyuss%20🔥"
      target="_blank"
      rel="noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring" }}
      className="fixed bottom-6 right-6 z-40 group"
      aria-label="Chat WhatsApp"
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
      <span className="relative flex items-center gap-2 bg-[#25D366] text-white pl-4 pr-5 py-3.5 rounded-full shadow-card hover:scale-110 transition-transform">
        <MessageCircle className="h-5 w-5 fill-white" />
        <span className="hidden sm:inline font-semibold text-sm">Chat Kami</span>
      </span>
    </motion.a>
  );
}
