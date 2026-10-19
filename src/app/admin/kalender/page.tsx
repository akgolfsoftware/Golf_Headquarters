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
import Link from "next/link";
import { KnappLenke, Topp } from "@/components/admin/agencyos-ny/ny";
import { AG05Aar, AG05Dag, AG05Uke, AG05Maned, AG05Periode } from "@/components/admin/precision/AG05Kalender";
import { AG05Tilg } from "@/components/admin/precision/AG05Tilg";
import { AG05GoogleSynk } from "@/components/admin/precision/AG05GoogleSynk";
import { StallDagV2, StallDagFeil } from "@/components/workbench/StallDagV2";
import { TL_SCOPE } from "@/components/workbench/wb-tl-scope";
import { loadStallDag } from "@/lib/workbench/wb-actions";
import { erKalenderLag, type KalenderLag } from "@/lib/domain/kalender-lag";
import { hentKalenderLagManed, hentKalenderLagUke } from "./lag/data";
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

export default async function AgencyKalenderPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const sp = await searchParams;
  const fane = velgKalenderFane(sp.fane, sp.visning);
  const startLag: KalenderLag | undefined = sp.lag && erKalenderLag(sp.lag) ? sp.lag : undefined;
  const seer = { id: user.id, erHeadCoach: user.role === "ADMIN" };

  let innhold: React.ReactNode;
  let periode = "";
  let navigasjon: React.ReactNode = null;

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

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="agn-s">
        <Topp dato={seer.erHeadCoach ? `Alle coacher · ${periode}` : `${user.name ?? "Coach"} · Assist Coach`} tittel="Kalender"
          handlinger={<>
            <KnappLenke variant="pri" href="/admin/bookinger?fane=ny">Ny booking</KnappLenke>
            <KnappLenke href="/admin/kalender/hendelse/ny">Ny hendelse</KnappLenke>
          </>} />
        <nav className="valg" aria-label="Visning">
          {KALENDER_FANER.map((f) => <Link key={f.id} href={kalenderHref(f.id)} aria-current={f.id === fane ? "page" : undefined}>{f.label}</Link>)}
        </nav>
        {navigasjon}
        <div className="pa-root kal-innhold">{innhold}</div>
      </div>
    </AgencyOSSkall>
  );
}
