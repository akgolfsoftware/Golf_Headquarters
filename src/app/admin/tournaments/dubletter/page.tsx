import { redirect } from "next/navigation";

/**
 * /admin/tournaments/dubletter → /admin/turnering?fane=dubletter
 *
 * MASTERPLAN 15.6 (beslutning 6.9, «én inngang per funksjon»): dubletter-
 * VERKTØYET flyttet hit fra 15.1 sin Kø-adresse — Kø (/admin/ko?fane=dubletter)
 * viser fortsatt dubletter som sak-type og virker uendret, den deler bare
 * loaderen med denne siden (src/lib/admin/ko/last-dubletter.ts).
 */
export default function DubletterRedirect(): never {
  redirect("/admin/turnering?fane=dubletter");
}
