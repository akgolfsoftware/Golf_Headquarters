"use client";

/**
 * Oppsummering + lagring. Full runde eller delvis (min. 1 fullført hull —
 * kun fullførte hull lagres, aldri skalert opp). Serveren beregner SG på
 * nytt ved lagring (klient-tallene er estimat). Kladden slettes først når
 * lagringen er bekreftet — feil mister aldri data.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { lagreLoggetRunde } from "@/app/portal/(legacy)/mal/runder/logg/actions";
import type { LoggetHull } from "@/lib/runde-logg/types";
import { beregnSg } from "@/lib/domain/sg";
import { rundeTilSgShots } from "@/lib/runde-logg/til-sg-shots";
import { deriverRundeScore } from "@/lib/runde-logg/deriver-hullscore";
import { T, fmtSg, Kort, Icon } from "@/components/v2";
import { slettKladd } from "@/lib/runde-logg/draft";

type OppsummeringProps = {
  courseId: string;
  courseNavn: string;
  playedAt: string;
  roundType: "turnering" | "trening";
  hullData: LoggetHull[];
  onTilbake: () => void;
};

export function Oppsummering({
  courseId,
  courseNavn,
  playedAt,
  roundType,
  hullData,
  onTilbake,
}: OppsummeringProps) {
  const router = useRouter();
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const ferdige = hullData.filter((h) => h.slag.at(-1)?.resultat.iHull === true);
  const delvis = ferdige.length < hullData.length;

  // Klient-estimat (samme motorfunksjoner som serveren).
  let score = 0;
  let putter = 0;
  let sgTotal: number | null = null;
  try {
    const derivert = deriverRundeScore(ferdige);
    score = derivert.totalScore;
    putter = derivert.hullScores.reduce((sum, h) => sum + h.putts, 0);
    sgTotal = beregnSg(rundeTilSgShots(ferdige)).total;
  } catch {
    sgTotal = null;
  }
  const straffer = ferdige.reduce(
    (sum, h) => sum + h.slag.filter((s) => s.straffe).length,
    0,
  );
  const sumPar = ferdige.reduce((sum, h) => sum + h.par, 0);
  const diff = score - sumPar;
  const diffTxt = diff === 0 ? "E" : diff > 0 ? `+${diff}` : `−${Math.abs(diff)}`;

  const lagre = async () => {
    setLagrer(true);
    setFeil(null);
    try {
      const res = await lagreLoggetRunde({
        courseId,
        playedAt: new Date(playedAt).toISOString(),
        hull: ferdige,
        roundType,
      });
      slettKladd();
      // CTA-løkke: rundedetalj har SG + Importer runde-data (UpGame)
      router.push(`/portal/mal/runder/${res.roundId}?lagret=1`);
    } catch (e) {
      setFeil(
        e instanceof Error && e.message.startsWith("Ugyldig runde-logg")
          ? e.message
          : "Fikk ikke kontakt. Runden ligger trygt på enheten — prøv igjen når du har dekning.",
      );
      setLagrer(false);
    }
  };

  const stat = (l: string, v: string) => (
    <div key={l} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: T.mut,
        }}
      >
        {l}
      </span>
      <span style={{ fontFamily: T.mono, fontSize: 17, fontWeight: 700, color: T.fg }}>{v}</span>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 22, color: T.fg, lineHeight: 1.1 }}>
          {score} slag ({diffTxt})
        </div>
        <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 3 }}>
          {courseNavn} · {roundType} · {ferdige.length}
          {delvis ? ` av ${hullData.length}` : ""} hull
        </div>
      </div>

      <Kort>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
          {stat("SG totalt", sgTotal == null ? "—" : fmtSg(sgTotal))}
          {stat("Putter", String(putter))}
          {stat("Straffer", String(straffer))}
        </div>
        <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.fg2, marginTop: 12 }}>
          {delvis
            ? `Kun de ${ferdige.length} fullførte hullene lagres. Runde-SG merkes med dekning — aldri skalert opp.`
            : "Alle kjeder komplette — full SG-attribusjon lagres."}{" "}
          Serveren beregner SG på nytt ved lagring.
        </div>
      </Kort>

      {feil && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 12,
            background: "color-mix(in srgb, var(--v2-down) 8%, transparent)",
            border: "1px solid color-mix(in srgb, var(--v2-down) 35%, transparent)",
          }}
        >
          <Icon name="triangle-alert" size={14} style={{ color: T.down, flex: "none" }} />
          <span style={{ fontFamily: T.ui, fontSize: 11.5, color: T.fg, lineHeight: 1.5 }}>{feil}</span>
        </div>
      )}

      <button
        type="button"
        onClick={lagre}
        disabled={lagrer || ferdige.length === 0}
        className="v2-press v2-focus"
        style={{
          appearance: "none",
          cursor: lagrer ? "wait" : "pointer",
          width: "100%",
          height: 54,
          borderRadius: 16,
          border: "none",
          background: T.lime,
          color: T.onLime,
          fontFamily: T.disp,
          fontSize: 16,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: lagrer ? 0.75 : 1,
          boxShadow: "0 10px 34px color-mix(in srgb, var(--v2-lime) 28%, transparent)",
        }}
      >
        {lagrer
          ? "Lagrer…"
          : feil
            ? "Prøv igjen"
            : delvis
              ? `Lagre ${ferdige.length} hull`
              : "Lagre runden"}
      </button>
      {lagrer && (
        <div style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, textAlign: "center" }}>
          Kladden slettes først når lagringen er bekreftet.
        </div>
      )}

      <button
        type="button"
        onClick={onTilbake}
        disabled={lagrer}
        className="v2-press v2-focus"
        style={{
          appearance: "none",
          cursor: "pointer",
          width: "100%",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          padding: "12px 0",
          borderRadius: 12,
          background: "transparent",
          border: `1px solid ${T.border}`,
          fontFamily: T.ui,
          fontSize: 13,
          fontWeight: 600,
          color: T.fg2,
        }}
      >
        <Icon name="arrow-left" size={14} />
        Tilbake til føringen
      </button>
    </div>
  );
}
