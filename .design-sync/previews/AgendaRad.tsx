import { AgendaRad, Kort } from "akgolf-hq-komponenter";

const boks = { maxWidth: 480 };
const kilde = <span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 9, color: "var(--tl-mute)" }}>plan · 16.09.2026</span>;

/** Dagens agenda slik den står på «I dag»: gjennomført, pågår nå, kommende. */
export function Dagsplan() {
  return (
    <div style={boks}>
      <Kort eyebrow="I dag · onsdag 16. september" action={kilde}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <AgendaRad time="07:00" icon="dumbbell" title="Styrke · underkropp" subtitle="Treningslokalet · 4 serier" duration="45 min" state="done" />
          <AgendaRad time="15:30" icon="target" title="Innspill ~100 m" subtitle="GFGK range · 60 slag · Carry ± 5 m" duration="60 min" state="live" />
          <AgendaRad time="17:00" icon="flag" title="Putt 5–10 fot" subtitle="Puttinggreen · 40 putter" duration="30 min" state="upcoming" />
        </div>
      </Kort>
    </div>
  );
}

/** Kanonisk: kommende økt med tid, ikon, tittel, sted og varighet. */
export function Kommende() {
  return (
    <div style={boks}>
      <AgendaRad time="16:00" icon="target" title="Innspill ~150 m" subtitle="GFGK range · 50 slag" duration="60 min" state="upcoming" onClick={() => {}} />
    </div>
  );
}

/** Pågår nå: kant i fyllfarge, ikon i fyllfarge og «Nå»-pille. */
export function Naa() {
  return (
    <div style={boks}>
      <AgendaRad time="15:30" icon="target" title="Innspill ~100 m" subtitle="GFGK range · 60 slag · Carry ± 5 m" duration="60 min" state="live" />
    </div>
  );
}

/** Gjennomført: hake i ok-farge, hele raden dempet til 55 %. */
export function Gjennomfort() {
  return (
    <div style={boks}>
      <AgendaRad time="07:00" icon="dumbbell" title="Styrke · underkropp" subtitle="Treningslokalet · 4 serier" duration="45 min" state="done" />
    </div>
  );
}

/** Uten undertekst og varighet (tom streng slår av begge). */
export function UtenMeta() {
  return (
    <div style={boks}>
      <AgendaRad time="09:00" icon="trophy" title="Klubbturnering · GFGK" subtitle="" duration="" state="upcoming" />
    </div>
  );
}
