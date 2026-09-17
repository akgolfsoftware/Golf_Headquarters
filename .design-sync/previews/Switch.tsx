import { Switch } from "akgolf-hq-komponenter";

const linje = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, maxWidth: 400, fontSize: 14 };

/** På: spor i primærfargen, knott til høyre. Tilstanden følger `checked` (readOnly i statiske eksempler). */
export function Paa() {
  return (
    <div style={linje}>
      <label htmlFor="sw-paa">Varsle meg 30 minutter før økt</label>
      <Switch id="sw-paa" checked readOnly />
    </div>
  );
}

/** Av: dempet spor, knott til venstre. */
export function Av() {
  return (
    <div style={linje}>
      <label htmlFor="sw-av">Del fremgang med forelder</label>
      <Switch id="sw-av" checked={false} readOnly />
    </div>
  );
}

/** size="sm" (36×20 px) for tette rader, mot standard md (44×24 px). */
export function Storrelser() {
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <Switch size="sm" checked readOnly aria-label="Liten, på" />
      <Switch size="sm" checked={false} readOnly aria-label="Liten, av" />
      <Switch checked readOnly aria-label="Standard, på" />
      <Switch checked={false} readOnly aria-label="Standard, av" />
    </div>
  );
}

/** Varselinnstillinger slik PreferencesCard tegner dem: hvitt kort, rader med tittel, mono-undertekst og bryter til høyre. */
export function Innstillinger() {
  const rader = [
    { id: "sw-paaminnelse", t: "Påminnelse før økt", s: "30 min før planlagt start", v: true },
    { id: "sw-uke", t: "Ukesoppsummering", s: "Søndag kveld · e-post", v: true },
    { id: "sw-turnering", t: "Turneringsresultater", s: "Når GolfBox har publisert", v: false },
  ];
  return (
    <div style={{ maxWidth: 440, background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 16 }}>
      {rader.map((r, i) => (
        <div
          key={r.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            minHeight: 56,
            padding: "8px 16px",
            borderBottom: i < rader.length - 1 ? "1px solid hsl(var(--border))" : "none",
          }}
        >
          <label htmlFor={r.id} style={{ flex: 1, cursor: "pointer" }}>
            <span style={{ display: "block", fontSize: 14, fontWeight: 600, letterSpacing: "-0.005em" }}>{r.t}</span>
            <span
              style={{
                display: "block",
                marginTop: 2,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.10em",
                color: "hsl(var(--muted-foreground))",
              }}
            >
              {r.s}
            </span>
          </label>
          <Switch id={r.id} checked={r.v} readOnly />
        </div>
      ))}
    </div>
  );
}
