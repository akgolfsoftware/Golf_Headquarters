import { KategoriKrav } from "akgolf-hq-komponenter";

/** Kategori B på vei mot A: 3 av 5 krav bestått, verdi / mål i mono, neste krav som innsikt-chip. */
export function Standard() {
  return (
    <KategoriKrav
      nivaa="B"
      nesteNivaa="A"
      krav={[
        { navn: "Snittscore ≤ 74", bestatt: true, verdi: "72,8", mal: "74" },
        { navn: "SG Total ≥ +0,5", bestatt: true, verdi: "+1,2", mal: "+0,5" },
        { navn: "Innslag 3–6 ft ≥ 88 %", bestatt: false, verdi: "84 %", mal: "88 %" },
        { navn: "Driver-carry ≥ 245 m", bestatt: true, verdi: "248 m", mal: "245 m" },
        { navn: "Turneringsrunder 2026 ≥ 16", bestatt: false, verdi: "12", mal: "16" },
      ]}
      nesteKrav="Løft innslag 3–6 ft fra 84 % til 88 % — fire pp igjen."
    />
  );
}

/** Alle krav bestått: kategori A, ingen neste kategori og ingen chip. */
export function AlleBestatt() {
  return (
    <KategoriKrav
      nivaa="A"
      nesteNivaa=""
      krav={[
        { navn: "Snittscore ≤ 72", bestatt: true, verdi: "71,4", mal: "72" },
        { navn: "SG Total ≥ +1,0", bestatt: true, verdi: "+1,6", mal: "+1,0" },
        { navn: "Innslag 3–6 ft ≥ 90 %", bestatt: true, verdi: "91 %", mal: "90 %" },
        { navn: "Driver-carry ≥ 255 m", bestatt: true, verdi: "258 m", mal: "255 m" },
      ]}
      nesteKrav={null}
    />
  );
}

/** Junior i kategori F: andre krav og enheter, ett krav uten tall. */
export function Junior() {
  return (
    <KategoriKrav
      nivaa="F"
      nesteNivaa="E"
      krav={[
        { navn: "Snittscore ≤ 90", bestatt: true, verdi: "87,4", mal: "90" },
        { navn: "Driver-carry ≥ 160 m", bestatt: false, verdi: "152 m", mal: "160 m" },
        { navn: "Putt per runde ≤ 36", bestatt: true, verdi: "34,8", mal: "36" },
        { navn: "Testbatteri gjennomført", bestatt: true },
        { navn: "Turneringsrunder 2026 ≥ 8", bestatt: false, verdi: "5", mal: "8" },
      ]}
      nesteKrav="Åtte meter igjen på driver-carry — Club Speed er vinterens jobb."
    />
  );
}
