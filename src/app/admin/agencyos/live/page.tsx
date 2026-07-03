/**
 * Mission Control (/admin/agencyos/live) — personlig live-ops-dashboard.
 *
 * Faithful port av Direction A «Mission Control» fra Claude Design-eksporten
 * ([historisk fasit, fjernet 2026-07-03] meg-live-os/src/dir-a.jsx). Foreløpig et visuelt
 * skall med statisk seed-data — live-integrasjoner (Gmail/Beeper/Notion/
 * Kalender) kobles senere.
 *
 * Single-tenant (Anders). Auth arves fra admin-layout (ADMIN/COACH).
 */

import type { Metadata } from "next";
import { MissionControl } from "./mission-control";

export const metadata: Metadata = {
  title: "Mission Control · AgencyOS",
};

export default function AgencyOSLivePage() {
  return <MissionControl />;
}
