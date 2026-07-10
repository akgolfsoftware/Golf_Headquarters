import { permanentRedirect } from "next/navigation";

export default function CalendarRedirect() {
  permanentRedirect("/admin/kalender");
}
