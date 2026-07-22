import { redirect } from "next/navigation";

/** Legacy → moderne live-økt (PlayerHQ B / v2). */
export default async function LegacyRedirect({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  redirect(`/portal/live/${sessionId}`);
}
