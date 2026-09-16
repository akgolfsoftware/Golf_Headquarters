import { Caps, ToppbarHoyde } from "akgolf-hq-komponenter";

/** Første barn i en sticky toppbar i en server-komponent: måler forelderen og publiserer `--ak-topbar-h` på <html>. Målestokken til høyre leser variabelen. */
export function IToppbar() {
  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start", maxWidth: 640 }}>
      <header style={{ flex: 1, position: "sticky", top: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", background: "var(--tl-elev)", border: "1px solid var(--tl-hair)", borderRadius: 12 }}>
        <ToppbarHoyde />
        <div>
          <Caps>AgencyOS</Caps>
          <div style={{ fontFamily: "var(--tl-font-sans)", fontSize: 18, fontWeight: 700, color: "var(--tl-text)", marginTop: 4 }}>Konsollen</div>
        </div>
        <span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 11, fontWeight: 600, color: "var(--tl-mute)" }}>ons 16.09</span>
      </header>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: "none" }}>
        <div style={{ width: 14, height: "var(--ak-topbar-h, 0px)", background: "var(--tl-fill)", borderRadius: 3 }} />
        <span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 9, color: "var(--tl-mute)" }}>--ak-topbar-h</span>
      </div>
    </div>
  );
}

/** Komponenten alene rendrer bare et skjult <span> — ingenting synlig. Rammen er tom med vilje. */
export function Alene() {
  return (
    <div style={{ maxWidth: 440, border: "1px dashed var(--tl-mute)", borderRadius: 12, padding: 16 }}>
      <ToppbarHoyde />
      <span style={{ fontFamily: "var(--tl-font-sans)", fontSize: 12, color: "var(--tl-mute)" }}>Ingenting rendres synlig: komponenten er et skjult målemerke som måler forelderen sin.</span>
    </div>
  );
}
