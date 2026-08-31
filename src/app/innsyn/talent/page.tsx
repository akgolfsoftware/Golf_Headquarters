import { redirect } from "next/navigation";

/**
 * /innsyn/talent → /innsyn/talent/radar (B5, 2026-07-12; flyttet fra
 * /admin/talent 2026-08-31, MASTERPLAN 15.12).
 * Talent-terminalen og radaren viste samme TalentTracking-radar per spiller.
 * Radar er kanonisk: peer-snitt-sammenligning (mer presis enn terminalens
 * stall-snitt-H2H) + akse-for-akse + KPI-remse. Flerspiller-sammenligning
 * bor i /innsyn/talent/sammenligning.
 */
export default function TalentRedirect(): never {
  redirect("/innsyn/talent/radar");
}
