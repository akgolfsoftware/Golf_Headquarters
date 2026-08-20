import Link from "next/link";
import { BadgeCheck, CalendarDays, CreditCard, ListChecks } from "lucide-react";

/**
 * /booking mens den innebygde bookingen er pauset for publikum.
 *
 * Dette er skjermen ALLE utenom ADMIN møter i dag (`BOOKING_PUBLIC` er ikke
 * satt) — den sender til Acuity. Erstattet MarkedBookingV2 sin pauset-gren,
 * som brukte MRamme og derfor var mørk midt i et lyst nettsted.
 *
 * Når `BOOKING_PUBLIC=true` overtar `MarkedBookingPaperV2`, som allerede er
 * pixel-signert mot `designsystem/paper/fase1/booking.html`. Denne filen er
 * altså mellomtilstanden, ikke den ferdige bookingen.
 *
 * Teksten er beholdt ordrett fra MarkedBookingV2: den er ærlig om at kunden
 * sendes ut av siden, og det skal den fortsette å være.
 */

const STEG = [
  {
    nr: 1,
    Ikon: ListChecks,
    tittel: "Velg økt",
    beskrivelse: "Flex, Performance, Pro eller gruppe — ett trykk.",
  },
  {
    nr: 2,
    Ikon: CalendarDays,
    tittel: "Velg tid",
    beskrivelse:
      "Uke for uke, tid i Europa/Oslo. Tomme dager sier ærlig ifra.",
  },
  {
    nr: 3,
    Ikon: CreditCard,
    tittel: "Bekreft og betal",
    beskrivelse: "Pris og avbestilling synlig før Stripe.",
  },
  {
    nr: 4,
    Ikon: BadgeCheck,
    tittel: "Kvittering",
    beskrivelse: "Bekreftelse på e-post og i kalenderen.",
  },
];

export function MarkedBookingPauset({ acuityUrl }: { acuityUrl: string }) {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mx-auto max-w-xl text-center">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-mk-accent-fg">
            Booking
          </p>
          <h1 className="text-4xl font-semibold sm:text-5xl">Book en økt</h1>
          <p className="mt-6 font-mk-serif text-lg leading-relaxed text-mk-muted">
            Velg tid i kalenderen vår, eller book en uforpliktende samtale
            først. Avbestilling og pris vises før du betaler.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <a
              href={acuityUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-mk-cta px-8 py-3 font-medium text-mk-on-cta transition-colors hover:bg-mk-cta-hover"
            >
              Åpne bookingkalender
            </a>
            <Link
              href="/kontakt"
              className="font-medium underline decoration-mk-hairline underline-offset-4 transition-colors hover:decoration-mk-fg"
            >
              Eller book en samtale først
            </Link>
          </div>

          <p className="mt-8 font-mono text-xs leading-relaxed text-mk-muted">
            Du sendes til vår eksterne booking (akgolfgroup.as.me) for tid og
            betaling. Full HQ-booking med ledighet her på siden er under
            innfasing.
          </p>
        </div>
      </section>

      <section className="border-t border-mk-border bg-mk-soft py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-mk-accent-fg">
              Enkelt og trygt
            </p>
            <h2 className="text-3xl font-semibold sm:text-4xl">Fire steg</h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
            {STEG.map(({ nr, Ikon, tittel, beskrivelse }) => (
              <div
                key={nr}
                className="rounded-2xl border border-mk-border bg-mk-surface p-6"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-mk-accent-soft">
                  <Ikon size={18} className="text-mk-accent-fg" />
                </span>
                <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-mk-muted">
                  Steg {nr}
                </p>
                <h3 className="mt-1 font-semibold">{tittel}</h3>
                <p className="mt-2 font-mk-serif text-sm leading-relaxed text-mk-muted">
                  {beskrivelse}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
