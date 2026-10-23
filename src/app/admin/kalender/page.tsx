/**
 * AG-05 Kalender, pakke 3 (bygget natt 17.10 etter utkast-agencyos/kalender.html):
 * Dag (kolonne per coach) · Uke · Måned · År · Stall-dag · Tilgjengelighet. Samme guard
 * (ADMIN/COACH). Head coach (ADMIN) ser alle coacher; assistant coach (COACH) egne
 * økter og gruppeøkter, andre coachers timer som «Opptatt» (maskerForSeer).
 * Faner er ekte lenker (`?fane=`), så bare den aktive fanen laster data.
 *
 * «Tilgjengelighet» er en ny, femte fane (AG-05-tegningen, 28.09.2026) — se
 * lib/admin/kalender/faner.ts for hvorfor det tidligere var et bevisst unntak.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import {
  AG05Aar, AG05Dag, AG05KalenderSide, AG05Uke, AG05Maned, AG05Periode, kalenderTallIdag, nesteOkt, type AG05Tall,
} from "@/components/admin/precision/AG05Kalender";
import { AG05Tilg } from "@/components/admin/precision/AG05Tilg";
import { AG05GoogleSynk } from "@/components/admin/precision/AG05GoogleSynk";
import { StallDagV2, StallDagFeil } from "@/components/workbench/StallDagV2";
import { TL_SCOPE } from "@/components/workbench/wb-tl-scope";
import { loadStallDag } from "@/lib/workbench/wb-actions";
import { erKalenderLag, type KalenderLag } from "@/lib/domain/kalender-lag";
import { hentKalenderLagManed, hentKalenderLagUke, type KalenderLagUkeData } from "./lag/data";
import { hentTilgjengelighet } from "./tilg-data";
import { hentGoogleSynk } from "./google-synk-data";
import { hentKalenderAar } from "./aar-data";
import { KALENDER_FANER, kalenderHref, velgKalenderFane } from "@/lib/admin/kalender/faner";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kalender · AgencyOS" };

type SearchParams = Promise<{
  fane?: string;
  uke?: string;
  visning?: string;
  maaned?: string;
  dato?: string;
  lag?: string;
  aar?: string;
  ok?: string;
  error?: string;
}>;

const ISO_DATO = /^\d{4}-\d{2}-\d{2}$/;

function osloIdag(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

/** Minutter siden midnatt i Oslo, for hvilken økt som pågår eller er neste. */
function osloMinutt(): number {
  const deler = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  return Number(deler.find((d) => d.type === "hour")?.value) * 60 + Number(deler.find((d) => d.type === "minute")?.value);
}

export default async function AgencyKalenderPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const sp = await searchParams;
  const fane = velgKalenderFane(sp.fane, sp.visning);
  const startLag: KalenderLag | undefined = sp.lag && erKalenderLag(sp.lag) ? sp.lag : undefined;
  const seer = { id: user.id, erHeadCoach: user.role === "ADMIN" };

  let innhold: React.ReactNode;
  let periode = "";
  let navigasjon: React.ReactNode = null;
  let idagFraVisning: KalenderLagUkeData | null = null;

  if (fane === "stall") {
    const idag = osloIdag();
    const dato = sp.dato && ISO_DATO.test(sp.dato) ? sp.dato : idag;
    const res = await loadStallDag({ dato });
    periode = `Stall-dag · ${dato}`;
    innhold = (
      <div style={TL_SCOPE}>
        {res.ok ? <StallDagV2 dato={dato} data={res.data} erIdag={dato === idag} somFane /> : <StallDagFeil melding={res.error} />}
      </div>
    );
  } else if (fane === "tilg") {
    const [data, google] = await Promise.all([hentTilgjengelighet(user), hentGoogleSynk(user.id)]);
    periode = "Tilgjengelighet";
    innhold = <AG05Tilg data={data} google={<AG05GoogleSynk data={google} ok={sp.ok} error={sp.error} />} />;
  } else if (fane === "ar") {
    const data = await hentKalenderAar(sp.aar, seer);
    periode = String(data.aar);
    navigasjon = <AG05Periode forrige={data.nav.forrige} idag={data.nav.idag} neste={data.nav.neste} tekst={periode} />;
    innhold = <AG05Aar data={data} />;
  } else if (fane === "maned") {
    const data = await hentKalenderLagManed(sp.maaned, { lag: startLag, seer });
    periode = data.periode;
    navigasjon = <AG05Periode forrige={data.nav.forrige} idag={data.nav.idag} neste={data.nav.neste} tekst={data.periode} />;
    innhold = <AG05Maned data={data} startLag={startLag} />;
  } else {
    const data = await hentKalenderLagUke(sp.uke, { lag: startLag, visning: fane, dato: sp.dato, seer });
    // Uka som vises inneholder i dag: tallene i toppen kan regnes av samme data. Lagfilteret i
    // adressen (`lag=`) styrer bare hva som er valgt i visningen, ikke hva som hentes.
    if (data.dager.includes(data.idagIso)) idagFraVisning = data;
    if (fane === "dag") {
      const dato = sp.dato && data.dager.includes(sp.dato) ? sp.dato : data.dager.includes(data.idagIso) ? data.idagIso : data.dager[0];
      periode = new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${dato}T12:00:00Z`));
      periode = periode.charAt(0).toUpperCase() + periode.slice(1);
      navigasjon = <AG05Periode forrige={data.nav.forrige} idag={data.nav.idag} neste={data.nav.neste} tekst={periode} />;
      innhold = <AG05Dag data={data} dagIso={dato} startLag={startLag} erHeadCoach={seer.erHeadCoach} />;
    } else {
      periode = data.periode;
      navigasjon = <AG05Periode forrige={data.nav.forrige} idag={data.nav.idag} neste={data.nav.neste} tekst={data.periode} />;
      innhold = <AG05Uke data={data} startLag={startLag} />;
    }
  }

  // Tallene og hovedkortet gjelder alltid i dag, uansett hvilken fane og periode som vises.
  const idagIso = osloIdag();
  const idagData = idagFraVisning ?? (await hentKalenderLagUke(undefined, { visning: "dag", dato: idagIso, seer }));
  const tall: AG05Tall = { ...kalenderTallIdag(idagData.hendelser, idagIso), ledigePlasser: null, forslagGruppeokt: null };
  const neste = nesteOkt(idagData.hendelser, idagIso, osloMinutt(), user.id);

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG05KalenderSide
        overlinje={seer.erHeadCoach ? `Alle coacher · ${periode}` : `${user.name ?? "Coach"} · Assist Coach`}
        tall={tall}
        neste={neste}
        faner={KALENDER_FANER.map((f) => ({ id: f.id, label: f.label, href: kalenderHref(f.id), aktiv: f.id === fane }))}
        navigasjon={navigasjon}
      >
        {innhold}
      </AG05KalenderSide>
    </AgencyOSSkall>
  );
}
