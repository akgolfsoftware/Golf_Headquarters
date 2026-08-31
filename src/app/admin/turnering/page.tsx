/**
 * Turnering — ÉN adresse (MASTERPLAN 15.6, beslutning 6.9 «én inngang per funksjon»).
 *
 * Slår sammen fire adresser: /admin/tournaments (+ filteret den hadde),
 * /admin/tournaments/dubletter, /admin/turnering-kart. Alle tre er nå
 * redirects hit. `/admin/tournaments/ny` er IKKE en fane — den er CTA-en i
 * toppen, og forblir sin egen adresse (uendret opprettelsesskjema).
 *
 * Dubletter-VERKTØYET bor her. Kø (/admin/ko?fane=dubletter, 15.1) viser
 * fortsatt dubletter som sak-type på sin egen adresse — begge fungerer, de
 * deler samme loader (src/lib/admin/ko/last-dubletter.ts).
 *
 * TILGANG: alle fire faner hadde ADMIN/COACH som eneste gate på kildesidene
 * — ingen fane krever mer. En sammenslåing skal ALDRI utvide tilgang. Låst
 * av src/lib/admin/turnering/faner.test.ts.
 *
 * Design: canvas godkjent av Anders 30.08.2026 —
 * designsystem/canvas/agencyos-ia/Turnering.dc.html.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { TurneringHode } from "@/components/admin/v2/turnering/TurneringHode";
import { TurneringAlleListe } from "@/components/admin/v2/turnering/TurneringAlleListe";
import { TurneringKartInnhold } from "@/components/admin/v2/turnering/TurneringKartInnhold";
import { AdminTurneringerTrainLock } from "@/components/admin/v2/tournaments/AdminTurneringerTrainLock";
import { MergeDubletterListe } from "@/app/admin/tournaments/dubletter/merge-liste";
import { TURNERING_FANER, velgTurneringFane } from "@/lib/admin/turnering/faner";
import {
  lastAlleTurneringer,
  lastMineSpillereTurneringer,
  lastTurneringKart,
  turneringFaneTellinger,
} from "@/lib/admin/turnering/lastere";
import { lastDubletter } from "@/lib/admin/ko/last-dubletter";

export const dynamic = "force-dynamic";
export const metadata = { title: "Turnering · AgencyOS" };

export default async function TurneringPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string; sok?: string; side?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { fane: onsket, sok, side } = await searchParams;
  const aktiv = velgTurneringFane(onsket);

  const antall = await turneringFaneTellinger();
  const hode = <TurneringHode faner={TURNERING_FANER} aktiv={aktiv} antall={antall} />;

  const innhold = await (async () => {
    switch (aktiv) {
      case "alle": {
        const sidetall = Number.parseInt(side ?? "0", 10);
        const data = await lastAlleTurneringer({ sok, side: Number.isFinite(sidetall) ? sidetall : 0 });
        return <TurneringAlleListe data={data} />;
      }
      case "mine-spillere": {
        const data = await lastMineSpillereTurneringer();
        return <AdminTurneringerTrainLock data={data} somFane />;
      }
      case "dubletter": {
        const liste = await lastDubletter();
        if (liste.length === 0) {
          return (
            <div style={{ padding: "34px 24px", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: TL.text }}>Ingen ventende dubletter</p>
              <p style={{ margin: "6px 0 0", fontSize: 12.5, color: TL.mute }}>
                Når spillere legger til manuelle turneringer som matcher en kjent kilde, vises de her for vurdering.
              </p>
            </div>
          );
        }
        return (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                borderRadius: TL.radius.card,
                background: TL.elev,
                padding: "14px 18px",
              }}
            >
              <Icon name="info" size={16} style={{ color: TL.mute, marginTop: 1, flex: "none" }} />
              <p style={{ fontSize: 12.5, color: TL.mute, margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: TL.text, fontWeight: 600 }}>Slik fungerer sammenslåing: </strong>
                Når du slår sammen en manuell turnering inn i en kanonisk turnering, flyttes alle påmeldinger,
                resultater og deltakerlister automatisk. Manuell-raden markeres som dublett og forsvinner fra
                hovedlista.
              </p>
            </div>
            <MergeDubletterListe liste={liste} />
          </>
        );
      }
      case "kart": {
        const data = await lastTurneringKart();
        return <TurneringKartInnhold data={data} />;
      }
    }
  })();

  return (
    <V2Shell bredde="full" aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
        {hode}
        {innhold}
      </div>
    </V2Shell>
  );
}
