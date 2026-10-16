/**
 * /admin/services → /admin/bookinger?fane=tjenester (bookingplanen steg 2,
 * 15.10.2026). Tjenester opprettes og redigeres i AG-06-fanen «Tjenester og
 * pris»; denne siden finnes bare som videresending for gamle lenker.
 */
import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ServicesRedirect() {
  permanentRedirect("/admin/bookinger?fane=tjenester");
}
