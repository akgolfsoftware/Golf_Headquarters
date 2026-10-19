/**
 * Datakontrakten for E-postmaler (Oppsett › Maler). Flyttet hit fra
 * components/admin/v2/AdminEmailV2 19.10.2026.
 */

export interface AdminEmailV2Template {
  id: string;
  slug: string;
  name: string;
  subject: string;
  body: string;
  active: boolean;
  /** slug-prefiks (heuristikk) — gruppe-etikett. */
  gruppe: string;
  /** formatert sist-endret (nb-NO). */
  sistEndret: string;
  /** formatert opprettet (nb-NO). */
  opprettet: string;
}
export interface AdminEmailV2Data {
  total: number;
  aktive: number;
  /** tilgjengelige gruppe-filtre (kun de med maler). */
  grupper: string[];
  maler: AdminEmailV2Template[];
}
