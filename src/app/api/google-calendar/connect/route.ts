/**
 * Start OAuth-flyt: generér Google authorization URL og send brukeren dit.
 * Stater inkluderer userId så vi vet hvem som koblet etter callback.
 */
import { NextResponse } from "next/server";
import { randomBytes, createHmac } from "node:crypto";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getAuthUrl, MEG_GOOGLE_SCOPES, SCOPES } from "@/lib/google-calendar";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    // Resolv mot faktisk request-origin — aldri hardkod host (feiler i prod).
    return NextResponse.redirect(new URL("/auth/login", request.url));
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

  // ?meg=1 (kun ADMIN): be om utvidede Gmail/Disk-scopes for Meg-assistenten.
  const wantMeg = new URL(request.url).searchParams.get("meg") === "1";
  const scopes = wantMeg && user.role === "ADMIN" ? MEG_GOOGLE_SCOPES : SCOPES;

  return NextResponse.redirect(getAuthUrl(state, scopes));
}
