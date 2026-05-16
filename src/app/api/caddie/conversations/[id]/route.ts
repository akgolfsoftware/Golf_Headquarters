// GET /api/caddie/conversations/[id]    — hele samtale-historikk for én samtale
// DELETE /api/caddie/conversations/[id]  — sletter alle meldinger i samtalen
// Krever ADMIN-rolle. Brukeren kan kun røre egne samtaler.

import { NextResponse } from "next/server";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await canAccessMissionControl();
  if (!user) {
    return NextResponse.json({ error: "ikke-autorisert" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "manglende-id" }, { status: 400 });
  }

  const messages = await prisma.caddieMessage.findMany({
    where: { userId: user.id, conversationId: id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      content: true,
      toolCalls: true,
      toolResults: true,
      model: true,
      inputTokens: true,
      outputTokens: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ conversationId: id, messages });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await canAccessMissionControl();
  if (!user) {
    return NextResponse.json({ error: "ikke-autorisert" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "manglende-id" }, { status: 400 });
  }

  const result = await prisma.caddieMessage.deleteMany({
    where: { userId: user.id, conversationId: id },
  });

  return NextResponse.json({ deleted: result.count });
}
