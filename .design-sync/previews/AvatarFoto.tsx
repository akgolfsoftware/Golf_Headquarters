import { AvatarFoto } from "akgolf-hq-komponenter";

const rad = { display: "flex", gap: 14, alignItems: "center" };
const FOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#2C6E63"/><circle cx="32" cy="24" r="12" fill="#E8E4DC"/><ellipse cx="32" cy="58" rx="20" ry="16" fill="#E8E4DC"/></svg>',
  );

/** Opplastet profilbilde, beskåret rundt. */
export function MedFoto() {
  return <AvatarFoto src={FOTO} navn="Øyvind Rohjan" size={48} />;
}

/** ring: markerer «deg» i skallet (IkonRail) — 2 px scene-gap + ring i handlingsfargen. */
export function MedRing() {
  return <AvatarFoto src={FOTO} navn="Øyvind Rohjan" size={40} ring />;
}

/** Uten bilde faller den tilbake til AvatarInit med initialer. */
export function UtenBilde() {
  return (
    <div style={rad}>
      <AvatarFoto navn="Øyvind Rohjan" size={40} />
      <AvatarFoto navn="Anders Kristiansen" size={40} ring />
    </div>
  );
}

export function Storrelser() {
  return (
    <div style={rad}>
      <AvatarFoto src={FOTO} navn="Øyvind Rohjan" size={30} />
      <AvatarFoto src={FOTO} navn="Øyvind Rohjan" size={40} />
      <AvatarFoto src={FOTO} navn="Øyvind Rohjan" size={56} />
    </div>
  );
}
