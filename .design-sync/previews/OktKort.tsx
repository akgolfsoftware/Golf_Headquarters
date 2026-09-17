import { OktKort } from "akgolf-hq-komponenter";

const kolonne = { display: "flex", flexDirection: "column" as const, gap: 12, maxWidth: 480 };

/** Planlagt økt i «I dag»: tid og varighet i mono-kolonnen, fargekant, akse-chip og to handlinger. */
export function Planlagt() {
  return (
    <div style={kolonne}>
      <OktKort
        title="Teknisk — P4 topp-posisjon"
        axis="TEK"
        time="07:15"
        duration="60 min"
        location="Mulligan Indoor Golf"
        coach="Anders Kristiansen"
        state="planned"
        cta="Start økt"
        ctaGhost="Se plan"
      />
    </div>
  );
}

/** Status-aksen: live med «Nå»-pill, gjennomført (grønn kant, varm pill) og avlyst (grå kant). */
export function Tilstander() {
  return (
    <div style={kolonne}>
      <OktKort
        title="Golfslag — wedge 60–100 m"
        axis="SLAG"
        time="16:30"
        duration="75 min"
        location="GFGK range"
        coach="Anders Kristiansen"
        state="live"
        naa
        cta="Åpne økt"
      />
      <OktKort
        title="Fysisk — styrke underkropp"
        axis="FYS"
        time="08:00"
        duration="45 min"
        meta="WANG Toppidrett · egentrening"
        state="done"
        footerTall={<span style={{ fontSize: 11.5 }}>4 av 4 øvelser · 42 min</span>}
        ctaGhost="Se recap"
      />
      <OktKort
        title="Spill — 9 hull med strategikort"
        axis="SPILL"
        time="17:00"
        duration="120 min"
        location="Gamle Fredrikstad GK"
        coach="Anders Kristiansen"
        state="cancelled"
      />
    </div>
  );
}

/** Uten tid: gjenstående egentrening uten fast klokkeslett, kun varighet. */
export function UtenKlokkeslett() {
  return (
    <div style={kolonne}>
      <OktKort
        title="Putting — 3–6 fot, 40 putter"
        axis="SLAG"
        time=""
        duration="30 min"
        location="Puttinggreen, GFGK"
        coach=""
        state="planned"
        cta="Start økt"
      />
    </div>
  );
}
