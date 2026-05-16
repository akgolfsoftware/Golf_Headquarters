import { NextResponse } from "next/server";
import type { CaddieConversation } from "@/components/admin/caddie/types";

/**
 * Stub for /api/caddie/conversations.
 *
 * Returnerer en hardkodet liste inntil Conversation-modellen er lagt til i
 * Prisma. Klienten kan bytte til denne ved å erstatte MOCK_CONVERSATIONS i
 * page.tsx med en fetch mot dette endepunktet.
 */
export async function GET() {
  const now = Date.now();
  const conversations: CaddieConversation[] = [
    {
      id: "c_active",
      title: "Ny samtale",
      snippet: "Hei Anders. Jeg er klar når du er.",
      updatedAt: new Date(now).toISOString(),
    },
    {
      id: "c_uke",
      title: "Ukesrapport sponsor",
      snippet: "Jeg har samlet tallene — vil du ha PDF eller e-post?",
      updatedAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "c_fakt",
      title: "Utestående fakturaer",
      snippet: "Totalt 12 450 kr på 4 fakturaer. Eldste forfaller om 2 dager.",
      updatedAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      unread: true,
    },
    {
      id: "c_vinter",
      title: "Vinterpakke til Bjørn",
      snippet: "Utkast laget — venter på godkjenning.",
      updatedAt: new Date(now - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
  ];
  return NextResponse.json({ conversations });
}
