/**
 * I3 (Bølge 1) — opprett kalenderhendelse. Leser ?start= (samme param
 * HurtigOpprett allerede bruker for "Ny booking") og forhåndsutfyller
 * start-dato/tid i skjemaet.
 *
 * Server component. Skrå-drakten 22.10 (bølge 1, pakke A3, skissen §5 «Skjema»): lav topp med
 * banebildet fra Kalender og skjemaet i et hvitt kort.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { SkraKort } from "@/components/precision/skra/Skra";
import "@/styles/agencyos-ny-kalender-skra.css";
import { HendelseForm } from "./hendelse-form";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ start?: string }>;

function dagensDatoOgTid(): { dato: string; tid: string } {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    dato: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    tid: `${pad(now.getHours())}:00`,
  };
}

export default async function NyHendelsePage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { start } = await searchParams;

  const fallback = dagensDatoOgTid();
  const [dato, tid] = start?.includes("T") ? start.split("T") : [fallback.dato, fallback.tid];

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="agn-s agn-kal-under">
        <Topp tilbake={{ href: "/admin/kalender", tekst: "Kalender" }} dato="Kalender · blokkert tid" tittel="Ny hendelse"
          ingress="Møte, ferie eller reise. Tiden er ikke en økt, og spillerne kan ikke booke deg i den." bilde="/images/playerhq/green-25m.jpg" />
        <SkraKort className="kal-under-kort" etikett="Ny hendelse"><HendelseForm startDato={dato} startKlokkeslett={tid} /></SkraKort>
      </div>
    </AgencyOSSkall>
  );
}
