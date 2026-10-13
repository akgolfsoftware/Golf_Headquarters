import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/getCurrentUser';
import { requirePortalUser } from '@/lib/auth/requirePortalUser';
import { canUseInternalDataGolf, type DataGolfAnalystConfig, type DataGolfPrincipal } from './access-rules';

/** Read on every request; defaults are closed. Never serialize this configuration. */
export function internalDataGolfConfig(): DataGolfAnalystConfig {
  const id = process.env.AK_INTERNAL_ANALYST_USER_ID?.trim();
  return { enabled: process.env.DATAGOLF_INTERNAL_ANALYSIS_ENABLED === 'true', analystUserId: id && id.length <= 128 ? id : null };
}
export function hasInternalDataGolfAccess(user: DataGolfPrincipal): boolean { return canUseInternalDataGolf(user, internalDataGolfConfig()); }
export async function requireDataGolfAnalyst(expectedUserId?: string) {
  const user = await requirePortalUser({ allow: ['ADMIN','COACH'], kreverTilgang: 'INGEN' });
  if (!hasInternalDataGolfAccess(user) || (expectedUserId !== undefined && expectedUserId !== user.id)) notFound();
  return user;
}
/** Old public links lead to the private room only for the configured analyst, without reading DG. */
export async function redirectLegacyDataGolf(view = 'DG-01'): Promise<never> {
  const user = await getCurrentUser();
  if (hasInternalDataGolfAccess(user)) redirect(`/portal/analysere/datagolf?flate=${encodeURIComponent(view)}`);
  redirect('/stats/spillere');
}
