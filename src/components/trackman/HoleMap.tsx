/**
 * HoleMap — TM-07 «Hullkart komponenter». Stilisert topp-syn bane bak enhver
 * TrackMan-spredning: rough/fairway/green/bunker i grå nyanser, aldri
 * satellittfoto, 3D, grønn farge eller banelogo. To varianter:
 *   - "tee"      Driver/tre — hele hullet, sikte langt mot green (TM-07 A/E).
 *   - "approach" Jern/wedge — nærbilde av green m/ proximity-ringer (TM-07 F).
 *
 * Rent presentasjonslag. `TrackManShot` har ingen `holeNumber`/`roundId`
 * (practice-range-data, ikke runde-data) — kartet er derfor DEKORATIVT slik
 * fasiten selv krever («spredning ekkes alltid på hull … aldri blankt
 * koordinatsystem»), ikke en literal gjengivelse av et ekte hull. Ingen ny
 * datamodell er lagt til for dette (anti-scope PX-3).
 *
 * Fasit: designsystem/train-lock/TM-07 Hullkart komponenter.dc.html
 * Fasit: designsystem/train-lock/TM-09 Mini-kart og runde.dc.html
 * (kun TM-09a/b/f «Analyse mini» — "mini"-størrelsen pakker inn samme
 * hullkart 240×120. TM-09c/d/e «Hull-detalj» — rundens skudd PÅ hvert hull,
 * tee→innspill→putt langs en bane-polylinje — er IKKE bygget: det krever
 * per-hull skudd-posisjoner som verken `Round`/`Hole`-modellene eller
 * TrackManShot har i dag (praksis-data, ikke runde-data). Ny datamodell for
 * det er utenfor anti-scope PX-3.)
 *
 * Terreng-fargene (rough/fairway/green/bunker) finnes ikke som --tl-*
 * (kun denne komponentfamilien bruker dem — ikke en ny generell token-
 * familie, jf. CLAUDE.md invariant 2 «ingen nye tokens»). De er derfor
 * komponent-scopede CSS-variabler (samme lys-på-:root/mørk-på-
 * `html[data-v2-tema="dark"]`-mønster som train-lock-tokens.css selv bruker
 * — se TL_SCOPE i wb-tl-scope.ts for presedens), ikke oppføringer i
 * train-lock-tokens.css. Mørk er fasitens eksakte hex (eneste tegnede
 * fasit for TM-07/08/08f); lys er mekanisk avledet trinnvis grå
 * (D-LYS-beslutningen 26.08.2026 — godkjent metode der ingen lys-fasit
 * finnes ennå for denne familien).
 */

import { TL } from "@/lib/v2/train-lock";

export type HoleMapVariant = "tee" | "approach";
/** "full" = TM-07/TM-08/TM-08f hero-kart (240×170). "mini" = TM-09 a/b/f-kortet (240×120, kortere). */
export type HoleMapSize = "full" | "mini";

export const HOLE_MAP_VIEWBOX = "0 0 240 170";
export const HOLE_MAP_VIEWBOX_MINI = "0 0 240 120";

/** Fast, dekorativt siktepunkt/startpunkt (SVG-enheter) — matcher fasitens ankre. */
export const HOLE_MAP_TARGET: Record<
  HoleMapVariant,
  { x: number; y: number; startX: number; startY: number; plotRadius: number }
> = {
  tee: { x: 200, y: 80, startX: 18, startY: 85, plotRadius: 40 },
  approach: { x: 134, y: 74, startX: 6, startY: 92, plotRadius: 44 },
};

/** Samme ankre, TM-09-miniatyren (fasitens egne tall — ikke en lineær skalering av «full»). */
export const HOLE_MAP_TARGET_MINI: Record<
  HoleMapVariant,
  { x: number; y: number; startX: number; startY: number; plotRadius: number }
> = {
  tee: { x: 200, y: 57, startX: 18, startY: 60, plotRadius: 30 },
  approach: { x: 134, y: 52, startX: 6, startY: 66, plotRadius: 32 },
};

/**
 * Delt projeksjon: TrackMan-punkter (lateral/distance, meter, sentrert på
 * snittet) → SVG-koordinater i det 240×170 hullkartet, klynget rundt
 * variantens dekorative siktepunkt. Brukt av både DispersionMap (hero) og
 * ShotSheet (TM-08f mini-kart) — én skala-regel, ikke to som kan sprike.
 */
export function holeMapProjection(
  points: { lateral: number; distance: number }[],
  ellipseReach: number,
  variant: HoleMapVariant,
  size: HoleMapSize = "full",
) {
  const anchor = (size === "mini" ? HOLE_MAP_TARGET_MINI : HOLE_MAP_TARGET)[variant];
  const maxLateral = Math.max(6, ellipseReach, ...points.map((p) => Math.abs(p.lateral)), 0);
  const maxDistance = Math.max(6, ellipseReach, ...points.map((p) => Math.abs(p.distance)), 0);
  const scale = Math.min(anchor.plotRadius / maxLateral, anchor.plotRadius / maxDistance);
  return {
    toX: (lateral: number) => anchor.x + lateral * scale,
    // Distance er "carry forbi snitt" — lang = opp på skjermen (mindre y),
    // samme retning som mållinjens pilhode (TM-07 B).
    toY: (distance: number) => anchor.y - distance * scale,
  };
}

/** Klubb (fritekst fra TrackMan-import) → hvilken kart-variant. */
export function holeMapVariantFor(club: string): HoleMapVariant {
  const c = club.trim().toLowerCase();
  if (/^d(river)?$/.test(c) || /driver/.test(c) || /^\d?w(ood)?$/.test(c) || /hybrid|^h\d?$/.test(c)) {
    return "tee";
  }
  return "approach";
}

/** Injiseres ÉN gang per side (idempotent nok som duplisert `<style>` — samme mønster som andre v2-komponenter). */
export function HoleMapTerrainStyle() {
  return (
    <style>{`
.tm-holemap-terrain {
  --hm-rough: #EDEDED;
  --hm-fairway: #E4E4E4;
  --hm-green: #D9D9D9;
  --hm-green-2: #D2D2D2;
  --hm-bunker: #C7C7C7;
  --hm-tee: #BEBEBE;
}
html[data-v2-tema="dark"] .tm-holemap-terrain {
  --hm-rough: #141414;
  --hm-fairway: #1A1A1A;
  --hm-green: #212121;
  --hm-green-2: #202020;
  --hm-bunker: #2A2A2A;
  --hm-tee: #2C2C2E;
}
`}</style>
  );
}

/** Terreng-laget — SVG-fragment, settes inn FØRST i en foreldre-`<svg>` som selv sitter i `.tm-holemap-terrain`. */
export function HoleMapTerrain({ variant, size = "full" }: { variant: HoleMapVariant; size?: HoleMapSize }) {
  if (size === "mini") {
    if (variant === "tee") {
      return (
        <>
          <path
            d="M0 106 C24 84 18 42 52 24 C104 4 186 10 220 28 C238 42 238 92 212 110 C158 124 38 126 0 106 Z"
            fill="var(--hm-rough)"
          />
          <path
            d="M22 68 C60 48 96 46 132 51 C160 54 176 61 190 65 C176 74 158 79 130 79 C96 81 56 79 22 71 Z"
            fill="var(--hm-fairway)"
          />
          <ellipse cx={200} cy={57} rx={24} ry={16} fill="var(--hm-green)" />
          <ellipse cx={120} cy={36} rx={11} ry={6} fill="var(--hm-bunker)" />
          <ellipse cx={150} cy={85} rx={9} ry={5} fill="var(--hm-bunker)" />
          <rect x={12} y={57} width={9} height={9} rx={2} fill="var(--hm-tee)" />
        </>
      );
    }
    return (
      <>
        <ellipse cx={140} cy={60} rx={86} ry={46} fill="var(--hm-green)" />
        <ellipse cx={142} cy={59} rx={70} ry={37} fill="var(--hm-green-2)" />
        <path d="M0 54 C20 48 38 48 56 52 L56 74 C36 76 18 78 0 76 Z" fill="var(--hm-fairway)" />
        <ellipse cx={48} cy={92} rx={18} ry={9} fill="var(--hm-bunker)" />
        <ellipse cx={64} cy={26} rx={14} ry={8} fill="var(--hm-bunker)" />
      </>
    );
  }
  if (variant === "tee") {
    return (
      <>
        <path
          d="M0 150 C30 120 20 60 56 34 C110 6 190 14 226 40 C240 60 240 130 214 156 C160 176 40 178 0 150 Z"
          fill="var(--hm-rough)"
        />
        <path
          d="M22 96 C60 70 96 66 132 72 C160 76 176 86 190 92 C176 104 158 112 130 112 C96 114 56 112 22 100 Z"
          fill="var(--hm-fairway)"
        />
        <ellipse cx={200} cy={80} rx={26} ry={20} fill="var(--hm-green)" />
        <ellipse cx={120} cy={52} rx={12} ry={7} fill="var(--hm-bunker)" />
        <ellipse cx={150} cy={120} rx={10} ry={6} fill="var(--hm-bunker)" />
        <ellipse cx={176} cy={106} rx={8} ry={5} fill="var(--hm-bunker)" />
        <rect x={12} y={80} width={10} height={10} rx={2} fill="var(--hm-tee)" />
      </>
    );
  }
  return (
    <>
      <ellipse cx={140} cy={85} rx={86} ry={62} fill="var(--hm-green)" />
      <ellipse cx={142} cy={84} rx={72} ry={50} fill="var(--hm-green-2)" />
      <path d="M0 78 C20 72 38 72 56 76 L56 104 C36 106 18 108 0 106 Z" fill="var(--hm-fairway)" />
      <ellipse cx={46} cy={122} rx={20} ry={11} fill="var(--hm-bunker)" />
      <ellipse cx={62} cy={42} rx={16} ry={9} fill="var(--hm-bunker)" />
      <ellipse cx={226} cy={110} rx={14} ry={9} fill="var(--hm-bunker)" />
    </>
  );
}

/**
 * Mållinje — stiplet hair fra startpunkt til det dekorative siktepunktet,
 * pilhode + prikk ved siktepunktet, pluss proximity-ring(er) på
 * approach-varianten (fasitens `stroke-opacity 0.08`-sirkler — én i mini,
 * to i full).
 */
export function HoleMapTargetLine({
  variant,
  target,
  size = "full",
}: {
  variant: HoleMapVariant;
  target: { x: number; y: number };
  size?: HoleMapSize;
}) {
  const anchor = (size === "mini" ? HOLE_MAP_TARGET_MINI : HOLE_MAP_TARGET)[variant];
  const arrowY2 = target.y - (size === "mini" && variant === "tee" ? 14 : 16);
  return (
    <>
      {variant === "approach" && (
        <>
          <ellipse cx={target.x} cy={target.y} rx={size === "mini" ? 20 : 22} ry={size === "mini" ? 12 : 15} fill="none" stroke={TL.text} strokeOpacity={0.08} strokeWidth={1} />
          {size === "full" && <ellipse cx={target.x} cy={target.y} rx={42} ry={29} fill="none" stroke={TL.text} strokeOpacity={0.08} strokeWidth={1} />}
        </>
      )}
      <line
        x1={anchor.startX}
        y1={anchor.startY}
        x2={target.x}
        y2={target.y}
        stroke={TL.text}
        strokeOpacity={0.2}
        strokeWidth={1}
        strokeDasharray="4 5"
      />
      <line x1={target.x} y1={target.y} x2={target.x} y2={arrowY2} stroke={TL.text} strokeWidth={1} />
      <path
        d={`M${target.x} ${arrowY2} L${target.x + 11} ${arrowY2 + 4} L${target.x} ${arrowY2 + 8} Z`}
        fill={TL.text}
      />
      <circle cx={target.x} cy={target.y} r={1.8} fill={TL.text} />
    </>
  );
}
