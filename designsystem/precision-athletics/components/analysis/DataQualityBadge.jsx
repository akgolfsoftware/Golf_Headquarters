import React from "react";
import { StatusPill } from "../display/StatusPill.jsx";
const L = { god: ["ok", "God dekning"], tynn: ["warn", "Tynt grunnlag"], mangler: ["neutral", "Mangler data"], utdatert: ["warn", "Utdatert"], manuell: ["info", "Manuelt lagt inn"] };
/** Sier om tallet tåler en konklusjon. Tynt grunnlag = ingen «forbedring». */
export function DataQualityBadge({ level = "god", have, need, unit, age }) {
  const [tone, label] = L[level] || L.god;
  const detail = level === "utdatert" && age ? age : have != null && need != null ? have + " av " + need + (unit ? " " + unit : "") : have != null ? have + (unit ? " " + unit : "") : null;
  return <StatusPill tone={tone}>{label}{detail ? " · " + detail : ""}</StatusPill>;
}
