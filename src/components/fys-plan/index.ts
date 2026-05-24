/**
 * FYS-plan komponenter — fysisk treningsplan (styrke/kondisjon).
 *
 * Hierarki: FysiskPlan → FysUke → FysOkt → FysOvelseRad.
 * Per plan Del 31 (FYS-plan modul, 2026-05-24).
 */

export { FysPlanCard, type FysPlanCardProps } from "./plan-card";
export { UkeRad, type UkeRadData } from "./uke-rad";
export { OktKort, type OktKortData } from "./okt-kort";
export { OvelseTabell, type OvelseRadData, type OvelseTabellProps } from "./ovelse-tabell";
export { FysPlanSidebar, type FysPlanSidebarProps } from "./sidebar";
