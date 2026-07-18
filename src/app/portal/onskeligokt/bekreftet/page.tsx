/**
 * PlayerHQ · Ønskelig økt · Bekreftet (/portal/onskeligokt/bekreftet) — v2.
 * v2-port 17. juli 2026 (Team D2): `OnskeligOktBekreftetV2` erstatter
 * legacy-siden, ruten flyttet ut av (legacy). Auth, Prisma-spørringen
 * (spillerens SISTE SessionRequest), reason-parsingen og tidslinje-logikken
 * (buildSteps fra faktisk status) er uendret — kun presentasjonslaget er nytt.
 * Ingen forespørsel → ærlig tomtilstand, aldri falske data.
 */
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { SessionRequestStatus } from "@/generated/prisma/client";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke, TomTilstand, CTAPill, Kort } from "@/components/v2";
import {
  OnskeligOktBekreftetV2,
  type BekreftetSteg,
} from "@/components/portal/v2/OnskeligOktBekreftetV2";

export const dynamic = "force-dynamic";

const AREA_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

/** Plukker ut «Melding: …» / «Detalj: …» fra den pakkede reason-teksten. */
function extractNote(reason: string): string | null {
  const lines = reason.split("\n").map((l) => l.trim());
  const msg = lines.find((l) => l.startsWith("Melding:"))?.slice("Melding:".length).trim();
  const detail = lines.find((l) => l.startsWith("Detalj:"))?.slice("Detalj:".length).trim();
  return msg || detail || null;
}

/** Plukker ut «Type: …» hvis formet pakket den inn. */
function extractType(reason: string): string | null {
  const line = reason
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith("Type:"));
  return line ? line.slice("Type:".length).trim() : null;
}

function buildSteps(
  status: SessionRequestStatus,
  coachFirst: string,
  createdAt: Date,
): BekreftetSteg[] {
  const sentWhen = createdAt
    .toLocaleString("nb-NO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    .replace(",", " ·")
    .toUpperCase();

  const approved = status === "APPROVED";
  const declined = status === "DECLINED";
  const cancelled = status === "CANCELLED";

  return [
    {
      state: "done",
      icon: "check",
      title: "Du sendte ønske",
      meta: `${cap(coachFirst)} har mottatt ønsket ditt`,
      when: sentWhen,
    },
    {
      state: approved || declined ? "done" : cancelled ? "pending" : "active",
      icon: "clock",
      title: declined ? "Coach kunne ikke" : "Coach foreslår tider",
      meta: declined
        ? `${cap(coachFirst)} hadde ikke ledig tid denne gangen — prøv et nytt ønske.`
        : `${cap(coachFirst)} sjekker kalenderen og sender alternative tidspunkter tilbake.`,
      when: cancelled ? undefined : "FORVENTET INNEN 24 T PÅ HVERDAGER",
    },
    {
      state: approved ? "done" : "pending",
      icon: "circle",
      title: "Du bekrefter",
      meta: "Velg et av tidspunktene coachen foreslår, eller be om et nytt forslag.",
    },
    {
      state: approved ? "active" : "pending",
      icon: "calendar",
      title: "Time er booket",
      meta: "Vises i kalenderen din når den er bekreftet.",
    },
  ];
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function OnskeligOktBekreftetPage() {
  const user = await requirePortalUser();

  const request = await prisma.sessionRequest.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { coach: { select: { name: true } } },
  });

  // Ingen forespørsel funnet — vis nøktern tomstate (ingen falske data).
  if (!request) {
    return (
      <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name ?? undefined} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/gjennomfore">Gjør</TilbakeLenke>
        <Kort>
          <TomTilstand
            icon="send"
            title="Ingen ønsker ennå"
            sub="Du har ikke sendt noe ønske om økt. Send et ønske, så hjelper coachen deg å finne en tid."
          />
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Link href="/portal/onskeligokt" style={{ textDecoration: "none" }}>
              <CTAPill icon="send">Be om økt</CTAPill>
            </Link>
          </div>
        </Kort>
      </V2Shell>
    );
  }

  const coachName = request.coach?.name ?? null;
  const coachFirst = coachName?.split(" ")[0] ?? "coachen";
  const sentLabel = request.createdAt
    .toLocaleString("nb-NO", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(",", " ·");
  const note = extractNote(request.reason);
  const oktType = extractType(request.reason);
  const status = request.status as SessionRequestStatus;

  const steps = buildSteps(status, coachFirst, request.createdAt);
  const shortId = request.id.slice(-8).toUpperCase();

  return (
    <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name ?? undefined} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/gjennomfore">Gjør</TilbakeLenke>
      <OnskeligOktBekreftetV2
        data={{
          sentLabel,
          coachName,
          omraade: request.preferredArea
            ? AREA_LABEL[request.preferredArea] ?? request.preferredArea
            : null,
          onsketTid: request.preferredDate
            ? request.preferredDate.toLocaleString("nb-NO", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : null,
          oktType,
          notat: note,
          shortId,
          steg: steps,
        }}
      />
    </V2Shell>
  );
}
