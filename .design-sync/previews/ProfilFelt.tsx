import { Icon, ProfilFelt } from "akgolf-hq-komponenter";

const boks = { maxWidth: 360 };

/** Skrivebeskyttet visning — redigering skjer på /portal/meg/profil. */
export function Utfylt() {
  return (
    <div style={boks}>
      <ProfilFelt label="Klubb" value="Gamle Fredrikstad GK" />
    </div>
  );
}

export function Tom() {
  return (
    <div style={boks}>
      <ProfilFelt label="Handicap" placeholder="Ikke registrert" hint="Hentes fra GolfBox når kontoen er koblet." />
    </div>
  );
}

/** Målt verdi i mono, låst felt merket med ikon. */
export function MonoLaast() {
  return (
    <div style={boks}>
      <ProfilFelt
        label="Fødselsår"
        value="2009"
        mono
        trailing={<Icon name="lock" size={14} style={{ color: "var(--tl-mute)" }} />}
        hint="Endres av forelder eller coach."
      />
    </div>
  );
}

/** Profilblokk slik den står på Meg-fanen. */
export function Profil() {
  return (
    <div style={{ ...boks, display: "flex", flexDirection: "column", gap: 16 }}>
      <ProfilFelt label="Navn" value="Øyvind Rohjan" />
      <ProfilFelt label="Klubb" value="Gamle Fredrikstad GK" />
      <ProfilFelt label="Handicap" value="4,2" mono trailing={<span style={{ fontFamily: "var(--tl-font-mono)", fontSize: 11, color: "var(--tl-mute)" }}>hcp</span>} />
      <ProfilFelt label="Coach" value="Anders Kristiansen" trailing={<Icon name="chevron-right" size={14} style={{ color: "var(--tl-mute)" }} />} />
    </div>
  );
}
