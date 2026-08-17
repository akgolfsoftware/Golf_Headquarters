import { redirect } from "next/navigation";

/** /admin/agenter (legacy) → /admin/agenticos (H5, direkte til samleflaten). */
export default function AgenterRedirect(): never {
  redirect("/admin/agenticos");
}
