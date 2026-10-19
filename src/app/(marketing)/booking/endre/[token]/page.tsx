/**
 * /booking/endre/[token] — BK-04: gjest uten konto flytter eller avbestiller
 * (bookingplanen 15.10 steg 5). Lenken kommer i bekreftelsen og påminnelsen.
 * Tider i basen er Oslo-veggklokke, derfor formateres de uten tidssone-konvertering.
 */
import type { Metadata } from "next";
import { cancelOutcome, cancellationDeadline, rescheduleOutcome } from "@/lib/booking/policy";
import { gjestLedigeTider, hentGjestBooking } from "@/lib/booking/gjest-endring";
import { fraNaivVeggklokke } from "@/lib/google-calendar-tid";
import { BK04GjestEndre, type BK04Detaljer } from "@/components/marketing/precision/BK04GjestEndre";
import { gjestAvbestill, gjestFlytt } from "./actions";

export const metadata: Metadata = {
  title: "Endre eller avbestill · AK Golf",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Props = { params: Promise<{ token: string }> };

const nb = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleString("nb-NO", o);
const kl = (d: Date) => nb(d, { hour: "2-digit", minute: "2-digit" });

export default async function GjestEndre({ params }: Props) {
  const { token } = await params;
  const oppslag = await hentGjestBooking(token);
  if (!oppslag.ok) return <BK04GjestEndre tilstand={oppslag.grunn} />;

  const { booking: b, actor, snapshot } = oppslag;
  const frist = cancellationDeadline(b.startAt);
  const avbestilling = cancelOutcome(snapshot, actor);
  const detaljer: BK04Detaljer = {
    ref: `#${b.id.slice(-8)}`,
    tjeneste: `${b.serviceType.name} ${b.serviceType.durationMin} min`,
    tid: `${nb(b.startAt, { weekday: "long", day: "numeric", month: "long" })} · ${kl(b.startAt)}–${kl(b.endAt)}`,
    sted: b.location.name,
    coach: b.coach?.name ?? null,
    fristTekst: `GRATIS ENDRING OG AVBESTILLING TIL ${nb(frist, { weekday: "long", day: "2-digit", month: "2-digit" }).toUpperCase()} KL. ${kl(frist)}`,
    kanFlytte: rescheduleOutcome(snapshot, actor).allowed,
    avbestillTekst: avbestilling.refundStripe
      ? "Avbestiller du nå, får du pengene tilbake til kortet, vanligvis innen 5–10 virkedager."
      : avbestilling.lateCancelNoRefund && b.priceOre > 0
        ? "Det er 24 timer eller mindre til timen. Du kan avbestille, men betalingen refunderes ikke."
        : "Timen blir avbestilt, og tiden blir ledig for andre.",
  };
  if (b.status === "CANCELLED") return <BK04GjestEndre tilstand="avbestilt" detaljer={detaljer} />;

  const dager = detaljer.kanFlytte ? await gjestLedigeTider(b) : [];
  return (
    <BK04GjestEndre
      tilstand="data"
      detaljer={detaljer}
      dager={dager.map(tider => {
        const d = tider[0];
        return d
          ? { navn: nb(d, { weekday: "long", day: "numeric", month: "long" }), kort: nb(d, { weekday: "short", day: "numeric", month: "numeric" }).replace(".", ""), tider: tider.map(t => ({ kl: kl(t), startIso: fraNaivVeggklokke(t) })) }
          : null;
      }).filter((x): x is NonNullable<typeof x> => x !== null)}
      flytt={gjestFlytt.bind(null, token)}
      avbestill={gjestAvbestill.bind(null, token)}
    />
  );
}
