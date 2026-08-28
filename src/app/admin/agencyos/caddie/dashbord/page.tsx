/**
 * T12: Caddie-dashbord foldet inn i godkjenningskøen (AO-01).
 */
import { permanentRedirect } from "next/navigation";

export default function CaddieDashbordRedirect() {
  permanentRedirect("/admin/godkjenninger");
}
