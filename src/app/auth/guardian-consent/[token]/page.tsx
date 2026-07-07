/**
 * /auth/guardian-consent/[token]
 *
 * GDPR art. 8 (P17) — foreldresamtykke for mindreårig spiller.
 * Forelder mottar e-post med signing-link, klikker → kommer hit.
 * Bekrefter samtykke → spiller-konto aktiveres + ParentRelation opprettes.
 *
 * Chrome = auth-kanonen (login/signup): mørk terminal-flate + grid,
 * «ak»-lettermerke, hero, kort. `.dark` flipper tokenene. Logikk uendret.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { Shield, Check, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { calculateAge } from "@/lib/auth/minor";
import { GuardianConsentForm } from "./guardian-consent-form";

type Props = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

export default async function GuardianConsentPage({ params }: Props) {
  const { token } = await params;

  const invitation = await prisma.parentInvitation.findUnique({
    where: { token },
    include: {
      player: {
        select: {
          id: true,
          name: true,
          email: true,
          dateOfBirth: true,
          requiresGuardianConsent: true,
          guardianConsentGivenAt: true,
        },
      },
    },
  });

  if (!invitation) notFound();

  // Sjekk om utløpt
  const expired = invitation.expiresAt < new Date();
  // Sjekk om allerede akseptert
  const alreadyAccepted = invitation.acceptedAt !== null;
  const alreadyConsented =
    invitation.player.guardianConsentGivenAt !== null;

  const playerAge = calculateAge(invitation.player.dateOfBirth);

  return (
    <main
      className="dark relative flex min-h-svh items-center justify-center overflow-hidden px-5 py-12"
      style={{ background: "linear-gradient(160deg, #0A1410, #07100C)" }}
    >
      {/* Svakt terminal-grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(var(--t-line-soft,rgba(180,225,195,.035)) 1px,transparent 1px),linear-gradient(90deg,var(--t-line-soft,rgba(180,225,195,.035)) 1px,transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />
      <div className="relative z-10 flex w-full max-w-[480px] flex-col items-center gap-7">
        {/* «ak»-lettermerke */}
        <div className="font-display text-[40px] font-bold leading-none tracking-[-0.045em] text-accent">
          ak
        </div>

        {/* Hero */}
        <header className="text-center">
          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-accent">
            <Shield className="h-7 w-7" strokeWidth={1.75} aria-hidden />
          </span>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-[var(--t-fg-2,#9DB0A4)]">
            AK GOLF · FORELDRESAMTYKKE
          </p>
          <h1 className="mt-2 font-display text-[26px] font-bold leading-tight tracking-[-0.02em] text-[var(--t-fg,#EAF2EC)]">
            Bekreft{" "}
            <em className="font-medium italic text-accent">samtykke</em>
          </h1>
          <p className="mt-2 text-[13.5px] text-[var(--t-fg-2,#9DB0A4)]">
            For at{" "}
            <strong className="font-semibold text-[var(--t-fg,#EAF2EC)]">
              {invitation.player.name}
            </strong>{" "}
            {playerAge !== null ? `(${playerAge} år)` : ""} skal kunne bruke AK
            Golf
          </p>
        </header>

        {/* Status-håndtering */}
        <div className="w-full">
          {expired ? (
            <ExpiredCard email={invitation.email} />
          ) : alreadyAccepted && alreadyConsented ? (
            <SuccessCard playerName={invitation.player.name} />
          ) : (
            <GuardianConsentForm
              token={token}
              playerName={invitation.player.name}
              playerEmail={invitation.player.email}
              guardianEmail={invitation.email}
              playerAge={playerAge}
            />
          )}
        </div>

        {/* Info */}
        <section className="w-full rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <h2 className="font-display mb-2 text-sm font-semibold text-foreground">
          Hva betyr dette samtykket?
        </h2>
        <ul className="space-y-2">
          <li>
            <strong className="text-foreground">GDPR artikkel 8:</strong> Norske
            barn under 16 år trenger foreldresamtykke før de kan dele
            persondata med en tjeneste.
          </li>
          <li>
            <strong className="text-foreground">Du kan trekke samtykket</strong>{" "}
            når som helst ved å kontakte oss på{" "}
            <a
              href="mailto:post@akgolf.no"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              post@akgolf.no
            </a>
            .
          </li>
          <li>
            <strong className="text-foreground">Du får tilgang</strong> til en
            foreldreportal som lar deg følge barnets utvikling, fakturaer og
            kommunikasjon med coach.
          </li>
        </ul>
        <p className="mt-4 text-xs">
          Mer info i{" "}
          <Link
            href="/personvern"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            personvernerklæringen
          </Link>{" "}
          og{" "}
          <Link
            href="/vilkar"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            vilkårene
          </Link>
          .
        </p>
      </section>
      </div>
    </main>
  );
}

function ExpiredCard({ email }: { email: string }) {
  return (
    <div className="rounded-2xl border border-warning/30 bg-warning/10 p-6 text-center">
      <AlertTriangle
        className="mx-auto h-8 w-8 text-warning"
        strokeWidth={1.75}
        aria-hidden
      />
      <h2 className="font-display mt-2 text-lg font-semibold text-foreground">
        Invitasjonen er utløpt
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Lenken er ikke lenger gyldig. Be spilleren sende deg en ny invitasjon
        til <strong className="text-foreground">{email}</strong>.
      </p>
    </div>
  );
}

function SuccessCard({ playerName }: { playerName: string }) {
  return (
    <div className="rounded-2xl border border-success/30 bg-success/10 p-6 text-center">
      <Check
        className="mx-auto h-8 w-8 text-success"
        strokeWidth={1.75}
        aria-hidden
      />
      <h2 className="font-display mt-2 text-lg font-semibold text-foreground">
        Samtykke allerede gitt
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Du har allerede bekreftet samtykke for{" "}
        <strong className="text-foreground">{playerName}</strong>.
      </p>
      <Link
        href="/forelder"
        className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-[13px] font-mono text-[12px] font-bold uppercase tracking-[0.10em] text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Gå til foreldreportal
      </Link>
    </div>
  );
}
