/**
 * /portal/ai/mal-bygger — AI mål-bygger (3-stegs SMART-wizard).
 *
 * Hjelper spilleren å formulere egne SMART-mål og lagre dem som Goal-rader.
 * Ingen oppdiktede tall — spilleren fyller inn sine egne verdier.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { MalByggerWizard } from "@/components/portal/ai/mal-bygger-wizard";

export const dynamic = "force-dynamic";

export default async function MalByggerPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const yearEnd = `${new Date().getFullYear()}-12-31`;

  return (
    <MalByggerWizard
      playerFirstName={(user.name ?? "deg").split(" ")[0]}
      defaultYearEnd={yearEnd}
    />
  );
}
