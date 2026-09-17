import { Icon } from "akgolf-hq-komponenter";

const navnStil = {
  fontFamily: "var(--tl-font-mono)",
  fontSize: 9,
  color: "var(--tl-mute)",
  textAlign: "center" as const,
  whiteSpace: "nowrap" as const,
};
const celle = { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 6 };
const radStil = { display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" as const };

/* De 16 ikonene appen bruker mest (talt i src/components/v2/*.tsx), i kebab-case slik Icon tar dem. */
const BRUKT = [
  "check",
  "chevron-right",
  "x",
  "sparkles",
  "search",
  "chevron-down",
  "arrow-right",
  "users",
  "alert-triangle",
  "target",
  "plus",
  "more-horizontal",
  "minus",
  "help-circle",
  "chevron-left",
  "x-circle",
];

/** Rutenett av ikonene appen faktisk bruker — Lucide, strek 1,5, aldri emoji. */
export function Rutenett() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "16px 8px", maxWidth: 560 }}>
      {BRUKT.map((n) => (
        <div key={n} style={celle}>
          <Icon name={n} size={20} style={{ color: "var(--tl-text)" }} />
          <span style={navnStil}>{n}</span>
        </div>
      ))}
    </div>
  );
}

/** Størrelser: 12–32 px på samme ikon; streken skalerer med. */
export function Storrelser() {
  return (
    <div style={radStil}>
      {[12, 14, 16, 18, 20, 24, 32].map((s) => (
        <div key={s} style={celle}>
          <Icon name="target" size={s} style={{ color: "var(--tl-text)" }} />
          <span style={navnStil}>{s}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Farge settes via style med tokens, aldri rå hex. Signalfargene (ok/warn/danger) står aldri løst på
 * nøytral bunn i lys modus — de får sin egen tonede flate rundt seg, som Banner gjør.
 */
export function Farger() {
  const par: Array<[string, string, boolean]> = [
    ["text", "check", false],
    ["mute", "clock", false],
    ["fill", "sparkles", false],
    ["ok", "check-circle", true],
    ["warn", "alert-triangle", true],
    ["danger", "x-circle", true],
  ];
  return (
    <div style={radStil}>
      {par.map(([tok, n, flate]) => (
        <div key={tok} style={celle}>
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: flate ? `color-mix(in srgb, var(--tl-${tok}) 12%, transparent)` : "transparent",
            }}
          >
            <Icon name={n} size={20} style={{ color: `var(--tl-${tok})` }} />
          </span>
          <span style={navnStil}>--tl-{tok}</span>
        </div>
      ))}
    </div>
  );
}

/** Strektykkelse: 1,5 er standard; 2 brukes i små knapper der 1,5 blir for tynn. */
export function Strek() {
  return (
    <div style={radStil}>
      {[1, 1.5, 2, 2.5].map((sw) => (
        <div key={sw} style={celle}>
          <Icon name="activity" size={24} strokeWidth={sw} style={{ color: "var(--tl-text)" }} />
          <span style={navnStil}>{String(sw).replace(".", ",")}</span>
        </div>
      ))}
    </div>
  );
}

/** Ukjent navn faller trygt tilbake til help-circle — aldri tomt, aldri krasj. */
export function UkjentNavn() {
  return (
    <div style={radStil}>
      <div style={celle}>
        <Icon name="finnes-ikke" size={20} style={{ color: "var(--tl-mute)" }} />
        <span style={navnStil}>finnes-ikke → help-circle</span>
      </div>
    </div>
  );
}
