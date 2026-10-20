import type { Metadata } from "next";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { erGyldigTokenForm } from "@/app/team-wang/_data/wang-admin-regler";
import { WangSystemside } from "@/components/wang/WangSystemside";
import { GodtaInvitasjon } from "./godta-invitasjon";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Invitasjon som trener — WANG",
  robots: { index: false, follow: false },
  // Lenken bærer tokenet; ingen henvisning til andre nettsteder.
  referrer: "no-referrer",
};

/**
 * Invitasjonslenken fra Administrasjon › Trenere (pakke W4). Krever innlogget trenerkonto. Selve sjekken
 * (token, utløp, e-post og gruppe) skjer i aksepterTrenerInvitasjon når treneren trykker «Godta».
 * Utseende: designløftet 20.10.2026, canvas rad 13–14.
 */
export default async function WangInvitasjonPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sti = `/team-wang/coach/invitasjon/${encodeURIComponent(token)}`;
  const bruker = await requirePortalUser({
    tillatDemo: true,
    allow: ["ADMIN", "COACH"],
    redirectTo: `/wang?next=${encodeURIComponent(sti)}`,
  });
  if (!erGyldigTokenForm(token)) {
    return (
      <WangSystemside
        merke="Invitasjon som trener"
        stort="Utløpt"
        tittel="Lenken er ugyldig, utløpt eller allerede brukt"
        fakta={[{ etikett: "Slik får du en ny", tekst: "Be sportssjefen lage en ny lenke under Administrasjon › Trenere." }]}
        handlinger={[{ tekst: "Logg inn på WANG", href: "/wang" }]}
      >
        <p className="wg-system-tekst">En invitasjonslenke gjelder i sju dager og kan brukes én gang.</p>
      </WangSystemside>
    );
  }
  return (
    <WangSystemside merke="Invitasjon som trener" stort="Velkommen" tittel="Du er invitert som trener">
      <GodtaInvitasjon token={token} epost={bruker.email} />
    </WangSystemside>
  );
}
