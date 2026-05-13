/**
 * OAuth-callback fra Google. Validerer state, bytter code til tokens,
 * krypterer refresh_token og lagrer GoogleCalendarConnection.
 */
import { NextResponse } from "next/server";
import { createHmac } from "node:crypto";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import {
  encryptToken,
  exchangeCode,
  getOAuth2Client,
} from "@/lib/google-calendar";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      new URL(`/admin/settings/calendar?error=${encodeURIComponent(errorParam)}`, req.url),
    );
  }
  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/admin/settings/calendar?error=mangler-code", req.url),
    );
  }

  // Verifiser state-signatur
  const secret = process.env.GOOGLE_WEBHOOK_TOKEN_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "secret-mangler" }, { status: 500 });
  }
  const parts = state.split(".");
  if (parts.length !== 3) {
    return NextResponse.redirect(
      new URL("/admin/settings/calendar?error=ugyldig-state", req.url),
    );
  }
  const [userId, nonce, sig] = parts;
  const forventet = createHmac("sha256", secret)
    .update(`${userId}.${nonce}`)
    .digest("hex");
  if (sig !== forventet) {
    return NextResponse.redirect(
      new URL("/admin/settings/calendar?error=state-signatur-feil", req.url),
    );
  }

  // Bytt code mot tokens
  try {
    const tokens = await exchangeCode(code);
    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        new URL(
          "/admin/settings/calendar?error=ingen-refresh-token-fjern-tilgang-og-prov-igjen",
          req.url,
        ),
      );
    }

    // Hent Google-konto e-post via userinfo
    const oauth = getOAuth2Client();
    oauth.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: oauth });
    const userInfo = await oauth2.userinfo.get();
    const googleEmail = userInfo.data.email ?? "ukjent@example.com";

    const cipher = encryptToken(tokens.refresh_token);

    await prisma.googleCalendarConnection.upsert({
      where: { userId },
      create: {
        userId,
        googleEmail,
        refreshTokenCipher: cipher,
        status: "ACTIVE",
        lastSyncAt: new Date(),
      },
      update: {
        googleEmail,
        refreshTokenCipher: cipher,
        status: "ACTIVE",
        lastError: null,
        lastSyncAt: new Date(),
      },
    });

    return NextResponse.redirect(
      new URL("/admin/settings/calendar?ok=1", req.url),
    );
  } catch (err) {
    const melding = err instanceof Error ? err.message : "ukjent";
    return NextResponse.redirect(
      new URL(
        `/admin/settings/calendar?error=${encodeURIComponent(melding.slice(0, 100))}`,
        req.url,
      ),
    );
  }
}
