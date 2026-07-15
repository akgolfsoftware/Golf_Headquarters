import { permanentRedirect } from "next/navigation";

/**
 * /kommando/kalender → /admin/kalender (2026-07-15).
 * Var bookinger + KommandoTask-frister; med KommandoTask retired er dette
 * bare bookingkalenderen som allerede finnes ekte og v2 på /admin/kalender.
 */
export default function KommandoKalenderRedirect(): never {
  permanentRedirect("/admin/kalender");
}
