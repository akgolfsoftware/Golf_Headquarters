import { TalentProfil } from "akgolf-hq-komponenter";

const boks = { maxWidth: 440 };
const kilde = { fontFamily: "var(--tl-font-mono)", fontSize: 9, color: "var(--tl-mute)", display: "block", marginTop: 8 };

/* Fem akser 1–10 — coachens vurdering («vurdering», aldri «karakterer»), aldri et FYS-/nivåtall som krav. */
const RADAR = [
  { akse: "Fysisk", verdi: 6 },
  { akse: "Teknikk", verdi: 7 },
  { akse: "Taktikk", verdi: 5 },
  { akse: "Mental", verdi: 6 },
  { akse: "Motivasjon", verdi: 9 },
];
const MILEPAELER = [
  { tittel: "Første Srixon Tour-start", dato: "Juni 2026", beskrivelse: "Cut med 76–74 på Borre GK." },
  { tittel: "Under 75 i snitt over ti runder", dato: "August 2026", beskrivelse: null },
];

/** Full profil: aldersnivå som pille, klubb · region, radar, stolper per akse og milepæler. Vurderingen har navn og dato under. */
export function Standard() {
  return (
    <div style={boks}>
      <TalentProfil niva="U18" klubb="Gamle Fredrikstad GK" region="Østlandet" radar={RADAR} milepaeler={MILEPAELER} />
      <span style={kilde}>Vurdering: Anders Kristiansen · 12.09.2026 · skala 1–10</span>
    </div>
  );
}

/** Ærlig tom tilstand: ingen vurdering registrert ennå, bare nivå og klubb. */
export function UtenVurdering() {
  return (
    <div style={boks}>
      <TalentProfil niva="U16" klubb="Gamle Fredrikstad GK" region="Østlandet" radar={[]} milepaeler={[]} />
    </div>
  );
}

/** Bare radar: uten nivå, klubb og milepæler — slik den står før resten er lagt inn. */
export function KunRadar() {
  return (
    <div style={boks}>
      <TalentProfil radar={RADAR} />
    </div>
  );
}
