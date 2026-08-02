import { redirect } from "next/navigation";

/** Legacy talent-underside → kanonisk Talent-radar (v2). */
export default function LegacyTalentRedirect(): never {
  redirect("/admin/talent/radar");
}
