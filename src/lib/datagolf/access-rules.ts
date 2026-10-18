export type DataGolfAnalystConfig = { enabled: boolean; analystUserId: string | null };
export type DataGolfPrincipal = { id: string; role: string; deletedAt?: Date | null } | null;
/** Independent entitlement: ADMIN/COACH alone never gives DataGolf access. Id is Prisma users.id. */
export function canUseInternalDataGolf(principal: DataGolfPrincipal, config: DataGolfAnalystConfig): boolean {
  return Boolean(principal && !principal.deletedAt && ['ADMIN', 'COACH'].includes(principal.role) && config.enabled && config.analystUserId && principal.id === config.analystUserId);
}
export function isDataGolfSource(source: string | null | undefined): boolean { return /data[\s_-]?golf|^dg[\s_-]/i.test(source ?? ''); }
