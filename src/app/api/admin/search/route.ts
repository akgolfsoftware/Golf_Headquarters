// Global søk for CoachHQ — brukes av Cmd+K-modalen.
//
// Returnerer fire kategorier: players, plans, bookings, routes.
// Begrenset til 5 per kategori for å holde respons-tiden lav.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type SearchPlayer = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  href: string;
};

type SearchPlan = {
  id: string;
  name: string;
  playerName: string;
  status: string;
  href: string;
};

type SearchBooking = {
  id: string;
  playerName: string;
  startAt: string;
  serviceName: string;
  href: string;
};

type SearchRoute = {
  id: string;
  label: string;
  description: string;
  href: string;
};

export type GlobalSearchResponse = {
  players: SearchPlayer[];
  plans: SearchPlan[];
  bookings: SearchBooking[];
  routes: SearchRoute[];
};

// Statisk rute-katalog. Brukes for navigasjons-treff i søket.
// Match gjøres mot label + description (begge case-insensitive).
const ROUTES: Omit<SearchRoute, "id">[] = [
  { label: "Hub", description: "Dagens oversikt og KPI-er", href: "/admin" },
  { label: "Daglig brief", description: "Morgens første-stop med agent-insights", href: "/admin/brief" },
  { label: "Spillere", description: "Spillerliste, profiler og status", href: "/admin/spillere" },
  { label: "Grupper", description: "Gruppe-medlemmer og treningsgrupper", href: "/admin/grupper" },
  { label: "Plans", description: "Treningsplaner og periodisering", href: "/admin/plans" },
  { label: "Kalender", description: "Uke-kalender og timebooking", href: "/admin/kalender" },
  { label: "Bookinger", description: "Alle bookinger og status", href: "/admin/bookinger" },
  { label: "Forespørsler", description: "Økt-forespørsler fra spillere", href: "/admin/foresporsler" },
  { label: "Økonomi", description: "Inntekt, utestående og fakturaer", href: "/admin/finance" },
  { label: "Innstillinger", description: "Personlig og system-innstillinger", href: "/admin/settings" },
  { label: "Godkjenninger", description: "Plan-aksjoner og agent-inbox", href: "/admin/godkjenninger" },
  { label: "Meldinger", description: "Innboks for spiller-meldinger", href: "/admin/innboks" },
  { label: "Tester", description: "SG- og fys-tester", href: "/admin/tester" },
  { label: "Anlegg", description: "Anlegg og fasiliteter", href: "/admin/anlegg" },
  { label: "Tjenester", description: "Tjeneste-typer og priser", href: "/admin/services" },
  { label: "Rapporter", description: "Rapport- og analyse-eksport", href: "/admin/reports" },
  { label: "Profil", description: "Min profil og preferanser", href: "/admin/profile" },
];

function matchRoutes(query: string): SearchRoute[] {
  const q = query.toLowerCase();
  return ROUTES.filter(
    (r) =>
      r.label.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q),
  )
    .slice(0, 6)
    .map((r, i) => ({ id: `route-${i}`, ...r }));
}

export async function GET(req: Request) {
  const coach = await getCurrentUser();
  if (!coach || (coach.role !== "COACH" && coach.role !== "ADMIN")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    const empty: GlobalSearchResponse = {
      players: [],
      plans: [],
      bookings: [],
      routes: [],
    };
    return NextResponse.json(empty);
  }

  const [playersRaw, plansRaw, bookingsRaw] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: "PLAYER",
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, email: true, avatarUrl: true },
      take: 5,
      orderBy: { name: "asc" },
    }),
    prisma.trainingPlan.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        name: true,
        status: true,
        user: { select: { name: true } },
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.booking.findMany({
      where: {
        user: {
          name: { contains: q, mode: "insensitive" },
        },
      },
      select: {
        id: true,
        startAt: true,
        user: { select: { name: true } },
        serviceType: { select: { name: true } },
      },
      take: 5,
      orderBy: { startAt: "desc" },
    }),
  ]);

  const players: SearchPlayer[] = playersRaw.map((p) => ({
    id: p.id,
    name: p.name,
    email: p.email,
    avatarUrl: p.avatarUrl,
    href: `/admin/spillere/${p.id}`,
  }));

  const plans: SearchPlan[] = plansRaw.map((p) => ({
    id: p.id,
    name: p.name,
    playerName: p.user.name,
    status: p.status,
    href: `/admin/plans/${p.id}`,
  }));

  const bookings: SearchBooking[] = bookingsRaw.map((b) => ({
    id: b.id,
    playerName: b.user?.name ?? "Gjest",
    startAt: b.startAt.toISOString(),
    serviceName: b.serviceType.name,
    href: `/admin/bookinger/${b.id}`,
  }));

  const response: GlobalSearchResponse = {
    players,
    plans,
    bookings,
    routes: matchRoutes(q),
  };

  return NextResponse.json(response);
}
