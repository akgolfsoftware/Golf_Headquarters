/**
 * Om oss (/om-oss) i «AK Golf Precision Athletics». OFFENTLIG: ingen auth-guard.
 */
import type { Metadata } from "next";
import { OmOssPrecision } from "@/components/marketing/ds-sider/OmOssPrecision";

export const metadata: Metadata = {
  title: "Om oss | AK Golf Academy",
  description:
    "Anders Kristiansen og AK Golf Academy i Fredrikstad: personlig coaching bygd på måling, TrackMan og en tydelig plan.",
};

export default function OmOssPage() {
  return <OmOssPrecision />;
}
