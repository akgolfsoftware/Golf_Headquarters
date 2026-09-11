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
import { byggIDagAgenda } from "@/lib/portal/idag-agenda";
import { weekSessionCounts } from "@/lib/portal/week-progress";
import { hentIDagKalender } from "@/lib/portal/idag-data";
import { hentSpillerDagITiden } from "@/lib/kalender-lag/player-dag";
import { hentEffektivNaa } from "@/lib/testing/dato-override";
import {
  byggMaanedPrikker,
  erHvileTittel,
  formatIntervallPunkt,
  fremdriftPst,
  IDAG_UI,
  idagNaaCta,
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

  const naa = await hentEffektivNaa(user.email);
  const iDag = OSLO_ISO_FMT.format(naa);
  const naaMinutt = osloMinuttAvDogen(naa);
  const osloDeler = iDag.split("-").map(Number);
  const aar = osloDeler[0] ?? naa.getFullYear();
  const manedNr = osloDeler[1] ?? naa.getMonth() + 1;
  const dagNr = osloDeler[2] ?? naa.getDate();

  const [data, gjennomfore, workbenchDay, trackman, testerLive, kalender, dagITidenHendelser] =
    await Promise.all([
      getDashboardData(user.id, naa),
      getGjennomforeData(user.id, naa),
      user.role === "PLAYER" && user.tilgang.nivaa !== "FULL"
        ? Promise.resolve({ ok: true as const, data: { date: iDag, sessions: [], nextSessionId: null } })
        : loadPlayerDay({ playerId: user.id, date: iDag }),
      getTrackManTeaser(user.id),
      getTesterLiveKort(user.id),
      hentIDagKalender(user.id, naa),
      hentSpillerDagITiden(user.id, iDag),
    ]);

  const feil = !workbenchDay.ok;
  const sessions: PlayerDaySession[] = workbenchDay.ok ? workbenchDay.data.sessions : [];
  const synlige = sessions.filter((s) => !s.needsPlayerApproval);
  const godkjenninger = sessions.filter((s) => s.needsPlayerApproval);
  const pagaende = synlige.find((s) => s.status === "IN_PROGRESS") ?? null;
  const startbar =
    synlige.find((s) => s.status === "PUBLISHED" || s.status === "SCHEDULED") ?? null;
  const fullfortWb =
    synlige.find((s) => s.status === "COMPLETED" && !erHvileTittel(s.title)) ?? null;
  const fullfortGjennomfore = gjennomfore.fullfortIdag.at(-1) ?? null;
  const hvile = synlige.find((s) => erHvileTittel(s.title)) ?? null;

  const ukeAntall = weekSessionCounts(data.week);
  const ukeHarOkter = ukeAntall.total > 0;

  const tilstand = velgIDagTilstand({
    feil,
    pagaende: pagaende != null,
    harStartbarOkt: startbar != null || (pagaende == null && gjennomfore.nesteOkt != null && gjennomfore.nesteOkt.status !== "done"),
    harFullfortOkt: fullfortWb != null || fullfortGjennomfore != null,
    harHvile: hvile != null && startbar == null && pagaende == null && fullfortWb == null,
    ukeHarOkter,
  });

  let naaKort: NaaKort | null = null;
  const wbOkt = pagaende ?? startbar ?? fullfortWb;
  if (wbOkt) {
    const igjen = minutterIgjen(wbOkt.startMinute, wbOkt.durationMinutes, naaMinutt);
    const cta = idagNaaCta({ id: wbOkt.id, modell: "wb", status: wbOkt.status });
    const sted = wbOkt.location?.trim();
    naaKort = {
      tittel: wbOkt.title,
      tid: cta.live && igjen != null ? `${igjen} min igjen` : formatIntervallPunkt(wbOkt.startMinute, wbOkt.durationMinutes),
      meta: [sted, formatMinutes(wbOkt.durationMinutes)].filter(Boolean).join(" · "),
      ctaTekst: cta.ctaTekst,
      ctaHref: cta.ctaHref,
      fremdriftPst:
        !cta.fullfort && (cta.live || (igjen != null && igjen > 0))
          ? fremdriftPst(wbOkt.startMinute, wbOkt.durationMinutes, naaMinutt)
          : null,
      fremdriftTekst:
        !cta.fullfort && igjen != null && igjen > 0
          ? [`${igjen} min igjen`, wbOkt.notes?.trim()].filter(Boolean).join(" · ")
          : null,
      live: cta.live,
      fullfort: cta.fullfort,
      sekundarTekst: cta.sekundarTekst,
      sekundarHref: cta.sekundarHref,
      pyramide: wbOkt.pyramid || null,
    };
  } else if (gjennomfore.nesteOkt && gjennomfore.nesteOkt.status !== "done") {
    const o = gjennomfore.nesteOkt;
    const cta = idagNaaCta({
      id: o.id,
      modell: o.kilde === "plan" ? "plan" : "v2",
      status: o.status,
    });
    naaKort = {
      tittel: o.tittel,
      tid: o.tid.replace(":", ".").replace("–", "–").replace("-", "–"),
      meta: [o.sted, formatMinutes(o.varighet)].filter(Boolean).join(" · "),
      ctaTekst: cta.ctaTekst,
      ctaHref: cta.ctaHref,
      fremdriftPst: null,
      fremdriftTekst: null,
      live: cta.live,
      fullfort: cta.fullfort,
    };
  } else if (fullfortGjennomfore) {
    const o = fullfortGjennomfore;
    const cta = idagNaaCta({
      id: o.id,
      modell: o.kilde === "plan" ? "plan" : "v2",
      status: o.status,
    });
    naaKort = {
      tittel: o.tittel,
      tid: o.tid.replace(":", ".").replace("–", "–").replace("-", "–"),
      meta: [o.sted, formatMinutes(o.varighet)].filter(Boolean).join(" · "),
      ctaTekst: cta.ctaTekst,
      ctaHref: cta.ctaHref,
      fremdriftPst: null,
      fremdriftTekst: null,
      live: false,
      fullfort: true,
    };
  }

  const neste = kalender.neste;
  const valgtOktId = wbOkt?.id ?? gjennomfore.nesteOkt?.id ?? fullfortGjennomfore?.id;
  const agenda = byggIDagAgenda(dagITidenHendelser, data.week.find((d) => d.isToday)?.sessions ?? []);

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
        navn={data.user.name}
        avatarUrl={data.user.avatarUrl}
        hilsen={`${data.greeting}, ${data.user.fornavn}`}
        valgtOktId={valgtOktId}
        fullfortMinutter={data.weekProgress.completedMin}
        maanedNavn={storForbokstav(OSLO_MANED.format(naa))}
        prikker={prikker}
        tilstand={tilstand}
        naa={naaKort}
        neste={neste}
        sgInnspill={formatSg(data.kpiStats.sgBreakdown.app)}
        okterUke={ukeAntall.total}
        fullfortUke={ukeAntall.completed}
        ukeNummer={data.weekNumber}
        ukeFremdrift={data.weekProgress.plannedMin > 0 ? data.weekProgress.completedMin / data.weekProgress.plannedMin : undefined}
        trackman={trackman}
        testerLive={testerLive}
        godkjenninger={godkjenninger}
        dagLabel={`${dagNavnLang(naa)} ${dagNr}.`}
        hendelser={agenda}
      />
    </V2Shell>
  );
}
