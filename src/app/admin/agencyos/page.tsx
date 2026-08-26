/**
 * AgencyOS Cockpit — Train-lock (T2, 26.08.2026). Egen top-level route-group
 * (v2preview) som IKKE arver PortalShell/AdminShell — kun root-layout — så
 * V2Shell leverer all chrome (rail/dock) i mørk v2-scope.
 *
 * Fasit: AG-01 Cockpit(+lys), AG-02 Cockpit Mac, AG-14 tom, AG-15 feil.
 * Erstatter KonsollChat (Caddie-tråd) — AG-01 har verken composer eller
 * chat-feed, kun Nå · live / Kø / neste økt. Se TrainLockCockpit.tsx-hodet
 * for hva som falt bort i porten.
 *
 * Auth + data er identisk med den ekte /admin/agencyos-siden: samme
 * requirePortalUser-guard (ADMIN/COACH) og samme loadDailyBrief-loader.
 * innboks/fokus henger med KUN som telleverk til AI-dispatch-køen —
 * innholdet deres vises ikke her (Innboks/Stall er T3/T4-scope).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadDailyBrief } from "@/lib/agencyos/daily-brief-data";
import { loadInnboksSammendrag } from "@/lib/innboks/data";
import { loadFokusSpillere } from "@/lib/agencyos/fokus-spillere";
import { loadAiDispatch } from "@/lib/agencyos/ai-dispatch-data";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AgencyCockpitTrainLock } from "@/components/admin/cockpit/TrainLockCockpit";

export const dynamic = "force-dynamic";

export default async function V2CockpitPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const [data, innboks, fokus] = await Promise.all([
    loadDailyBrief({ id: user.id, name: user.name, avatarUrl: user.avatarUrl, role: user.role }),
    loadInnboksSammendrag(),
    loadFokusSpillere({ id: user.id, role: user.role }),
  ]);

  const aiDispatch = await loadAiDispatch({
    id: user.id,
    role: user.role,
    innboksNye: innboks.antallNye,
    fokusSpillere: fokus.forslag.length + fokus.pinnet.length,
  });

  // Klokke + dag formateres server-side i Oslo-tid: Vercel kjører UTC, så en
  // klient-beregnet klokke ville gitt hydreringsavvik (gotchas §Tidssone).
  const naa = new Date();
  const dagRaa = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(naa);
  const dayLabel = dagRaa.charAt(0).toUpperCase() + dagRaa.slice(1);
  const klokke = new Intl.DateTimeFormat("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  }).format(naa);

  return (
    <V2Shell bredde="full" hoyde="skjerm" aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AgencyCockpitTrainLock data={data} aiDispatch={aiDispatch} dayLabel={dayLabel} klokke={klokke} />
    </V2Shell>
  );
}
