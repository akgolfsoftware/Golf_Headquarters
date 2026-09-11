import { canAccessPlayer } from "@/lib/auth/own-or-coached";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { filterLiveCoachMessages, type LiveCoachPanelData } from "@/components/portal/live/types";
import { TL } from "@/lib/v2/train-lock";

import { TapperShell } from "./tapper-shell";

/**
 * PlayerHQ · Slagteller (/portal/(fullscreen)/live/[sessionId]/tapper).
 * Fasit: designsystem/train-lock/PH-05 Live.dc.html
 * Avvik:
 *   - Ingen egen riggrad: PH-05-raden måler /portal/live/<id>/active
 *     (LiveActive.tsx), som er skjermen fasiten faktisk tegner. Slagtelleren
 *     her er en egen inngang i samme live-sløyfe uten egen fasitramme.
 *   - Gammel Paper-sitering (playerhq-live-tapper.html) er slettet 30.08 — koden
 *     er slagtelleren i live-sløyfa, ikke en 1:1-port av den slettede fila.
 *   - Tar også WorkbenchSession-id fra I dag (Anders 08.09), ikke bare plan-økt.
 *
 * Kølleknappene bygges av spillerens utstyrsbag (EquipmentBag — fritekst per
 * kategori, så knappene er kategoriene som faktisk er fylt ut). Tom bag →
 * standardoppsett. Persistering er uendret: SessionBallLog-aggregater via
 * saveTapperCounts — INGEN Shot-skriving.
 */

// Fallback når utstyrsbagen er tom — samme id-er som historiske
// session_ball_logs-rader, så gjenopptak fortsatt treffer.
const DEFAULT_CLUBS = [
  { id: "driver", name: "Driver" },
  { id: "iron-7", name: "7-jern" },
  { id: "wedge", name: "Wedge" },
  { id: "putter", name: "Putter" },
];

// EquipmentBag-kategorier → kølleknapper (kun kategorier med innhold).
const BAG_KATEGORIER = [
  ["driver", "Driver"],
  ["fairwayWoods", "Fairway"],
  ["hybrids", "Hybrid"],
  ["irons", "Jern"],
  ["wedges", "Wedge"],
  ["putter", "Putter"],
] as const;

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
  let oktLabel: string | null = null;

  if (plan) {
    if (!(await canAccessPlayer(user, plan.plan.userId))) {
      redirect("/portal/planlegge/workbench");
    }
    if (plan.status === "COMPLETED") redirect(`/portal/live/${sessionId}/summary`);
    if (!["ACTIVE", "PAUSED"].includes(plan.status)) redirect(`/portal/live/${sessionId}`);
    playerId = plan.plan.userId;
    oktLabel = plan.title || plan.plan.name;
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
      const startbar =
        wb.status === "IN_PROGRESS";
      if (!startbar) {
        playerId = null;
      } else {
        playerId = wb.playerId;
        oktLabel = wb.title;
      }
    }
  }

  // Tom tilstand — fasit-copy: slagtelleren hører til en pågående økt.
  if (!playerId || !oktLabel) {
    return (
      <main
        data-paper-slug="playerhq-live-tapper"
        style={{ minHeight: "100dvh", background: TL.scene, display: "grid", placeItems: "center", padding: 16 }}
      >
        <div
          style={{
            maxWidth: 430,
            width: "100%",
            padding: "24px 16px",
            background: TL.dock,
            border: `1px dashed ${TL.hair}`,
            borderRadius: TL.radius.card,
          }}
        >
          <h3 style={{ margin: "0 0 8px", fontFamily: TL.font.sans, fontSize: 15, fontWeight: 600, color: TL.text }}>
            Ingen økt pågår
          </h3>
          <p style={{ margin: "0 0 12px", fontFamily: TL.font.sans, fontSize: 13.5, color: TL.mute }}>
            Slagtelleren hører til en pågående økt. Start dagens økt, så teller
            vi derfra.
          </p>
          {/* Kontrakt §3: tom tilstand — én aksenthandling, én vei videre. */}
          <Link
            href="/portal"
            data-od-id="tapper-tom-start"
            data-paper-en-ting="true"
            className="v2-press v2-focus"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 56,
              width: "100%",
              borderRadius: TL.radius.card,
              background: TL.fill,
              color: TL.onFill,
              fontFamily: TL.font.sans,
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

  const thread = await prisma.coachingSession.findUnique({
    where: { userId_liveSessionId: { userId: user.id, liveSessionId: sessionId } },
    select: { messages: true },
  });
  const fornavn = user.name?.split(" ")[0] ?? "deg";
  const initialer = user.name
    ? user.name.split(" ").map((d) => d[0]).slice(0, 2).join("").toUpperCase()
    : "DU";
  const coachPanel: LiveCoachPanelData = {
    sessionId,
    kind: "plan-session",
    tier: user.tier === "GRATIS" ? "GRATIS" : "PRO",
    userId: user.id,
    fornavn,
    initialer,
    initialMessages: filterLiveCoachMessages(thread?.messages),
  };

  // Kølleknapper fra SPILLERENS (øktseierens) utstyrsbag — aldri en
  // hardkodet liste når bagen finnes.
  const bag = await prisma.equipmentBag.findUnique({
    where: { userId: playerId },
    select: {
      driver: true,
      fairwayWoods: true,
      hybrids: true,
      irons: true,
      wedges: true,
      putter: true,
    },
  });
  const bagClubs = bag
    ? BAG_KATEGORIER.filter(([key]) => (bag[key] ?? "").trim().length > 0).map(
        ([key, name]) => ({ id: key, name }),
      )
    : [];
  const clubs = bagClubs.length > 0 ? bagClubs : DEFAULT_CLUBS;

  // Gjenopptak: tidligere lagrede tellinger for økten (session_ball_logs).
  const lagrede = await prisma.sessionBallLog.findMany({
    where: { planSessionId: sessionId },
    select: { club: true, count: true },
  });
  const initialCounts = Object.fromEntries(lagrede.map((r) => [r.club, r.count]));

  return (
    <TapperShell
      sessionId={sessionId}
      oktLabel={oktLabel}
      clubs={clubs}
      coachPanel={coachPanel}
      initialCounts={initialCounts}
      userId={user.id}
    />
  );
}
