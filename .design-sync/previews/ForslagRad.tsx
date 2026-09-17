import { AiMerke, ForslagRad, SamtaleBoble } from "akgolf-hq-komponenter";

const noop = () => {};

/** Kanonisk bruk: «Forslag»-etikett i mono caps foran chip-ene, venstrestilt under skrivefeltet. */
export function Standard() {
  return (
    <div style={{ maxWidth: 560 }}>
      <ForslagRad
        items={["Hva bør jeg trene i dag?", "Vis SG siste 5 runder", "Legg inn wedge-økt torsdag"]}
        onPick={noop}
      />
    </div>
  );
}

/** Tom tilstand: sentrert uten etikett, under merket og en åpningstekst. */
export function TomTilstand() {
  return (
    <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "8px 0" }}>
      <AiMerke navn="Caddie" sub="Ser planen din · uke 38" />
      <p
        style={{
          margin: 0,
          fontFamily: "var(--tl-font-sans)",
          fontSize: 14,
          color: "var(--tl-mute)",
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        Spør om planen, tallene dine eller neste økt.
      </p>
      <ForslagRad sentrert items={["Hva bør jeg trene i dag?", "Hvor taper jeg slag?", "Flytt torsdagsøkta"]} onPick={noop} />
    </div>
  );
}

/** Mange forslag bryter til flere rader innenfor beholderen. */
export function Bryter() {
  return (
    <div style={{ maxWidth: 440 }}>
      <ForslagRad
        items={[
          "Hva bør jeg trene i dag?",
          "Vis SG siste 5 runder",
          "Legg inn wedge-økt torsdag",
          "Sammenlign med forrige måned",
          "Hva sa Anders sist?",
          "Vis Carry-spredning",
        ]}
        onPick={noop}
      />
    </div>
  );
}

/** Etter et svar: forslagene følger boblen som neste steg. */
export function EtterSvar() {
  return (
    <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 12 }}>
      <SamtaleBoble rolle="assistant">
        Approach fra 80–120 meter koster deg 0,6 slag per runde mot eget snitt. Vil du at jeg legger inn en
        wedge-økt?
      </SamtaleBoble>
      <ForslagRad items={["Ja, torsdag", "Vis tallene først", "Ikke nå"]} onPick={noop} />
    </div>
  );
}
