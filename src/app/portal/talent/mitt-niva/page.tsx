// PlayerHQ steg 1 (docs/planer/playerhq-alle-sider-nytt-design-2026-10-16.md): Talent er bare for coach; testnivået står i Tester.
import { redirect } from "next/navigation";

export default function Videresend() {
  redirect("/portal/tren/tester");
}
