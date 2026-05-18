// Globalt søk for PlayerHQ — brukes av Cmd+K-modalen i /portal.
//
// Returnerer fire kategorier scoped til innlogget spiller:
//   - routes (statisk portal-rute-katalog)
//   - plans (egne treningsplaner)
//   - bookings (egne bookinger)
//   - goals (egne aktive mål)
// Begrenset til 5 per kategori for kjapp respons.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type SearchPlan = {
  id: string;
  name: string;
  status: string;
  href: string;
};

type SearchBooking = {
  id: string;
  startAt: string;
  serviceName: string;
  coachName: string | null;
  href: string;
};

type SearchGoal = {
  id: string;
  title: string;
  type: string;
  status: string;
  href: string;
};

type SearchRoute = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type PortalSearchResponse = {
  routes: SearchRoute[];
  plans: SearchPlan[];
  bookings: SearchBooking[];
  goals: SearchGoal[];
};

// Statisk rute-katalog for PlayerHQ. Match mot label + description.
const ROUTES: Omit<SearchRoute, "id">[] = [
  { label: "Hjem", description: "Dagens brief og fremgang", href: "/portal" },
  { label: "Trening", description: "Treningsplaner og økter", href: "/portal/tren" },
  { label: "Kalender", description: "Min uke og bookinger", href: "/portal/kalender" },
  { label: "Analyse", description: "Strokes Gained, runder, TrackMan", href: "/portal/analyse" },
  { label: "Statistikk", description: "Tall over tid og benchmarks", href: "/portal/statistikk" },
  { label: "Mine bookinger", description: "Pågående og tidligere", href: "/portal/booking" },
  { label: "Coach", description: "Min coach og meldinger", href: "/portal/coach" },
  { label: "Maler", description: "Mine økt-maler og favoritt-drills", href: "/portal/mal" },
  { label: "Ny økt", description: "Logg en ny treningsøkt", href: "/portal/ny-okt" },
  { label: "Ønskelig økt", description: "Be coachen om en ny tid", href: "/portal/onskeligokt" },
  { label: "Utfordringer", description: "Drill-challenges og leaderboard", href: "/portal/utfordringer" },
  { label: "Min profil", description: "Innstillinger, HCP, klubb og mål", href: "/portal/meg" },
  { label: "Talent", description: "Talent-tracking og pyramide", href: "/portal/talent" },
  { label: "Varsler", description: "Notifikasjoner og inbox", href: "/portal/varsler" },
  { label: "Abonnement", description: "Tier og credits", href: "/portal/meg/abonnement" },
];

function matchRoutes(query: string): SearchRoute[] {
  const q = query.toLowerCase();
  return ROUTES.filter(
    (r) =>
      r.label.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q),
  )
    .slice(0, 6)
    .map((r, idx) => ({ ...r, id: `route-${idx}` }));
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { feil: "Ikke innlogget" },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json<PortalSearchResponse>({
      routes: [],
      plans: [],
      bookings: [],
      goals: [],
    });
  }

  const [plansRaw, bookingsRaw, goalsRaw] = await Promise.all([
    prisma.trainingPlan.findMany({
      where: {
        userId: user.id,
        name: { contains: q, mode: "insensitive" },
      },
      select: { id: true, name: true, status: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.booking.findMany({
      where: {
        userId: user.id,
        OR: [
          { serviceType: { name: { contains: q, mode: "insensitive" } } },
          { notes: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        startAt: true,
        serviceType: { select: { name: true } },
        // Coach-info kommer fra service.coach hvis koblet
        serviceTypeId: true,
      },
      orderBy: { startAt: "desc" },
      take: 5,
    }),
    prisma.goal.findMany({
      where: {
        userId: user.id,
        title: { contains: q, mode: "insensitive" },
        status: "ACTIVE",
      },
      select: { id: true, title: true, type: true, status: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);

  const plans: SearchPlan[] = plansRaw.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    href: `/portal/tren/${p.id}`,
  }));

  const bookings: SearchBooking[] = bookingsRaw.map((b) => ({
    id: b.id,
    startAt: b.startAt.toISOString(),
    serviceName: b.serviceType.name,
    coachName: null,
    href: `/portal/booking/${b.id}`,
  }));

  const goals: SearchGoal[] = goalsRaw.map((g) => ({
    id: g.id,
    title: g.title,
    type: g.type,
    status: g.status,
    href: `/portal/meg#mal-${g.id}`,
  }));

  return NextResponse.json<PortalSearchResponse>({
    routes: matchRoutes(q),
    plans,
    bookings,
    goals,
  });
}
