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
import { LydSamtykkeForm } from "./lyd-samtykke-form";

type Props = {
  params: Promise<{ token: string }>;
};

export const dynamic = "force-dynamic";

function StatusBoks({
  tittel,
  tekst,
}: {
  tittel: string;
  tekst: string;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-xl font-semibold text-foreground">{tittel}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        {tekst}
      </p>
    </div>
  );
}

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
      <StatusBoks
        tittel="Lenken virker ikke"
        tekst="Lenken er ugyldig eller allerede brukt. Be treneren sende ny e-post hvis du fortsatt skal gi samtykke."
      />
    );
  }

  const player = await prisma.user.findUnique({
    where: { id: rad.userId },
    select: { name: true },
  });
  const spillerNavn = player?.name ?? "spilleren";

  if (rad.status === "GITT") {
    return (
      <StatusBoks
        tittel="Allerede registrert"
        tekst={`Samtykke for ${spillerNavn} er allerede gitt. Du trenger ikke gjøre noe mer.`}
      />
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
      <StatusBoks
        tittel="Lenken er utløpt"
        tekst="Be treneren sende en ny e-post med fersk lenke."
      />
    );
  }

  return (
    <LydSamtykkeForm
      token={token}
      spillerNavn={spillerNavn}
      ordlyd={rad.ordlyd}
    />
  );
}
