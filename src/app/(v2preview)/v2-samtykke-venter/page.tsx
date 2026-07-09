/**
 * v2-forhåndsvisning — Samtykke-venterom (retning C). Samme guard-mønster som
 * den ekte /auth/samtykke-venter: getCurrentUserRaw (ikke getCurrentUser, som
 * ville redirecte hit på nytt → uendelig loop), redirect til innlogging hvis
 * ikke innlogget, redirect til riktig portal hvis samtykke allerede er gitt.
 * Egen top-level route-group (v2preview) som ikke arver PortalShell.
 *
 * SamtykkeVenterV2 leverer sin egen dark-scope + fluid AuthRamme (BrandPanel +
 * kort) — bevisst UTEN V2Shell. Resend-invitasjon og logg-ut er EKTE
 * server-actions (gjenbrukt 1:1, ikke duplisert) — se komponentens docstring.
 * Kilde for guard/data-uttrekk: src/app/auth/samtykke-venter/page.tsx.
 */

import { getCurrentUserRaw } from "@/lib/auth/getCurrentUser";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAwaitingGuardianConsent } from "@/lib/auth/minor";
import { SamtykkeVenterV2 } from "@/components/portal/v2/SamtykkeVenterV2";

export const dynamic = "force-dynamic";

export default async function V2SamtykkeVenterPreviewPage() {
  // getCurrentUserRaw (ikke getCurrentUser): denne siden ER venterommet, så den
  // må kunne lese den ventende brukeren. getCurrentUser ville redirecte hit på
  // nytt → uendelig loop.
  const user = await getCurrentUserRaw();

  // Ikke innlogget → logg inn
  if (!user) redirect("/auth/login");

  // Samtykke allerede gitt → send til portalen
  if (!isAwaitingGuardianConsent(user)) {
    if (user.role === "PARENT") redirect("/forelder");
    if (user.role === "ADMIN" || user.role === "COACH") redirect("/admin");
    redirect("/portal");
  }

  // Finn siste aktive invitasjon for å vise e-postadressen
  const sisteInvitasjon = await prisma.parentInvitation.findFirst({
    where: {
      playerId: user.id,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: { email: true },
  });

  return (
    <SamtykkeVenterV2
      spillerNavn={user.name ?? ""}
      invitasjonEmail={sisteInvitasjon?.email ?? null}
    />
  );
}
