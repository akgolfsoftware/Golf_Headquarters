/**
 * EP-02 Endret time — Precision Athletics (7d7c2994, ui_kits/epost/emails.js).
 *
 * Ren bygger: tar ferdig hentede bookingdata og gir emne + HTML. Ingen database,
 * ingen sending. `sendBookingRescheduled` i booking-emails.ts kaller den.
 * Manglende verdi vises som «—», aldri gjetning.
 */
import { cancellationDeadline } from "@/lib/booking/policy";
import {
  avsnitt,
  boks,
  EPOST_LYS,
  EPOST_MORK,
  epostSkall,
  esc,
  faktaRader,
  kr,
} from "@/lib/email/precision-epost";

/** PlayerHQ FULL, jf. docs/platform/BUSINESS-RULES.md §Abonnement (299 kr/mnd, 2 690 kr/år). */
const PLAYERHQ_PRIS_MND = 299;
const PLAYERHQ_PRIS_AAR = 2690;

export type EndretTimeInput = {
  appUrl: string;
  bookingId: string;
  /** Booking-raden er allerede oppdatert til ny tid. */
  startAt: Date;
  endAt: Date;
  oldStartAt: Date;
  fornavn: string | null;
  /** Mottakerens e-post; vises i tilbudet til gjest (aldri i lenken). */
  epost: string | null;
  tjenesteNavn: string;
  varighetMin: number;
  stedNavn: string;
  stedAdresse: string | null;
  coachNavn: string | null;
  priceOre: number;
  /** Trukket fra abonnement (klipp). */
  erKlipp: boolean;
  stripePaymentIntentId: string | null;
  /** Innlogget spiller (appbruker) eller gjest uten konto. */
  harKonto: boolean;
  dark?: boolean;
  introHtml?: string;
};

const UKEDAG = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];

function p2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Lagret tid er Oslo-veggklokke (se lib/google-calendar-tid.ts), derfor lokale getters. */
function dag(d: Date, stor: boolean): string {
  const navn = UKEDAG[d.getDay()];
  const ukedag = stor ? navn.charAt(0).toUpperCase() + navn.slice(1) : navn;
  return `${ukedag} ${p2(d.getDate())}.${p2(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function kl(d: Date): string {
  return `${p2(d.getHours())}:${p2(d.getMinutes())}`;
}

function tidRom(start: Date, slutt: Date): string {
  return `${kl(start)}–${kl(slutt)}`;
}

/** Google Kalender-lenke med tid uten offset + ctz, så Oslo-veggklokken beholdes. */
export function kalenderLenke(input: {
  tittel: string;
  start: Date;
  slutt: Date;
  sted: string;
}): string {
  const f = (d: Date) =>
    `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}T${p2(d.getHours())}${p2(d.getMinutes())}00`;
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: input.tittel,
    dates: `${f(input.start)}/${f(input.slutt)}`,
    ctz: "Europe/Oslo",
    location: input.sted,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

export function byggEndretTimeEpost(input: EndretTimeInput): { subject: string; html: string } {
  const c = input.dark ? EPOST_MORK : EPOST_LYS;
  const gammelSlutt = new Date(input.oldStartAt.getTime() + (input.endAt.getTime() - input.startAt.getTime()));
  const frist = cancellationDeadline(input.startAt);
  const tjeneste = `${input.tjenesteNavn} ${input.varighetMin} min`;
  const sted = input.stedAdresse ? `${input.stedNavn} · ${input.stedAdresse}` : input.stedNavn;

  const nyTid = `${dag(input.startAt, true)} kl. ${tidRom(input.startAt, input.endAt)}`;
  const gammelTid = `${dag(input.oldStartAt, true)} kl. ${tidRom(input.oldStartAt, gammelSlutt)}`;

  const pris = input.erKlipp ? "Inkludert i abonnement" : kr(input.priceOre / 100);
  const betaling = input.erKlipp ? "1 klipp fra abonnementet" : (input.stripePaymentIntentId ?? "—");

  const rader = faktaRader(
    [
      ["Tjeneste", esc(tjeneste)],
      ["Tid", `<s class="m" style="color:${c.muted}">${esc(gammelTid)}</s><br><b>${esc(nyTid)}</b>`],
      ["Sted", esc(sted)],
      ["Coach", esc(input.coachNavn ?? "—")],
      ["Pris", esc(pris)],
      ["Betaling", esc(betaling), !input.erKlipp && input.stripePaymentIntentId !== null],
      ["Referanse", esc(input.bookingId), true],
    ],
    c,
  );

  const fristTekst = `${dag(frist, false)} kl. ${kl(frist)}`;
  const etterFrist = input.erKlipp ? "Etter det brukes klippet." : "Etter det belastes full pris.";

  const tilbud = input.harKonto
    ? ""
    : boks(
        "Fortsett i PlayerHQ",
        `Med konto får du plan fra coachen, økter, tester og analyse av rundene dine. FULL koster ${kr(PLAYERHQ_PRIS_MND)} per måned eller ${kr(PLAYERHQ_PRIS_AAR)} per år. <a class="lnk" href="${esc(input.appUrl)}/auth/signup" style="color:${c.link};text-decoration:underline">${esc(input.epost ? `Opprett konto med ${input.epost}` : "Opprett konto")}</a>`,
        c,
      );

  const endreLenke = input.harKonto
    ? `${input.appUrl}/portal/meg/bookinger`
    : `${input.appUrl}/booking/kvittering/${input.bookingId}`;

  const body =
    (input.introHtml ?? avsnitt(`Hei ${esc(input.fornavn ?? "der")}. Timen din har fått ny tid.`, c)) +
    rader +
    (input.erKlipp || input.priceOre > 0
      ? avsnitt(`Gratis avbestilling til <b>${esc(fristTekst)}</b>. ${etterFrist}`, c)
      : "") +
    tilbud;

  const html = epostSkall({
    pre: `Timen er flyttet til ${dag(input.startAt, false)} kl. ${kl(input.startAt)}.`,
    title: "Timen er flyttet",
    body,
    button: [
      "Legg ny tid i kalender",
      kalenderLenke({ tittel: tjeneste, start: input.startAt, slutt: input.endAt, sted }),
    ],
    secondary: input.harKonto
      ? [
          ["Se bookingen i PlayerHQ", `${input.appUrl}/portal/meg/bookinger`],
          ["Endre eller avbestill", endreLenke],
        ]
      : [["Se bookingen", endreLenke]],
    dark: input.dark,
  });

  return {
    subject: `Endret: ny tid ${dag(input.startAt, false)} kl. ${kl(input.startAt)}`,
    html,
  };
}
