import { CheckEmailV2 } from "@/components/portal/v2/CheckEmailV2";

/**
 * /auth/check-email — v2-redesign (2026-07-10): CheckEmailV2 (retning C
 * «Presis») erstatter den gamle terminal-lys-fasiten. Statisk venteskjerm
 * etter registrering — ingen form-logikk, samme lenkemål (/auth/signup,
 * /auth/login) og samme copy som før.
 */
export default function CheckEmailPage() {
  return <CheckEmailV2 />;
}
