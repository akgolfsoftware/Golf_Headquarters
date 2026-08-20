import { redirect } from "next/navigation";

/**
 * /kommando/agenter → /admin/agenticos (H5, 2026-08-17 — direkte til
 * samleflaten, ingen redirect-kjede).
 */
export default function KommandoAgenterRedirect(): never {
  redirect("/admin/agenticos");
}
