import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { filterLiveCoachMessages, type LiveCoachPanelData } from "@/components/portal/live/types";
import { T } from "@/lib/v2/tokens";
import { TapperShell } from "./tapper-shell";

/**
 * PlayerHQ · Slagteller (/portal/(fullscreen)/live/[sessionId]/tapper) —
 * Paper-port W1 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-live-tapper.html.
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

  const session = await prisma.trainingPlanSession.findUnique({
    where: { id: sessionId },
    include: {
      plan: { select: { userId: true, name: true } },
    },
  });

  // Tom tilstand — fasit-copy: slagtelleren hører til en pågående økt.
  if (!session) {
    return (
      <main
        data-paper-slug="playerhq-live-tapper"
        style={{ minHeight: "100dvh", background: T.bg, display: "grid", placeItems: "center", padding: 16 }}
      >
        <div
          style={{
            maxWidth: 430,
            width: "100%",
            padding: "24px 16px",
            background: T.panel2,
            border: `1px dashed ${T.border}`,
            borderRadius: T.rCard,
          }}
        >
          <h3 style={{ margin: "0 0 8px", fontFamily: T.disp, fontSize: 15, fontWeight: 600, color: T.fg }}>
            Ingen økt pågår
          </h3>
          <p style={{ margin: "0 0 12px", fontFamily: T.bodyFont, fontSize: 13.5, color: T.mut }}>
            Slagtelleren hører til en pågående økt. Start dagens økt, så teller
            vi derfra.
          </p>
          {/* Kontrakt §3: tom tilstand — én aksenthandling, én vei videre. */}
          <Link
            href="/portal/gjennomfore"
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
              borderRadius: T.rCard,
              background: T.handling,
              color: T.onHandling,
              fontFamily: T.ui,
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

  const erEier = session.plan.userId === user.id;
  const erCoach = user.role === "COACH" || user.role === "ADMIN";
  if (!erEier && !erCoach) {
    redirect("/portal/planlegge/workbench");
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
    where: { userId: session.plan.userId },
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
    where: { planSessionId: session.id },
    select: { club: true, count: true },
  });
  const initialCounts = Object.fromEntries(lagrede.map((r) => [r.club, r.count]));

  return (
    <TapperShell
      sessionId={session.id}
      oktLabel={session.title || session.plan.name}
      clubs={clubs}
      coachPanel={coachPanel}
      initialCounts={initialCounts}
    />
  );
}
