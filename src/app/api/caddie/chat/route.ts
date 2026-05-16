import { NextResponse } from "next/server";

/**
 * Stub for /api/caddie/chat.
 *
 * Bytt ut med ekte AI SDK streaming når @ai-sdk/react er installert (M19).
 * Klienten bruker foreløpig en lokal mock-hook (use-caddie-chat.ts) som ikke
 * treffer dette endepunktet — det er definert her så frontenden kan kobles
 * direkte uten ekstra endring i komponentene.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({
    ok: true,
    received: body,
    note: "Caddie chat-endepunkt er ikke koblet til AI ennå. Frontenden kjører mock-modus.",
  });
}
