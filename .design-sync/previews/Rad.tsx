import { AkseChip, AvatarFoto, AvatarInit, DeltaChip, Rad, StatusPill } from "akgolf-hq-komponenter";

const liste = { maxWidth: 520 };
const FOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#2C6E63"/><circle cx="32" cy="24" r="12" fill="#E8E4DC"/><ellipse cx="32" cy="58" rx="20" ry="16" fill="#E8E4DC"/></svg>',
  );
const score = { fontFamily: "var(--tl-font-mono)", fontSize: 15, fontWeight: 700, color: "var(--tl-text)", fontVariantNumeric: "tabular-nums" as const };

/** Økt-rader i ukeplanen: tittel + sub, akse som meta, «Nå» på den som pågår, ingen linje under siste. */
export function Okter() {
  return (
    <div style={liste}>
      <Rad title="Oppvarming · mobilitet" sub="08:00 · 15 min" meta={<AkseChip a="FYS" />} trailing={null} />
      <Rad title="Wedge 60–100 m · 60 slag" sub="16:00 · Range, GFGK" meta={<AkseChip a="SLAG" />} naa trailing={null} />
      <Rad title="Putting · 3 m lag-drill" sub="17:00 · 30 putter" meta={<AkseChip a="SPILL" />} trailing={null} />
      <Rad title="P2–P4 med speil" sub="Fredag 08:00 · Mulligan Indoor Golf" meta={<AkseChip a="TEK" />} trailing={null} last />
    </div>
  );
}

/** Stall-lista hos coach: avatar, navn, neste økt, ett varsel. onClick gir chevron, radius og hover-flate. */
export function Klikkbar() {
  const aapne = () => {};
  return (
    <div style={liste}>
      <Rad leading={<AvatarInit navn="Øyvind Rohjan" size={36} />} title="Øyvind Rohjan" sub="Neste økt torsdag 16:00 · sist aktiv i går" meta={<StatusPill tone="up">I rute</StatusPill>} onClick={aapne} />
      <Rad leading={<AvatarInit navn="WANG Toppidrett" size={36} />} title="WANG Toppidrett · 8 spillere" sub="Fredag 08:00 · 2 venter på deg" meta={<StatusPill tone="warn">2 venter</StatusPill>} onClick={aapne} />
      <Rad leading={<AvatarInit navn="GFGK Junior" size={36} />} title="GFGK junior · 12 spillere" sub="Torsdag 20:00 · ballplukking" onClick={aapne} />
      <Rad leading={<AvatarInit navn="Team Norway" size={36} />} title="Team Norway U18 · 6 spillere" sub="Samling 3.–5. oktober" onClick={aapne} last />
    </div>
  );
}

/** Runder: målt score i mono som trailing, delta mot eget snitt som meta. */
export function Runder() {
  return (
    <div style={liste}>
      <Rad title="Klubbmesterskap · runde 1" sub="Søndag 14.09 · GFGK · 18 hull" meta={<DeltaChip v="−1,3" dir="down" />} trailing={<span style={score}>73</span>} />
      <Rad title="Treningsrunde" sub="Onsdag 10.09 · GFGK · 9 hull" meta={<DeltaChip v="+0,5" dir="up" />} trailing={<span style={score}>38</span>} />
      <Rad title="Srixon Tour · runde 2" sub="Lørdag 06.09 · Borre GK · 18 hull" meta={<DeltaChip v="+2,1" dir="up" />} trailing={<span style={score}>78</span>} />
      <Rad title="Srixon Tour · runde 1" sub="Fredag 05.09 · Borre GK · 18 hull" meta={<DeltaChip v="−0,8" dir="down" />} trailing={<span style={score}>74</span>} last />
    </div>
  );
}

/** Spiller-rad med profilbilde (AvatarFoto) og «Nå». */
export function MedFoto() {
  return (
    <div style={liste}>
      <Rad leading={<AvatarFoto src={FOTO} navn="Øyvind Rohjan" size={40} ring />} title="Øyvind Rohjan" sub="Live: Wedge 60–100 m · 24 av 60 slag" naa last />
    </div>
  );
}

/** Kun tittel og chevron, som i innstillinger og «Meg». */
export function UtenSub() {
  const aapne = () => {};
  return (
    <div style={liste}>
      <Rad title="Varsler" onClick={aapne} />
      <Rad title="Personvern og deling" onClick={aapne} />
      <Rad title="Abonnement" meta={<StatusPill tone="up">Full</StatusPill>} onClick={aapne} />
      <Rad title="Logg ut" onClick={aapne} last />
    </div>
  );
}
