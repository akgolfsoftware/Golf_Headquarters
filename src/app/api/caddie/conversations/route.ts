// GET /api/caddie/conversations
// Lister brukerens Caddie-samtaler, gruppert etter conversationId, med siste
// melding-snippet og tidspunkt. Krever ADMIN-rolle.

import { NextResponse } from "next/server";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type ConversationSummary = {
  conversationId: string;
  lastMessageAt: string;
  lastSnippet: string;
  messageCount: number;
};

export async function GET() {
  const user = await canAccessMissionControl();
  if (!user) {
    return NextResponse.json({ error: "ikke-autorisert" }, { status: 401 });
  }

  // Hent alle meldinger for brukeren, nyeste først, og grupper i minne.
  // Volumet per bruker er moderat (intern admin), så en enkel passering er
  // greit inntil vi ev. flytter aggregering til SQL.
  const messages = await prisma.caddieMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      conversationId: true,
      content: true,
      createdAt: true,
    },
    take: 500,
  });

  const grouped = new Map<string, ConversationSummary>();
  for (const m of messages) {
    const existing = grouped.get(m.conversationId);
    if (existing) {
      existing.messageCount += 1;
      continue;
    }
    grouped.set(m.conversationId, {
      conversationId: m.conversationId,
      lastMessageAt: m.createdAt.toISOString(),
      lastSnippet: m.content.slice(0, 140),
      messageCount: 1,
    });
  }

  const conversations = Array.from(grouped.values()).sort((a, b) =>
    b.lastMessageAt.localeCompare(a.lastMessageAt),
  );

  return NextResponse.json({ conversations });
}
