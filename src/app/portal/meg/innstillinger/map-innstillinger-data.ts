/**
 * Mapper: ekte loader-output (Prisma-User + lesPreferences) → v10 InnstillingerData.
 *
 * Bevarer tom-tilstander: hjemmeklubb «Ikke satt» når null, og fasiliteter-slidere
 * (range-maks / innspill / green) er IKKE schema-backet i v10-designet — vi har
 * ingen ekte kilde til meter-verdier, så lista returneres tom ([]). Ingen liksom-tall.
 * Antall valgte fasiliteter speiles kun i seksjons-underteksten (fasiliteterSub).
 *
 * Varsler mapper de 4 v10-radene til de samme ekte notif-feltene som det gamle
 * accordion brukte (paaminnelse / ukentligRapport / nyMeldingFraCoach /
 * turneringsresultater) fra User.preferences JSON.
 */

import type { User } from "@/generated/prisma/client";
import type { UserPreferences } from "@/lib/preferences";
import type { InnstillingerData } from "@/components/portal/meg/innstillinger";

function initialer(navn: string | null | undefined): string {
  if (!navn) return "??";
  return navn
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function mapInnstillingerData(
  user: User,
  prefs: UserPreferences,
): InnstillingerData {
  const antallFasiliteter = user.tilgjengeligeFasiliteter.length;

  return {
    tilbake: { label: "Profil", href: "/portal/meg" },
    profil: {
      initialer: initialer(user.name),
      avatarUrl: user.avatarUrl ?? null,
      fulltNavn: user.name ?? "Spiller",
      epost: user.email ?? "",
      hjemmeklubb: user.homeClub ?? "Ikke satt",
      redigerHref: "/portal/meg/profil/rediger",
    },
    fasiliteterSub:
      antallFasiliteter === 0
        ? "INGEN VALGT · ALLE DRILLS"
        : `${antallFasiliteter} VALGT · FILTRERER DRILLS`,
    // Ingen schema-backet kilde for meter-slidere — bevar tom-tilstand.
    fasiliteter: [],
    varsler: [
      { id: "okt", tittel: "Økt-påminnelser", sub: "FØR HVER ØKT", on: prefs.notif.paaminnelse },
      { id: "uke", tittel: "Ukerapport", sub: "SØNDAG 18:00", on: prefs.notif.ukentligRapport },
      { id: "coach", tittel: "Coach-meldinger", sub: "PUSH + E-POST", on: prefs.notif.nyMeldingFraCoach },
      { id: "turnering", tittel: "Turneringsresultater", sub: "NÅR REGISTRERT", on: prefs.notif.turneringsresultater },
    ],
    personvern: [
      {
        id: "last-ned",
        label: "Last ned mine data",
        retning: "intern",
        href: "/portal/meg/innstillinger/eksport",
      },
      {
        id: "erklaering",
        label: "Personvernerklæring",
        retning: "ekstern",
        href: "/personvern",
      },
      {
        id: "slett",
        label: "Slett konto",
        retning: "intern",
        danger: true,
        href: "/portal/meg/innstillinger/personvern",
      },
    ],
  };
}
