// Start Notion OAuth-flyt.
// Kun ADMIN-brukere får lov til å initiere tilkobling.
// Returnerer redirect til Notion sin authorize-endpoint.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/auth/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
    );
  }
  if (user.role !== "ADMIN") {
    return NextResponse.redirect(
      new URL(
        "/admin/workspace/notion?error=admin_only",
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      ),
    );
  }

  const clientId = process.env.NOTION_OAUTH_CLIENT_ID;
  const redirectUri = process.env.NOTION_OAUTH_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error: "config_missing",
        detail:
          "NOTION_OAUTH_CLIENT_ID og NOTION_OAUTH_REDIRECT_URI må settes som env-vars.",
      },
      { status: 500 },
    );
  }

  const authorizeUrl = new URL("https://api.notion.com/v1/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("owner", "user");
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  // state kan brukes for CSRF — vi knytter tilkoblingen til innlogget user
  // via Supabase-cookie, så enkel state holder for v1.1.
  authorizeUrl.searchParams.set("state", user.id);

  return NextResponse.redirect(authorizeUrl.toString());
}
