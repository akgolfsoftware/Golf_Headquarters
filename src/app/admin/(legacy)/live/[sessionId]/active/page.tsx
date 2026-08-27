import { redirect } from "next/navigation";

type Props = { params: Promise<{ sessionId: string }> };

/**
 * Pensjonert (T9, §5T rad 11 — D-LYS-OG-5T-BESLUTNING.md): duplikat av
 * `/admin/agencyos/live/[sessionId]` (AG-09-flaten), som nå har samme
 * informasjon i Train-lock uten de utgåtte M0–M5-etikettene denne siden
 * viste. Coach-melding-i-sanntid (`_live-melding.tsx`) er IKKE videreført —
 * se docs/natt/T9-DONE.md.
 */
export default async function LegacyLiveActiveRedirect({ params }: Props) {
  const { sessionId } = await params;
  redirect(`/admin/agencyos/live/${sessionId}`);
}
