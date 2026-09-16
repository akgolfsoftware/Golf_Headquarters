import { Kort, PyramideSyklusChip, Rad } from "akgolf-hq-komponenter";

/**
 * Trykk-for-å-bla pyramideområde på en øvelse: FYS → TEK → SLAG → SPILL → TURN. Uten `onEndre`
 * rendres den skrivebeskyttet (AkseChip) — ingen død knapp.
 */
const rad = { display: "flex", gap: 8, flexWrap: "wrap" as const, alignItems: "center" };
const lagre = async () => ({ ok: true });
const OMRAADER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

/** Alle fem områdene som blabare knapper (hairline-kant, prikk og navn). */
export function AlleOmraader() {
  return (
    <div style={rad}>
      {OMRAADER.map((a) => (
        <PyramideSyklusChip key={a} verdi={a} onEndre={lagre} />
      ))}
    </div>
  );
}

/** Uten skrivetilgang: de samme fem, skrivebeskyttet. */
export function Skrivebeskyttet() {
  return (
    <div style={rad}>
      {OMRAADER.map((a) => (
        <PyramideSyklusChip key={a} verdi={a} />
      ))}
    </div>
  );
}

/** På øvelsene i en økt: chippen sitter til høyre i raden. */
export function PaaOvelser() {
  return (
    <div style={{ maxWidth: 440 }}>
      <Kort pad="15px 17px" eyebrow="Øvelser · torsdag 17. sep">
        <Rad
          title="P4-stopp med stang"
          sub="20 svinger uten ball · 15 i lav hastighet"
          trailing={<PyramideSyklusChip verdi="TEK" onEndre={lagre} />}
        />
        <Rad title="Wedge 60–100 m" sub="60 baller slått · Carry ± 5 m" trailing={<PyramideSyklusChip verdi="SLAG" onEndre={lagre} />} />
        <Rad title="Trapbar Deadlift" sub="4 × 5 · Treningslokalet" trailing={<PyramideSyklusChip verdi="FYS" onEndre={lagre} />} last />
      </Kort>
    </div>
  );
}
