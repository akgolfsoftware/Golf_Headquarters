import { canAccessPlayer } from "@/lib/auth/own-or-coached";
/**
 * PlayerHQ · Slagteller — PH06Tapper i Precision Athletics (natt).
 * Kilde: ui_kits/playerhq/screens/PH-06.jsx.
 * Kølleknapper, +1/+5, angre, TrackMan siste slag og avslutning beholdes.
 * Visningen er PH06Slagteller.
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadPH06TapperData } from "@/lib/portal-live/load-ph04-07";
import { PH06Slagteller } from "@/components/portal/precision/PH06Slagteller";
import { saveTapperCounts, finishTapperSession } from "./actions";

export default async function LiveTapperPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN"],
  });
  const { sessionId } = await params;

  const plan = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    include: {
      plan: { select: { userId: true, name: true } },
    },
  });

  let playerId: string | null = null;

  if (plan) {
    if (!(await canAccessPlayer(user, plan.plan.userId))) {
      redirect("/portal/planlegge/workbench");
    }
    if (plan.status === "COMPLETED") redirect(`/portal/live/${sessionId}/summary`);
    if (!["ACTIVE", "PAUSED", "IN_PROGRESS"].includes(plan.status)) {
      redirect(`/portal/live/${sessionId}`);
    }
    playerId = plan.plan.userId;
  } else {
    const wb = await prisma.workbenchSession.findUnique({
      where: { id: sessionId },
      select: { id: true, playerId: true, title: true, status: true },
    });
    if (wb) {
      if (!(await canAccessPlayer(user, wb.playerId))) {
        redirect("/portal/planlegge/workbench");
      }
      if (wb.status === "COMPLETED") {
        redirect(`/portal/live/${sessionId}/summary`);
      }
      playerId = wb.playerId;
    }
  }

  // Tom tilstand hvis ingen økt pågår
  if (!playerId) {
    return (
      <main
        className="pa-root ph06"
        data-theme="night"
        style={{
          minHeight: "100dvh",
          background: "var(--surface-page)",
          display: "grid",
          placeItems: "center",
          padding: 16,
        }}
      >
        <div
          style={{
            maxWidth: 430,
            width: "100%",
            padding: "24px 16px",
            background: "var(--surface-sunken)",
            border: "1px dashed var(--border-hairline)",
            borderRadius: 8,
          }}
        >
          <h3
            style={{
              margin: "0 0 8px",
              fontFamily: "var(--font-sans)",
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            Ingen økt pågår
          </h3>
          <p
            style={{
              margin: "0 0 12px",
              fontFamily: "var(--font-sans)",
              fontSize: 13.5,
              color: "var(--text-muted)",
            }}
          >
            Slagtelleren hører til en pågående økt. Start dagens økt, så teller
            vi derfra.
          </p>
          <Link
            href="/portal"
            data-od-id="tapper-tom-start"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 56,
              width: "100%",
              borderRadius: 8,
              background: "var(--primary)",
              color: "var(--text-on-primary)",
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Start økta
          </Link>
        </div>
      </main>
    );
  }

  const data = await loadPH06TapperData(sessionId, playerId);

  async function handleAddShot(club: string, count: number) {
    "use server";
    try {
      await saveTapperCounts(sessionId, [{ club, count }]);
    } catch {
      // Ignorer eventuelle nettfeil eller offline
    }
  }

  async function handleFinish() {
    "use server";
    try {
      await finishTapperSession(sessionId, []);
    } catch {
      // Ignorer
    }
    redirect(`/portal/live/${sessionId}/summary`);
  }

  return (
    <PH06Slagteller
      data={data}
      onAddShot={handleAddShot}
      onFinish={handleFinish}
    />
  );
}
