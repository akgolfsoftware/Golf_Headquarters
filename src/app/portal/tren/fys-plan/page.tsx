/**
 * PH26FysPlan — spillerens FYS-planer i PlayerHQSkall.
 * Dagens FYS-økt, aktive og arkiverte planer, og ærlig score-plassholder.
 * Ingen tall er funnet opp. Tegningen ui_kits/playerhq/screens/PH-26.jsx ligger ikke i git.
 */

import Link from "next/link";
import { Clock, Dumbbell } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "@/lib/uke-helpers";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { Ikon, TomTilstand } from "@/components/precision/pa";
import { NyPlanKnapp } from "./ny-plan-knapp";
import { FysPlanKort, type FysPlanKortData } from "./fys-plan-kort";

export const dynamic = "force-dynamic";

type RawFysPlan = {
  id: string;
  navn: string;
  status: string;
  startDato: Date;
  sluttDato: Date | null;
  uker: { okter: { id: string }[] }[];
};

function enrichPlaner(planer: RawFysPlan[]): FysPlanKortData[] {
  const now = Date.now();
  return planer.map((p) => {
    const ukerCount = p.uker.length;
    const okterCount = p.uker.reduce((s, u) => s + u.okter.length, 0);
    const start = p.startDato.getTime();
    const weeksElapsed = Math.max(0, Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000)));
    const currentWeek = Math.min(weeksElapsed + 1, ukerCount);
    const pct = ukerCount > 0 ? Math.min(100, Math.round((currentWeek / ukerCount) * 100)) : 0;
    const status: FysPlanKortData["status"] =
      p.status === "ACTIVE" ? "ACTIVE" : p.status === "ARCHIVED" ? "ARCHIVED" : "DRAFT";
    return { id: p.id, navn: p.navn, status, ukerCount, okterCount, pct, currentWeek };
  });
}

const OSLO_TID = new Intl.DateTimeFormat("nb-NO", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});

export default async function FysPlanListePage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const idag = new Date();
  const [planer, dagensFys, ulest] = await Promise.all([
    prisma.fysiskPlan.findMany({
      where: { userId: user.id },
      orderBy: { startDato: "desc" },
      include: {
        uker: {
          select: {
            id: true,
            okter: { select: { id: true } },
          },
        },
      },
    }),
    prisma.trainingPlanSession.findFirst({
      where: {
        plan: { userId: user.id },
        pyramidArea: "FYS",
        status: "PLANNED",
        scheduledAt: { gte: startOfDay(idag), lte: endOfDay(idag) },
      },
      orderBy: { scheduledAt: "asc" },
      select: { id: true, title: true, scheduledAt: true, durationMin: true, location: true },
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  const enriched = enrichPlaner(planer);
  const aktive = enriched.filter((p) => p.status !== "ARCHIVED");
  const arkiverte = enriched.filter((p) => p.status === "ARCHIVED");
  const harNoen = enriched.length > 0;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side ph26-fys">
        <header className="ph26-hode">
          <div>
            <h1>FYS</h1>
            <p>Fysiske treningsplaner</p>
          </div>
          {harNoen && <NyPlanKnapp variant="header" />}
        </header>

        {dagensFys && (
          <section className="pa-card ph26-kort">
            <p className="ph26-kicker">Én ting nå</p>
            <h2>
              {dagensFys.title}
              {" · "}
              <span>{OSLO_TID.format(dagensFys.scheduledAt)}</span>
            </h2>
            <p>
              {dagensFys.location ? `${dagensFys.location} · ` : ""}
              {dagensFys.durationMin} min. Økta ligger først i dag — golfkølla venter til etterpå.
            </p>
            <Link href={`/portal/gjennomfore/${dagensFys.id}`} data-od-id="fys-start" className="pa-btn pa-btn--primary pa-btn--full">
              Start FYS-økta
            </Link>
          </section>
        )}

        {aktive.length > 0 && (
          <section className="ph26-liste">
            <p className="ph26-kicker">Aktive planer · {aktive.length}</p>
            {aktive.map((p) => <FysPlanKort key={p.id} plan={p} />)}
          </section>
        )}

        {arkiverte.length > 0 && (
          <section className="ph26-liste">
            <p className="ph26-kicker">Arkiverte · {arkiverte.length}</p>
            {arkiverte.map((p) => <FysPlanKort key={p.id} plan={p} />)}
          </section>
        )}

        {!harNoen && (
          <TomTilstand
            icon={Dumbbell}
            title="Ingen FYS-plan ennå"
            text="Anders har ikke lagt en fysisk plan for deg. Du kan be om en — eller logge fri fysisk trening så lenge, den teller i totalen."
            actions={
              <div className="ph26-tom">
                <Link href="/portal/coach/melding/ny" data-od-id="fys-tom-be" className={dagensFys ? "pa-btn pa-btn--secondary pa-btn--full" : "pa-btn pa-btn--primary pa-btn--full"}>
                  Be Anders om en FYS-plan
                </Link>
                <Link href="/portal/planlegge/workbench" data-od-id="fys-tom-fri" className="pa-btn pa-btn--secondary pa-btn--full">
                  Logg fri fysisk økt
                </Link>
              </div>
            }
          />
        )}

        {harNoen && (
          <p className="ph26-note">
            <Ikon icon={Clock} size={16} name="clock" />
            <span>
              FYS-score kommer. Anders bekrefter referanseverdiene før tall vises her — vi viser heller ingenting enn tall som ikke stemmer.
            </span>
          </p>
        )}
      </div>
    </PlayerHQSkall>
  );
}
