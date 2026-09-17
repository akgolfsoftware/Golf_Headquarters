import { LiveStatus } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 28, flexWrap: "wrap" as const, alignItems: "center" };

/** Pulserende prikk med tekst og tid i mono. */
export function Pagaar() {
  return <LiveStatus tekst="Økt pågår" tone="down" tid="42:18" />;
}

/** Tone-aksen: rød (pågår), grønn (publisert), lime (live), gul (venter), blå (synk). */
export function Toner() {
  return (
    <div style={rad}>
      <LiveStatus tekst="Økt pågår" tone="down" />
      <LiveStatus tekst="Publisert til Øyvind" tone="up" />
      <LiveStatus tekst="Live nå" tone="lime" />
      <LiveStatus tekst="Venter på coach" tone="warn" />
      <LiveStatus tekst="Synkroniserer TrackMan" tone="info" />
    </div>
  );
}
