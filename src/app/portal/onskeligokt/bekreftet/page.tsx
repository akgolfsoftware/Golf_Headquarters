// PH21OnskeligOktBekreftet — Precision Athletics. Data og handlinger er beholdt.
import { redirect } from "next/navigation";
import { Check, Clock, Calendar, Send } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { SessionRequestStatus } from "@/generated/prisma/client";
import { SideHode, Side, Kort } from "@/components/precision/pa-a4";
import { KnappLenke, StatusPille, TomTilstand, Meta } from "@/components/precision/pa";
import "@/styles/precision-komponenter.css";

export const dynamic = "force-dynamic";

const AREA_LABEL: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

function extractNote(reason: string): string | null {
  const lines = reason.split("\n").map((l) => l.trim());
  const msg = lines.find((l) => l.startsWith("Melding:"))?.slice("Melding:".length).trim();
  const detail = lines.find((l) => l.startsWith("Detalj:"))?.slice("Detalj:".length).trim();
  return msg || detail || null;
}

export default async function OnskeligOktBekreftetPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const request = await prisma.sessionRequest.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { coach: { select: { name: true } } },
  });

  if (!request) {
    return (
      <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
        <Side max={800}>
          <SideHode kicker="Ønsket økt" title="Bekreftelse" sub="Status for sendt ønske" />
          <Kort pad={24} gap={16}>
            <TomTilstand
              icon={Send}
              title="Ingen ønsker ennå"
              text="Du har ikke sendt noe ønske om økt. Send et ønske, så hjelper coachen deg å finne en tid."
            />
            <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
              <KnappLenke href="/portal/onskeligokt">Be om økt</KnappLenke>
            </div>
          </Kort>
        </Side>
      </PlayerHQSkall>
    );
  }

  const coachName = request.coach?.name ?? "Anders Kristiansen";
  const coachFirst = coachName.split(" ")[0] ?? "coachen";
  const sentLabel = request.createdAt.toLocaleString("nb-NO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const note = extractNote(request.reason);
  const status = request.status as SessionRequestStatus;
  const area = request.preferredArea ? AREA_LABEL[request.preferredArea] ?? request.preferredArea : "Trening";

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <Side max={800}>
        <SideHode
          kicker="Innboks · Ønsket økt"
          title="Ønske er sendt"
          sub={`${coachFirst} har mottatt ønsket ditt og svarer så snart som mulig.`}
          actions={
            <KnappLenke variant="secondary" href="/portal/coach?tab=ønske">
              Se i innboks
            </KnappLenke>
          }
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Kort pad={16} gap={12}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="kicker">{area.toUpperCase()}</span>
              <StatusPille tone={status === "APPROVED" ? "ok" : status === "DECLINED" ? "warn" : "neutral"}>
                {status === "APPROVED" ? "Godtatt" : status === "DECLINED" ? "Avslått" : "Venter på coach"}
              </StatusPille>
            </div>

            {note && (
              <p style={{ margin: "4px 0 0", font: "var(--type-body)", color: "var(--text-primary)" }}>
                «{note}»
              </p>
            )}

            <Meta>SENDT {sentLabel.toUpperCase()} · TIL {coachName.toUpperCase()}</Meta>
          </Kort>

          <Kort pad={16} gap={12}>
            <span className="kicker">Hva skjer nå?</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "999px",
                    background: "var(--surface-flat)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                  }}
                >
                  <Check size={14} style={{ color: "var(--text-primary)" }} />
                </div>
                <div>
                  <div style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>
                    Ønsket er registrert
                  </div>
                  <div style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
                    Coachen har mottatt meldingen.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "999px",
                    background: "var(--surface-flat)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                  }}
                >
                  <Clock size={14} style={{ color: "var(--text-primary)" }} />
                </div>
                <div>
                  <div style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>
                    Coach sjekker planen
                  </div>
                  <div style={{ font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
                    Hvis det passer inn i ukeplanen, legges økten til.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "999px",
                    background: "var(--surface-flat)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "none",
                  }}
                >
                  <Calendar size={14} style={{ color: "var(--text-muted)" }} />
                </div>
                <div>
                  <div style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-muted)" }}>
                    Vises i kalenderen din
                  </div>
                  <div style={{ font: "var(--type-body-s)", color: "var(--text-muted)" }}>
                    Du får beskjed i innboksen når planen er oppdatert.
                  </div>
                </div>
              </div>
            </div>
          </Kort>
        </div>
      </Side>
    </PlayerHQSkall>
  );
}
