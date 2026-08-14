// POST /api/recording/start
// Oppretter en SessionRecording. Tre modi:
//   { bookingId } — knytter opptaket til en booking (spiller hentes derfra).
//   { sessionId } — knytter opptaket til en treningsøkt (TrainingSessionV2);
//                   spiller hentes fra økta. Gjør at coachens live-økt-flate
//                   (/admin/agencyos/live/[sessionId]) faktisk kan vise
//                   opptak, transkript og analyse for økta.
//   { playerId }  — fritt opptak fra /admin/recording uten booking.
// Validerer at innlogget bruker er coach på booking.serviceType eller ADMIN.
// Returnerer { recordingId }.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { vurderOktOpptakTilgang } from "@/lib/recording/okt-tilgang";
import {
  hentLydSamtykkeStatus,
  lydSamtykkeMelding,
  LYD_SAMTYKKE_MANGLER,
} from "@/lib/recording/lyd-samtykke";

const Body = z
  .object({
    bookingId: z.string().min(1).optional(),
    sessionId: z.string().min(1).optional(),
    playerId: z.string().min(1).optional(),
  })
  .refine((v) => !!v.bookingId || !!v.sessionId || !!v.playerId, {
    message: "bookingId, sessionId eller playerId må oppgis",
  });

/** Hard gate: uten LydSamtykke status GITT → 403. Klient kan ikke omgå. */
async function avvisUtenLydSamtykke(playerId: string) {
  const sjekk = await hentLydSamtykkeStatus(playerId);
  if (sjekk.tillatt) return null;
  return NextResponse.json(
    {
      error: LYD_SAMTYKKE_MANGLER,
      message: lydSamtykkeMelding(sjekk),
      status: sjekk.status,
    },
    { status: 403 },
  );
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
    }
    if (user.role !== "COACH" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Mangler tilgang" }, { status: 403 });
    }

    // Rate-limit: 20 opptak-starter per time per coach (demo-vennlig, #12).
    const rl = await rateLimit({
      key: `recording-start:${user.id}`,
      max: 20,
      windowMs: 3_600_000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "rate-limited" },
        { status: 429, headers: { "x-ratelimit-reset": String(rl.resetAt) } },
      );
    }

    const parsed = Body.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) {
      return NextResponse.json({ error: "Ugyldig body" }, { status: 400 });
    }

    // Treningsøkt — opptak knyttet til en TrainingSessionV2. Spilleren hentes
    // fra økta, så coachen aldri kan koble opptaket til feil person.
    if (parsed.data.sessionId) {
      const okt = await prisma.trainingSessionV2.findUnique({
        where: { id: parsed.data.sessionId },
        select: { id: true, studentId: true, coachId: true },
      });
      if (!okt) {
        return NextResponse.json({ error: "Økta finnes ikke" }, { status: 404 });
      }
      const tilgang = vurderOktOpptakTilgang({
        viewerRole: user.role,
        viewerId: user.id,
        oktCoachId: okt.coachId,
        oktStudentId: okt.studentId,
        // Slås kun opp når økta faktisk har en spiller.
        harTilgangTilSpiller: okt.studentId
          ? await harCoachTilgangTilSpiller(user, okt.studentId)
          : false,
      });
      if (!tilgang.ok) {
        return tilgang.grunn === "mangler-spiller"
          ? NextResponse.json(
              { error: "Økta mangler spiller", message: "Økta har ingen spiller å knytte opptaket til." },
              { status: 400 },
            )
          : NextResponse.json({ error: "Du har ikke tilgang til denne økta" }, { status: 403 });
      }

      const sperre = await avvisUtenLydSamtykke(tilgang.playerId);
      if (sperre) return sperre;

      const recording = await prisma.sessionRecording.create({
        data: {
          sessionId: okt.id,
          uploadedById: user.id,
          playerId: tilgang.playerId,
          status: "RECORDING",
        },
        select: { id: true },
      });

      await audit({
        actorId: user.id,
        action: "recording.started",
        target: `SessionRecording:${recording.id}`,
        metadata: { sessionId: okt.id, playerId: tilgang.playerId, kilde: "treningsokt" },
      });

      return NextResponse.json({ recordingId: recording.id });
    }

    // Fritt opptak — spiller valgt direkte i /admin/recording.
    if (!parsed.data.bookingId) {
      const playerId = parsed.data.playerId!;
      const player = await prisma.user.findUnique({
        where: { id: playerId },
        select: { id: true, role: true },
      });
      if (!player || player.role !== "PLAYER") {
        return NextResponse.json({ error: "Spiller finnes ikke" }, { status: 404 });
      }

      // #1: coach kan kun starte for egne spillere (ADMIN: alle coachede)
      if (!(await harCoachTilgangTilSpiller(user, player.id))) {
        return NextResponse.json(
          { error: "Du har ikke tilgang til denne spilleren" },
          { status: 403 },
        );
      }

      const sperre = await avvisUtenLydSamtykke(player.id);
      if (sperre) return sperre;

      const recording = await prisma.sessionRecording.create({
        data: {
          uploadedById: user.id,
          playerId: player.id,
          status: "RECORDING",
        },
        select: { id: true },
      });

      await audit({
        actorId: user.id,
        action: "recording.started",
        target: `SessionRecording:${recording.id}`,
        metadata: { playerId: player.id, kilde: "fritt-opptak" },
      });

      return NextResponse.json({ recordingId: recording.id });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parsed.data.bookingId },
      select: {
        id: true,
        userId: true,
        serviceType: { select: { coachUserId: true } },
      },
    });
    if (!booking) {
      return NextResponse.json({ error: "Booking finnes ikke" }, { status: 404 });
    }

    const coachId = booking.serviceType.coachUserId;
    if (user.role !== "ADMIN" && coachId && coachId !== user.id) {
      return NextResponse.json(
        { error: "Du er ikke coach på denne booking" },
        { status: 403 },
      );
    }

    const playerId = booking.userId;
    if (!playerId) {
      return NextResponse.json(
        { error: "Booking mangler spiller" },
        { status: 400 },
      );
    }

    const sperre = await avvisUtenLydSamtykke(playerId);
    if (sperre) return sperre;

    const recording = await prisma.sessionRecording.create({
      data: {
        bookingId: booking.id,
        uploadedById: user.id,
        playerId,
        status: "RECORDING",
      },
      select: { id: true },
    });

    await audit({
      actorId: user.id,
      action: "recording.started",
      target: `SessionRecording:${recording.id}`,
      metadata: { bookingId: booking.id, playerId },
    });

    return NextResponse.json({ recordingId: recording.id });
  } catch (err) {
    // #7: ikke lek interne feilmeldinger til klient
    console.error("[recording/start]", err);
    return NextResponse.json(
      {
        error: "server-error",
        message: "Noe gikk galt. Prøv igjen.",
      },
      { status: 500 },
    );
  }
}
