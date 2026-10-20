import { z } from "zod";
import { avsnitt, boks, epostSkall, esc, faktaRader } from "./precision-epost";
import { datoTekst, klokkeTekst } from "./booking-bekreftelse";

const LinkSchema = z.string().url().refine((value) => new URL(value).protocol === "https:", "Bruk en fullstendig HTTPS-lenke.");
const InputSchema = z.object({
  status: z.literal("COMPLETED"), fornavn: z.string().max(100).nullable(), coach: z.string().max(160).nullable(),
  tjeneste: z.string().min(1).max(200), startAt: z.date(), coachTekst: z.string().max(10000),
  bookingUrl: LinkSchema, playerhqUrl: LinkSchema.nullable().optional(),
});
export type CoachingOppfolgingInput = z.infer<typeof InputSchema>;

/** EP-05/EP-06 er rene maler. Coachens godkjente tekst/voice følger med som data.
 *  Sending, 24t-utkast og 14d-utvalg avgjøres utenfor denne visningsgrensen. */
export function byggCoachingOppfolging(kind: "takk" | "oppfolging", input: CoachingOppfolgingInput) {
  const data = InputSchema.parse(input);
  const takk = kind === "takk";
  const hilsen = data.fornavn?.trim() ? `Hei ${esc(data.fornavn.trim())}.` : "Hei.";
  const body = avsnitt(hilsen) + faktaRader([["Coachingtime", esc(data.tjeneste)], ["Dato og tid", `${esc(datoTekst(data.startAt))} · ${esc(klokkeTekst(data.startAt))}`, true]])
    + (data.coachTekst.trim() ? boks(data.coach?.trim() ? `Fra ${data.coach.trim()}` : "Fra coachen", esc(data.coachTekst.trim()).replace(/\n/g, "<br>")) : "");
  return { subject: takk ? "Takk for timen" : "Oppfølging etter coachingtime", html: epostSkall({
    pre: takk ? "Coachingtime og coachens oppsummering." : "Oppfølging fra coachen etter timen.", title: takk ? "Takk for timen" : "Etter coachingtimen", body,
    button: [takk ? "Book neste time" : "Se ledige timer", data.bookingUrl], secondary: data.playerhqUrl ? [["Se PlayerHQ", data.playerhqUrl]] : undefined,
  }) };
}
