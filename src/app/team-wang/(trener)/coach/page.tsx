import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { hentGruppeElever } from "@/app/team-wang/_data/wang-elever-data";
import { norskTall } from "@/app/team-wang/_data/wang-elever-regler";
import { meStil as s } from "@/app/team-wang/_components/wang-meldinger-elever/felles";
import {
  WangChips,
  WangDemoMerknad,
  WangFeil,
  WangKort,
  WangLenke,
  WangSide,
  WangSidehode,
  WangTom,
} from "@/components/wang/trener/wang-ui";
import { elevprofilHref, wangHref } from "@/lib/wang/wang-ruter";

/**
 * WG-05 Trenerflate (Elevstallen). Rute: /team-wang/coach. Tegning: «WANG Golf.dc.html» #coach.
 *
 * Gruppa leses fra porten (`krevWangTrener().gruppe.id`), så demogruppen virker
 * også. Oppmøte på morgentrening, belastning (ACWR) og skadestatus har ingen
 * datakilde trenerflaten kan bruke ennå, og står som «—». Skadestatus er
 * helseopplysninger og vises ikke uten elevens samtykke til deling.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Elevstallen — WANG Golf",
  description: "Trenerflaten for golfgruppa ved WANG Toppidrett.",
  robots: { index: false, follow: false },
};

function initialer(navn: string): string {
  return navn.split(/\s+/).filter(Boolean).slice(0, 2).map((d) => d[0]?.toUpperCase() ?? "").join("");
}

export default async function WangCoachPage({ searchParams }: { searchParams: Promise<{ klasse?: string | string[] }> }) {
  const { bruker, gruppe, erDemo } = await krevWangTrener();
  const sp = await searchParams;
  const valgt = (Array.isArray(sp.klasse) ? sp.klasse[0] : sp.klasse) ?? "Alle";
  const trenerNavn = bruker.name?.trim() || bruker.email;
  const hode = <WangSidehode skjermId="WG-05" undertittel={`Trenerflate · ${trenerNavn}`} tittel="Elevstallen" />;

  let elever;
  try {
    elever = await hentGruppeElever(gruppe.id, new Date());
  } catch {
    return (
      <WangSide>
        {hode}
        <WangFeil tekst="Ingenting er borte. Last siden på nytt om litt." />
      </WangSide>
    );
  }

  const klasser = [...new Set(elever.map((e) => e.klasse).filter((k): k is string => !!k))].sort((a, b) => a.localeCompare(b, "nb"));
  const liste = valgt === "Alle" ? elever : elever.filter((e) => e.klasse === valgt);
  const base = wangHref("WG-05");

  return (
    <WangSide>
      {hode}
      {erDemo ? <WangDemoMerknad /> : null}

      <div className={s.split}>
        <WangKort polstret>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <p className={s.metaTekst} style={{ margin: 0 }}>Fremmøte morgentrening · siste 8 økter</p>
                <p style={{ margin: "6px 0 0", display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span className={s.stor}>—</span>
                  <span className={s.metaTekst}>{valgt === "Alle" ? "Alle klasser" : valgt}</span>
                </p>
              </div>
              <p className={s.tall} style={{ margin: 0, fontSize: 13, color: "var(--wtr-text-muted)" }}>
                {liste.length} {liste.length === 1 ? "elev" : "elever"}
              </p>
            </div>
            <p className={s.fot}>Oppmøte på morgentrening føres ikke i appen ennå. Tallene vises her når oppmøtet registreres.</p>
          </div>
        </WangKort>
        <WangKort polstret>
          <div style={{ display: "grid", gap: 8 }}>
            <h2 className={s.h2}>Belastning og skade</h2>
            <p className={s.metaTekst} style={{ margin: 0 }}>ACWR = akutt 7 dager mot kronisk 28 dager.</p>
            <p className={s.fot}>Belastning og skadestatus vises ikke ennå. Skade er helseopplysninger og krever at eleven deler dem.</p>
          </div>
        </WangKort>
      </div>

      {klasser.length > 0 ? (
        <WangChips
          etikett="Filtrer på klasse"
          valg={["Alle", ...klasser].map((k) => ({
            etikett: k,
            antall: k === "Alle" ? elever.length : elever.filter((e) => e.klasse === k).length,
            href: k === "Alle" ? base : `${base}?klasse=${encodeURIComponent(k)}`,
            aktiv: k === valgt,
          }))}
        />
      ) : null}

      <WangKort>
        {elever.length === 0 ? (
          <WangTom
            tittel="Ingen elever i gruppa ennå."
            tekst={`Elevene vises her når de står som aktive spillere i ${gruppe.name}.`}
            handling={<WangLenke href={wangHref("WANG-20")}>Inviter elev</WangLenke>}
          />
        ) : (
          <div role="table" aria-label="Elevstallen">
            <div role="row" className={`${s.erad} ${s.eradHode}`}>
              <span role="columnheader">Elev</span>
              <span role="columnheader">Klasse</span>
              <span role="columnheader">Hcp</span>
              <span role="columnheader">Oppmøte morgen</span>
              <span role="columnheader">ACWR</span>
              <span role="columnheader" className={s.skade}>Skadestatus</span>
              <span role="columnheader" className={s.pilKol} />
            </div>
            {liste.map((e) => (
              <div role="row" key={e.id} className={s.erad}>
                <span role="cell" className={s.eradNavn}>
                  <span className={s.initialer} aria-hidden="true">{initialer(e.navn)}</span>
                  <span style={{ minWidth: 0 }}>
                    <Link href={elevprofilHref(e.id)} className={s.radTittel} style={{ display: "block", fontSize: 14, color: "var(--wtr-blue)" }}>{e.navn}</Link>
                    <span style={{ display: "block", fontSize: 13, color: "var(--wtr-text-muted)" }}>{e.alder !== null ? `${e.alder} år` : "—"}</span>
                  </span>
                </span>
                <span role="cell" className={s.tall} style={{ fontSize: 13, fontWeight: 500 }}><span className={s.lblM}>Klasse </span>{e.klasse ?? "—"}</span>
                <span role="cell" className={s.tall} style={{ fontSize: 13, fontWeight: 500 }}><span className={s.lblM}>Hcp </span>{norskTall(e.hcp, 1)}</span>
                <span role="cell" className={s.tall} style={{ fontSize: 13, fontWeight: 500 }}><span className={s.lblM}>Oppmøte </span>—</span>
                <span role="cell" className={s.tall} style={{ fontSize: 13, fontWeight: 500 }}><span className={s.lblM}>ACWR </span>—</span>
                <span role="cell" className={`${s.skade} ${s.brod}`} style={{ fontSize: 14 }}><span className={s.lblM}>Skade </span>—</span>
                <span role="cell" className={s.pilKol}>
                  <Link href={elevprofilHref(e.id, "iup")} className={s.pil} aria-label={`Åpne IUP for ${e.navn}`}>
                    <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                </span>
              </div>
            ))}
            {liste.length === 0 ? <p className={s.tomLinje}>Ingen elever i {valgt}.</p> : null}
          </div>
        )}
      </WangKort>
    </WangSide>
  );
}
