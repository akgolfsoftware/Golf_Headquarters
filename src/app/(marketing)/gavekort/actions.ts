"use server";

/**
 * Gavekort (bookingplanen steg 7): kjøp. Starter Stripe Checkout (bare kort og Apple Pay).
 * Gavekortet opprettes først når webhooken melder at betalingen er gjennomført
 * (`src/lib/booking/gavekort-kjop.ts`), og koden sendes på e-post.
 */
import { headers } from "next/headers";
import { z } from "zod";
import { stripeKlient } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { kanBrukeInnebygdBooking } from "@/lib/booking/offentlig-booking";
import { GAVEKORT_METADATA, gyldigGavekortBelop } from "@/lib/booking/gavekort-kjop";
import { rateLimit } from "@/lib/rate-limit";
import { APP_URL } from "@/lib/app-url";
import { logError } from "@/lib/error-tracking";
import { audit } from "@/lib/audit";
import { email, nonEmpty } from "@/lib/validation/schemas";

const Schema = z.object({
  belopKr: z.number().int(),
  navn: nonEmpty(200),
  epost: email,
  mottakerEpost: z.string().trim().max(254).optional(),
  melding: z.string().trim().max(300).optional(),
});

export type GavekortKjopInput = z.input<typeof Schema>;
export type GavekortKjopResultat = { ok: true; url: string } | { ok: false; error: string };

export async function startGavekortKjop(input: GavekortKjopInput): Promise<GavekortKjopResultat> {
  try {
    if (!(await kanBrukeInnebygdBooking())) {
      return { ok: false, error: "Kjøp av gavekort er ikke åpnet ennå." };
    }
    const h = await headers();
    const ip = h.get("x-vercel-forwarded-for") ?? h.get("x-real-ip") ?? "unknown";
    const rl = await rateLimit({ key: `gavekort-kjop:${ip}`, max: 5, windowMs: 60_000 });
    if (!rl.ok) return { ok: false, error: "For mange forsøk. Vent litt og prøv igjen." };

    const p = Schema.safeParse(input);
    if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Ugyldig input" };
    const d = p.data;
    const belopOre = d.belopKr * 100;
    if (!gyldigGavekortBelop(belopOre)) return { ok: false, error: "Velg et beløp mellom 500 og 10 000 kroner." };
    const mottaker = d.mottakerEpost?.toLowerCase() || null;
    if (mottaker && !email.safeParse(mottaker).success) return { ok: false, error: "Mottakerens e-post er ugyldig." };

    const user = await getCurrentUser();
    const kjoperEpost = d.epost.trim().toLowerCase();
    const session = await stripeKlient().checkout.sessions.create({
      mode: "payment",
      // Bare kort (Apple Pay vises som kortlommebok), jf. beslutninger §INNLOGGING BARE MED GOOGLE OG PASSORD.
      payment_method_types: ["card"],
      customer_email: kjoperEpost,
      line_items: [{
        quantity: 1,
        price_data: { currency: "nok", unit_amount: belopOre, product_data: { name: "Gavekort · AK Golf Academy", description: "Gjelder alle tjenester og alle coacher" } },
      }],
      metadata: {
        [GAVEKORT_METADATA]: "1",
        gavekortOre: String(belopOre),
        kjoperEpost,
        kjoperNavn: d.navn.trim(),
        ...(user ? { kjoperBrukerId: user.id } : {}),
        ...(mottaker ? { mottakerEpost: mottaker } : {}),
        ...(d.melding ? { melding: d.melding } : {}),
      },
      success_url: `${APP_URL}/gavekort/takk`,
      cancel_url: `${APP_URL}/gavekort`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });
    if (!session.url) throw new Error("Stripe ga ingen betalingsside.");
    await audit({ actorId: user?.id ?? null, action: "gavekort.checkout_started", target: `StripeSession:${session.id}`, metadata: { belopOre } })
      .catch((error) => logError({ context: "gavekort.checkout-audit", error }).catch(() => undefined));
    return { ok: true, url: session.url };
  } catch (error) {
    await logError({ context: "gavekort.startKjop", error });
    return { ok: false, error: "Betalingssiden kunne ikke åpnes. Ingenting er belastet. Prøv igjen." };
  }
}
