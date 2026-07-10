"use client";

/**
 * StatsWrappedSlide — single fullscreen slide for Spotify Wrapped-style rapport
 * Client component — handles CSS transitions per slide type.
 */

import { CountUp } from "./count-up";
import { T } from "@/lib/v2/tokens";

export type SlideType =
  | "intro"
  | "runder"
  | "snitt"
  | "beste"
  | "klubber"
  | "utvikling"
  | "streak"
  | "ranking"
  | "sammenligning"
  | "avslutning";

interface SlideBase {
  type: SlideType;
  bgVariant: "forest" | "forest-dark" | "lime" | "offwhite";
}

export interface IntroSlide extends SlideBase {
  type: "intro";
  navn: string;
  aar: number;
}

export interface RundeSlide extends SlideBase {
  type: "runder";
  antall: number;
  fjoraarsAntall: number;
  norskSnitt: number;
}

export interface SnittSlide extends SlideBase {
  type: "snitt";
  snittScore: number;
  estimertHcp: string;
  norgeSnittHcp: string;
}

export interface BesteSlide extends SlideBase {
  type: "beste";
  score: number;
  toPar: number;
  turnering: string;
  dato: string;
  putterCount: number;
}

export interface KlubberSlide extends SlideBase {
  type: "klubber";
  antallKlubber: number;
  klubbListe: string[];
  mestSpilteKlubb: string;
  mestSpilteAntall: number;
}

export interface UtviklingSlide extends SlideBase {
  type: "utvikling";
  forbedring: number;
  betterThanPercent: number;
  data: { aar: number; snitt: number }[];
}

export interface StreakSlide extends SlideBase {
  type: "streak";
  streak: number;
  kontekst: string;
}

export interface RankingSlide extends SlideBase {
  type: "ranking";
  rankNasjon: number;
  totalNasjon: number;
  rankAldersgruppe: number;
  totalAldersgruppe: number;
  fodselsAar: number;
}

export interface SammenligningSlide extends SlideBase {
  type: "sammenligning";
  ligneNavn: string;
  ligneAar: number;
  ligneKontekst: string;
  initials: string;
}

export interface AvslutningSlide extends SlideBase {
  type: "avslutning";
  navn: string;
  aar: number;
  delLenke: string;
}

export type WrappedSlideData =
  | IntroSlide
  | RundeSlide
  | SnittSlide
  | BesteSlide
  | KlubberSlide
  | UtviklingSlide
  | StreakSlide
  | RankingSlide
  | SammenligningSlide
  | AvslutningSlide;

// Fargene under er BEVISST hardkodet, ikke tema-tokens: hvert "wrapped"-kort
// har sin egen faste fargeidentitet (photo-card-estetikk) uavhengig av
// lys/mørk app-tema. De erstatter tidligere hsl(var(--background))/
// hsl(var(--foreground)) — som i praksis alltid resolvet til disse samme
// verdiene i det (lys-only) legacy-appen, men som ville blitt INVERTERT
// under v2s mørke adapter-scope (der --background/--foreground er byttet om).
// Selve hex-verdiene bor i T.wrapped (src/lib/v2/tokens.ts) så denne fila
// forblir hex-fri.
const BG_STYLES: Record<string, React.CSSProperties> = {
  forest: {
    background: T.wrapped.bgForest,
    color: T.wrapped.textOnDark,
  },
  "forest-dark": {
    background: T.wrapped.bgForestDark,
    color: T.wrapped.textOnDark,
  },
  lime: {
    background: T.wrapped.bgLime,
    color: T.wrapped.textOnLight,
  },
  offwhite: {
    background: T.wrapped.bgOffwhite,
    color: T.wrapped.textOnLight,
  },
};

interface StatsWrappedSlideProps {
  slide: WrappedSlideData;
  isActive: boolean;
  delLenke?: string;
}

export function StatsWrappedSlide({ slide, isActive, delLenke }: StatsWrappedSlideProps) {
  const bgStyle = BG_STYLES[slide.bgVariant] ?? BG_STYLES.forest;
  const accentColor = slide.bgVariant === "lime" ? T.forest : T.lime;
  const mutedColor =
    slide.bgVariant === "lime"
      ? "rgba(10,31,23,0.6)"
      : "rgba(250,250,247,0.6)";

  return (
    <div
      style={{
        ...bgStyle,
        width: "100%",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 32px",
        position: "relative",
        overflow: "hidden",
        opacity: isActive ? 1 : 0,
        transition: "opacity 0.4s ease",
      }}
    >
      {/* Decorative background glyph */}
      <svg
        style={{
          position: "absolute",
          bottom: -80,
          right: -60,
          opacity: 0.06,
          pointerEvents: "none",
        }}
        width="320"
        height="320"
        viewBox="0 0 32 32"
        fill="currentColor"
      >
        <circle cx="16" cy="8" r="2" />
        <path d="M16 10 Q20 18 28 20 Q22 24 16 30 Q10 24 4 20 Q12 18 16 10Z" />
      </svg>

      {slide.type === "intro" && (
        <SlideIntro slide={slide} accentColor={accentColor} mutedColor={mutedColor} />
      )}
      {slide.type === "runder" && (
        <SlideRunder slide={slide} accentColor={accentColor} mutedColor={mutedColor} isActive={isActive} />
      )}
      {slide.type === "snitt" && (
        <SlideSnitt slide={slide} accentColor={accentColor} mutedColor={mutedColor} isActive={isActive} />
      )}
      {slide.type === "beste" && (
        <SlideBeste slide={slide} accentColor={accentColor} mutedColor={mutedColor} />
      )}
      {slide.type === "klubber" && (
        <SlideKlubber slide={slide} accentColor={accentColor} mutedColor={mutedColor} />
      )}
      {slide.type === "utvikling" && (
        <SlideUtvikling slide={slide} accentColor={accentColor} mutedColor={mutedColor} isActive={isActive} />
      )}
      {slide.type === "streak" && (
        <SlideStreak slide={slide} accentColor={accentColor} mutedColor={mutedColor} isActive={isActive} />
      )}
      {slide.type === "ranking" && (
        <SlideRanking slide={slide} accentColor={accentColor} mutedColor={mutedColor} isActive={isActive} />
      )}
      {slide.type === "sammenligning" && (
        <SlideSammenligning slide={slide} accentColor={accentColor} mutedColor={mutedColor} />
      )}
      {slide.type === "avslutning" && (
        <SlideAvslutning slide={slide} accentColor={accentColor} mutedColor={mutedColor} delLenke={delLenke ?? slide.delLenke} />
      )}
    </div>
  );
}

/* ─── Individual slide renderers ─── */

function SlideIntro({ slide, accentColor, mutedColor }: { slide: IntroSlide; accentColor: string; mutedColor: string }) {
  return (
    <div style={{ textAlign: "center", maxWidth: 480 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: mutedColor, marginBottom: 24 }}>
        AK GOLF STATS
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: accentColor, marginBottom: 16 }}>
        DIN GOLFSESONG
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(120px, 20vw, 200px)", fontWeight: 600, fontStyle: "italic", lineHeight: 0.9, color: accentColor }}>
        {slide.aar}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 600, marginTop: 24, letterSpacing: "-0.03em" }}>
        {slide.navn}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: mutedColor, marginTop: 32, letterSpacing: "0.06em" }}>
        KLIKK FOR A STARTE →
      </div>
    </div>
  );
}

function SlideRunder({ slide, accentColor, mutedColor, isActive }: { slide: RundeSlide; accentColor: string; mutedColor: string; isActive: boolean }) {
  return (
    <div style={{ textAlign: "center", maxWidth: 480 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: mutedColor, marginBottom: 16 }}>
        RUNDER SPILT
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(80px, 16vw, 160px)", fontWeight: 500, lineHeight: 1, color: accentColor, fontVariantNumeric: "tabular-nums" }}>
        {isActive ? <CountUp value={slide.antall} duration={800} /> : "0"}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 500, marginTop: 16, lineHeight: 1.3 }}>
        Du spilte {slide.antall} runder i {new Date().getFullYear()}.
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: mutedColor, marginTop: 24, lineHeight: 1.6 }}>
        {slide.antall > slide.fjoraarsAntall
          ? `Det er ${slide.antall - slide.fjoraarsAntall} fler enn i fjor.`
          : `Det er ${slide.fjoraarsAntall - slide.antall} færre enn i fjor.`}
        {" "}Norske amatører spiller {slide.norskSnitt} i snitt.
      </div>
    </div>
  );
}

function SlideSnitt({ slide, accentColor, mutedColor, isActive }: { slide: SnittSlide; accentColor: string; mutedColor: string; isActive: boolean }) {
  return (
    <div style={{ textAlign: "center", maxWidth: 480 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: mutedColor, marginBottom: 16 }}>
        SESONGSNITT · BRUTTO
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(80px, 16vw, 160px)", fontWeight: 500, lineHeight: 1, color: accentColor, fontVariantNumeric: "tabular-nums" }}>
        {isActive ? <CountUp value={slide.snittScore} duration={800} decimals={1} /> : "0"}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, marginTop: 16, lineHeight: 1.3 }}>
        Med en snittscore på {slide.snittScore}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: mutedColor, marginTop: 24, lineHeight: 1.6 }}>
        Det tilsvarer HCP {slide.estimertHcp}. Norge-snittet for menn er HCP {slide.norgeSnittHcp}.
      </div>
    </div>
  );
}

function SlideBeste({ slide, accentColor, mutedColor }: { slide: BesteSlide; accentColor: string; mutedColor: string }) {
  return (
    <div style={{ textAlign: "center", maxWidth: 480 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: mutedColor, marginBottom: 24 }}>
        BESTE RUNDE
      </div>
      <div style={{
        background: "rgba(255,255,255,0.12)",
        borderRadius: 16,
        padding: "32px 40px",
        display: "inline-block",
        marginBottom: 24,
      }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: mutedColor, marginBottom: 8 }}>
          {slide.dato}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, marginBottom: 8, opacity: 0.85 }}>
          {slide.turnering}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 80, fontWeight: 500, lineHeight: 1, color: accentColor, fontVariantNumeric: "tabular-nums" }}>
          {slide.score}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: accentColor, marginTop: 8 }}>
          {slide.toPar < 0 ? `${slide.toPar}` : `+${slide.toPar}`} TOT PAR
        </div>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: mutedColor, lineHeight: 1.6 }}>
        Du hadde {slide.putterCount} putter den runden — Tour-snitt er 28.5.
      </div>
    </div>
  );
}

function SlideKlubber({ slide, accentColor, mutedColor }: { slide: KlubberSlide; accentColor: string; mutedColor: string }) {
  return (
    <div style={{ textAlign: "center", maxWidth: 520 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: mutedColor, marginBottom: 16 }}>
        BANER BESØKT
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 100, fontWeight: 500, lineHeight: 1, color: accentColor, fontVariantNumeric: "tabular-nums" }}>
        {slide.antallKlubber}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, marginTop: 16, marginBottom: 24 }}>
        Du spilte på {slide.antallKlubber} forskjellige baner.
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 24 }}>
        {slide.klubbListe.slice(0, 8).map((k, i) => (
          <span key={i} style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "6px 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.15)",
            color: "inherit",
          }}>
            {k}
          </span>
        ))}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: mutedColor }}>
        Mest spilte: {slide.mestSpilteKlubb} ({slide.mestSpilteAntall} runder)
      </div>
    </div>
  );
}

function SlideUtvikling({ slide, accentColor, mutedColor, isActive }: { slide: UtviklingSlide; accentColor: string; mutedColor: string; isActive: boolean }) {
  const isImproved = slide.forbedring < 0;
  return (
    <div style={{ textAlign: "center", maxWidth: 480 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: mutedColor, marginBottom: 16 }}>
        UTVIKLING FRA I FJOR
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(72px, 14vw, 140px)", fontWeight: 500, lineHeight: 1, color: accentColor, fontVariantNumeric: "tabular-nums" }}>
        {isImproved ? "" : "+"}{isActive ? <CountUp value={Math.abs(slide.forbedring)} duration={800} decimals={1} prefix={isImproved ? "−" : "+"} /> : "0"}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, marginTop: 16, lineHeight: 1.3 }}>
        {isImproved ? `Du forbedret deg ${Math.abs(slide.forbedring)} strokes fra i fjor.` : `Snittscoren økte ${slide.forbedring} strokes fra i fjor.`}
      </div>
      {slide.data.length > 1 && (
        <div style={{ marginTop: 32, height: 80, position: "relative" }}>
          <MiniTrendLine data={slide.data} accentColor={accentColor} />
        </div>
      )}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: mutedColor, marginTop: 24 }}>
        Det er {isImproved ? "bedre" : "svakere"} enn {slide.betterThanPercent}% av spillerne i din aldersgruppe.
      </div>
    </div>
  );
}

function MiniTrendLine({ data, accentColor }: { data: { aar: number; snitt: number }[]; accentColor: string }) {
  if (data.length < 2) return null;
  const w = 300; const h = 60;
  const pad = { l: 8, r: 8, t: 8, b: 8 };
  const cw = w - pad.l - pad.r; const ch = h - pad.t - pad.b;
  const ys = data.map(d => d.snitt);
  const yMin = Math.min(...ys) - 0.5; const yMax = Math.max(...ys) + 0.5;
  const xS = (i: number) => pad.l + (i / (data.length - 1)) * cw;
  const yS = (v: number) => pad.t + (1 - (v - yMin) / (yMax - yMin)) * ch;
  const path = data.map((d, i) => `${i === 0 ? "M" : "L"} ${xS(i).toFixed(1)} ${yS(d.snitt).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 80, overflow: "visible" }}>
      <path d={path} fill="none" stroke={accentColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.7} />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={xS(i)} cy={yS(d.snitt)} r={3} fill={accentColor} opacity={0.9} />
          <text x={xS(i)} y={h} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={9} fill="currentColor" opacity={0.6}>{d.aar}</text>
        </g>
      ))}
    </svg>
  );
}

function SlideStreak({ slide, accentColor, mutedColor, isActive }: { slide: StreakSlide; accentColor: string; mutedColor: string; isActive: boolean }) {
  return (
    <div style={{ textAlign: "center", maxWidth: 480 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: mutedColor, marginBottom: 16 }}>
        LENGSTE STREAK
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(72px, 14vw, 140px)", fontWeight: 500, lineHeight: 1, color: accentColor, fontVariantNumeric: "tabular-nums" }}>
        {isActive ? <CountUp value={slide.streak} duration={800} /> : "0"}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500, marginTop: 16 }}>
        dager på rad med runde
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: mutedColor, marginTop: 24, lineHeight: 1.6 }}>
        {slide.kontekst}
      </div>
    </div>
  );
}

function SlideRanking({ slide, accentColor, mutedColor, isActive }: { slide: RankingSlide; accentColor: string; mutedColor: string; isActive: boolean }) {
  return (
    <div style={{ textAlign: "center", maxWidth: 480 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: mutedColor, marginBottom: 16 }}>
        NORSK RANKING
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 24, letterSpacing: "0.06em", color: mutedColor, marginBottom: 8 }}>
        TOPP
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(80px, 16vw, 160px)", fontWeight: 500, lineHeight: 0.9, color: accentColor, fontVariantNumeric: "tabular-nums" }}>
        {isActive ? <CountUp value={slide.rankNasjon} duration={800} /> : "0"}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, color: mutedColor, marginTop: 12 }}>
        av {slide.totalNasjon.toLocaleString("nb-NO")} norske spillere
      </div>
      <div style={{ marginTop: 32, background: "rgba(255,255,255,0.12)", borderRadius: 12, padding: "16px 24px", display: "inline-block" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: mutedColor, marginBottom: 8 }}>
          {slide.fodselsAar}-ÅRSKULLET
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 28, fontWeight: 500, color: accentColor }}>
          #{slide.rankAldersgruppe} av {slide.totalAldersgruppe}
        </div>
      </div>
    </div>
  );
}

function SlideSammenligning({ slide, accentColor, mutedColor }: { slide: SammenligningSlide; accentColor: string; mutedColor: string }) {
  return (
    <div style={{ textAlign: "center", maxWidth: 480 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: mutedColor, marginBottom: 32 }}>
        SPILLINGEN DIN LIGNER
      </div>
      <div style={{
        width: 96, height: 96,
        borderRadius: "50%",
        background: accentColor,
        color: slide.bgVariant === "lime" ? T.forest : T.wrapped.textOnLight,
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 32,
        fontWeight: 600,
        margin: "0 auto 24px",
      }}>
        {slide.initials}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600, fontStyle: "italic", lineHeight: 1.2 }}>
        {slide.ligneNavn}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: mutedColor, marginTop: 8 }}>
        i {slide.ligneAar}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: mutedColor, marginTop: 24, lineHeight: 1.7 }}>
        {slide.ligneKontekst}
      </div>
    </div>
  );
}

function SlideAvslutning({ slide, accentColor, mutedColor, delLenke }: { slide: AvslutningSlide; accentColor: string; mutedColor: string; delLenke: string }) {
  const twitterTekst = encodeURIComponent(`Min golfsesong ${slide.aar} i tall — generert av AK Golf Stats. Hva er din? ${delLenke}`);
  const twitterUrl = `https://x.com/intent/tweet?text=${twitterTekst}`;

  return (
    <div style={{ textAlign: "center", maxWidth: 480 }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: mutedColor, marginBottom: 16 }}>
        DIN GOLFSESONG {slide.aar}
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 600, fontStyle: "italic", lineHeight: 1, color: accentColor }}>
        Klar for {slide.aar + 1}?
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: mutedColor, marginTop: 16, marginBottom: 40, lineHeight: 1.6 }}>
        Du har satt {slide.navn}s sesong i tall. Del det med verden.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 28px",
            borderRadius: 999,
            background: accentColor,
            color: slide.bgVariant === "lime" ? T.forest : T.wrapped.textOnLight,
            fontWeight: 600,
            fontSize: 15,
            fontFamily: "inherit",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          Del pa X / Twitter
        </a>
        <a
          href="/portal"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.15)",
            color: "inherit",
            fontSize: 14,
            fontFamily: "inherit",
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          Prøv PlayerHQ — logg hver runde
        </a>
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: mutedColor, marginTop: 32 }}>
        GENERERT {new Date().toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" }).toUpperCase()} · AK GOLF STATS
      </div>
    </div>
  );
}
