import { AvatarInit } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 14, alignItems: "center" };

/** Initialer fra navnet (maks to), mono 600 på dim-sirkel. Radstandarden er 36 px, default 30. */
export function Standard() {
  return <AvatarInit navn="Øyvind Rohjan" />;
}

export function Storrelser() {
  return (
    <div style={rad}>
      <AvatarInit navn="Øyvind Rohjan" size={24} />
      <AvatarInit navn="Øyvind Rohjan" size={30} />
      <AvatarInit navn="Øyvind Rohjan" size={36} />
      <AvatarInit navn="Øyvind Rohjan" size={48} />
    </div>
  );
}

/** Spiller og coach side om side. */
export function SpillerOgCoach() {
  return (
    <div style={rad}>
      <AvatarInit navn="Øyvind Rohjan" size={36} />
      <AvatarInit navn="Anders Kristiansen" size={36} />
    </div>
  );
}
