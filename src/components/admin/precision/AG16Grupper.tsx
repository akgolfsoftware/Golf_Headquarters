"use client";

/**
 * AG-16 Grupper i Skrå-drakten (bølge 2, pakke A5, 22.10.2026) — /admin/grupper.
 * Skisse: docs/design-system/utkast-skra/komponist/bolge-2.html §3 (godkjent 22.10).
 * Innhold: docs/design-system/utkast-agencyos/mer.html, skjerm «AG-16 Grupper».
 *
 * Topp med puttebildet og fire tall (Grupper, Spillere i grupper, Uten gruppe, Neste samling),
 * hovedkortet med neste samling eller testdag, AK-stigen med fire trinn, og gruppene som kort
 * (tre i bredden på PC). Data uendret fra src/app/admin/grupper/page.tsx.
 *
 * Avvik:
 *   - «Legg spillere i grupper» (søk og avkrysning på tvers av grupper) har ingen handling i appen.
 *     Knappen går til gruppekortene; spillere legges til fra gruppa («Legg til spiller»).
 *   - Knøtt U12 er ikke et trinn (22.09) og står ved siden av stigen; finnes gruppa ikke i basen,
 *     vises «Ikke opprettet ennå» (opprettes med «Ny gruppe»).
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { KnappLenke } from "@/components/admin/agencyos-ny/ny";
import { SkraFlyt, SkraHelt, SkraKort, SkraStat, SkraTom, SkraTopp } from "@/components/precision/skra/Skra";
import type { GruppeV2, GrupperData } from "@/lib/admin/grupper/typer";
import "@/styles/agencyos-ny-mer.css";
import "@/styles/agencyos-ny-grupper.css";
import "@/styles/agencyos-ny-a5-skra.css";

export type AG16Tilstand = "data" | "tom";

/** Tallene i toppen. «null» vises som «—». */
export type AG16Tall = { iGrupper: number | null; utenGruppe: number | null; nesteSamling: string | null };

/** Hovedkortet: det som kommer først av neste samling og neste testdag. */
export type AG16Helt = { overlinje: string; tid: string; tidEtter?: string; tittel: string; meta?: string; href: string; lenkeTekst: string };

export type AG16Props = {
  tilstand: AG16Tilstand;
  data: GrupperData;
  nyGruppeKnapp: ReactNode;
  gfgkBootstrapKnapp: ReactNode | null;
  /** AK-stigens trinn (med kanonisk gruppenavn) og gruppene som står ved siden av den (src/lib/agencyos/ak-stigen-data.ts). */
  stigen?: { trinn: readonly { navn: string; gruppeNavn: string }[]; vedSiden: readonly string[] };
  tall?: AG16Tall;
  helt?: AG16Helt | null;
};

const pst = (p: number | null | undefined) => (p == null ? "—" : `${p} %`);
const faste = (g: GruppeV2) => (g.faste.length === 0 ? "Ingen faste tider" : g.faste.map((f) => `${f.dag} ${f.tid.split("–")[0]}`).join(" · "));
const tallTekst = (n: number | null | undefined) => (n == null ? "—" : String(n));

function MotPlan({ pct }: { pct: number | null | undefined }) {
  return <span className="mot-plan" title="Bare aktive medlemmer som deler treningsgrunnlaget med AK Golf i denne gruppen">
    <span className="mot-tekst"><span>Mot plan, 4 uker</span><b className="num">{pst(pct)}</b></span>
    <span className="mot-spor" role="img" aria-label={pct == null ? "Ingen delte forfalte økter" : `${pct} prosent`}><i style={{ width: `${Math.min(100, Math.max(0, pct ?? 0))}%` }} /></span>
  </span>;
}

function TrinnKort({ nr, navn, g }: { nr: number; navn: string; g: GruppeV2 | undefined }) {
  if (!g) return <div className="trinn-kort tomt"><span className="kilde">Trinn {nr} · {navn}</span><b className="n">Ingen gruppe</b><span className="kilde">Gruppa finnes ikke i basen ennå.</span></div>;
  return <Link href={`/admin/grupper/${g.id}`} className="trinn-kort">
    <span className="trinn-topp"><span className="kilde">Trinn {nr} · {navn}</span><b className="tall num">{g.antallMedlemmer}</b></span>
    <b className="n">{g.navn}</b>
    <span className="gr-fakta">{g.coachNavn ?? "Coach ikke satt"}</span>
    <MotPlan pct={g.etterlevelsePct} />
  </Link>;
}

function GruppeKort({ g }: { g: GruppeV2 }) {
  return <Link href={`/admin/grupper/${g.id}`} className="a5-gruppekort">
    <span className="a5-gk-topp"><b className="n">{g.navn}</b><b className="tall num" aria-label={`${g.antallMedlemmer} medlemmer`}>{g.antallMedlemmer}</b></span>
    <span className="gr-fakta">{g.coachNavn ?? "Coach ikke satt"}</span>
    <span className="gr-fakta num">{faste(g)}</span>
    <MotPlan pct={g.etterlevelsePct} />
    <span className="gr-fakta">Neste samling: <b>{g.nesteOkt ?? "—"}</b></span>
  </Link>;
}

export function AG16Grupper({ tilstand, data, nyGruppeKnapp, gfgkBootstrapKnapp, stigen, tall, helt = null }: AG16Props) {
  const perNavn = new Map(data.grupper.map((g) => [g.navn, g]));
  const bruktNavn = new Set(stigen?.trinn.map((t) => t.gruppeNavn) ?? []);
  const vedSiden = stigen?.vedSiden ?? [];
  const vedSidenSett = new Set(vedSiden);
  const andre = data.grupper.filter((g) => !bruktNavn.has(g.navn) && !vedSidenSett.has(g.navn));
  const tom = tilstand === "tom" || data.grupper.length === 0;

  return <div className="agn-s agn-a5-skra">
    <SkraTopp
      bilde="/images/playerhq/slag-putting.jpg"
      bildePosisjon="50% 55%"
      overlinje="Spillere · grupper"
      tittel="Grupper"
      etikett="Grupper"
      handling={<div className="a5-topp-knapper knapper">
        {nyGruppeKnapp}
        {!tom && <KnappLenke href="#gruppene">Legg spillere i grupper</KnappLenke>}
        {gfgkBootstrapKnapp}
      </div>}
      tall={<>
        <SkraStat verdi={tom ? "0" : String(data.grupper.length)} etikett="Grupper" />
        <SkraStat verdi={tallTekst(tall?.iGrupper)} etikett="Spillere i grupper" />
        <SkraStat verdi={tallTekst(tall?.utenGruppe)} etikett="Uten gruppe" />
        <SkraStat verdi={tall?.nesteSamling ?? "—"} etikett="Neste samling" />
      </>}
    />

    <SkraFlyt className="a5-flyt">
      {helt
        ? <SkraHelt etikett="Det som kommer først" overlinje={helt.overlinje} tid={helt.tid} tidEtter={helt.tidEtter} tittel={helt.tittel} meta={helt.meta}
          handlinger={[{ tekst: helt.lenkeTekst, href: helt.href }]} />
        : null}

      {tom
        ? <SkraKort tittel="Ingen grupper"><SkraTom>Lag en gruppe, og legg inn spillere med PlayerHQ.</SkraTom></SkraKort>
        : <>
          {stigen && <SkraKort tittel="AK-stigen" lenke={{ href: "/admin/agencyos/ak-stigen", tekst: "Åpne stigen" }}>
            <p className="forklar">Mini, Basis, Utvikling, Elite. Gruppa rangerer ikke spillerne.</p>
            <div className="trinn-rutenett">
              {stigen.trinn.map((t, i) => <TrinnKort key={t.gruppeNavn} nr={i + 1} navn={t.navn} g={perNavn.get(t.gruppeNavn)} />)}
            </div>
          </SkraKort>}

          {(vedSiden.length > 0 || andre.length > 0) && <section id="gruppene" className="a5-gruppene" aria-label="Gruppene">
            <div className="a5-sek-topp"><h2>{stigen ? "Ved siden av stigen og andre grupper" : "Gruppene"}</h2><span className="kilde">{vedSiden.length + andre.length} grupper</span></div>
            <div className="a5-kortrutenett">
              {vedSiden.map((navn) => {
                const g = perNavn.get(navn);
                return g ? <GruppeKort key={navn} g={g} /> : <div key={navn} className="a5-gruppekort ikke-opprettet">
                  <span className="a5-gk-topp"><b className="n">{navn.replace(/^GFGK Junior /, "")}</b><b className="tall num">—</b></span>
                  <span className="kilde">Ikke opprettet ennå</span>
                  <span className="gr-fakta">Gruppa finnes ikke i basen. Opprett den med «Ny gruppe».</span>
                </div>;
              })}
              {andre.map((g) => <GruppeKort key={g.id} g={g} />)}
            </div>
            <p className="kilde">Spillere legges til fra gruppa med «Legg til spiller».{stigen ? " Knøtt er ikke et trinn i stigen." : ""} Mot plan = gjennomført tid delt på planlagt, siste fire uker.</p>
          </section>}
        </>}
    </SkraFlyt>
  </div>;
}
