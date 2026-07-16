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
  drills?: Array<{ id: string; title: string; href: string }>;
};

// Statisk rute-katalog for PlayerHQ. Match mot label + description.
const ROUTES: Omit<SearchRoute, "id">[] = [
  { label: "Hjem", description: "Dagens oversikt, SG og plan", href: "/portal" },
  { label: "Planlegge / Workbench", description: "Alt planlegging – ett sted", href: "/portal/planlegge/workbench" },
  { label: "Gjennomføre", description: "Dagens økter, live og logg", href: "/portal/gjennomfore" },
  { label: "Analyse", description: "Samlet: SG, Runder, TrackMan, Tester", href: "/portal/analysere" },
  { label: "Strokes Gained Hub", description: "SG per kølle, benchmark, strategi", href: "/portal/mal/sg-hub" },
  { label: "Runder", description: "Logg og se runder + shot-by-shot", href: "/portal/mal/runder" },
  { label: "TrackMan", description: "Sesjoner og data", href: "/portal/mal/trackman" },
  { label: "Tester", description: "Testkatalog og resultater", href: "/portal/tren/tester" },
  { label: "Kalender", description: "Min uke og bookinger", href: "/portal/kalender" },
  { label: "Ny økt", description: "Start eller planlegg økt", href: "/portal/ny-okt" },
  { label: "Live økt", description: "Pågående trening", href: "/portal/gjennomfore" },
  { label: "Statistikk", description: "Tall over tid", href: "/portal/statistikk" },
  { label: "Mine bookinger", description: "Bookinger og endre", href: "/portal/meg/bookinger" },
  { label: "Booking ny", description: "Book time med coach", href: "/portal/booking/ny" },
  { label: "Coach", description: "Meldinger og planer med coach", href: "/portal/coach" },
  { label: "Venner", description: "Legg til venner, se at de har trent", href: "/portal/venner" },
  { label: "Mål & Utfordringer", description: "Mål, milepæler og challenges", href: "/portal/mal" },
  { label: "Drills", description: "Øvelsesbibliotek", href: "/portal/drills" },
  { label: "Årsplan", description: "Langsiktig plan", href: "/portal/tren/aarsplan" },
  { label: "Min profil", description: "Profil, innstillinger, helse", href: "/portal/meg" },
  { label: "Abonnement", description: "Tier, kreditter, fakturaer", href: "/portal/meg/abonnement" },
  { label: "Talent", description: "Utviklingsroadmap", href: "/portal/utviklingsplan" },
  { label: "Varsler", description: "Notifikasjoner", href: "/portal/varsler" },
  { label: "Hjelp", description: "FAQ og support", href: "/portal/meg/help" },
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
      drills: [],
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

  // Bredde: legg til drills som statiske + match (kan utvides til prisma)
  const DRILLS_STATIC = [
    { id: "d-tempo", title: "Tempo 3:1 driver", href: "/portal/drills" },
    { id: "d-putt", title: "Putting gate 1m", href: "/portal/drills" },
    { id: "d-wedge", title: "Wedge yardage 30-90m", href: "/portal/drills" },
    { id: "d-chip", title: "Chip & run kontroll", href: "/portal/drills" },
  ];
  const drills = DRILLS_STATIC.filter(d =>
    d.title.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 5);

  return NextResponse.json<PortalSearchResponse>({
    routes: matchRoutes(q),
    plans,
    bookings,
    goals,
    drills,
  });
}
