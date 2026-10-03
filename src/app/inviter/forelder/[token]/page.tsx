// Offentlig accept-side for forelder-invitasjoner. AU05Invitasjon.
// Tokenstatus og AksepterForm er uendret.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AksepterForm } from "./form";
import "@/styles/precision-athletics.css";

const NB = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
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

  const statusTekst =
    status === "ok"
      ? "Gyldig invitasjon"
      : status === "brukt"
        ? "Allerede brukt"
        : status === "utlopt"
          ? "Utløpt"
          : "Ugyldig";

  return (
    <div className="pa-root au-ramme" data-design="precision-athletics">
      <div className="au-boks au-boks--bred">
        <Link href="/" className="au-logo">AK Golf HQ</Link>
        <header>
          <p className="au-kicker">{statusTekst}</p>
          <h1>Bli forelder i AK Golf</h1>
        </header>

        {status === "ugyldig" ? (
          <>
            <p className="au-melding" data-tone="feil" role="alert">
              Invitasjonen finnes ikke. Be spilleren sende en ny.
            </p>
            <Link href="/auth/login" className="pa-btn pa-btn--primary">Gå til innlogging</Link>
          </>
        ) : null}

        {status === "brukt" ? (
          <>
            <p className="au-melding" role="status">
              Invitasjonen er allerede brukt. Logg inn for å fortsette.
            </p>
            <Link href="/auth/login" className="pa-btn pa-btn--primary">Gå til innlogging</Link>
          </>
        ) : null}

        {status === "utlopt" && invitation ? (
          <>
            <p className="au-melding" data-tone="feil" role="alert">
              Invitasjonen utløp {NB.format(invitation.expiresAt)}. Be spilleren sende en ny.
            </p>
            <Link href="/auth/login" className="pa-btn pa-btn--primary">Gå til innlogging</Link>
          </>
        ) : null}

        {status === "ok" && invitation ? (
          <>
            <p>
              <strong>{invitation.player.name}</strong> har invitert deg som foresatt. Fyll inn opplysningene under for å opprette konto.
            </p>
            <AksepterForm token={token} email={invitation.email} />
          </>
        ) : null}
      </div>
    </div>
  );
}
