import { AmbientBakgrunn, Caps, Tittel } from "akgolf-hq-komponenter";

/**
 * Uskarp profilbilde-glød bak innholdet (Spotify-idiomet), maskes ut nedover.
 * Rendrer ingenting før et profilbilde er satt (PROFIL.src i kjernebiblioteket).
 * Pakken eksporterer ikke PROFIL, så kortet kan bare vise tom-tilstanden: innholdet uten glød.
 */
export function UtenProfilbilde() {
  return (
    <div style={{ position: "relative", width: 480, height: 220, background: "var(--tl-scene)", border: "1px solid var(--tl-hair)", borderRadius: 20, overflow: "hidden" }}>
      <AmbientBakgrunn />
      <div style={{ position: "relative", padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
        <Caps>Ambient-lag · ingen profilbilde satt</Caps>
        <Tittel>God morgen, Øyvind</Tittel>
      </div>
    </div>
  );
}
