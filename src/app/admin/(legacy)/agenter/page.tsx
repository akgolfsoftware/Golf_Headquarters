import { redirect } from "next/navigation";

/** /admin/agenter (legacy) → /admin/agents (v2). */
export default function AgenterRedirect(): never {
  redirect("/admin/agents");
}
