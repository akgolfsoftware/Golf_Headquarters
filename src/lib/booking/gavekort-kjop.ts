/**
 * Gavekort (bookingplanen steg 7): kjøpet. Stripe Checkout (bare kort og Apple Pay) startes fra
 * siden /gavekort. Gavekortet opprettes først når webhooken melder at betalingen er gjennomført,
 * og koden sendes på e-post. Alt her er idempotent: Stripe leverer «minst én gang».
 */
import "server-only";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import { APP_URL } from "@/lib/app-url";
import { logError } from "@/lib/error-tracking";
import {
  GAVEKORT_GYLDIG_AAR,
  GAVEKORT_MAKS_ORE,
  GAVEKORT_MIN_ORE,
  formaterGavekode,
  gavekortNokkel,
  hashGavekode,
  lagGavekode,
} from "@/lib/booking/gavekort";
import { byggGavekortEpost, byggGavekortKvittering } from "@/lib/email/gavekort-epost";

export const GAVEKORT_METADATA = "gavekort";

/** Beløpet kunden velger må være hele kroner innenfor grensene. */
export function gyldigGavekortBelop(ore: number): boolean {
  return Number.isInteger(ore) && ore % 100 === 0 && ore >= GAVEKORT_MIN_ORE && ore <= GAVEKORT_MAKS_ORE;
}

export function erGavekortSession(session: Stripe.Checkout.Session): boolean {
  return session.metadata?.[GAVEKORT_METADATA] === "1";
}

/**
 * Oppretter gavekortet for en betalt økt (én gang per økt) og sender koden. Kaster ved feil, så
 * webhooken prøver på nytt; da finnes kortet alt, og bare e-posten som mangler sendes.
 */
export async function opprettGavekortFraSession(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== "paid") return;
  const belopOre = Number(session.metadata?.gavekortOre);
  if (session.currency !== "nok" || !gyldigGavekortBelop(belopOre) || session.amount_total !== belopOre) {
    throw new Error("Gavekortbetalingen samsvarer ikke med det som ble bestilt.");
  }
  const kjoperEpost = (session.metadata?.kjoperEpost ?? session.customer_details?.email ?? "").trim().toLowerCase();
  if (!kjoperEpost) throw new Error("Gavekortet mangler kjøperens e-post.");
  const nokkel = gavekortNokkel();
  if (!nokkel) throw new Error("Nøkkel for gavekortkoder mangler (CRON_SECRET eller GIFTCARD_SECRET).");

  const norm = lagGavekode(session.id, nokkel);
  const mottaker = session.metadata?.mottakerEpost?.trim().toLowerCase() || null;
  const utloper = new Date();
  utloper.setFullYear(utloper.getFullYear() + GAVEKORT_GYLDIG_AAR);

  await prisma.giftCard.upsert({
    where: { stripeCheckoutSessionId: session.id },
    create: {
      codeHash: hashGavekode(norm),
      codeEnd: norm.slice(-4),
      initialOre: belopOre,
      balanceOre: belopOre,
      purchaserUserId: session.metadata?.kjoperBrukerId || null,
      purchaserEmail: kjoperEpost,
      purchaserName: session.metadata?.kjoperNavn?.trim() || null,
      recipientEmail: mottaker,
      message: session.metadata?.melding?.trim() || null,
      expiresAt: utloper,
      stripeCheckoutSessionId: session.id,
    },
    update: {},
  });

  // Atomisk krav på e-postsendingen: bare den som setter emailSentAt sender, så en gjentatt
  // levering ikke sender koden to ganger. Feiler sendingen, rulles kravet tilbake og webhooken prøver igjen.
  const krav = await prisma.giftCard.updateMany({
    where: { stripeCheckoutSessionId: session.id, emailSentAt: null },
    data: { emailSentAt: new Date() },
  });
  if (krav.count === 0) return;
  try {
    const kort = await prisma.giftCard.findUniqueOrThrow({ where: { stripeCheckoutSessionId: session.id } });
    const tilAnnen = Boolean(kort.recipientEmail && kort.recipientEmail !== kort.purchaserEmail);
    const mail = byggGavekortEpost({
      appUrl: APP_URL,
      kode: formaterGavekode(norm),
      belopOre,
      utloper: kort.expiresAt,
      fra: kort.purchaserName,
      melding: kort.message,
      tilAnnen,
    });
    const til = kort.recipientEmail ?? kort.purchaserEmail;
    const res = await resendKlient().emails.send({ from: FRA_EPOST, to: til, subject: mail.subject, html: mail.html });
    if (res.error) throw new Error("E-postleverandøren avviste gavekortet.");
    if (tilAnnen) {
      const kvittering = byggGavekortKvittering({ belopOre, mottaker: til });
      await resendKlient().emails.send({ from: FRA_EPOST, to: kort.purchaserEmail, subject: kvittering.subject, html: kvittering.html })
        .catch((error) => logError({ context: "gavekort.kvittering", error, severity: "warn" }));
    }
  } catch (error) {
    await prisma.giftCard.updateMany({ where: { stripeCheckoutSessionId: session.id }, data: { emailSentAt: null } });
    throw error;
  }
}
