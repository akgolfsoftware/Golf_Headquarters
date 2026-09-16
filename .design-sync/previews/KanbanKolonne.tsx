import { KanbanKolonne } from "akgolf-hq-komponenter";

const TIL_VURDERING = [
  { t: "Øyvind Rohjan — ukeplan uke 38", s: "Sendt inn i går", a: "SPILL" as const },
  { t: "Putt-test 12. sep — gjennomgang", s: "Venter på kommentar", a: "SLAG" as const },
  { t: "Styrkeblokk oktober", s: "Utkast fra Anders Kristiansen", a: "FYS" as const },
];
const GODKJENT = [
  { t: "WANG VG2 — gruppeuke 38", s: "Godkjent i dag 08:40", a: "TEK" as const },
  { t: "Srixon Tour · reiseplan", s: "Godkjent mandag", a: "TURN" as const },
];
const PUBLISERT = [{ t: "Wedge 60–100 m · 60 slag", s: "Publisert til Øyvind", a: "SLAG" as const }];

/** Godkjenningstavla i AgencyOS: tre kolonner side om side, antall i mono ved tittelen. */
export function Tavle() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <KanbanKolonne tittel="Til vurdering" kort={TIL_VURDERING} />
      <KanbanKolonne tittel="Godkjent" kort={GODKJENT} />
      <KanbanKolonne tittel="Publisert" kort={PUBLISERT} />
    </div>
  );
}

/** Én kolonne: kort med tittel, status-linje og akse-chip; cursor grab på kortene. */
export function EnKolonne() {
  return <KanbanKolonne tittel="Til vurdering" kort={TIL_VURDERING} />;
}

/** Tom kolonne: stiplet ramme og «Ingen kort her», antall 0. */
export function Tom() {
  return <KanbanKolonne tittel="Avvist" kort={[]} />;
}
