import { redirect } from "next/navigation";

/**
 * /admin/tester/tildel/[spillerId] → arket «Tildel test» i AG-15 (utkast-agencyos/resten.html,
 * «Bygges fra skjermer som er tegnet»). Arket kaller samme handling (./actions.ts).
 */
export default async function TildelTestRedirect({ params }: { params: Promise<{ spillerId: string }> }) {
  const { spillerId } = await params;
  redirect(`/admin/tester?fane=tildelt&tildel=${encodeURIComponent(spillerId)}`);
}
