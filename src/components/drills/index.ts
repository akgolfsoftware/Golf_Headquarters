/**
 * Drill Library — pixel-perfect mot plan Del 6 (visuell spec).
 *
 * Komponenter:
 * - DrillCategoryDot — fargekodet prikk basert på skill-area
 * - DrillCard — kort i grid
 * - DrillDetailPanel — slide-in panel med 7 body-seksjoner
 * - DrillGrid — client-wrapper med selection state
 *
 * CSS: drill.css (scope'et til .drill-scope)
 */

export { DrillCategoryDot } from "./drill-category-dot";
export { DrillCard, type DrillCardData } from "./drill-card";
export { DrillDetailPanel, type DrillDetailData } from "./drill-detail-panel";
export { DrillGrid } from "./drill-grid";
