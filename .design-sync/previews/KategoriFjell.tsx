import { KategoriFjell } from "akgolf-hq-komponenter";

/** Kanonisk bruk: K–A-stigen, spilleren i D på vei mot C. */
export function Standard() {
  return <KategoriFjell naa="D" neste="C" tekst="Du er i kategori D — 3 av 5 krav mot C er nådd." />;
}

/** Nær toppen: B med ett krav igjen mot A. */
export function NaerToppen() {
  return (
    <KategoriFjell
      naa="B"
      neste="A"
      tekst="Du er i kategori B — 4 av 5 krav mot A er nådd. Gjenstår: snittscore ≤ 72 over 10 runder."
    />
  );
}

/** Kortere stige (E–A) for en gruppe som bruker fem kategorier. */
export function FemTrinn() {
  return (
    <KategoriFjell
      kategorier={["E", "D", "C", "B", "A"]}
      naa="C"
      neste="B"
      tekst="Du er i kategori C — 2 av 4 krav mot B er nådd."
    />
  );
}

/** Toppen nådd: tom `neste` skjuler høyrelabelen. */
export function Toppen() {
  return <KategoriFjell naa="A" neste="" tekst="Du er i kategori A — høyeste nivå. Kravene måles på nytt etter sesongen." />;
}
