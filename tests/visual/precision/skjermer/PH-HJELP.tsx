/** Prøvefil for pakke 15 Hjelp: Hjelp, kategori, artikkel, Skriv til oss, Sendt. Redaksjonelt innhold, syntetisk avsender. */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHHjelp } from "@/components/portal/precision/PHHjelp";
import { PHHjelpArtikkel, PHHjelpKategori } from "@/components/portal/precision/PHHjelpArtikkel";
import { PHSendt, PHSkrivTilOss } from "@/components/portal/precision/PHSkrivTilOss";
import { artiklerIKategori, finnArtikkel, finnKategori } from "@/lib/portal-hjelp/artikler";

export const sti = "/portal/meg/help";
const S = ({ children }: { children: React.ReactNode }) => <PlayerHQSkall innboksHref="#" uleste={0}>{children}</PlayerHQSkall>;
const trening = finnKategori("trening")!;
export const tilstander = {
  hjelp: <S><PHHjelp /></S>,
  kategori: <S><PHHjelpKategori kategori={trening} artikler={artiklerIKategori("trening")} /></S>,
  "kategori-tom": <S><PHHjelpKategori kategori={trening} artikler={[]} /></S>,
  artikkel: <S><PHHjelpArtikkel artikkel={finnArtikkel("pyramiden")!} kategori={trening} /></S>,
  "artikkel-liste": <S><PHHjelpArtikkel artikkel={finnArtikkel("flytt-eller-avbestill-en-time")!} kategori={finnKategori("coaching")!} /></S>,
  skriv: <S><PHSkrivTilOss data={{ navn: "Øyvind Rohjan", epost: "oyvind.rohjan@eksempel.no", type: "sporsmal", fra: null }} /></S>,
  sendt: <S><PHSendt data={{ tid: "5. oktober 14:20", type: "Spørsmål", emne: "Klippene vises ikke etter booking", epost: "oyvind.rohjan@eksempel.no", saksnummer: "AK-2041AB" }} /></S>,
};
