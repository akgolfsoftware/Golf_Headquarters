import { Radar, Kort, Caps } from "akgolf-hq-komponenter";

type Akse = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
type Punkt = { akse: Akse; verdi: number };

/* Pyramidens fem akser, 0–100. Kategorisnittet er coachens skjulte referanse. */
const PROFIL: Punkt[] = [
  { akse: "FYS", verdi: 82 }, { akse: "TEK", verdi: 64 }, { akse: "SLAG", verdi: 71 },
  { akse: "SPILL", verdi: 58 }, { akse: "TURN", verdi: 45 },
];
const KAT_B: Punkt[] = [
  { akse: "FYS", verdi: 70 }, { akse: "TEK", verdi: 72 }, { akse: "SLAG", verdi: 68 },
  { akse: "SPILL", verdi: 66 }, { akse: "TURN", verdi: 60 },
];

/** Kanonisk bruk: spillerens profil alene, akseetiketter i aksefargene. */
export function Profil() {
  return <Radar data={PROFIL} />;
}

/** Med sammenligning: kategorisnittet som stiplet mute-polygon bak spillerens. */
export function MedSammenligning() {
  return <Radar data={PROFIL} sammenlign={KAT_B} />;
}

/** Slik den står i et kort: radar til venstre, verdiene per akse til høyre. */
export function IKort() {
  return (
    <div style={{ maxWidth: 520 }}>
      <Kort eyebrow="Profil per akse · siste 90 dager">
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ flex: "none", width: 200 }}>
            <Radar data={PROFIL} sammenlign={KAT_B} size={200} />
          </div>
          <div style={{ flex: 1, display: "grid", gap: 8 }}>
            {PROFIL.map((p, i) => (
              <div key={p.akse} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <Caps size={9}>{p.akse}</Caps>
                <span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 12, fontWeight: 700, color: "var(--tl-text)", fontVariantNumeric: "tabular-nums" }}>
                  {p.verdi}
                  <span style={{ fontWeight: 400, color: "var(--tl-mute)", marginLeft: 6 }}>/ {KAT_B[i].verdi}</span>
                </span>
              </div>
            ))}
            <span style={{ fontFamily: "var(--tl-font-sans)", fontSize: 10.5, color: "var(--tl-mute)" }}>Øyvind / kat. B-snitt</span>
          </div>
        </div>
      </Kort>
    </div>
  );
}

/** Delprofil med tre akser blir en trekant — komponenten tegner n akser. */
export function TreAkser() {
  return <Radar data={[{ akse: "FYS", verdi: 76 }, { akse: "TEK", verdi: 61 }, { akse: "SLAG", verdi: 69 }]} size={200} />;
}
