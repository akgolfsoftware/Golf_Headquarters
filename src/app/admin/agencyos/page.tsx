/**
 * AgencyOS Cockpit — AG-01 i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-cockpit.jsx, runde 25). Erstatter Train-lock-
 * cockpiten (V2Shell + TrainLockCockpit). Startskjerm i AgencyOS
 * (beslutninger.md §SKJERMENE … RUNDE 8).
 *
 * Lastere (alle fra før, ingen skjemaendring):
 *  - loadDailyBrief: dagens økter (kalender 05–22), oppgaver fra Notion-
 *    cachen og nøkkeltall.
 *  - lastGodkjenninger: køen, samme tall og rader som /admin/ko.
 *  - lastCockpitTillegg: «Følger ikke planen» (to siste uker) og turneringer
 *    denne uka, i coachens spillerskop.
 *
 * Tilgang: ADMIN og COACH, som før.
 *
 * Fokusspillere og Økonomi/MRR er bevisst IKKE med her: tegningen (AG-cockpit.jsx,
 * runde 25) har verken en Fokusspillere- eller Økonomi-seksjon på Cockpit, og
 * forgjengeren (TrainLockCockpit.tsx) utelot dem uttrykkelig med samme
 * begrunnelse («Avvik og fremgang nås via Stall — de haster aldri i
 * minutter», beslutning 6.5). Økonomi (AG-20) er en egen side for head coach
 * (beslutninger.md §ØKONOMI BARE FOR HEAD COACH), ikke et Cockpit-kort.
 *
 * Klokke og dag formateres på serveren i Oslo-tid (Vercel kjører UTC).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadDailyBrief } from "@/lib/agencyos/daily-brief-data";
import { lastGodkjenninger } from "@/lib/admin/ko/last-godkjenninger";
import { lastCockpitTillegg } from "@/lib/agencyos/cockpit-tillegg";
import { byggAG01Data } from "@/lib/agencyos/cockpit-precision";
import { ukenummer } from "@/lib/uke-helpers";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG01Cockpit } from "@/components/admin/precision/AG01Cockpit";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cockpit · AgencyOS" };

export default async function CockpitPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const coach = { id: user.id, role: user.role };

  const [brief, ko, tillegg] = await Promise.all([
    loadDailyBrief({ id: user.id, name: user.name, avatarUrl: user.avatarUrl, role: user.role }),
    lastGodkjenninger(coach),
    lastCockpitTillegg(coach),
  ]);

  const naa = new Date();
  const dag = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "long", day: "numeric", month: "long" }).format(naa);
  const klokke = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }).format(naa);
  const kicker = `${dag.charAt(0).toUpperCase()}${dag.slice(1)} · uke ${ukenummer(naa)}`;

  const data = byggAG01Data({ brief, ko, tillegg, kicker, klokke });

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG01Cockpit tilstand="data" data={data} />
    </AgencyOSSkall>
  );
}
