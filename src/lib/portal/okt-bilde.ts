/**
 * Bilde per treningsområde på fylte øktkort (designbrevet 13.10.2026, utkast-playerhq/README «Faste grep»).
 * Bildet følger treningsområdet, fargen følger aksen. Har området ikke eget bilde, brukes aksens bilde.
 * Bildene er AK Golfs egne, bortsett fra FYS (Victor Freitas, Unsplash) til egne bilder fra styrkerommet finnes.
 * Bilder får aldri tekst oppå: kortet har tekst i eget felt.
 */
export type OktBilde = { src: string; posisjon: string };

const B = (fil: string, posisjon = "30% 40%"): OktBilde => ({ src: `/images/playerhq/${fil}.jpg`, posisjon });

export const OKT_BILDER = {
  innspill: B("naerspill-wedge"),
  utslag: B("slag-utslag"),
  putting: B("slag-putting"),
  bunker: B("slag-bunker"),
  simulator: B("slag-simulator"),
  tek: B("tek-video"),
  spill: B("spill-bane"),
  turn: B("turn-tee"),
  fys: B("fys-styrke", "50% 60%"),
} as const;

/** Velger bilde ut fra aksen og det økta heter eller hvor den foregår. */
export function oktBilde(akse: string | null | undefined, tekst = ""): OktBilde {
  const t = tekst.toLowerCase();
  switch ((akse ?? "").toUpperCase()) {
    case "FYS": return OKT_BILDER.fys;
    case "TEK": return OKT_BILDER.tek;
    case "SPILL": return OKT_BILDER.spill;
    case "TURN": return OKT_BILDER.turn;
    default:
      if (/putt|green/.test(t)) return OKT_BILDER.putting;
      if (/bunker/.test(t)) return OKT_BILDER.bunker;
      if (/trackman|simulator|studio/.test(t)) return OKT_BILDER.simulator;
      if (/driver|utslag|tee|langt spill/.test(t)) return OKT_BILDER.utslag;
      return OKT_BILDER.innspill;
  }
}
