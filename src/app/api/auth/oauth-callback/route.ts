import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { safeRedirectPath } from "@/lib/security/safe-redirect";
import { logError } from "@/lib/error-tracking";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/security/same-origin";
import { linkAndSyncUserTournamentResults } from "@/lib/turneringer/link-public-players";

export const runtime = "nodejs";

// Behold nettleserens origin. Next sin interne origin kan være localhost
// bak en lokal proxy, mens innloggingens cookies tilhører 127.0.0.1.
function redirectWithinApp(path: string) {
  return new NextResponse(null, { status: 307, headers: { Location: path } });
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  try {
    const rl = await rateLimit({ key: `auth-oauth-callback:${ip}`, max: 30, windowMs: 60_000 });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "rate-limited" },
        { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
      );
    }
  } catch {
    // Aldri blokker OAuth pga rate-limit infra
  }

  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  // safeRedirectPath avviser absolutte URLer og protocol-relative paths
  const next = safeRedirectPath(url.searchParams.get("next"), "/auth/etter-innlogging");

  if (!code) {
    return redirectWithinApp("/auth/login?error=no-code");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return redirectWithinApp("/auth/login?error=invalid-code");
  }

  // Auto-link Supabase auth-bruker til Prisma User.
  // - Hvis Prisma User finnes med samme email (seeded med placeholder authId),
  //   oppdater authId til ekte Supabase UUID.
  // - Hvis ingen Prisma User finnes, opprett ny PLAYER (default for nye brukere).
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser && authUser.email) {
      const email = authUser.email.toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email } });

      if (existing) {
        // Linke placeholder-authId til ekte UUID hvis ikke matchet allerede
        if (existing.authId !== authUser.id) {
          await prisma.user.update({
            where: { id: existing.id },
            data: { authId: authUser.id, lastLoginAt: new Date() },
          });
        } else {
          await prisma.user.update({
            where: { id: existing.id },
            data: { lastLoginAt: new Date() },
          });
        }
      } else {
        // Ny bruker. E-postregistrering (AU-02) bærer rolle og navn i metadata; Google gjør det ikke.
        // Rollen whitelistes som i ensureUser: bare PLAYER eller PARENT, aldri privilegert. Tier er alltid
        // GRATIS, og spillere får profilType TALENT (samme som ensureUser), ellers lander de på INGEN.
        const meta = authUser.user_metadata ?? {};
        const metaName =
          (meta.full_name as string | undefined) ??
          (meta.name as string | undefined) ??
          email.split("@")[0];
        const role = meta.role === "PARENT" ? "PARENT" : "PLAYER";
        const fraSkjema = [meta.firstName, meta.lastName]
          .filter((x): x is string => typeof x === "string" && x.trim() !== "")
          .join(" ")
          .trim();
        const nyBruker = await prisma.user.create({
          data: {
            authId: authUser.id,
            email,
            name: fraSkjema || metaName,
            role,
            tier: "GRATIS",
            lastLoginAt: new Date(),
            ...(role === "PLAYER" ? { profilType: "TALENT" as const, profilKilde: meta.kilde === "talenthq" ? "TALENTHQ" : "SIGNUP" } : {}),
          },
        });
        if (role === "PLAYER") {
          // Automatisk PLATFORM_ONLY-enrollering — usynlig i AgencyOS inntil coach
          // enrollerer spilleren i et coachingprogram.
          await prisma.playerEnrollment.create({
            data: {
              userId: nyBruker.id,
              program: "PLATFORM_ONLY",
              coachId: null,
            },
          });
        }

        // Automatisk kobling mot turneringshistorikk
        await linkAndSyncUserTournamentResults(prisma, nyBruker.id);
      }
    }
  } catch (error) {
    // Logg, men ikke blokker login — brukeren kan fortsatt komme inn.
    // Manuell DB-fiks kan utføres senere.
    await logError({ context: "auth.oauth-callback.auto-link", error, severity: "warn" });
  }

  return redirectWithinApp(next);
}
