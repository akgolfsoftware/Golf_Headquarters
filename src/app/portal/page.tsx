/**
 * PlayerHQ I dag — Train-lock PH-01 (telefon + Mac).
 * Dataene er de samme som før; Paper-chatten er tatt ut av skjermen.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getDashboardData } from "@/app/portal/actions";
import { getGjennomforeData } from "@/lib/portal-gjennomfore/gjennomfore-data";
import { loadPlayerDay } from "@/lib/workbench/wb-actions";
import { dagNavnLang } from "@/lib/uke-helpers";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { getTrackManTeaser } from "@/lib/trackman/teaser";
import { getTesterLiveKort } from "@/lib/portal-tester/tester-live-kort";
import { formatSg } from "@/lib/sg";
import { formatMinutes } from "@/lib/domain/workbench/labels";
import { hentIDagKalender } from "@/lib/portal/idag-data";
import {
  byggMaanedPrikker,
  erHvileTittel,
  formatIntervallPunkt,
  fremdriftPst,
  IDAG_UI,
  minutterIgjen,
  osloMinuttAvDogen,
  velgIDagTilstand,
} from "@/lib/portal/idag-visning";
import { IDagTrainLock, type NaaKort } from "@/components/portal/v2/idag/IDagTrainLock";
import { IDagCaddie } from "@/components/portal/v2/idag/IDagCaddie";
import { PushOptInBanner } from "@/components/portal/push-opt-in-banner";
import type { PlayerDaySession } from "@/lib/workbench/wb-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "I dag · PlayerHQ" };

const OSLO_ISO_FMT = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" });
const OSLO_MANED = new Intl.DateTimeFormat("nb-NO", { month: "long", timeZone: "Europe/Oslo" });

function storForbokstav(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function PortalHjemPage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const naa = new Date();
  const iDag = OSLO_ISO_FMT.format(naa);
  const naaMinutt = osloMinuttAvDogen(naa);
  const osloDeler = iDag.split("-").map(Number);
  const aar = osloDeler[0] ?? naa.getFullYear();
  const manedNr = osloDeler[1] ?? naa.getMonth() + 1;
  const dagNr = osloDeler[2] ?? naa.getDate();

  const [data, gjennomfore, workbenchDay, trackman, testerLive, kalender] = await Promise.all([
    getDashboardData(user.id),
    getGjennomforeData(user.id),
    loadPlayerDay({ playerId: user.id, date: iDag }),
    getTrackManTeaser(user.id),
    getTesterLiveKort(user.id),
    hentIDagKalender(user.id, naa),
  ]);

  const feil = !workbenchDay.ok;
  const sessions: PlayerDaySession[] = workbenchDay.ok ? workbenchDay.data.sessions : [];
  const synlige = sessions.filter((s) => !s.needsPlayerApproval);
  const godkjenninger = sessions.filter((s) => s.needsPlayerApproval);
  const pagaende = synlige.find((s) => s.status === "IN_PROGRESS") ?? null;
  const startbar =
    synlige.find((s) => s.status === "PUBLISHED" || s.status === "SCHEDULED") ?? null;
  const hvile = synlige.find((s) => erHvileTittel(s.title)) ?? null;

  const ukeHarOkter =
    kalender.okterDenneUken > 0 || data.week.some((d) => d.sessions.length > 0);

  const tilstand = velgIDagTilstand({
    feil,
    pagaende: pagaende != null,
    harStartbarOkt: startbar != null || (pagaende == null && gjennomfore.nesteOkt != null && gjennomfore.nesteOkt.status !== "done"),
    harHvile: hvile != null && startbar == null && pagaende == null,
    ukeHarOkter,
  });

  let naaKort: NaaKort | null = null;
  const wbOkt = pagaende ?? startbar;
  if (wbOkt) {
    const igjen = minutterIgjen(wbOkt.startMinute, wbOkt.durationMinutes, naaMinutt);
    const live = wbOkt.status === "IN_PROGRESS";
    const sted = wbOkt.location?.trim();
    naaKort = {
      tittel: wbOkt.title,
      tid: live && igjen != null ? `${igjen} min igjen` : formatIntervallPunkt(wbOkt.startMinute, wbOkt.durationMinutes),
      meta: [sted, formatMinutes(wbOkt.durationMinutes)].filter(Boolean).join(" · "),
      ctaTekst: live ? IDAG_UI.fortsett : IDAG_UI.startOkt,
      ctaHref: `/portal/tren/wb/${wbOkt.id}`,
      fremdriftPst:
        live || (igjen != null && igjen > 0)
          ? fremdriftPst(wbOkt.startMinute, wbOkt.durationMinutes, naaMinutt)
          : null,
      fremdriftTekst:
        igjen != null && igjen > 0
          ? [`${igjen} min igjen`, wbOkt.notes?.trim()].filter(Boolean).join(" · ")
          : null,
      live,
      sekundarTekst: live ? IDAG_UI.avslutt : undefined,
      sekundarHref: live ? `/portal/tren/wb/${wbOkt.id}` : undefined,
      pyramide: wbOkt.pyramid || null,
    };
  } else if (gjennomfore.nesteOkt && gjennomfore.nesteOkt.status !== "done") {
    const o = gjennomfore.nesteOkt;
    const live = o.status === "now";
    naaKort = {
      tittel: o.tittel,
      tid: o.tid.replace(":", ".").replace("–", "–").replace("-", "–"),
      meta: [o.sted, formatMinutes(o.varighet)].filter(Boolean).join(" · "),
      ctaTekst: live ? IDAG_UI.fortsett : IDAG_UI.startOkt,
      ctaHref: o.href,
      fremdriftPst: null,
      fremdriftTekst: null,
      live,
    };
  }

  const nesteIDag = synlige.find((s) => s.id !== wbOkt?.id && !erHvileTittel(s.title));
  const neste =
    nesteIDag != null
      ? {
          tittel: nesteIDag.title,
          meta: `${formatIntervallPunkt(nesteIDag.startMinute, nesteIDag.durationMinutes)} · ${formatMinutes(nesteIDag.durationMinutes)}`,
        }
      : kalender.neste
        ? { tittel: kalender.neste.tittel, meta: kalender.neste.meta }
        : hvile && wbOkt
          ? // Fasitens «Neste»-kort skriver alltid dagen først («Søndag · programmert»).
            { tittel: IDAG_UI.hvile, meta: `${storForbokstav(dagNavnLang(naa))} · ${IDAG_UI.programmert}` }
          : null;

  const datoLinje = `${dagNavnLang(naa)} ${dagNr}. ${OSLO_MANED.format(naa)}`;
  const prikker = byggMaanedPrikker({
    aar,
    maned: manedNr,
    idag: dagNr,
    ferdige: new Set(kalender.ferdigeDager),
  });

  const fangstOkt = gjennomfore.nesteOkt ?? gjennomfore.fullfortIdag.at(-1) ?? null;

  return (
    <V2Shell
      bredde="full"
      hoyde="skjerm"
      aktiv="hjem"
      nav={PLAYERHQ_NAV}
      navn={data.user.name}
      avatarUrl={data.user.avatarUrl}
      composer={
        <IDagCaddie
          plassering="mac"
          placeholder={tilstand === "pagar" ? IDAG_UI.loggCaddie : IDAG_UI.sporCaddie}
          fangstFormel={fangstOkt?.formel ?? null}
          oktLabel={fangstOkt ? `${fangstOkt.tittel} · ${fangstOkt.meta}` : null}
        />
      }
    >
      <PushOptInBanner />
      <IDagTrainLock
        datoLinje={datoLinje}
        maanedNavn={storForbokstav(OSLO_MANED.format(naa))}
        prikker={prikker}
        tilstand={tilstand}
        naa={naaKort}
        neste={neste}
        sgInnspill={formatSg(data.kpiStats.sgBreakdown.app)}
        okterUke={kalender.okterDenneUken || data.kpiStats.sessionsThisWeek}
        ukeNummer={data.weekNumber}
        trackman={trackman}
        testerLive={testerLive}
        godkjenninger={godkjenninger}
      />
    </V2Shell>
  );
}
