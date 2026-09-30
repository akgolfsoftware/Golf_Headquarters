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
 *
 * 29.09.2026 (AG-04, «Én innboks»): fanene Innboks, Utkast og Sendt er slått
 * inn i /admin/innboks og sendes dit, med søkeparametrene. Innboks › Alle og
 * Varsler har sakene, Innboks › E-post har utkastene (bare ADMIN, som før) og
 * «Sendt og arkivert». Bare fanen Maler står igjen her — den har ingen
 * tegning i Innboks.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Side } from "@/components/precision/pa-a4";
import { TL_SCOPE } from "@/components/workbench/wb-tl-scope";
import { AG04RestHode } from "@/components/admin/precision/AG04RestHode";
import { AdminEmailV2 } from "@/components/admin/v2/AdminEmailV2";
import { KOMMUNIKASJON_FANER, kommunikasjonHref, velgKommunikasjonFane } from "@/lib/admin/kommunikasjon/faner";
import { innboksHref, lesInnboksFilter } from "@/lib/admin/innboks/filter";
import {
  kommunikasjonFaneTellinger,
  lastKommunikasjonInnboks,
  lastKommunikasjonMaler,
} from "@/lib/admin/kommunikasjon/lastere";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kommunikasjon · AgencyOS" };

export default async function KommunikasjonPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { fane, ...ovrige } = await searchParams;
  const aktiv = velgKommunikasjonFane(Array.isArray(fane) ? fane[0] : fane);

  // Innboks, Utkast og Sendt bor i /admin/innboks. E-postfanen der er fortsatt
  // bare for ADMIN — en COACH ser en tom fane med forklaring. Ingen utvidelse
  // av tilgang.
  if (aktiv === "innboks") redirect(innboksHref(lesInnboksFilter(Array.isArray(ovrige.filter) ? ovrige.filter[0] : ovrige.filter), ovrige));
  if (aktiv === "utkast") redirect(innboksHref("epost", ovrige));
  if (aktiv === "sendt") redirect(innboksHref("epost", { ...ovrige, vis: "sendt" }));

  const innboksData = await lastKommunikasjonInnboks({ id: user.id, role: user.role, name: user.name });
  const antall = await kommunikasjonFaneTellinger(innboksData.apne);
  const hode = (
    <AG04RestHode
      kicker="Innboks · Kommunikasjon"
      title="Kommunikasjon"
      sub="E-post, meldinger og maler ett sted. Utkast skrives her — sending krever alltid ditt ja."
      faner={KOMMUNIKASJON_FANER.map((f) => ({ id: f.id, label: f.label, href: kommunikasjonHref(f.id) }))}
      aktiv={aktiv}
      antall={antall}
    />
  );

  const innhold = <AdminEmailV2 data={await lastKommunikasjonMaler()} somFane />;

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <Side>
        {hode}
        <div style={{ ...TL_SCOPE, minWidth: 0 }}>{innhold}</div>
      </Side>
    </AgencyOSSkall>
  );
}
