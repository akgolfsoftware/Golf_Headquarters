// Notion OAuth-callback.
// Bytter authorization-code mot access_token og oppretter NotionConnection.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/notion/crypto";
import { logError } from "@/lib/error-tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NotionTokenResponse = {
  access_token: string;
  bot_id?: string;
  workspace_id: string;
  workspace_name?: string;
  workspace_icon?: string;
  owner?: unknown;
};

export async function GET(req: Request): Promise<NextResponse> {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const errorParam = url.searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(
      `${appUrl}/admin/workspace/notion?state=empty&error=${encodeURIComponent(errorParam)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${appUrl}/admin/workspace/notion?state=empty&error=missing_code`,
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(`${appUrl}/auth/login`);
  }
  if (user.role !== "ADMIN") {
    return NextResponse.redirect(
      `${appUrl}/admin/workspace/notion?state=empty&error=admin_only`,
    );
  }

  const clientId = process.env.NOTION_OAUTH_CLIENT_ID;
  const clientSecret = process.env.NOTION_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.NOTION_OAUTH_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "config_missing" },
      { status: 500 },
    );
  }

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
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
      const errText = await tokenRes.text();
      await logError({
        context: "notion.oauth-callback.token-exchange",
        error: new Error(`token-exchange-failed: ${errText}`),
        userId: user.id,
      });
      return NextResponse.redirect(
        `${appUrl}/admin/workspace/notion?state=empty&error=token_exchange_failed`,
      );
    }

    const data = (await tokenRes.json()) as NotionTokenResponse;

    const accessTokenEnc = encrypt(data.access_token);

    await prisma.notionConnection.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        accessTokenEnc,
        botId: data.bot_id ?? null,
        workspaceId: data.workspace_id,
        workspaceName: data.workspace_name ?? "Notion workspace",
        workspaceIcon: data.workspace_icon ?? null,
      },
      update: {
        accessTokenEnc,
        botId: data.bot_id ?? null,
        workspaceId: data.workspace_id,
        workspaceName: data.workspace_name ?? "Notion workspace",
        workspaceIcon: data.workspace_icon ?? null,
        lastSyncError: null,
      },
    });

    return NextResponse.redirect(
      `${appUrl}/admin/workspace/notion?state=connected`,
    );
  } catch (err) {
    await logError({
      context: "notion.oauth-callback",
      error: err,
      userId: user.id,
    });
    return NextResponse.redirect(
      `${appUrl}/admin/workspace/notion?state=empty&error=internal`,
    );
  }
}
