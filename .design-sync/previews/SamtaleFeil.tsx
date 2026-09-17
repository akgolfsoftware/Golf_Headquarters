import { ForslagRad, SamtaleBoble, SamtaleFeil, Skrivefelt } from "akgolf-hq-komponenter";

const noop = () => {};
const kolonne = { display: "flex", flexDirection: "column" as const, gap: 10, maxWidth: 560 };

/** Kanonisk bruk (PortalChatHjem): feilbånd i danger-tone med x-circle; teksten sier hva du kan gjøre. */
export function Standard() {
  return (
    <div style={kolonne}>
      <SamtaleFeil>Kunne ikke svare akkurat nå. Prøv igjen om litt.</SamtaleFeil>
    </div>
  );
}

/** I samtalen: spillerens melding står, båndet tar assistentens plass. */
export function ISamtale() {
  return (
    <div style={kolonne}>
      <SamtaleBoble rolle="user" initialer="ØR">
        Hva bør jeg trene på før helgen?
      </SamtaleBoble>
      <SamtaleFeil>Meldingen ble ikke sendt — sjekk nettet og prøv igjen.</SamtaleFeil>
    </div>
  );
}

/** Over skrivefeltet (CoachAIV2): feil, feltet med teksten som ikke gikk, og forslag under. */
export function OverSkrivefelt() {
  return (
    <div style={kolonne}>
      <SamtaleFeil>Kunne ikke svare akkurat nå. Prøv igjen om litt.</SamtaleFeil>
      <Skrivefelt value="Hva bør jeg trene på før helgen?" onChange={noop} onSend={noop} />
      <ForslagRad items={["Hva bør jeg trene i dag?", "Vis SG siste 5 runder"]} onPick={noop} />
    </div>
  );
}

/** Lang feiltekst bryter i båndet; ikonet holder seg øverst. */
export function Lang() {
  return (
    <div style={kolonne}>
      <SamtaleFeil>
        Caddie svarer ikke akkurat nå. Meldingen din er lagret og sendes når tjenesten er tilbake — du kan
        fortsette å skrive, eller åpne planen din i mellomtiden.
      </SamtaleFeil>
    </div>
  );
}
