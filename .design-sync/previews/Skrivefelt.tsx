import { SendKnapp, Skrivefelt } from "akgolf-hq-komponenter";

const noop = () => {};
const boks = { maxWidth: 560 };

/** Tomt felt: plassholder, send-knappen er dempet til noe er skrevet. */
export function Tom() {
  return (
    <div style={boks}>
      <Skrivefelt value="" onChange={noop} onSend={noop} />
    </div>
  );
}

/** Med tekst: send-knappen blir blekk (ink CTA, ikke lime). Enter sender, Shift+Enter gir linjeskift. */
export function MedTekst() {
  return (
    <div style={boks}>
      <Skrivefelt value="Legg inn en wedge-økt torsdag, maks 45 minutter" onChange={noop} onSend={noop} />
    </div>
  );
}

/** Sender: feltet er låst og knappen dempet til svaret er tilbake. */
export function Sender() {
  return (
    <div style={boks}>
      <Skrivefelt sender value="Hva bør jeg trene på før helgen?" onChange={noop} onSend={noop} />
    </div>
  );
}

/** Egen plassholder for coachens konsoll. */
export function EgenPlassholder() {
  return (
    <div style={boks}>
      <Skrivefelt value="" onChange={noop} onSend={noop} placeholder="Skriv til Jarvis — han forbereder, du sender" />
    </div>
  );
}

/** variant="bare": bare textarea; forelderen eier rammen og send-knappen (konsollens composer). */
export function Bare() {
  return (
    <div
      style={{
        ...boks,
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
        background: "var(--tl-dock)",
        border: "1px solid var(--tl-hair)",
        borderRadius: 16,
        padding: "10px 10px 10px 16px",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <Skrivefelt
          variant="bare"
          value="Jeg spilte 76 i dag. Putting var dårlig — 34 putter."
          onChange={noop}
          onSend={noop}
        />
      </div>
      <SendKnapp aktiv onClick={noop} storrelse={48} />
    </div>
  );
}
