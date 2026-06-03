/**
 * /portal/meg/abonnement/kort/ny — Administrer betalingskort
 *
 * Kort-administrasjon skjer i Stripe Customer Billing Portal (PCI-DSS). Vi lagrer
 * aldri kortdata. Siden viser ekte abonnement-info og en knapp som åpner Stripe-
 * portalen via POST /api/stripe/portal.
 *
 * Auth-guard + redirect-vakt (krever aktivt abonnement med Stripe-kunde) beholdt.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Lock, Check } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AapneStripePortal } from "./aapne-stripe-portal";

export const dynamic = "force-dynamic";

function formatNesteBelastning(dato: Date | null): string {
  if (!dato) return "—";
  return dato.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function NyttKortPage() {
  const user = await requirePortalUser();

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: { currentPeriodEnd: true, status: true },
  });

  if (!subscription || subscription.status !== "ACTIVE") {
    redirect("/portal/meg/abonnement");
  }

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
          Administrer{" "}
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
          Legg til eller endre betalingskort i Stripes sikre portal. Kortdata
          forlater aldri din enhet, og lagres aldri hos AK Golf.
        </p>
      </header>

      <div className="mt-6 space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <AapneStripePortal />
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-secondary/40 p-3.5">
            <Lock
              className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden
            />
            <p className="text-xs leading-relaxed text-muted-foreground">
              <strong className="text-foreground">Vi lagrer aldri kortdata.</strong>{" "}
              Betalingen håndteres av Stripe — AK Golf får kun et token.
            </p>
          </div>
        </div>

        {/* Neste belastning (ekte data) */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
            Neste belastning
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-2xl font-bold tracking-[-0.02em] text-foreground">
              300 kr
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {formatNesteBelastning(nesteBelastning)}
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            PRO · månedlig · fornyes automatisk. Kanselleres når som helst fra
            abonnement-siden.
          </p>
        </div>

        {/* Sikkerhet */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
            Sikkerhet
          </span>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              "PCI-DSS Level 1 (Stripe)",
              "3-D Secure 2 (Strong Customer Auth)",
              "Kortdata lagres aldri hos AK Golf",
            ].map((s) => (
              <li key={s} className="flex items-center gap-2.5">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
                </span>
                <span className="text-foreground">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
