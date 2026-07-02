import { redirect } from "next/navigation";

/**
 * Konsolidert 2026-06-25 (IA-rydding B6).
 *
 * `portal/trackman/[sessionId]` var en redundant alternativ-shell for den
 * kanoniske TrackMan-detaljen `portal/mal/trackman/[id]` — IDENTISK datakilde
 * (`prisma.trackManSession.findUnique({ where: { id } })`, samme nøkkel) og
 * ingen knapp i appen pekte hit. Vi sender til kanon i stedet for å vedlikeholde
 * to like skjermer. Reversibelt via git om Workbench senere skal ha en egen
 * uten-Mål-kontekst-visning.
 */
export default async function TrackManSessionRedirect({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  redirect(`/portal/mal/trackman/${sessionId}`);
}
