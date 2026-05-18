import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";
const SHEET_NAME = "Transactions";

const ItemSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.number().int().min(1).max(999),
  sauces: z.array(z.string().max(50)).max(20),
  withBroth: z.boolean(),
});

const InputSchema = z.object({
  orderNumber: z.string().min(1).max(50),
  buyerName: z.string().min(1).max(100),
  buyerWhatsapp: z.string().min(1).max(30),
  total: z.number().int().min(0),
  items: z.array(ItemSchema).min(1).max(100),
});

export const logTransactionToSheet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    const SHEETS_KEY = process.env.GOOGLE_SHEETS_API_KEY;
    const SHEET_ID = process.env.GOOGLE_SHEET_ID;

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!SHEETS_KEY) throw new Error("GOOGLE_SHEETS_API_KEY is not configured");
    if (!SHEET_ID) throw new Error("GOOGLE_SHEET_ID is not configured");

    const menuSummary = data.items
      .map((i) => {
        const extras = [
          i.withBroth ? "berkuah" : "tidak berkuah",
          ...(i.sauces.length ? [`saos: ${i.sauces.join("/")}`] : []),
        ].join(", ");
        return `${i.quantity}x ${i.name} (${extras})`;
      })
      .join(" | ");

    const tanggal = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const row = [
      data.orderNumber,
      data.buyerName,
      data.buyerWhatsapp,
      menuSummary,
      data.total,
      tanggal,
    ];

    const url = `${GATEWAY_URL}/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:F:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": SHEETS_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [row] }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Google Sheets append failed [${res.status}]: ${text}`);
    }

    return { ok: true };
  });
