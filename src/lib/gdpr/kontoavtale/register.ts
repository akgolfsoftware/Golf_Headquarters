import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { maaHaForesattSamtykke } from "@/lib/auth/minor";
import { frysKontoAvtale, hentGjeldendeKontoAvtale } from "./dokumenter";

const AkseptInput = z.object({
  pakkeVersjon: z.string().min(1).max(80),
  vilkarGodtatt: z.literal(true),
  personvernLest: z.literal(true),
}).strict();

export type KontoAkseptSvar = { ok: true } | { ok: false; feil: string };

/**
 * Kalles bare med aktør-ID fra innlogging, aldri målbruker fra klienten.
 * Egen kontoaksept for PLAYER; foresatt-/skoleflyt er separat og ikke implementert her.
 * Tildeler ingen tilgang og endrer ikke deling, læring eller onboarding-status.
 */
export async function registrerEgenKontoAvtale(aktorId: string, input: unknown): Promise<KontoAkseptSvar> {
  const parsed = AkseptInput.safeParse(input);
  if (!parsed.success) return { ok: false, feil: "Bekreft vilkårene og at personvernerklæringen er lest." };
  const pakke = hentGjeldendeKontoAvtale();
  if (!pakke) return { ok: false, feil: "Kontoavtalen er ikke klar for godkjenning ennå." };
  if (parsed.data.pakkeVersjon !== pakke.versjon) {
    return { ok: false, feil: "Dokumentene er endret. Les gjeldende versjon før du bekrefter." };
  }

  try {
    const snapshot = frysKontoAvtale(pakke);
    return await prisma.$transaction(async tx => {
      // Samordner med vanlig kontosletting og endring av fødselsdato/rolle.
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${aktorId} FOR SHARE`;
      const bruker = await tx.user.findFirst({
        where: { id: aktorId, deletedAt: null, role: "PLAYER" },
        select: { dateOfBirth: true, requiresGuardianConsent: true },
      });
      const [klokke] = await tx.$queryRaw<Array<{ naa: Date }>>`SELECT clock_timestamp() AS naa`;
      if (!bruker || !klokke || maaHaForesattSamtykke(bruker, klokke.naa)) {
        return { ok: false, feil: "Kontoen kan ikke gi egen bekreftelse i denne flyten." };
      }
      // Unik nøkkel + DO NOTHING tåler dobbeltklikk og samtidige nettverksforsøk.
      // Aldri upsert-update: første kvittering og tidspunkt skal bevares.
      await tx.kontoAvtaleAksept.createMany({
        data: [{ userId: aktorId, pakkeVersjon: pakke.versjon, ...snapshot }],
        skipDuplicates: true,
      });
      const kvittering = await tx.kontoAvtaleAksept.findUnique({
        where: { userId_pakkeVersjon: { userId: aktorId, pakkeVersjon: pakke.versjon } },
        select: { dokumentHash: true },
      });
      // En feilaktig gjenbrukt versjon må aldri bli behandlet som den nye teksten.
      if (kvittering?.dokumentHash !== snapshot.dokumentHash) throw Error("Dokumentversjon har annet innhold");
      return { ok: true };
    }, { timeout: 10_000 });
  } catch {
    // Ikke lekk databasefeil, konto-ID eller dokumentinnhold til klient/logg.
    return { ok: false, feil: "Bekreftelsen kunne ikke lagres. Prøv igjen." };
  }
}
