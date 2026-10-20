/**
 * AgencyOS Cockpit — AG-01 i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-cockpit.jsx, runde 25). Erstatter Train-lock-
 * cockpiten (V2Shell + TrainLockCockpit). Startskjerm i AgencyOS
 * (beslutninger.md §SKJERMENE … RUNDE 8).
 *
 * Lastere (alle fra før, ingen skjemaendring):
 *  - loadDailyBrief: dagens økter (kalender 05–22), oppgaver fra Notion-
 *    cachen og nøkkeltall.
 *  - lastGodkjenninger: køen, samme tall som /admin/ko, men bare de åtte
 *    nyeste radene (A1, audit 20.10.2026: hele køen ga 30 s lastetid).
 *  - lastCockpitTillegg: «Følger ikke planen» (to siste uker) og turneringer
 *    denne uka, i coachens spillerskop.
 *  - loadStallen: stallen som rørledning (Trenger deg · Følger planen · Hviler),
 *    samme status som AG-07 Stall. Strømmes for seg (Suspense), så den ikke
 *    gjør resten av Cockpit tregere. Feiler den, vises «—».
 *  - loadAiDispatch: AI-dispatch («Én ting nå» og hvilken AI-flate som eier
 *    køen), skill agenticos-cockpit. Nye e-poster telles bare for ADMIN.
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
import { stallRorledning } from "@/lib/agencyos/cockpit-tillegg-regler";
import { loadStallen } from "@/lib/admin/stallen-data";
import { byggAG01Data } from "@/lib/agencyos/cockpit-precision";
import { loadAiDispatch } from "@/lib/agencyos/ai-dispatch-data";
import { prisma } from "@/lib/prisma";
import { ukenummer } from "@/lib/uke-helpers";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG01Cockpit } from "@/components/admin/precision/AG01Cockpit";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cockpit · AgencyOS" };

export default async function CockpitPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const coach = { id: user.id, role: user.role };

  const innboksNye = user.role === "ADMIN" ? prisma.innboksEpost.count({ where: { status: "NY" } }) : Promise.resolve(0);
  const [brief, ko, tillegg, dispatch] = await Promise.all([
    loadDailyBrief({ id: user.id, name: user.name, avatarUrl: user.avatarUrl, role: user.role }),
    // Cockpit viser fire saker og ingen ukesrapport; køen i sin helhet lastes aldri (audit 20.10, A1).
    lastGodkjenninger(coach, { maksRader: 8, medUkesrapport: false }),
    lastCockpitTillegg(coach),
    innboksNye.then((n) => loadAiDispatch({ id: user.id, role: user.role, innboksNye: n })),
  ]);

  const naa = new Date();
  const dag = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "long", day: "numeric", month: "long" }).format(naa);
  const klokke = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }).format(naa);
  const kicker = `${dag.charAt(0).toUpperCase()}${dag.slice(1)} · uke ${ukenummer(naa)}`;

  const data = byggAG01Data({ brief, ko, tillegg, kicker, klokke });
  // Ikke ventet på: strømmes inn i Stallen-kortet når den er klar.
  const stall = loadStallen(coach, {}).then((s) => stallRorledning(s.rows)).catch(() => null);

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG01Cockpit tilstand="data" data={data} dispatch={dispatch} stall={stall} />
    </AgencyOSSkall>
  );
}
