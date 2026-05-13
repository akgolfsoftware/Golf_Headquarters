// Offentlig accept-side for forelder-invitasjoner.
// Verifiserer token og rendrer registreringsskjema for den nye forelderen.

import { prisma } from "@/lib/prisma";
import { AksepterForm } from "./form";

const NB = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function AksepterInvitasjonPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invitation = await prisma.parentInvitation.findUnique({
    where: { token },
    include: { player: { select: { name: true } } },
  });

  const now = new Date();
  const status: "ok" | "ugyldig" | "brukt" | "utlopt" = !invitation
    ? "ugyldig"
    : invitation.acceptedAt
      ? "brukt"
      : invitation.expiresAt < now
        ? "utlopt"
        : "ok";

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          AK Golf · Foreldreinvitasjon
        </div>
        <h1 className="mt-2 font-display text-4xl">
          Bli <em className="italic">forelder</em> i AK Golf
        </h1>

        {status === "ugyldig" ? (
          <p className="mt-6 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Invitasjonen finnes ikke. Be spilleren sende en ny.
          </p>
        ) : null}

        {status === "brukt" ? (
          <p className="mt-6 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
            Invitasjonen er allerede brukt. Gå til{" "}
            <a href="/auth/login" className="font-semibold text-primary underline">
              innloggingen
            </a>{" "}
            for å logge inn.
          </p>
        ) : null}

        {status === "utlopt" && invitation ? (
          <p className="mt-6 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Invitasjonen utløp {NB.format(invitation.expiresAt)}. Be spilleren sende en ny.
          </p>
        ) : null}

        {status === "ok" && invitation ? (
          <>
            <p className="mt-4 text-sm text-muted-foreground">
              <strong>{invitation.player.name}</strong> har invitert deg som foresatt. Fyll
              inn opplysningene under for å opprette konto.
            </p>
            <div className="mt-6">
              <AksepterForm token={token} email={invitation.email} />
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
