/**
 * PlayerHQ · Meg · Helse · Legg til symptom (/portal/meg/helse/symptom/ny) — v2.
 * v2-port 17. juli 2026 (Team D4a): MegSymptomNyV2 erstatter wizard.tsx.
 * Auth-guarden er uendret; selve wizarden er client (kaller logSymptom i
 * actions.ts, som er urørt).
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { MegSymptomNyV2 } from "@/components/portal/v2/MegSymptomNyV2";

export default async function NyttSymptomPage() {
  const user = await requirePortalUser();
  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg/helse">Helse</TilbakeLenke>
      <MegSymptomNyV2 />
    </V2Shell>
  );
}
