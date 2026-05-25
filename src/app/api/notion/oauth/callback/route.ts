/**
 * S-18: Notion OAuth-callback med CSRF state-validering.
 *
 * Verifiserer HMAC-signert state (userId.nonce.sig) generert av
 * /api/notion/oauth/connect — samme mønster som Google Calendar-callback.
 *
 * Env-vars som kreves:
 *   NOTION_CLIENT_ID        — fra Notion-integration-innstillinger
 *   NOTION_CLIENT_SECRET    — fra Notion-integration-innstillinger
 *   NOTION_WEBHOOK_SECRET   — for HMAC state-validering
 *   NEXT_PUBLIC_APP_URL     — for redirect_uri
 */

import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { createHmac } from "node:crypto";

export const runtime = "nodejs";

const REDIRECT_BASE = "/admin/workspace/notion";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      new URL(`${REDIRECT_BASE}?error=${encodeURIComponent(errorParam)}`, url.origin),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL(`${REDIRECT_BASE}?error=mangler-code-eller-state`, url.origin),
    );
  }

  // S-18: CSRF — verifiser HMAC-signert state
  const secret = process.env.NOTION_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "NOTION_WEBHOOK_SECRET mangler" }, { status: 500 });
  }

  const parts = state.split(".");
  if (parts.length !== 3) {
    return NextResponse.redirect(
      new URL(`${REDIRECT_BASE}?error=ugyldig-state-format`, url.origin),
    );
  }

  const [userId, nonce, sig] = parts;
  if (!userId || !nonce || !sig) {
    return NextResponse.redirect(
      new URL(`${REDIRECT_BASE}?error=ugyldig-state-innhold`, url.origin),
    );
  }

  const forventet = createHmac("sha256", secret)
    .update(`${userId}.${nonce}`)
    .digest("hex");

  // Tidskonstant sammenligning — unngå timing attacks
  if (!timingSafeEqual(sig, forventet)) {
    return NextResponse.redirect(
      new URL(`${REDIRECT_BASE}?error=state-signatur-feil`, url.origin),
    );
  }

  // State OK — bytt code mot access_token
  const clientId = process.env.NOTION_CLIENT_ID;
  const clientSecret = process.env.NOTION_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "NOTION_CLIENT_ID eller NOTION_CLIENT_SECRET mangler" },
      { status: 500 },
    );
  }

  try {
    const redirectUri = `${appUrl}/api/notion/oauth/callback`;
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = (await tokenRes.json().catch(() => ({}))) as Record<string, unknown>;
      const msg = typeof errBody.error_description === "string"
        ? errBody.error_description
        : typeof errBody.error === "string"
          ? errBody.error
          : "token-exchange-feilet";
      return NextResponse.redirect(
        new URL(`${REDIRECT_BASE}?error=${encodeURIComponent(msg.slice(0, 100))}`, url.origin),
      );
    }

    // TODO: lagre access_token til NotionConnection-tabellen (kryptert)
    // via /lib/notion/client.ts når Notion per-user OAuth er fullt implementert.
    // For nå: logg og redirect OK.
    const _tokenData = await tokenRes.json();
    console.info("[notion/oauth/callback] token mottatt for userId:", userId);

    return NextResponse.redirect(
      new URL(`${REDIRECT_BASE}?ok=1`, url.origin),
    );
  } catch (err) {
    const melding = err instanceof Error ? err.message : "ukjent";
    return NextResponse.redirect(
      new URL(
        `${REDIRECT_BASE}?error=${encodeURIComponent(melding.slice(0, 100))}`,
        url.origin,
      ),
    );
  }
}

/**
 * Tidskonstant streng-sammenligning for å unngå timing attacks.
 * Bruker XOR over alle byte-posisjoner uavhengig av mismatch-posisjon.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
