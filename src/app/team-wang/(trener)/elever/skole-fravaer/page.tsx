import type { Metadata } from "next";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { osloIso } from "@/app/team-wang/_data/wang-elever-regler";
import { KortHode, meStil as s } from "@/app/team-wang/_components/wang-meldinger-elever/felles";
import { WangDemoMerknad, WangKnapp, WangKort, WangLenke, WangSide, WangSidehode } from "@/components/wang/trener/wang-ui";
import { wangHref } from "@/lib/wang/wang-ruter";

/**
 * WANG-05 Skole og idrettsfravær. Rute: /team-wang/elever/skole-fravaer. Tegning: «WANG Golf Batch 2.dc.html» #fravaer.
 * Søknader om fri, fravær per fag og dialogen med kontaktlærer har ingen modell,
 * og skolens fraværstall ligger ikke i appen. Ingen tall vises før de finnes.
 */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Skole og idrettsfravær — WANG Golf", robots: { index: false, follow: false } };

function skoleaar(na: Date): string {
  const [a, m] = osloIso(na).split("-").map(Number);
  const start = m >= 8 ? a : a - 1;
  return `${start}/${String((start + 1) % 100).padStart(2, "0")}`;
}

export default async function WangSkoleFravaerSide() {
  const { gruppe, erDemo } = await krevWangTrener();
  return (
    <WangSide>
      <WangSidehode
        skjermId="WANG-05"
        undertittel={`${gruppe.name} · Skoleåret ${skoleaar(new Date())}`}
        tittel="Skole og idrettsfravær"
        handling={<WangKnapp variant="primar" disabled>Ny søknad om fri</WangKnapp>}
      />
      {erDemo ? <WangDemoMerknad /> : null}
      <div className={s.split}>
        <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
          <WangKort>
            <KortHode tittel="Søknader om fri" meta="0 søknader" />
            <p className={s.tomLinje} style={{ color: "var(--wtr-text-muted)" }}>
              Ingen søknader. Søknad om idrettsfravær kan ikke sendes fra appen ennå.
            </p>
          </WangKort>
          <WangKort>
            <KortHode tittel="Faglig risikovarsel" meta="Udokumentert fravær per fag mot grensen på 10 %." />
            <p className={s.tomLinje} style={{ color: "var(--wtr-text-muted)" }}>
              Skolens fraværstall ligger ikke i appen. Varselet vises når fraværet per fag hentes inn.
            </p>
          </WangKort>
        </div>
        <WangKort polstret>
          <div style={{ display: "grid", gap: 10 }}>
            <p className={s.brod16} style={{ margin: 0 }}>Velg en søknad for å se dialog og berørte fag.</p>
            <p className={s.fot}>Prøver og heldagsprøver fra skolens terminliste ser du i prøveplanen.</p>
            <WangLenke href={wangHref("WG-04")}>Prøveplan</WangLenke>
          </div>
        </WangKort>
      </div>
    </WangSide>
  );
}
