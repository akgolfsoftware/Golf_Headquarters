import { permanentRedirect } from "next/navigation";

export default function FinanceRedirect() {
  permanentRedirect("/admin/okonomi");
}
