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
  { label: "Oversikt / Cockpit", description: "Daglig kontrolltårn", href: "/admin/agencyos" },
  { label: "Spillere", description: "Stall, profiler, analyse", href: "/admin/spillere" },
  { label: "Workbench", description: "Planlegging for spiller", href: "/admin/spillere" },
  { label: "Planlegge", description: "Planer, maler, drills", href: "/admin/planlegge" },
  { label: "Kalender & Bookinger", description: "Bookinger, kalender, tilgjengelighet", href: "/admin/bookinger" },
  { label: "Kalender", description: "Uke og måned", href: "/admin/kalender" },
  { label: "Grupper", description: "Grupper og timeplan", href: "/admin/grupper" },
  { label: "Talent", description: "Discovery, radar, WAGR", href: "/admin/talent" },
  { label: "Drills", description: "Drill-bibliotek og forslag", href: "/admin/drills" },
  { label: "Turneringer", description: "Turneringer og resultater", href: "/admin/tournaments" },
  { label: "Tester", description: "Tester og benchmarks", href: "/admin/tester" },
  { label: "Analyse / Innsikt", description: "Stall-analyse, compliance, rapporter", href: "/admin/analysere" },
  { label: "Innboks / Forespørsler", description: "Meldinger, godkjenninger, oppgaver", href: "/admin/innboks" },
  { label: "Agenter", description: "AI-agenter og team", href: "/admin/agenter" },
  { label: "Workspace", description: "Oppgaver, prosjekter, Notion", href: "/admin/workspace" },
  { label: "Anlegg & Tjenester", description: "Fasiliteter, priser, kapasitet", href: "/admin/anlegg" },
  { label: "Tilgjengelighet", description: "Availability grid", href: "/admin/availability" },
  { label: "Live", description: "Pågående økter", href: "/admin/gjennomfore" },
  { label: "Rapporter", description: "Eksport og statistikk", href: "/admin/reports" },
  { label: "Økonomi", description: "MRR, betalinger, faktura", href: "/admin/okonomi" },
  { label: "Innstillinger", description: "API, kalender, sikkerhet", href: "/admin/settings" },
  { label: "Team", description: "Inviter og organisasjon", href: "/admin/team" },
  { label: "Caddie / AI", description: "Chat med AI-assistent", href: "/admin/agencyos/caddie" },
  { label: "Varsler", description: "Notifikasjoner", href: "/admin/varsler" },
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
