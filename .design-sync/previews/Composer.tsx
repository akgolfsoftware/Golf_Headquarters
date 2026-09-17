import { Composer, Icon } from "akgolf-hq-komponenter";

/**
 * Composer eier feltet og send-flyten; plasseringen (sticky/bunn) eier flaten selv. Feltet starter
 * tomt, så Send står deaktivert i hvile — det er den ekte tilstanden før noen har skrevet.
 */
const desktop = { maxWidth: 760, border: "1px solid var(--tl-hair)", borderRadius: 16, overflow: "hidden" };
const telefon = { width: 390, border: "1px solid var(--tl-hair)", borderRadius: 28, overflow: "hidden" };

/** Verktøy-slot: diktering. 36 px i desktop-verktøylinjen, 44 px ved siden av mobil-feltet. */
function Mikrofon({ size = 36 }: { size?: number }) {
  return (
    <button
      type="button"
      aria-label="Diktér"
      style={{
        width: size,
        height: size,
        flex: "none",
        display: "grid",
        placeItems: "center",
        border: "1px solid var(--tl-hair)",
        borderRadius: size > 40 ? 12 : 10,
        background: "transparent",
        color: "var(--tl-mute)",
        cursor: "pointer",
      }}
    >
      <Icon name="mic" size={size > 40 ? 17 : 15} />
    </button>
  );
}

/** Desktop (PlayerHQ): boks med verktøylinje, kontekst-pille og tastaturhint under. */
export function Desktop() {
  return (
    <div style={desktop}>
      <Composer
        label="Skriv til PlayerHQ"
        placeholder="Spør om uka, økta eller tallene dine …"
        onSend={() => {}}
        kontekst="Ser: uke 38 · Øyvind Rohjan"
        verktoy={<Mikrofon />}
      />
    </div>
  );
}

/** Mobil (I dag): kontekstlinje øverst, felt med / og @, pil-knapp på 44 px. */
export function Mobil() {
  return (
    <div style={telefon}>
      <Composer
        mobil
        label="Skriv til PlayerHQ"
        placeholder="Spør om økta i dag …"
        onSend={() => {}}
        kontekst="Ser: i dag · onsdag 16. sep"
        verktoy={<Mikrofon size={44} />}
      />
    </div>
  );
}

/** AgencyOS-konsollen for en rolle uten AI-tilgang: ærlig deaktivert, ikke utelatt. */
export function Deaktivert() {
  return (
    <div style={desktop}>
      <Composer
        label="Skriv til AgencyOS"
        placeholder="Jarvis er ikke tilgjengelig for denne rollen"
        onSend={() => {}}
        disabled
        kontekst="Ser: Stall · 14 spillere"
      />
    </div>
  );
}

/** Minimal: uten snarveier og uten kontekst — bare feltet og Send. */
export function Minimal() {
  return (
    <div style={desktop}>
      <Composer label="Skriv til PlayerHQ" placeholder="Skriv en melding til Anders …" onSend={() => {}} snarveier={false} />
    </div>
  );
}
