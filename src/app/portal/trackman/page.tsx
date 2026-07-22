import { redirect } from "next/navigation";

/** Legacy inngang — kanonisk TrackMan-hub. */
export default function TrackManLegacyRedirect() {
  redirect("/portal/mal/trackman");
}
