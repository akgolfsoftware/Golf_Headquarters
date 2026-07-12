import { redirect } from "next/navigation";

/**
 * /admin/talent → /admin/talent/radar (B5, 2026-07-12).
 * Talent-terminalen og radaren viste samme TalentTracking-radar per spiller.
 * Radar er kanonisk: peer-snitt-sammenligning (mer presis enn terminalens
 * stall-snitt-H2H) + akse-for-akse + KPI-remse. Flerspiller-sammenligning
 * bor i /admin/talent/sammenligning.
 */
export default function TalentRedirect(): never {
  redirect("/admin/talent/radar");
}
