import { CheckEmailPA } from "@/components/portal/precision/CheckEmailPA";

/**
 * /auth/check-email — AU-02 steg 3 i Precision Athletics (CheckEmailPA).
 * Statisk venteskjerm etter registrering — ingen form-logikk, samme lenkemål
 * (/auth/signup, /auth/login) som før. ?subscribe= føres videre til signup.
 */
export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribe?: string }>;
}) {
  const { subscribe } = await searchParams;
  return <CheckEmailPA subscribe={subscribe} />;
}
