/**
 * S-18: Start Notion OAuth-flyt.
 *
 * Genererer HMAC-signert state (userId.nonce.sig) og redirecter
 * til Notion OAuth authorization URL. Samme mønster som
 * src/app/api/google-calendar/connect/route.ts.
 *
 * Env-vars som kreves:
 *   NOTION_CLIENT_ID        — fra Notion-integration-innstillinger
 *   NOTION_WEBHOOK_SECRET   — brukes til å signere state
 *   NEXT_PUBLIC_APP_URL     — for redirect_uri
 */

import "server-only";
import { NextResponse } from "next/server";
import { randomBytes, createHmac } from "node:crypto";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }
  if (user.role !== "ADMIN" && user.role !== "COACH") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const clientId = process.env.NOTION_CLIENT_ID;
  const secret = process.env.NOTION_WEBHOOK_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!clientId || !secret) {
    return NextResponse.json(
      { error: "NOTION_CLIENT_ID eller NOTION_WEBHOOK_SECRET mangler i miljøvariablene." },
      { status: 500 },
    );
  }

  // Signer state med HMAC slik at callback kan verifisere (anti-CSRF)
  const nonce = randomBytes(16).toString("hex");
  const payload = `${user.id}.${nonce}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  const state = `${payload}.${sig}`;

  const redirectUri = `${appUrl}/api/notion/oauth/callback`;

  const authUrl = new URL("https://api.notion.com/v1/oauth/authorize");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("owner", "user");
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
