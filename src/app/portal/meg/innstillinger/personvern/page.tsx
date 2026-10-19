// PH25Personvern — Precision Athletics (PH-25, meg.html). Data og server-handlinger er beholdt.
/**
 * /portal/meg/innstillinger/personvern — Samtykker.
 * Historisk Train-lock-tegning (ikke fasit): designsystem/train-lock/PH-18 Meg samtykke.dc.html
 * - D-55: kortet «Del testresultatene med WANG og Team Norway» for WANG-elever vises over frivillig deling.
 * Én setning per bryter, av/på, ingen mørke mønstre. Eksport og sletting til høyre (nederst på mobil).
 */
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentSamtykkeStatus } from "@/lib/health/samtykke";
import { HELSE_SAMTYKKE_TEKST, maaHaForesattSamtykke } from "@/lib/health/samtykke-regler";
import { DELING_SAMTYKKE_TEKST } from "@/lib/deling/samtykke-regler";
import {
  grupperMedEksterneLesereForSpiller,
  hentDelingsStatus,
} from "@/lib/deling/samtykke";
import { hentWangTestdeling } from "@/lib/portal-tester/wang-resultat-tilgang";
import { WangTestforesporsel } from "@/components/portal/precision/WangTestforesporsel";
import { PH25Personvern } from "@/components/portal/precision/PH25Personvern";

export const dynamic = "force-dynamic";

export default async function PersonvernPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });

  const samtykke = await hentSamtykkeStatus(user.id);
  const krevesForesatt = maaHaForesattSamtykke(user);

  // T8: delingssamtykke per gruppe med aktive eksterne lesere (Team Norway/WANG).
  const delingGrupper = await grupperMedEksterneLesereForSpiller(user.id);
  const wangTestdeling = await hentWangTestdeling(user.id);
  const wangPlandeling = await hentWangTestdeling(user.id, "TRENINGSPLAN");
  const delingStatus = await hentDelingsStatus(
    user.id,
    delingGrupper.map((g) => g.id),
  );
  const delingKart = new Map(delingStatus.map((s) => [s.gruppeId, s]));

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH25Personvern
        data={{
          helse: {
            wearable: samtykke.wearable,
            manuell: samtykke.manuell,
            coachInnsyn: samtykke.coachInnsyn,
            coachDetalj: samtykke.coachDetalj,
            // Nyeste av de to innsamlings-samtykkene — det er det kvitteringen
            // gjelder («samtykke gitt <dato>»).
            sistGittAt:
              [samtykke.wearableGittAt, samtykke.manuellGittAt]
                .filter((d): d is Date => d !== null)
                .sort((a, b) => b.getTime() - a.getTime())[0]
                ?.toISOString() ?? null,
            krevesForesatt,
          },
          grupper: delingGrupper.map((g) => ({
            gruppeId: g.id,
            gruppeNavn: g.name,
            testResultater: delingKart.get(g.id)?.testResultater ?? false,
            stats: delingKart.get(g.id)?.stats ?? false,
          })),
          delingKrevesForesatt: user.requiresGuardianConsent,
          tekst: {
            helse: HELSE_SAMTYKKE_TEKST,
            deling: {
              TEST_RESULTATER: DELING_SAMTYKKE_TEKST.TEST_RESULTATER,
              STATS: DELING_SAMTYKKE_TEKST.STATS,
            },
          },
        }}
        ekstra={
          wangTestdeling.length + wangPlandeling.length > 0 ? (
            <>
              {wangTestdeling.map((d) => (
                <WangTestforesporsel key={d.gruppeId} {...d} modus={{ type: "spiller" }} />
              ))}
              {wangPlandeling.map((d) => (
                <WangTestforesporsel key={`plan-${d.gruppeId}`} {...d} modus={{ type: "spiller" }} omfang="TRENINGSPLAN" />
              ))}
            </>
          ) : undefined
        }
      />
    </PlayerHQSkall>
  );
}
