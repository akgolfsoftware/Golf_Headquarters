import { permanentRedirect } from "next/navigation";

/** /kommando/agenter → /admin/agenter (2026-07-15, v2-port). */
export default function KommandoAgenterRedirect(): never {
  permanentRedirect("/admin/agenter");
}
