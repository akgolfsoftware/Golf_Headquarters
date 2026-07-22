// Offentlig accept-side for forelder-invitasjoner — v2/B (2026-07-22).
// Verifiserer token og rendrer registreringsskjema for den nye forelderen.
// Status + Caps + én CTA ved ugyldig/brukt/utløpt. Skjema-flyt uendret.

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { T } from "@/lib/v2/tokens";
import { VeiviserFlate } from "@/components/auth/onboarding/wizard-chrome";
import { CTAPill, StatusPill, Caps } from "@/components/v2";
import { AksepterForm } from "./form";

const NB = new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function StatusBoks({
  tone,
  children,
}: {
  tone: "feil" | "info";
  children: React.ReactNode;
}) {
  const c = tone === "feil" ? T.down : T.mut;
  return (
    <p
      style={{
        marginTop: 16,
        marginBottom: 0,
        borderRadius: 12,
        border: `1px solid color-mix(in srgb, ${c} 30%, transparent)`,
        background: `color-mix(in srgb, ${c} 10%, transparent)`,
        padding: "14px 16px",
        fontFamily: T.ui,
        fontSize: 13.5,
        lineHeight: 1.55,
        color: tone === "feil" ? T.down : T.fg2,
      }}
    >
      {children}
    </p>
  );
}

function CtaLenke({ href, children }: { href: string; children: string }) {
  return (
    <div style={{ marginTop: 20 }}>
      <Link href={href} style={{ textDecoration: "none" }}>
        <CTAPill icon="arrow-right">{children}</CTAPill>
      </Link>
    </div>
  );
}

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

  const statusPill =
    status === "ok"
      ? { tone: "up" as const, l: "Gyldig invitasjon" }
      : status === "brukt"
        ? { tone: "info" as const, l: "Allerede brukt" }
        : status === "utlopt"
          ? { tone: "warn" as const, l: "Utløpt" }
          : { tone: "down" as const, l: "Ugyldig" };

  return (
    <VeiviserFlate>
      <div style={{ margin: "0 auto", maxWidth: 430, padding: "24px 16px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Caps>AK Golf · Foreldreinvitasjon</Caps>
          <StatusPill tone={statusPill.tone}>{statusPill.l}</StatusPill>
        </div>
        <h1
          style={{
            margin: "10px 0 0",
            fontFamily: T.disp,
            fontSize: 30,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            color: T.fg,
            textWrap: "balance",
          }}
        >
          Bli <em style={{ fontStyle: "italic", fontWeight: 400, color: T.lime }}>forelder</em>{" "}
          i AK Golf
        </h1>

        {status === "ugyldig" ? (
          <>
            <StatusBoks tone="feil">
              Invitasjonen finnes ikke. Be spilleren sende en ny.
            </StatusBoks>
            <CtaLenke href="/auth/login">Gå til innlogging</CtaLenke>
          </>
        ) : null}

        {status === "brukt" ? (
          <>
            <StatusBoks tone="info">
              Invitasjonen er allerede brukt. Logg inn for å fortsette.
            </StatusBoks>
            <CtaLenke href="/auth/login">Gå til innlogging</CtaLenke>
          </>
        ) : null}

        {status === "utlopt" && invitation ? (
          <>
            <StatusBoks tone="feil">
              Invitasjonen utløp {NB.format(invitation.expiresAt)}. Be spilleren
              sende en ny.
            </StatusBoks>
            <CtaLenke href="/auth/login">Gå til innlogging</CtaLenke>
          </>
        ) : null}

        {status === "ok" && invitation ? (
          <>
            <p
              style={{
                marginTop: 14,
                marginBottom: 0,
                fontFamily: T.ui,
                fontSize: 13.5,
                lineHeight: 1.55,
                color: T.mut,
              }}
            >
              <strong style={{ fontWeight: 600, color: T.fg }}>
                {invitation.player.name}
              </strong>{" "}
              har invitert deg som foresatt. Fyll inn opplysningene under for å
              opprette konto.
            </p>
            <div style={{ marginTop: 22 }}>
              <AksepterForm token={token} email={invitation.email} />
            </div>
          </>
        ) : null}
      </div>
    </VeiviserFlate>
  );
}
