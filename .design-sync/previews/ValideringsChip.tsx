import { Inndata, SkjemaFelt, ValideringsChip } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 8, flexWrap: "wrap" as const, alignItems: "center" };

/** De tre tonene med standardtekstene fra kilden — klarspråk, aldri sperre-språk. */
export function Toner() {
  return (
    <div style={rad}>
      <ValideringsChip tone="ok" />
      <ValideringsChip tone="advarsel" />
      <ValideringsChip tone="info" />
    </div>
  );
}

/** Egen tekst per tone, slik den brukes ved runderegistrering og TrackMan-import. */
export function EgenTekst() {
  return (
    <div style={{ ...rad, flexDirection: "column", alignItems: "flex-start" }}>
      <ValideringsChip tone="ok" tekst="Carry 212 m stemmer med de siste øktene" />
      <ValideringsChip tone="advarsel" tekst="Score 61 er uvanlig lav for 18 hull — sjekk gjerne tallet" />
      <ValideringsChip tone="info" tekst="Basert på 4 runder — flere gir sikrere tall" />
    </div>
  );
}

/** Under et felt: chipen kommenterer verdien uten å stoppe lagring. */
export function UnderFelt() {
  return (
    <div style={{ maxWidth: 360, display: "flex", flexDirection: "column", gap: 10 }}>
      <SkjemaFelt label="Score · 18 hull" hjelp={null}>
        <Inndata label={null} defaultValue="61" mono />
      </SkjemaFelt>
      <ValideringsChip tone="advarsel" tekst="Uvanlig lav score — sjekk gjerne tallet" />
    </div>
  );
}
