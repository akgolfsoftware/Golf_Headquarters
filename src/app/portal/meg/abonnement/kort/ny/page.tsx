/**
 * /portal/meg/abonnement/kort/ny — Legg til betalingskort
 *
 * Mobil-først (430px) redesign mot athletic-designsystemet. UI er en mockup av
 * Stripe Elements-flyten — selve Stripe-integrasjonen kobles opp i egen runde.
 * Form-state håndteres lokalt i KortForm (client component).
 *
 * Auth-guard + redirect-vakt (krever aktivt abonnement) beholdt uendret.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { KortForm } from "./kort-form";

export const dynamic = "force-dynamic";

export default async function NyttKortPage() {
  const user = await requirePortalUser();

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: { currentPeriodEnd: true, status: true },
  });

  if (!subscription || subscription.status !== "ACTIVE") {
    redirect("/portal/meg/abonnement");
  }

  const navnPaaKortet = user.name ?? "";
  const nesteBelastning = subscription.currentPeriodEnd ?? null;

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-20 sm:px-6">
      <Link
        href="/portal/meg/abonnement"
        className="inline-flex min-h-11 items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
        Abonnement
      </Link>

      <header className="mt-3 space-y-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          PlayerHQ · Meg · Abonnement · Betalingskort
        </span>
        <h1 className="font-display text-[28px] font-bold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[34px]">
          Legg til{" "}
          <em
            className="not-italic"
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontStyle: "italic",
              color: "hsl(var(--primary))",
            }}
          >
            kort
          </em>
        </h1>
        <p className="text-sm text-muted-foreground">
          Sikret av Stripe. Kortdata forlater aldri din enhet.
        </p>
      </header>

      <div className="mt-6">
        <KortForm
          defaultNavn={navnPaaKortet}
          nesteBelastning={nesteBelastning?.toISOString() ?? null}
        />
      </div>
    </div>
  );
}
