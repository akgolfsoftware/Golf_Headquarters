/**
 * /booking/deltaker/[token] — deltaker 2 i en duo-time melder seg av.
 * Bare påmeldingen til deltaker 2 fjernes; timen og betalingen tilhører den som booket.
 */
import type { Metadata } from "next";
import { hentDeltaker2Booking } from "@/lib/booking/deltaker2-avmelding";
import { MeldAvKnapp } from "./MeldAvKnapp";
import { meldAvDeltaker2 } from "./actions";

export const metadata: Metadata = {
  title: "Meld deg av timen · AK Golf",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Props = { params: Promise<{ token: string }> };

const nb = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleString("nb-NO", { ...o, timeZone: "UTC" });

export default async function Deltaker2Side({ params }: Props) {
  const { token } = await params;
  const oppslag = await hentDeltaker2Booking(token);
  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "48px 16px", minWidth: 0 }}>
      {!oppslag.ok ? (
        <>
          <h1>{oppslag.grunn === "allerede" ? "Du er meldt av" : "Lenken virker ikke"}</h1>
          <p>
            {oppslag.grunn === "allerede"
              ? "Du står ikke lenger på denne timen."
              : "Lenken er ugyldig eller utløpt. Skriv til post@akgolf.no hvis du trenger hjelp."}
          </p>
        </>
      ) : (
        <>
          <h1>Meld deg av timen</h1>
          <p>
            {oppslag.booking.tjeneste}, {nb(oppslag.booking.startAt, { weekday: "long", day: "numeric", month: "long" })} kl.{" "}
            {nb(oppslag.booking.startAt, { hour: "2-digit", minute: "2-digit" })} på {oppslag.booking.sted}.
          </p>
          <p>Du melder bare deg selv av. Timen består for den som booket, og betalingen blir ikke endret. Vil du endre eller avbestille hele timen, må den som booket gjøre det.</p>
          <MeldAvKnapp meldAv={meldAvDeltaker2.bind(null, token)} />
        </>
      )}
    </main>
  );
}
