/**
 * Start OAuth-flyt: generér Google authorization URL og send brukeren dit.
 * Stater inkluderer userId så vi vet hvem som koblet etter callback.
 */
import { NextResponse } from "next/server";
import { randomBytes, createHmac } from "node:crypto";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getAuthUrl } from "@/lib/google-calendar";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", "http://localhost"));
  }
  if (user.role !== "ADMIN" && user.role !== "COACH") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // Signer state med HMAC slik at callback kan verifisere
  const secret = process.env.GOOGLE_WEBHOOK_TOKEN_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "GOOGLE_WEBHOOK_TOKEN_SECRET mangler" },
      { status: 500 },
    );
  }
  const nonce = randomBytes(16).toString("hex");
  const payload = `${user.id}.${nonce}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  const state = `${payload}.${sig}`;

  return NextResponse.redirect(getAuthUrl(state));
}
