import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { safeRedirectPath } from "@/lib/security/safe-redirect";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  // safeRedirectPath avviser absolutte URLer og protocol-relative paths
  const next = safeRedirectPath(url.searchParams.get("next"), "/auth/etter-innlogging");

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=no-code", url.origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, url.origin),
    );
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
        // Ny bruker — opprett som PLAYER med GRATIS tier + PLATFORM_ONLY enrollering.
        // Coach må manuelt enrollere i et coachingprogram.
        const metaName =
          (authUser.user_metadata?.full_name as string | undefined) ??
          (authUser.user_metadata?.name as string | undefined) ??
          email.split("@")[0];
        const nyBruker = await prisma.user.create({
          data: {
            authId: authUser.id,
            email,
            name: metaName,
            role: "PLAYER",
            tier: "GRATIS",
            lastLoginAt: new Date(),
          },
        });
        // Automatisk PLATFORM_ONLY-enrollering — usynlig i CoachHQ inntil coach
        // enrollerer spilleren i et coachingprogram.
        await prisma.playerEnrollment.create({
          data: {
            userId: nyBruker.id,
            program: "PLATFORM_ONLY",
            coachId: null,
          },
        });
      }
    }
  } catch (linkErr) {
    // Logg, men ikke blokker login — brukeren kan fortsatt komme inn.
    // Manuell DB-fiks kan utføres senere.
    console.error("[oauth-callback] auto-link feilet:", linkErr);
  }

  // next er allerede validert som relativ path — new URL er trygt her
  return NextResponse.redirect(new URL(next, url.origin));
}
