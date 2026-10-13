/**
 * I3 (Bølge 1) — opprett kalenderhendelse. Leser ?start= (samme param
 * HurtigOpprett allerede bruker for "Ny booking") og forhåndsutfyller
 * start-dato/tid i skjemaet.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { CoachContent } from "@/components/admin/precision/agency-completion/CoachContent";
import { KnappLenke } from "@/components/precision/pa";
import { SideHode } from "@/components/precision/pa-a4";
import { HendelseForm } from "./hendelse-form";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ start?: string }>;

function dagensDatoOgTid(): { dato: string; tid: string } {
  const deler = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const verdi = (type: string) => deler.find(p => p.type === type)?.value ?? "";
  return { dato: `${verdi("year")}-${verdi("month")}-${verdi("day")}`, tid: `${verdi("hour")}:00` };
}

export default async function NyHendelsePage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { start } = await searchParams;

  const fallback = dagensDatoOgTid();
  const [dato, tid] = start?.includes("T") ? start.split("T") : [fallback.dato, fallback.tid];

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}><CoachContent>
      <SideHode title="Ny hendelse" sub="Reserver tid i coachkalenderen." actions={<KnappLenke variant="ghost" href="/admin/kalender">Til kalenderen</KnappLenke>} />
      <HendelseForm startDato={dato} startKlokkeslett={tid} />
    </CoachContent></AgencyOSSkall>
  );
}
