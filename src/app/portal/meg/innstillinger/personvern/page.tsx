/**
 * Samtykker (/portal/meg/innstillinger/personvern) — Precision Athletics PH-25.
 * Én setning per bryter, av/på, ingen mørke mønstre. Eksport og sletting nederst.
 * Loaderne og server-handlingene (helse, deling, eksport, GDPR-forespørsel) er uendret.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentUleste } from "@/lib/portal-booking/uleste";
import { hentSamtykkeStatus } from "@/lib/health/samtykke";
import { HELSE_SAMTYKKE_TEKST, maaHaForesattSamtykke } from "@/lib/health/samtykke-regler";
import { DELING_SAMTYKKE_TEKST } from "@/lib/deling/samtykke-regler";
import { grupperMedEksterneLesereForSpiller, hentDelingsStatus } from "@/lib/deling/samtykke";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Personvern } from "@/components/portal/precision/PH25Abonnement";

export const dynamic = "force-dynamic";
export const metadata = { title: "Samtykker · PlayerHQ" };

export default async function PersonvernPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const samtykke = await hentSamtykkeStatus(user.id);
  const krevesForesatt = maaHaForesattSamtykke(user);

  // T8: delingssamtykke per gruppe med aktive eksterne lesere (Team Norway/WANG).
  const delingGrupper = await grupperMedEksterneLesereForSpiller(user.id);
  const delingStatus = await hentDelingsStatus(user.id, delingGrupper.map((g) => g.id));
  const delingKart = new Map(delingStatus.map((s) => [s.gruppeId, s]));
  const uleste = await hentUleste(user.id);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH25Personvern
        data={{
          helse: {
            wearable: samtykke.wearable,
            manuell: samtykke.manuell,
            coachInnsyn: samtykke.coachInnsyn,
            coachDetalj: samtykke.coachDetalj,
            // Nyeste av de to innsamlings-samtykkene: det er det kvitteringen gjelder.
            sistGittAt:
              [samtykke.wearableGittAt, samtykke.manuellGittAt]
                .filter((d): d is Date => d !== null)
                .sort((a, b) => b.getTime() - a.getTime())[0]
                ?.toISOString() ?? null,
            krevesForesatt,
          },
          helseTekst: HELSE_SAMTYKKE_TEKST,
          delingTekst: { TEST_RESULTATER: DELING_SAMTYKKE_TEKST.TEST_RESULTATER, STATS: DELING_SAMTYKKE_TEKST.STATS },
          delingGrupper: delingGrupper.map((g) => ({
            gruppeId: g.id,
            gruppeNavn: g.name,
            testResultater: delingKart.get(g.id)?.testResultater ?? false,
            stats: delingKart.get(g.id)?.stats ?? false,
          })),
          krevesForesatt: user.requiresGuardianConsent,
        }}
      />
    </PlayerHQSkall>
  );
}
