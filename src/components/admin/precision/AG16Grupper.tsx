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
 *   - Etterlevelse per gruppe vises i Gruppeanalysen, ikke på kortet (egen spørring).
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { Pille, Tom, Topp } from "@/components/admin/agencyos-ny/ny";
import type { GrupperData } from "@/components/admin/v2/GrupperV2";
import "@/styles/agencyos-ny-mer.css";

export type AG16Tilstand = "data" | "tom";
export type AG16Props = {
  tilstand: AG16Tilstand;
  data: GrupperData;
  nyGruppeKnapp: ReactNode;
  gfgkBootstrapKnapp: ReactNode | null;
  /** AK-stigens trinn og gruppene som står ved siden av den (src/lib/agencyos/ak-stigen-data.ts). */
  stigen?: { trinn: readonly string[]; vedSiden: readonly string[] };
};

const spillere = (n: number) => `${n} ${n === 1 ? "spiller" : "spillere"}`;

export function AG16Grupper({ tilstand, data, nyGruppeKnapp, gfgkBootstrapKnapp, stigen }: AG16Props) {
  return <div className="agn-s">
    <Topp dato="Mer · grupper" tittel="Grupper" handlinger={<>{nyGruppeKnapp}{gfgkBootstrapKnapp}</>} />

    {stigen && <Link href="/admin/agencyos/ak-stigen" className="gruppe-kort" aria-label="AK-stigen">
      <b className="n">AK-stigen</b>
      <div className="trinn-rad">{stigen.trinn.map((t) => <span key={t}>{t}</span>)}</div>
      {stigen.vedSiden.length > 0 && <>
        <span className="kilde">Ved siden av stigen</span>
        <div className="trinn-rad">{stigen.vedSiden.map((t) => <span key={t} className="ved">{t}</span>)}</div>
      </>}
    </Link>}

    {tilstand === "tom" || data.grupper.length === 0
      ? <Tom tittel="Ingen grupper" tekst="Lag en gruppe, og legg inn spillere med PlayerHQ." />
      : <section className="seksjon" aria-label="Gruppene">
        <div className="sek-topp"><h2>Gruppene</h2><span className="kilde">{data.grupper.length} grupper · {data.grupper.reduce((s, g) => s + g.antallMedlemmer, 0)} medlemskap</span></div>
        <div className="gruppe-liste">
          {data.grupper.map((g) => <Link key={g.id} href={`/admin/grupper/${g.id}`} className="gruppe-kort">
            <span className="rad"><b className="n">{g.navn}</b><Pille>{spillere(g.antallMedlemmer)}</Pille></span>
            <span className="kilde">
              {g.faste.length === 0 ? "Ingen faste tider" : g.faste.map((f) => `${f.dag} ${f.tid.split("–")[0]}`).join(" · ")}
              {g.nesteOkt ? ` · neste ${g.nesteOkt}` : ""}
            </span>
          </Link>)}
        </div>
      </section>}
  </div>;
}
