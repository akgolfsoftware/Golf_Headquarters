/**
 * AU-01 Logg inn i nytt design (utkast-flater/innlogging.html). Google eller e-post og passord.
 * ?next= (satt av proxy) sendes videre etter innlogging, vasket med safeRedirectPath.
 */
import { Innlogging } from "@/components/auth/precision/KontoSkjermer";
import { safeRedirectPath } from "@/lib/security/safe-redirect";

export const metadata = {
  title: "Logg inn · AK Golf HQ",
  description: "Logg inn med Google eller e-post og passord.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return <Innlogging next={next ? safeRedirectPath(next, "/auth/etter-innlogging") : undefined} feilkode={error} />;
}
