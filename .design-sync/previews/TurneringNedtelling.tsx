import { TurneringNedtelling } from "akgolf-hq-komponenter";

const kolonne = { display: "flex", flexDirection: "column" as const, gap: 12, maxWidth: 520 };

/** Neste turnering: stort dagtall i fyllfargen, dato, sted og fokus-chip. */
export function Standard() {
  return (
    <div style={kolonne}>
      <TurneringNedtelling
        navn="Srixon Tour 5 — Larvik GK"
        dato="26.–27. september"
        sted="Larvik"
        dager={10}
        fokus="Uken før: nedtrapping og nærspill"
      />
    </div>
  );
}

/** Dagen før: tallet 1 og en konkret beskjed i fokus-chipen. */
export function IMorgen() {
  return (
    <div style={kolonne}>
      <TurneringNedtelling
        navn="Klubbmesterskapet — Gamle Fredrikstad GK"
        dato="Lør 19. september"
        sted="Fredrikstad"
        dager={1}
        fokus="Pakk bagen i kveld — 9-jernet er tilbake i settet"
      />
    </div>
  );
}

/** Uten fokus: bare navn, dato og sted. */
export function UtenFokus() {
  return (
    <div style={kolonne}>
      <TurneringNedtelling navn="Olyo Tour Østlandet — Borre GK" dato="10.–11. oktober" sted="Horten" dager={24} fokus={null} />
    </div>
  );
}
