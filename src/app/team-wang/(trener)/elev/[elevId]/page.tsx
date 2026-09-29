import type { Metadata } from "next";
import { Link2 } from "lucide-react";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { hentGruppeElev, hentSnittForElever } from "@/app/team-wang/_data/wang-elever-data";
import { isoTilNorsk, norskTall, osloIso } from "@/app/team-wang/_data/wang-elever-regler";
import { Tilbake, meStil as s } from "@/app/team-wang/_components/wang-meldinger-elever/felles";
import {
  IupFane,
  PlanFane,
  SamtalerFane,
  StatsFane,
  TesterFane,
  TurneringerFane,
} from "@/app/team-wang/_components/wang-meldinger-elever/elevprofil-faner";
import { WangChips, WangDemoMerknad, WangFeil, WangKort, WangSide, WangTom } from "@/components/wang/trener/wang-ui";
import { WANG_ELEVPROFIL_FANER, elevprofilHref, lesElevprofilFane, wangHref } from "@/lib/wang/wang-ruter";

/**
 * WANG-44 Elevprofil. Rute: /team-wang/elev/[elevId]?fane=plan|stats|tester|iup|samtaler|turneringer.
 * Tegning: «WANG Golf Elevprofil.dc.html» #profil. Eleven må være aktiv spiller
 * i trenerens gruppe (ekte eller demo); ellers vises «Fant ikke eleven».
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Elevprofil — WANG Golf", robots: { index: false, follow: false } };

export default async function WangElevprofilSide({
  params,
  searchParams,
}: {
  params: Promise<{ elevId: string }>;
  searchParams: Promise<{ fane?: string | string[]; tester?: string | string[] }>;
}) {
  const { bruker, gruppe, erDemo } = await krevWangTrener();
  const [{ elevId }, sp] = await Promise.all([params, searchParams]);
  const fane = lesElevprofilFane(sp.fane);
  const testerFilter = (Array.isArray(sp.tester) ? sp.tester[0] : sp.tester) ?? "alle";
  const na = new Date();
  const alleElever = wangHref("WANG-07");

  let elev;
  let snitt;
  try {
    elev = await hentGruppeElev(gruppe.id, elevId, na);
    snitt = elev ? (await hentSnittForElever([elev.id], na)).get(elev.id) ?? null : null;
  } catch {
    return (
      <WangSide>
        <div><Tilbake href={alleElever}>Alle elever</Tilbake></div>
        <WangFeil tekst="Ingenting er borte. Det eleven har ført ligger i PlayerHQ. Last siden på nytt om litt." />
      </WangSide>
    );
  }

  if (!elev) {
    return (
      <WangSide>
        <WangKort>
          <WangTom
            tittel="Fant ikke eleven."
            tekst={`Eleven finnes ikke, eller er ikke aktiv spiller i ${gruppe.name}. Du ser bare elever i din egen gruppe.`}
            handling={<Tilbake href={alleElever}>Alle elever</Tilbake>}
          />
        </WangKort>
      </WangSide>
    );
  }

  const kicker = ["WANG-44", elev.klasse, elev.alder !== null ? `${elev.alder} år` : null, elev.klubb].filter(Boolean).join(" · ");
  const linje = [
    snitt?.kategori ? `Kategori ${snitt.kategori} · ${snitt.kategoriNiva}` : "Kategori —",
    `snittscore ${norskTall(snitt?.snitt ?? null, 1)}`,
    `hcp ${norskTall(elev.hcp, 1)}`,
  ].join(" · ");
  const trenerNavn = bruker.name?.trim() || bruker.email;

  return (
    <WangSide>
      <div><Tilbake href={alleElever}>Alle elever</Tilbake></div>
      <div className={s.profilHode}>
        <div className={s.profilHodeTekst}>
          <span className={s.kicker}>{kicker}</span>
          <h1 className={s.h1}>{elev.navn}</h1>
          <p className={s.linje}>{linje}</p>
          <p className={s.deling}>
            <Link2 size={18} strokeWidth={1.5} aria-hidden="true" style={{ flex: "none", marginTop: 1 }} />
            <span>Aktiv spiller i {gruppe.name} siden {isoTilNorsk(osloIso(elev.medlemSiden))}.</span>
          </p>
        </div>
      </div>
      {erDemo ? <WangDemoMerknad /> : null}

      <WangChips
        etikett="Elevprofil"
        valg={WANG_ELEVPROFIL_FANER.map((f) => ({ etikett: f.navn, href: elevprofilHref(elev.id, f.id), aktiv: f.id === fane }))}
      />

      {fane === "plan" ? <PlanFane elev={elev} /> : null}
      {fane === "stats" ? <StatsFane elev={elev} /> : null}
      {fane === "tester" ? <TesterFane elev={elev} filter={testerFilter} /> : null}
      {fane === "iup" ? <IupFane elev={elev} gruppeId={gruppe.id} gruppeNavn={gruppe.name} trenerNavn={trenerNavn} /> : null}
      {fane === "samtaler" ? <SamtalerFane elev={elev} /> : null}
      {fane === "turneringer" ? <TurneringerFane elev={elev} /> : null}
    </WangSide>
  );
}
