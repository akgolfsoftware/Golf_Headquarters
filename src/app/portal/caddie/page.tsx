import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function CaddieRedirectPage() {
  redirect("/portal/coach/ai");
}
