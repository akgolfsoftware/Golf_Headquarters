// PH24NyttSymptom — Precision Athletics. Data og handlinger er beholdt. Ikke målt i appen.
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
/**
 * PlayerHQ · Meg · Helse · Legg til symptom (/portal/meg/helse/symptom/ny) — v2.
 * v2-port 17. juli 2026 (Team D4a): MegSymptomNyV2 erstatter wizard.tsx.
 * Auth-guarden er uendret; selve wizarden er client (kaller logSymptom i
 * actions.ts, som er urørt).
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { TilbakeLenke } from "@/components/v2";
import { MegSymptomNyV2 } from "@/components/portal/v2/MegSymptomNyV2";

export default async function NyttSymptomPage() {
  await requirePortalUser({ kreverTilgang: "INGEN" });
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
      <TilbakeLenke href="/portal/meg/helse">Helse</TilbakeLenke>
      <MegSymptomNyV2 />
    </div>
    </PlayerHQSkall>
  );
}
