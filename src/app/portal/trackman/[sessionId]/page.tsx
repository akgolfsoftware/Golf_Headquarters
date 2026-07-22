import { redirect } from "next/navigation";

type Props = { params: Promise<{ sessionId: string }> };

/** Legacy session-URL → kanonisk TrackMan-session. */
export default async function TrackManSessionLegacyRedirect({ params }: Props) {
  const { sessionId } = await params;
  redirect(`/portal/mal/trackman/${sessionId}`);
}
