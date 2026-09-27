/**
 * Resultatene til en bekreftet spiller: nivåtall, scoringsmønster, runder og
 * hullkort. Kilde er GolfBox (brutto, 18 hull). Servervisning uten tilstand.
 *
 * Navngivning følger ordboken: «mot startfeltet», «justert», «til par». Ingen av
 * tallene heter SG. Strokes Gained krever slag-for-slag-data, og GolfBox har
 * bare score per hull. GolfBox og DataGolf blandes aldri i samme tall.
 */

import { TL } from "@/lib/v2/train-lock";
import { fmtSg as fortegn } from "@/lib/v2/format";
import { formaterProsent, formaterTall } from "@/lib/format-tall";
import { Kort, KpiFlis, Caps, TomTilstand } from "@/components/v2/core";
import { DataTabell, type DataTabellColumn } from "@/components/v2/datavis";
import type { ProfilResultater, ProfilRunde } from "@/lib/profil-kobling/typer";

const sans = { fontFamily: TL.font.sans } as const;
const mono = { fontFamily: TL.font.mono, fontVariantNumeric: "tabular-nums" } as const;

const tall = (v: number | null | undefined): string => formaterTall(v, 1, true);
const prosent = (v: number | null | undefined): string => formaterProsent(v, 1, true);
const fort = (v: number | null | undefined): string => (v == null ? "—" : fortegn(v));

const KOLONNER: DataTabellColumn[] = [
  { key: "dato", label: "Dato", mono: true },
  { key: "turnering", label: "Turnering" },
  { key: "klasse", label: "Klasse" },
  { key: "runde", label: "Runde", mono: true, align: "right" },
  { key: "score", label: "Score", mono: true, align: "right" },
  { key: "tilPar", label: "Til par", mono: true, align: "right" },
  { key: "motFelt", label: "Mot feltet", mono: true, align: "right" },
  { key: "justert", label: "Justert", mono: true, align: "right" },
];

function HullKort({ runde }: { runde: ProfilRunde }) {
  const hull = runde.hull ?? [];
  const parSum = hull.every((h) => h.par != null) ? hull.reduce((s, h) => s + (h.par ?? 0), 0) : null;
  const farge = (d: number | null) => (d == null ? TL.text : d < 0 ? TL.ok : d > 1 ? TL.danger : d === 1 ? TL.warn : TL.text);
  return (
    <Kort eyebrow="Siste runde, hull for hull">
      <div style={{ ...sans, fontSize: 12.5, color: TL.mute, marginBottom: 12 }}>
        {runde.turnering}
        {runde.dato ? ` · ${runde.dato}` : ""} · runde {runde.runde}
      </div>
      <div style={{ display: "flex", gap: 24, alignItems: "baseline", marginBottom: 14 }}>
        <span style={{ ...mono, fontSize: 32, fontWeight: 700, color: TL.text }}>{runde.score}</span>
        <span style={{ ...mono, fontSize: 14, color: TL.mute }}>{parSum != null ? `par ${parSum} · ${fort(runde.score - parSum)}` : "par mangler"}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(9, minmax(0, 1fr))", gap: 4 }}>
        {hull.map((h) => {
          const d = h.par == null ? null : h.score - h.par;
          return (
            <div key={h.hull} style={{ background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 8, padding: "6px 4px", textAlign: "center" }}>
              <div style={{ ...mono, fontSize: 9, color: TL.mute }}>{h.hull}{h.par != null ? ` · P${h.par}` : ""}</div>
              <div style={{ ...mono, fontSize: 15, fontWeight: 700, color: farge(d), lineHeight: 1.3 }}>{h.score}</div>
            </div>
          );
        })}
      </div>
    </Kort>
  );
}

export function ResultaterVisning({ data }: { data: ProfilResultater }) {
  const sesong = data.sesonger[0];
  const monster = data.monster.find((m) => sesong && m.year === sesong.year) ?? data.monster[0];
  const sisteMedHull = data.runder.find((r) => r.hull && r.hull.length > 0);

  const rader = data.runder.map((r) => ({
    dato: r.dato ?? "—",
    turnering: r.turnering,
    klasse: r.klasse ?? "—",
    runde: r.runde,
    score: r.score,
    tilPar: r.til_par == null ? "—" : fort(r.til_par),
    motFelt: fort(r.mot_felt),
    justert: r.justert_score == null ? "—" : tall(r.justert_score),
  }));

  if (!sesong) {
    return (
      <Kort>
        <TomTilstand icon="flag" title="Ingen runder ennå" sub="Koblingen er på plass. Resultatene dukker opp her når de er hentet fra GolfBox." />
      </Kort>
    );
  }

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <section aria-label={`Sesongen ${sesong.year}`} style={{ display: "grid", gap: 10 }}>
        <Caps>Sesongen {sesong.year}</Caps>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10 }}>
          <KpiFlis instant label="Runder" value={sesong.runder} sub={`${sesong.turneringer} turneringer`} />
          <KpiFlis instant label="Snitt til par" value={fort(sesong.snitt_til_par)} sub="slag per runde" />
          <KpiFlis
            instant
            label="Mot startfeltet"
            value={fort(sesong.snitt_mot_felt)}
            sub="slag per runde, pluss er bedre enn feltet"
          />
          <KpiFlis instant label="Justert snitt" value={tall(sesong.justert_snitt)} sub="justert for bane og dag" />
          <KpiFlis
            instant
            label="Plass i kullet"
            value={sesong.persentil_kull == null ? "—" : `${sesong.persentil_kull}`}
            sub={
              sesong.persentil_kull == null
                ? "for få runder til å rangere"
                : `av 100 i ${sesong.segment ?? "kullet"}, ${sesong.kull_n} spillere`
            }
          />
        </div>
      </section>

      {monster && (
        <section aria-label="Scoringsmønster" style={{ display: "grid", gap: 10 }}>
          <Caps>Scoringsmønster {monster.year} · {monster.hull} hull</Caps>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
            <KpiFlis instant label="Birdie eller bedre" value={prosent(monster.birdierate)} />
            <KpiFlis instant label="Bogey eller verre" value={prosent(monster.bogeyrate)} />
            <KpiFlis instant label="Dobbeltbogey eller verre" value={prosent(monster.dobbeltrate)} />
            <KpiFlis instant label="Snitt par 3" value={fort(monster.snitt_par3)} sub="til par" />
            <KpiFlis instant label="Snitt par 4" value={fort(monster.snitt_par4)} sub="til par" />
            <KpiFlis instant label="Snitt par 5" value={fort(monster.snitt_par5)} sub="til par" />
          </div>
        </section>
      )}

      {sisteMedHull && <HullKort runde={sisteMedHull} />}

      <Kort eyebrow="Runder">
        <DataTabell columns={KOLONNER} rows={rader} sortKey="dato" sortDir="desc" mobilKort />
      </Kort>

      <p style={{ ...sans, fontSize: 12, lineHeight: 1.55, color: TL.mute, margin: 0, maxWidth: "70ch" }}>
        Kilde: GolfBox. Alle tall er brutto og 18 hull. «Mot startfeltet» sammenlikner deg med alle som spilte samme
        runde, og sier ikke noe om hvor sterkt feltet var. «Justert» fjerner forskjellen mellom baner og dager og er
        det eneste tallet som kan sammenliknes på tvers av turneringer.
      </p>
    </div>
  );
}
