/** Prøvefil for TrackMan-statistikken i IUP › Tester (utkast 3, gruppa «TrackMan-statistikk»). Syntetiske data. */
import { TnTrackManVisning, type TnTrackManVisningData } from "@/components/team-norway/skjermer/tn-trackman-visning";
import type { TnArbeidskontekst, TnSpillerTilgang } from "@/lib/domain/tn-arbeidsflate";
import { TM_PARAMETRE, standardvindu, vinduTekst } from "@/lib/trackman/statistikk";

export const sti = "/team-norway/spiller/b/tester/trackman";

const kontekst: TnArbeidskontekst = { gruppe: { id: "g1", name: "Landslag junior" }, rolle: "COACH", erSpiller: false, kanAdministrere: true };
const tilgang: TnSpillerTilgang = { kontekst, spillerId: "b", spillerNavn: "Jørn Johnsen" };
const v = (label: string, aktiv = false) => ({ href: `?v=${encodeURIComponent(label)}`, label, aktiv });

const parametre = TM_PARAMETRE.map((p, i) => {
  const snitt = [82.4, 113, 1.37, -4.1, 1.8, 0.9, -0.9, 24.1, 17.8, 1.1, 6840, -2.4, 148.6, 156.2, 1.8, 27.9, 46.2][i]!;
  const spr = Math.abs(snitt) * 0.04 + 0.5;
  const vindu = standardvindu(p.key, "jern");
  return { navn: p.navn, enhet: p.enhet, desimaler: p.desimaler, n: 24, forFaa: false, snitt, median: snitt * 1.01, min: { verdi: snitt - 2 * spr, href: "#" }, maks: { verdi: snitt + 2 * spr, href: "#" }, spredning: spr, andel: vindu ? 0.75 : null, vindu: vinduTekst(vindu, p.enhet) };
});

const d: TnTrackManVisningData = {
  spillerId: "b", tilgang, brukerNavn: "Eva Lie", kanSkrive: true, feil: null,
  okter: [v("22. okt. · SLAG", true), v("15. okt. · TEK"), v("8. okt. · —"), v("Alle økter")],
  akser: [v("TEK og SLAG", true), v("TEK"), v("SLAG")],
  koller: [v("7-jern · 24", true), v("Driver · 12"), v("56° · 18"), v("PW · 4 · for få slag")],
  visninger: [v("Statistikk", true), v("Tendens"), v("Sammenheng")],
  kolle: "7-jern", kilde: "Kilde: TrackMan 22. okt. 14:02, 24 slag med 7-jern.", visning: "statistikk",
  slag: { nr: 14, club: "7-jern", verdier: TM_PARAMETRE.slice(0, 8).map((p) => ({ navn: p.navn, tekst: "12,3" })) },
  parametre,
  maal: [
    { parameter: "Face to Path", key: "faceToPath", navn: "Face to Path", enhet: "°", maal: null, vinduMin: null, vinduMax: null, standard: "±2°", gjelder: "Standard", eget: false },
    { parameter: "Club Path", key: "clubPath", navn: "Club Path", enhet: "°", maal: 1, vinduMin: -0.5, vinduMax: 2.5, standard: "−0,5 til +2,5°", gjelder: "Eget · Eva Lie · 20. okt.", eget: true },
    { parameter: "Carry", key: "carryDistance", navn: "Carry", enhet: "m", maal: 150, vinduMin: 146, vinduMax: 154, standard: "146 til 154 m", gjelder: "Eget · Jørn Johnsen · 21. okt.", eget: true },
  ],
  tilbake: "/team-norway/spiller/b/tester/trackman?visning=statistikk",
  gapping: [{ kolle: "Driver", n: 12, carry: 231.4, spredning: 8.2, gap: 60.4 }, { kolle: "5-jern", n: 9, carry: 171, spredning: 4.9, gap: 22.4 }, { kolle: "7-jern", n: 24, carry: 148.6, spredning: 4.2, gap: null }, { kolle: "PW", n: 4, carry: 101, spredning: null, gap: null }],
  treffpunkt: { n: 12, tekst: "Snitt X 0,12 · Y −0,08 (TrackMan-skala −1 til 1). 12 av 24 slag har treffpunkt.", punkter: [[0.1, -0.1], [0.2, 0], [-0.1, 0.2], [0.3, -0.2], [0, 0.1], [0.15, -0.05]].map(([x, y]) => ({ x: x!, y: y! })) },
  clubSpeed: { beste: 112.4, slag: [110.8, 111.9, 112.4, 109.6, 111.2].map((verdi, i) => ({ nr: 21 + i, verdi, beste: i === 2 })) },
  tendens: { parametre: TM_PARAMETRE.map((p, i) => v(p.navn, i === 6)), navn: "Face to Path", enhet: "°", punkter: [["17. sep.", 22, -2.1, 1.6], ["1. okt.", 18, -1.4, 1.4], ["8. okt.", 4, -1.0, null], ["15. okt.", 24, -0.9, 1.3], ["22. okt.", 24, -0.6, 1.1]].map(([dato, n, snitt, spredning]) => ({ dato: dato as string, n: n as number, snitt: snitt as number, spredning: spredning as number | null })) },
  maaneder: [
    { maaned: "oktober 2026", tm: { n: 72, andelFtp: 0.67, carrySpredning: 4.2 }, trening: { antall: 3, sgOtt: 0.21, sgApp: -0.4, sgArg: 0.1, sgPutt: 0.3 }, turnering: { antall: 2, sgOtt: -0.1, sgApp: -0.9, sgArg: 0.2, sgPutt: -0.2 } },
    { maaned: "september 2026", tm: { n: 40, andelFtp: 0.55, carrySpredning: 5.1 }, trening: null, turnering: { antall: 3, sgOtt: -0.3, sgApp: -1.2, sgArg: 0, sgPutt: 0.1 } },
  ],
};

export const tilstander = {
  statistikk: <TnTrackManVisning d={d} />,
  tendens: <TnTrackManVisning d={{ ...d, visning: "tendens", slag: null }} />,
  sammenheng: <TnTrackManVisning d={{ ...d, visning: "sammenheng", slag: null }} />,
  "for-faa": <TnTrackManVisning d={{ ...d, slag: null, kolle: "PW", parametre: parametre.map((p) => ({ ...p, n: 4, forFaa: true, spredning: null, andel: null })), treffpunkt: { n: 0, tekst: "", punkter: [] }, clubSpeed: { beste: null, slag: [] } }} />,
  tom: <TnTrackManVisning d={{ ...d, okter: [], koller: [] }} />,
};
