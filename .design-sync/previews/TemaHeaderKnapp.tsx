import { Caps, TemaHeaderKnapp } from "akgolf-hq-komponenter";

/** Fasitens `.btn.icon` ytterst til høyre i skjermhodet (390 px). Ikonet viser hva du bytter TIL: måne når du står i lys. */
export function IToppbar() {
  return (
    <header style={{ maxWidth: 390, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px", background: "var(--tl-elev)", border: "1px solid var(--tl-hair)", borderRadius: 12 }}>
      <div>
        <Caps>Onsdag 16. september</Caps>
        <div style={{ fontFamily: "var(--tl-font-sans)", fontSize: 22, fontWeight: 700, color: "var(--tl-text)", letterSpacing: "-0.02em", marginTop: 4 }}>I dag</div>
      </div>
      <TemaHeaderKnapp />
    </header>
  );
}

/** Knappen alene: 40 × 40, hårlinjekant, dempet ikon. Kortet rendres lyst, så statisk tilstand er alltid månen. */
export function Alene() {
  return <TemaHeaderKnapp />;
}
