import { permanentRedirect } from "next/navigation";

/**
 * Gammel adresse — ukas TrainingPlanSession-liste (pensjonert modell).
 * Ingen spiller-kontekst tilgjengelig her uten storstilt oppslag, så
 * redirecten går til Plan-hub — som ER "Workbench"-inngangen i AX-01-railen
 * (`AGENCYOS_SKALL_TABS` i src/components/v2/shell.tsx peker "Workbench" på
 * nøyaktig `/admin/plan`; det finnes ingen bar `/admin/workbench`-rute
 * uten en `[playerId]`, så det ville vært en blindvei).
 */
export default function AdminOkterRedirect() {
  permanentRedirect("/admin/plan");
}
