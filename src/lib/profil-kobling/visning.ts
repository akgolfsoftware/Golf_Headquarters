/**
 * Gjør `KomplettProfil` om til ferdig formaterte tekster, én gang, slik at AgencyOS, Team Norway og WANG
 * viser nøyaktig de samme tallene og tomtilstandene. Hvert miljø tegner dem med sine egne komponenter
 * (Precision, TN og WANG har hvert sitt designsystem); denne modulen eier bare innholdet.
 *
 * Ren funksjon, ingen database. Brutto score alltid; netto-klasser er tatt ut i `tilTurneringer`.
 * Manglende data sier det rett ut («—», forklaring), aldri et anslag.
 */

import { lesTurneringsresultat, resultatKilde } from "@/lib/domain/turneringsresultat";
import type { LevertIupProfilrad } from "@/lib/iup/trener-profil-lesing";
import type { KomplettProfil } from "./komplett";
import { tilTurneringer } from "./til-turneringer";

export type Fakta = { etikett: string; verdi: string };
export type ResultatRad = { id: string; dato: string; navn: string; klasse: string; plass: string; slag: string; kilde: string };
export type SesongRad = { sesong: string; runder: string; snitt: string; motPar: string };
export type TestRad = { id: string; navn: string; omraade: string; siste: string; dato: string; antall: string };
export type IupRad = { id: string; svar: string; periode: string; levert: string; advarsel: string | null };
export type MaaltallRad = { id: string; navn: string; kvartaler: string[]; aar: string; mal: string };

export type ProfilVisning = {
  navn: string;
  identitet: Fakta[];
  resultater: { tom: string | null; aar: { aar: number; rader: ResultatRad[] }[]; sesonger: SesongRad[] };
  tester: { tom: string | null; rader: TestRad[]; harTeamNorway: boolean };
  runder: { tom: string | null; tall: Fakta[]; merknad: string };
  iup: { tom: string | null; levert: IupRad[]; maaltall: { tittel: string; rader: MaaltallRad[] } | null };
};

const dato = new Intl.DateTimeFormat("nb-NO", { day: "2-digit", month: "short", year: "numeric", timeZone: "Europe/Oslo" });
const aarFmt = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Europe/Oslo" });
const MANGLER = "—";

const dec = (n: number | null, d = 1) => (n == null ? MANGLER : n.toFixed(d).replace(".", ","));
const signert = (n: number | null, d: number) => (n == null ? MANGLER : `${n > 0 ? "+" : ""}${n.toFixed(d).replace(".", ",")}`);
const motPar = (n: number | null) => (n == null ? MANGLER : n > 0 ? `+${n}` : String(n));

const IUP_TYPE: Record<LevertIupProfilrad["type"], string> = {
  UTVIKLINGSSJEKK: "Utviklingssjekk",
  SESONGEVALUERING: "Sesongevaluering",
};

export function byggProfilVisning(profil: KomplettProfil): ProfilVisning {
  const r = profil.resultater;

  const identitet: Fakta[] = [{ etikett: "Født", verdi: r?.person.birth_year != null ? String(r.person.birth_year) : MANGLER }];
  // Golf-ID kommer bare med når databasen ble bedt om den, og det skjer bare for trenere.
  if (r?.golf_id) identitet.push({ etikett: "Golf-ID", verdi: r.golf_id.length ? r.golf_id.join(", ") : MANGLER });

  const turneringer = r ? tilTurneringer(r.turneringer).sort((a, b) => b.start.getTime() - a.start.getTime()) : [];
  const perAar = new Map<number, ResultatRad[]>();
  for (const t of turneringer) {
    const res = lesTurneringsresultat(t.resultat);
    const aar = Number(aarFmt.format(t.start));
    perAar.set(aar, [
      ...(perAar.get(aar) ?? []),
      {
        id: t.id,
        dato: dato.format(t.start),
        navn: t.navn,
        klasse: t.klasse ?? MANGLER,
        plass: res.plasseringTekst ?? MANGLER,
        slag: res.brutto != null ? `${res.brutto} (${motPar(res.motPar)})` : MANGLER,
        kilde: resultatKilde(t.kilde),
      },
    ]);
  }

  const tomResultater = !r
    ? "Spilleren har ikke koblet resultatprofilen sin ennå. Spillere fra 16 år kobler seg selv; for yngre spillere kobler treneren i AgencyOS."
    : turneringer.length === 0
      ? "Ingen registrerte turneringer ennå."
      : null;

  const tester: TestRad[] = profil.tester.map((t) => ({
    id: t.testId,
    navn: t.navn,
    omraade: t.omraade,
    siste: t.sisteScore != null ? dec(t.sisteScore) : t.erTeamNorway ? "se Team Norway" : MANGLER,
    dato: dato.format(t.sisteDato),
    antall: String(t.antall),
  }));

  const ru = profil.runder;

  return {
    navn: profil.navn,
    identitet,
    resultater: {
      tom: tomResultater,
      aar: [...perAar.entries()].map(([aar, rader]) => ({ aar, rader })),
      sesonger: (r?.sesonger ?? []).map((x) => ({
        sesong: String(x.year),
        runder: String(x.runder),
        snitt: dec(x.snitt_score),
        motPar: signert(x.snitt_til_par, 1),
      })),
    },
    tester: {
      tom: tester.length === 0 ? "Ingen registrerte tester." : null,
      rader: tester,
      harTeamNorway: profil.tester.some((t) => t.erTeamNorway),
    },
    runder: {
      tom: ru.antall === 0 ? "Ingen runder delt med trener." : null,
      tall: ru.antall === 0 ? [] : [
        { etikett: "Runder", verdi: String(ru.antall) },
        { etikett: "Snitt brutto", verdi: dec(ru.snittScore) },
        { etikett: "SG totalt", verdi: signert(ru.sgTotal, 2) },
        { etikett: "SG utslag", verdi: signert(ru.sgOtt, 2) },
        { etikett: "SG innspill", verdi: signert(ru.sgApp, 2) },
        { etikett: "SG nærspill", verdi: signert(ru.sgArg, 2) },
        { etikett: "SG putting", verdi: signert(ru.sgPutt, 2) },
      ],
      merknad: "Siste 12 måneder. Bare runder spilleren har delt med trener; runder merket «Bare deg» er ikke med.",
    },
    iup: !profil.iup
      ? { tom: "Spilleren har ikke IUP. Den gjelder aktive WANG- og Team Norway-spillere.", levert: [], maaltall: null }
      : {
          tom: profil.iup.levert.length === 0 && !profil.iup.maaltall ? "Ingen leverte IUP-svar ennå. Utkast vises aldri." : null,
          levert: profil.iup.levert.map((x) => ({
            id: x.id,
            svar: IUP_TYPE[x.type],
            periode: `${x.periodeStart} – ${x.periodeSlutt}`,
            levert: dato.format(new Date(x.levert)),
            advarsel: x.kildeEllerFormatAvviker ? "Innholdet avviker fra kilden og vises ikke." : null,
          })),
          maaltall: profil.iup.maaltall
            ? {
                tittel: `Måltall ${profil.iup.maaltall.sesong.navn} · ${profil.iup.maaltall.org}`,
                rader: profil.iup.maaltall.rader.map((m) => ({
                  id: m.id,
                  navn: m.navn,
                  kvartaler: m.kvartaler.map((k) => dec(k)),
                  aar: dec(m.aar),
                  mal: m.mal ?? MANGLER,
                })),
              }
            : null,
        },
  };
}
