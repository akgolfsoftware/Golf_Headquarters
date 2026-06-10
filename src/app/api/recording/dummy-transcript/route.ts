// POST /api/recording/dummy-transcript
// Body: { recordingId }
// Skriver en realistisk dummy-transkripsjon til SessionRecording for testing
// av V3-analysepipeline (siden V2 Deepgram-transkribering ikke er klar enna).
// Skal fjernes nar V2 er produksjonsklar.

import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const Body = z.object({
  recordingId: z.string().min(1),
});

const DUMMY = `Øyvind, vi starter med basic-setup. Setup ser bra ut, men venstre handledd er litt boyd. Prov a rette det opp - tenk pa at handleddet skal vaere flatt med underarmen ved adressen.

OK, na har du tatt et par swinger. Jeg ser at swing-pathen er litt over-the-top. Klubben kommer for langt utenfor pa veien ned, og det gir deg en fade som du ikke vil ha. La oss jobbe med a slippe klubben mer fra innsiden.

Drill: legg en alignment-stick pa bakken parallelt med target-linjen, og tenk pa at du skal sla "innenfor" sticken. Vi gjor 10 slag med 7-jern, ren teknikk uten ball.

OK, na ser det bedre ut. Smash factor er pa 1.42 - bra kompresjon. Ball-flighten er rettere. Men jeg merker at du strammer skuldrene pa toppen. Pust ut for du starter downswingen.

Mentalt - hvordan foltes det her i dag? Du har vaert litt frustrert pa de fa hullene siste runden. Vi snakker om "process-goals" framfor "outcome-goals". Fokuser pa setup og rotasjonen - resultatet kommer.

Avslutning: jeg vil at du jobber 15 min hver dag denne uken med alignment-stick-drillen pa rangen, 5 sett med 8 slag. Skriv ned felt fairways pa neste runde - jeg vil se tallene.`;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Ikke innlogget" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Ugyldig body" }, { status: 400 });
  }
  const { recordingId } = parsed.data;

  const recording = await prisma.sessionRecording.findUnique({
    where: { id: recordingId },
    select: { id: true, uploadedById: true },
  });
  if (!recording) {
    return NextResponse.json({ error: "Recording finnes ikke" }, { status: 404 });
  }
  if (recording.uploadedById !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Mangler tilgang" }, { status: 403 });
  }

  await prisma.sessionRecording.update({
    where: { id: recording.id },
    data: {
      transcript: DUMMY,
      status: "PROCESSING",
    },
  });
  await audit({
    actorId: user.id,
    action: "recording.dummy_transcript_set",
    target: `SessionRecording:${recording.id}`,
  });

  return NextResponse.json({ ok: true, recordingId: recording.id });
}
