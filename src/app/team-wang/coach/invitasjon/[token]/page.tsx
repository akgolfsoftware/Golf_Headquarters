import type { Metadata } from "next";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { erGyldigTokenForm } from "@/app/team-wang/_data/wang-admin-regler";
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
 */
export default async function WangInvitasjonPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const sti = `/team-wang/coach/invitasjon/${encodeURIComponent(token)}`;
  await requirePortalUser({
    tillatDemo: true,
    allow: ["ADMIN", "COACH"],
    redirectTo: `/wang?next=${encodeURIComponent(sti)}`,
  });
  return (
    <main className="wg-body" style={{ maxWidth: 560, margin: "0 auto", display: "grid", gap: 16 }}>
      <h1 className="wg-tittel" style={{ margin: 0 }}>Invitasjon som trener</h1>
      {erGyldigTokenForm(token) ? (
        <GodtaInvitasjon token={token} />
      ) : (
        <div className="wg-kort wg-fyll" role="status">
          <b>Lenken er ugyldig</b>
          <p className="wg-kilde">Be sportssjefen om en ny invitasjonslenke.</p>
        </div>
      )}
    </main>
  );
}
