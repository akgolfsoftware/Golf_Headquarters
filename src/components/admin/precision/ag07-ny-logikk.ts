/** Ren logikk for AG-07-NY (Ny spiller): alder og validering. Ingen React, kan testes med node:test. */
import type { PlayerProgram } from "@/generated/prisma/client";
import type { SpillerKategori, SpillerTier } from "@/app/admin/(legacy)/spillere/ny/constants";

const EPOST = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AG07NySkjema = {
  program: PlayerProgram;
  navn: string;
  epost: string;
  fodselsdato: string;
  hcp: string;
  hjemmeklubb: string;
  kategori: SpillerKategori;
  tier: SpillerTier;
  foreldreNavn: string;
  foreldreEpost: string;
  foreldreTelefon: string;
  velkomstMelding: string;
  sendInvitasjon: boolean;
};

export const AG07_NY_TOM: AG07NySkjema = {
  program: "AK_ACADEMY",
  navn: "",
  epost: "",
  fodselsdato: "",
  hcp: "",
  hjemmeklubb: "",
  kategori: "B2",
  tier: "GRATIS",
  foreldreNavn: "",
  foreldreEpost: "",
  foreldreTelefon: "",
  velkomstMelding: "Velkommen til AK Golf Academy. Vi gleder oss til å trene sammen med deg.",
  sendInvitasjon: true,
};

/** Alder i hele år på gitt dato (UTC, ingen tidssoneglidning). */
export function alderFraDato(iso: string, naa: Date = new Date()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const [, y, mo, d] = m;
  const f = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)));
  if (Number.isNaN(f.getTime())) return null;
  let alder = naa.getUTCFullYear() - f.getUTCFullYear();
  const bursdag =
    naa.getUTCMonth() > f.getUTCMonth() ||
    (naa.getUTCMonth() === f.getUTCMonth() && naa.getUTCDate() >= f.getUTCDate());
  if (!bursdag) alder -= 1;
  return alder;
}

/** Feil per felt; samme regler som veiviseren. Tom record = kan sendes. */
export function valider(s: AG07NySkjema, alder: number | null): Record<string, string> {
  const e: Record<string, string> = {};
  if (s.navn.trim().length < 2) e.navn = "Navn må være minst 2 tegn.";
  if (!EPOST.test(s.epost.trim())) e.epost = "Ugyldig e-postadresse.";
  if (!s.fodselsdato) e.fodselsdato = "Fødselsdato er påkrevd.";
  else if (alder == null || alder < 4 || alder > 110) e.fodselsdato = "Alder må være mellom 4 og 110 år.";
  if (s.hcp.trim() !== "") {
    const n = Number(s.hcp.replace(",", "."));
    if (Number.isNaN(n) || n < -10 || n > 54) e.hcp = "HCP må være mellom −10 og 54.";
  }
  if (alder != null && alder < 18) {
    if (s.foreldreNavn.trim().length < 2) e.foreldreNavn = "Foresattes navn er påkrevd under 18 år.";
    if (!EPOST.test(s.foreldreEpost.trim())) e.foreldreEpost = "Foresattes e-post er påkrevd under 18 år.";
  }
  return e;
}

