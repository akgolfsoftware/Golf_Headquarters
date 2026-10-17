// PlayerHQ steg 1 (docs/planer/playerhq-alle-sider-nytt-design-2026-10-16.md): ukesdigest blir melding i Innboks (28.09).
import { redirect } from "next/navigation";

export default function Videresend() {
  redirect("/portal/varsler");
}
