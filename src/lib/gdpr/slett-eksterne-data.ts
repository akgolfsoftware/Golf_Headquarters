/**
 * Ekstern sletting ved kontosletting (GDPR art. 17).
 *
 * `anonymiserBruker` vasker Prisma-radene, men persondata lever også UTENFOR
 * Postgres: Supabase Auth (auth.users), Supabase Storage (avatar, swing-videoer,
 * opptak), Stripe (kunde/abonnement) og gjeste-felt på egne bookinger. Denne
 * modulen rydder de kildene.
 *
 * Prinsipper:
 *  - ALT er best-effort og fanget individuelt. En feil mot Stripe skal aldri
 *    hindre at Supabase-brukeren slettes, og omvendt. Anonymiseringen av
 *    Prisma-dataene (som er den juridisk viktigste delen) har allerede skjedd
 *    før denne kalles.
 *  - Storage-stier hentes fra DB-rader (kjente stier), ikke gjettes.
 *  - Idempotent: å slette en allerede slettet Stripe-kunde / Supabase-bruker
 *    fanges og telles ikke som feil som velter resten.
 *  - Supabase Auth-brukeren slettes SIST — den er identitetsankeret.
 */
import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { stripeKlient } from "@/lib/stripe";
import { logError } from "@/lib/error-tracking";

export type EksternSlettingResultat = {
  authSlettet: boolean;
  stripeKundeSlettet: boolean;
  storageFilerFjernet: number;
  bookingerGjestevasket: number;
  feil: string[];
};

export async function slettEksterneBrukerdata(
  userId: string,
): Promise<EksternSlettingResultat> {
  const feil: string[] = [];
  let storageFilerFjernet = 0;
  let authSlettet = false;
  let stripeKundeSlettet = false;
  let bookingerGjestevasket = 0;

  const bruker = await prisma.user.findUnique({
    where: { id: userId },
    select: { authId: true },
  });

  const sb = trySupabaseAdmin(feil);

  // ── 1. Storage: avatar (kjent sti users/<id>.<ext> i bucket "avatars") ──
  if (sb) {
    try {
      const { data } = await sb.storage
        .from("avatars")
        .remove([
          `users/${userId}.jpg`,
          `users/${userId}.png`,
          `users/${userId}.webp`,
        ]);
      storageFilerFjernet += data?.length ?? 0;
    } catch (err) {
      feil.push(`avatar: ${meld(err)}`);
    }
  }

  // ── 2. Storage: swing-videoer (sti fra DB) ──
  if (sb) {
    try {
      const videoer = await prisma.playerSwingVideo.findMany({
        where: { userId },
        select: { storagePath: true, videoUrl: true },
      });
      const stier = videoer
        .map((v) => v.storagePath ?? v.videoUrl)
        .filter((s): s is string => Boolean(s));
      if (stier.length) {
        const { data } = await sb.storage
          .from("player-swing-videos")
          .remove(stier);
        storageFilerFjernet += data?.length ?? 0;
      }
    } catch (err) {
      feil.push(`swing-videoer: ${meld(err)}`);
    }
  }

  // ── 3. Storage: opptak (audio) + tøm transkript/analyse (mest PII-tunge) ──
  if (sb) {
    try {
      const opptak = await prisma.sessionRecording.findMany({
        where: { playerId: userId, audioUrl: { not: null } },
        select: { id: true, audioUrl: true },
      });
      const stier = opptak
        .map((o) => o.audioUrl)
        .filter((s): s is string => Boolean(s));
      if (stier.length) {
        const { data } = await sb.storage
          .from("coaching-recordings")
          .remove(stier);
        storageFilerFjernet += data?.length ?? 0;
      }
      if (opptak.length) {
        // Transkript + AI-analyse er personopplysninger og skal ikke overleve
        // en full kontosletting (til forskjell fra retention-cronen, som med
        // vilje beholder transkriptet en periode).
        await prisma.sessionRecording.updateMany({
          where: { playerId: userId },
          data: {
            audioUrl: null,
            transcript: null,
            aiAnalysis: Prisma.DbNull,
          },
        });
      }
    } catch (err) {
      feil.push(`opptak: ${meld(err)}`);
    }
  }

  // ── 4. Gjeste-felt på egne bookinger (Prisma) ──
  try {
    const res = await prisma.booking.updateMany({
      where: { userId },
      data: { guestName: null, guestEmail: null, guestPhone: null },
    });
    bookingerGjestevasket = res.count;
  } catch (err) {
    feil.push(`booking-gjestevask: ${meld(err)}`);
  }

  // ── 5. Stripe: avslutt abonnement + slett kunde ──
  try {
    const sub = await prisma.subscription.findUnique({
      where: { userId },
      select: { stripeCustomerId: true, stripeSubscriptionId: true },
    });
    if (sub?.stripeCustomerId) {
      const stripe = stripeKlient();
      // Å slette kunden avslutter alle abonnementene automatisk, men vi
      // kansellerer eksplisitt først for tydelighet i Stripe-loggen.
      if (sub.stripeSubscriptionId) {
        await stripe.subscriptions
          .cancel(sub.stripeSubscriptionId)
          .catch(() => {
            /* allerede kansellert / ukjent — kunde-slett håndterer resten */
          });
      }
      await stripe.customers.del(sub.stripeCustomerId);
      stripeKundeSlettet = true;
    }
  } catch (err) {
    feil.push(`stripe: ${meld(err)}`);
  }

  // ── 6. Supabase Auth-bruker (sist — identitetsankeret) ──
  if (sb && bruker?.authId) {
    try {
      const { error } = await sb.auth.admin.deleteUser(bruker.authId);
      // "User not found" = allerede slettet → idempotent, ikke en ekte feil.
      if (error && !/not\s*found/i.test(error.message)) {
        feil.push(`auth: ${error.message}`);
      } else {
        authSlettet = true;
      }
    } catch (err) {
      feil.push(`auth: ${meld(err)}`);
    }
  }

  if (feil.length) {
    await logError({
      context: "gdpr.slett-eksterne-data",
      error: new Error(feil.join(" | ")),
      userId,
      severity: "warn",
    }).catch(() => {});
  }

  return {
    authSlettet,
    stripeKundeSlettet,
    storageFilerFjernet,
    bookingerGjestevasket,
    feil,
  };
}

function meld(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function trySupabaseAdmin(feil: string[]): ReturnType<typeof supabaseAdmin> | null {
  try {
    return supabaseAdmin();
  } catch (err) {
    feil.push(`supabase-admin: ${meld(err)}`);
    return null;
  }
}
