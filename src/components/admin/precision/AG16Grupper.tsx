"use client";

/**
 * AG-16 Grupper i nytt design (designbrevet 13.10.2026) — /admin/grupper.
 * Fasit: docs/design-system/utkast-agencyos/mer.html, skjerm «AG-16 Grupper».
 *
 * AK-stigen med fire trinn og gruppene ved siden av (beslutninger.md §AK-stigen,
 * 22.09), og ett kort per gruppe som åpner gruppa. Data uendret fra
 * src/app/admin/grupper/page.tsx (Group, GroupMember, faste tider fra GroupSchedule).
 *
 * Avvik:
 *   - «Legg spillere i grupper» (søk og avkrysning på tvers av grupper) har ingen
 *     handling i appen. Spillere legges til fra gruppa («Legg til spiller»).
 *   - Knøtt U12 er ikke et trinn (22.09) og står ved siden av stigen; finnes gruppa ikke i basen,
 *     vises «Ikke opprettet ennå» (opprettes med «Ny gruppe»).
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { Seksjon, Tom, Topp } from "@/components/admin/agencyos-ny/ny";
import type { GruppeV2, GrupperData } from "@/lib/admin/grupper/typer";
import "@/styles/agencyos-ny-mer.css";
import "@/styles/agencyos-ny-grupper.css";

export type AG16Tilstand = "data" | "tom";
export type AG16Props = {
  tilstand: AG16Tilstand;
  data: GrupperData;
  nyGruppeKnapp: ReactNode;
  gfgkBootstrapKnapp: ReactNode | null;
  /** AK-stigens trinn (med kanonisk gruppenavn) og gruppene som står ved siden av den (src/lib/agencyos/ak-stigen-data.ts). */
  stigen?: { trinn: readonly { navn: string; gruppeNavn: string }[]; vedSiden: readonly string[] };
};

const pst = (p: number | null | undefined) => (p == null ? "—" : `${p} %`);
const faste = (g: GruppeV2) => (g.faste.length === 0 ? "Ingen faste tider" : g.faste.map((f) => `${f.dag} ${f.tid.split("–")[0]}`).join(" · "));

function MotPlan({ pct }: { pct: number | null | undefined }) {
  return <span className="mot-plan">
    <span className="mot-tekst"><span>Mot plan, 4 uker</span><b className="num">{pst(pct)}</b></span>
    <span className="mot-spor" role="img" aria-label={pct == null ? "Ingen forfalte økter" : `${pct} prosent`}><i style={{ width: `${Math.min(100, Math.max(0, pct ?? 0))}%` }} /></span>
  </span>;
}

function TrinnKort({ nr, navn, g }: { nr: number; navn: string; g: GruppeV2 | undefined }) {
  if (!g) return <div className="trinn-kort tomt"><span className="kilde">Trinn {nr} · {navn}</span><b className="n">Ingen gruppe</b><span className="kilde">Gruppa finnes ikke i basen ennå.</span></div>;
  return <Link href={`/admin/grupper/${g.id}`} className="trinn-kort">
    <span className="trinn-topp"><span className="kilde">Trinn {nr} · {navn}</span><b className="tall num">{g.antallMedlemmer}</b></span>
    <b className="n">{g.navn}</b>
    <span className="gr-fakta">{g.coachNavn ?? "Coach ikke satt"}</span>
    <span className="gr-fakta num">{faste(g)}</span>
    <MotPlan pct={g.etterlevelsePct} />
    <span className="gr-fakta">Neste samling: <b>{g.nesteOkt ?? "—"}</b></span>
  </Link>;
}

export function AG16Grupper({ tilstand, data, nyGruppeKnapp, gfgkBootstrapKnapp, stigen }: AG16Props) {
  const perNavn = new Map(data.grupper.map((g) => [g.navn, g]));
  const bruktNavn = new Set([...(stigen?.trinn.map((t) => t.gruppeNavn) ?? []), ...(stigen?.vedSiden ?? [])]);
  const vedSiden = stigen?.vedSiden ?? [];
  const andre = data.grupper.filter((g) => !bruktNavn.has(g.navn));

  const Rad = ({ g }: { g: GruppeV2 }) => <Link href={`/admin/grupper/${g.id}`} className="ved-rad">
    <span className="ved-navn"><b>{g.navn}</b><span className="kilde">{g.coachNavn ?? "Coach ikke satt"}</span></span>
    <b className="num ved-ant">{g.antallMedlemmer}</b>
    <span className="gr-fakta num">{faste(g)}</span>
    <span className="ved-pst num">{pst(g.etterlevelsePct)}</span>
  </Link>;

  return <div className="agn-s">
    <Topp dato="Mer · grupper" tittel="Grupper" handlinger={<>{nyGruppeKnapp}{gfgkBootstrapKnapp}</>} />

    {tilstand === "tom" || data.grupper.length === 0
      ? <Tom tittel="Ingen grupper" tekst="Lag en gruppe, og legg inn spillere med PlayerHQ." />
      : <>
        {stigen && <Seksjon tittel="AK-stigen" hoyre={<Link href="/admin/agencyos/ak-stigen" className="lenke-hoyre">Åpne stigen</Link>}>
          <p className="forklar">Mini, Basis, Utvikling, Elite. Gruppa rangerer ikke spillerne.</p>
          <div className="trinn-rutenett">
            {stigen.trinn.map((t, i) => <TrinnKort key={t.gruppeNavn} nr={i + 1} navn={t.navn} g={perNavn.get(t.gruppeNavn)} />)}
          </div>
        </Seksjon>}

        {(vedSiden.length > 0 || andre.length > 0) && <Seksjon tittel={stigen ? "Ved siden av stigen" : "Gruppene"} kilde={`${vedSiden.length + andre.length} grupper`}>
          <div className="ved-liste">
            <div className="ved-rad ved-topp" aria-hidden><span>Gruppe</span><span>Spillere</span><span>Faste tider</span><span>Mot plan</span></div>
            {vedSiden.map((navn) => {
              const g = perNavn.get(navn);
              return g ? <Rad key={navn} g={g} /> : <div key={navn} className="ved-rad ikke-opprettet">
                <span className="ved-navn"><b>{navn.replace(/^GFGK Junior /, "")}</b><span className="kilde">Ikke opprettet ennå</span></span>
                <b className="num ved-ant">—</b>
                <span className="gr-fakta">Gruppa finnes ikke i basen. Opprett den med «Ny gruppe».</span>
                <span className="ved-pst num">—</span>
              </div>;
            })}
            {andre.map((g) => <Rad key={g.id} g={g} />)}
          </div>
          {stigen && <p className="kilde">Knøtt er ikke et trinn i stigen · mot plan = gjennomført tid delt på planlagt, siste fire uker</p>}
        </Seksjon>}
      </>}
  </div>;
}
