import { Skuff } from "akgolf-hq-komponenter";

/**
 * Side-skuff (desktop), rendret statisk åpen i egen demo-ramme: eyebrow + tittel i hodet,
 * etikett/verdi-rader i kroppen (verdi i mono), CTA i fotraden utenfor rulleområdet.
 */

/** Kanonisk bruk: øktdetaljer fra ukeplanen. */
export function Oktdetaljer() {
  return (
    <Skuff
      eyebrow="Torsdag 18. september · 16:00"
      title="Øktdetaljer"
      rows={[
        { l: "Område", v: "Nærspill" },
        { l: "Varighet", v: "1,5 t" },
        { l: "Sted", v: "Range, GFGK" },
        { l: "Fokus", v: "Landing 60–100 m" },
        { l: "Status", v: "Utkast" },
      ]}
      cta="Åpne i Workbench"
    />
  );
}

/** Spillerkort fra stall-lista: målte tall i mono, kilde og dato i eyebrow. */
export function Spiller() {
  return (
    <Skuff
      eyebrow="WANG Toppidrett · GolfBox 14.09.2026"
      title="Øyvind Rohjan"
      rows={[
        { l: "Snittscore, siste 10", v: "74,3" },
        { l: "SG totalt, 30 dager", v: "+1,8" },
        { l: "Putt per runde", v: "30,4" },
        { l: "Neste økt", v: "Torsdag 16:00" },
        { l: "Sist aktiv", v: "I går" },
      ]}
      cta="Åpne spillerkortet"
    />
  );
}

/** Mange rader: kroppen ruller, hodet og fotraden står. TrackMan-parametere på engelsk. */
export function RullendeKropp() {
  return (
    <Skuff
      h={400}
      eyebrow="Mandag 15. september · Mulligan Indoor Golf"
      title="TrackMan-økt · driver"
      rows={[
        { l: "Club Speed", v: "98,4 mph" },
        { l: "Ball Speed", v: "142,1 mph" },
        { l: "Smash Factor", v: "1,44" },
        { l: "Attack Angle", v: "−1,2°" },
        { l: "Club Path", v: "+2,1°" },
        { l: "Face Angle", v: "+0,8°" },
        { l: "Launch Angle", v: "12,8°" },
        { l: "Spin Rate", v: "2 640 rpm" },
        { l: "Carry", v: "221 m" },
        { l: "Total", v: "238 m" },
      ]}
      cta="Se alle 60 slag"
    />
  );
}
