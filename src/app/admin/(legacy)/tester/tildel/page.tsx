import { redirect } from "next/navigation";

/** /admin/tester/tildel (legacy hub) → /admin/tester (v2). */
export default function TesterTildelRedirect(): never {
  redirect("/admin/tester");
}
