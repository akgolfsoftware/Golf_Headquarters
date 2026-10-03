/**
 * /auth/lyd-samtykke/[token]
 *
 * Foresatt mottar e-post med magisk lenke hit. Ingen innlogging.
 * Ordlyden vises i fulltekst; bekreftelse lagrer GITT + FORESATT.
 */

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  erLydSamtykkeTokenGyldig,
  hashLydSamtykkeToken,
} from "@/lib/recording/lyd-samtykke-token";
import { LydSamtykkePrecision, LydSamtykkeStatusVisning } from "@/components/auth/precision/AuSamtykke";

type Props = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

async function finnRad(rawToken: string) {
  const tokenHash = hashLydSamtykkeToken(rawToken);
  const viaHash = await prisma.lydSamtykke.findUnique({
    where: { tokenHash },
  });
  if (viaHash) return viaHash;
  return prisma.lydSamtykke.findUnique({
    where: { token: rawToken },
  });
}

export default async function LydSamtykkeTokenPage({ params }: Props) {
  const { token } = await params;
  if (!token || token.length < 16) notFound();

  const rad = await finnRad(token);

  if (!rad) {
    return (
      <LydSamtykkeStatusVisning status="ugyldig" />
    );
  }

  const player = await prisma.user.findUnique({
    where: { id: rad.userId },
    select: { name: true },
  });
  const spillerNavn = player?.name ?? "spilleren";

  if (rad.status === "GITT") {
    return (
      <LydSamtykkeStatusVisning status="gitt" spillerNavn={spillerNavn} />
    );
  }

  if (
    !erLydSamtykkeTokenGyldig({
      token: rad.token,
      tokenHash: rad.tokenHash,
      tokenExpiresAt: rad.tokenExpiresAt,
      status: rad.status,
    })
  ) {
    return (
      <LydSamtykkeStatusVisning status="utlopt" />
    );
  }

  return (
    <LydSamtykkePrecision
      token={token}
      spillerNavn={spillerNavn}
      ordlyd={rad.ordlyd}
    />
  );
}
