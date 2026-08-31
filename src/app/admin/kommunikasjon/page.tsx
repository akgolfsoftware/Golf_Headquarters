/**
 * Kommunikasjon — ÉN adresse (MASTERPLAN 15.7, beslutning 6.9 «én inngang
 * per funksjon»).
 *
 * Slår sammen TRE adresser: /admin/innboks (fane "innboks"),
 * /admin/innboks-epost (delt i to statusfaner "utkast"/"sendt" på samme
 * InnboksEpost-tabell), /admin/email-templates (fane "maler"). Alle tre er
 * nå redirects hit — se hver enkelt fil.
 *
 * AVVIK FRA MASTERPLAN-RADENS OPPRINNELIGE ORDLYD: raden nevner også `/meg`
 * som kilde. `/meg` (Jarvis-chat, `src/app/meg/page.tsx`) er IKKE flettet
 * inn — den er en frittstående, stor app (tråd/composer/artefaktpanel), ikke
 * en enkel innboks-flate, og STEG 14.7 flagger et uavklart Anders-spørsmål
 * (skal meg/dispatch + meg/morgenbrief redirecte til /admin/brief?) som
 * IKKE er avgjort. Canvas-fasiten viser kun de fire fanene under. `/meg`,
 * `/meg/dispatch`, `/meg/morgenbrief` er URØRT.
 *
 * TILGANG — IKKE UTVIDET: kildesidene hadde ULIK gate.
 *   /admin/innboks         → ADMIN/COACH
 *   /admin/email-templates → ADMIN/COACH
 *   /admin/innboks-epost   → ADMIN ALENE
 * Sidens basisgate er derfor unionen (ADMIN/COACH, samme som før for
 * Innboks/Maler) — men fanene "utkast"/"sendt" sjekker i tillegg
 * `user.role === "ADMIN"` og faller tilbake til standardfanen for en COACH.
 * En sammenslåing skal ALDRI utvide tilgang. Låst av
 * src/lib/admin/kommunikasjon/faner.test.ts.
 *
 * Design: canvas godkjent 30.08.2026 —
 * designsystem/canvas/agencyos-ia/Kommunikasjon.dc.html.
 */

import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { KommunikasjonHode } from "@/components/admin/v2/kommunikasjon/KommunikasjonHode";
import { InnboksSakerTrainLock } from "@/components/admin/v2/innboks/InnboksSakerTrainLock";
import { InnboksEpostV2 } from "@/components/admin/v2/InnboksEpostV2";
import { AdminEmailV2 } from "@/components/admin/v2/AdminEmailV2";
import { KOMMUNIKASJON_FANER, KOMMUNIKASJON_STANDARDFANE, kommunikasjonHref, velgKommunikasjonFane } from "@/lib/admin/kommunikasjon/faner";
import {
  kommunikasjonFaneTellinger,
  lastKommunikasjonInnboks,
  lastKommunikasjonMaler,
  lastKommunikasjonSendt,
  lastKommunikasjonUtkast,
} from "@/lib/admin/kommunikasjon/lastere";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kommunikasjon · AgencyOS" };

export default async function KommunikasjonPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { fane: onsket } = await searchParams;
  const aktiv = velgKommunikasjonFane(onsket);

  // ADMIN-ALENE-fanene (arvet fra /admin/innboks-epost) — en COACH som ber om
  // "utkast"/"sendt" faller tilbake til standardfanen. Ingen utvidelse av
  // tilgang, se filhodet.
  if ((aktiv === "utkast" || aktiv === "sendt") && user.role !== "ADMIN") {
    redirect(kommunikasjonHref(KOMMUNIKASJON_STANDARDFANE));
  }

  const innboksData = await lastKommunikasjonInnboks({ id: user.id, role: user.role, name: user.name });
  const antall = await kommunikasjonFaneTellinger(innboksData.apne);
  const hode = <KommunikasjonHode faner={KOMMUNIKASJON_FANER} aktiv={aktiv} antall={antall} />;

  const innhold = await (async () => {
    switch (aktiv) {
      case "innboks":
        return (
          <Suspense fallback={null}>
            <InnboksSakerTrainLock data={innboksData} somFane />
          </Suspense>
        );
      case "utkast": {
        const epost = await lastKommunikasjonUtkast();
        return <InnboksEpostV2 epost={epost} somFane eyebrow="Venter på deg" />;
      }
      case "sendt": {
        const epost = await lastKommunikasjonSendt();
        return <InnboksEpostV2 epost={epost} somFane eyebrow="Sendt eller arkivert" />;
      }
      case "maler": {
        const data = await lastKommunikasjonMaler();
        return <AdminEmailV2 data={data} somFane />;
      }
    }
  })();

  return (
    <V2Shell bredde="full" aktiv="innboks" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
        {hode}
        {innhold}
      </div>
    </V2Shell>
  );
}
