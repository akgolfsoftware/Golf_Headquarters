// PH-21 Ønsket økt sendt — Precision Athletics, pakke 11 og 12 (utkast booking-meldinger.html, godkjent 16.10.2026).
import { redirect } from "next/navigation";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21OnsketBekreftet } from "@/components/portal/precision/PH21OnsketBekreftet";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getUnreadNotifications } from "@/app/portal/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ønsket økt · PlayerHQ" };

const AREA_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Golfslag",
  SPILL: "Spill",
  TURN: "Turnering",
};

function extractNote(reason: string): string | null {
  const lines = reason.split("\n").map((l) => l.trim());
  const msg = lines.find((l) => l.startsWith("Melding:"))?.slice("Melding:".length).trim();
  const detail = lines.find((l) => l.startsWith("Detalj:"))?.slice("Detalj:".length).trim();
  return msg || detail || reason.trim() || null;
}

const OSLO = "Europe/Oslo";
const dagKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: OSLO });

export default async function OnskeligOktBekreftetPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [request, uleste] = await Promise.all([
    prisma.sessionRequest.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { coach: { select: { name: true } } },
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  let data = null;
  if (request) {
    const klokke = request.createdAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: OSLO });
    const sendt = dagKey(request.createdAt) === dagKey(new Date())
      ? `i dag ${klokke}`
      : `${request.createdAt.toLocaleDateString("nb-NO", { day: "numeric", month: "short", timeZone: OSLO })} ${klokke}`;
    const naar = [
      request.preferredDate?.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: OSLO }),
      request.preferredTime,
      request.durationMin ? `${request.durationMin} min` : null,
    ].filter(Boolean).join(" · ");
    data = {
      coachNavn: request.coach?.name ?? null,
      sendt,
      naar: naar || null,
      tema: request.preferredArea ? AREA_LABEL[request.preferredArea] ?? request.preferredArea : null,
      hvorfor: extractNote(request.reason),
      status: request.status,
      svar: request.coachResponse?.trim() || null,
    };
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH21OnsketBekreftet data={data} />
    </PlayerHQSkall>
  );
}
