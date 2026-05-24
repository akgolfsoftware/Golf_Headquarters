/**
 * /auth/guardian-consent/[token]
 *
 * GDPR art. 8 (P17) — foreldresamtykke for mindreårig spiller.
 * Forelder mottar e-post med signing-link, klikker → kommer hit.
 * Bekrefter samtykke → spiller-konto aktiveres + ParentRelation opprettes.
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
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
      {/* Header */}
      <header className="mb-8 text-center">
        <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-accent">
          <Shield className="h-7 w-7" strokeWidth={1.75} />
        </span>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          AK GOLF · FORELDRESAMTYKKE
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold leading-tight tracking-tight md:text-4xl">
          Bekreft{" "}
          <em className="font-display italic font-normal text-primary">
            samtykke
          </em>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          For at <strong className="text-foreground">{invitation.player.name}</strong>{" "}
          {playerAge !== null ? `(${playerAge} år)` : ""} skal kunne bruke AK Golf
        </p>
      </header>

      {/* Status-håndtering */}
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

      {/* Info */}
      <section className="mt-10 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
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
  );
}

function ExpiredCard({ email }: { email: string }) {
  return (
    <div className="rounded-2xl border border-warn/30 bg-warn/5 p-6 text-center">
      <AlertTriangle
        className="mx-auto h-8 w-8 text-warn"
        strokeWidth={1.75}
        style={{ color: "#B8852A" }}
      />
      <h2 className="font-display mt-3 text-lg font-semibold">
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
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
      <Check className="mx-auto h-8 w-8 text-primary" strokeWidth={1.75} />
      <h2 className="font-display mt-3 text-lg font-semibold">
        Samtykke allerede gitt
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Du har allerede bekreftet samtykke for{" "}
        <strong className="text-foreground">{playerName}</strong>.
      </p>
      <Link
        href="/forelder"
        className="font-display mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold text-primary-foreground hover:opacity-90"
      >
        Gå til foreldreportal
      </Link>
    </div>
  );
}
