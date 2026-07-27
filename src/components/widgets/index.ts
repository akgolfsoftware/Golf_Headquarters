/**
 * Widget-pakke — gjenbrukbare dashbord-kort for PlayerHQ og AgencyOS.
 *
 * Mønster (2026-07-27): hver widget er ett par —
 *   1) server-loader i src/lib/widgets/ som returnerer ett typet dataobjekt
 *   2) presentasjonskomponent her som tar objektet som eneste data-prop
 * Widgets henter aldri data selv, bygger aldri lenker selv (session-hrefs),
 * og komponeres utelukkende av v2-primitiver (Kort, Rad, StatusPill …).
 */

export { DagensOkterWidget } from "./DagensOkterWidget";
export { MaalWidget } from "./MaalWidget";
export { StallOkterWidget } from "./StallOkterWidget";
export { HurtigStatusKnapper, type HurtigStatusOkt } from "./HurtigStatusKnapper";
