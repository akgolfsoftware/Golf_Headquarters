/**
 * AgencyOS Daglig AI-brief — v2. Coachens morgenbrief: AI-oppsummering +
 * dagens nøkkeltall + agentenes forslag. getBriefData + AI-generering
 * (Anthropic) bevart 1:1. PrintButton/EksportTrigger/AgentStrip/
 * FokusSpillerPanel er tailwind-only og gjenbrukes uendret.
 */

import Link from "next/link";
import { z } from "zod";
import { FokusSpillerPanel, type FokusSpillerData } from "./_fokus-spiller";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PrintButton } from "@/components/shared/print-button";
import { EksportTrigger } from "@/components/shared/eksport-trigger";
import { AgentStrip } from "@/components/coachhq/agent-strip";
import { getBriefData, bygBriefSystemPrompt, bygBriefUserPrompt } from "@/lib/admin-brief";
import { anthropicKlient, COACH_MODEL } from "@/lib/anthropic";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { T } from "@/lib/v2/tokens";
import { Caps, Tittel, Kort, KpiFlis, StatusPill, CTAPill, TomTilstand, Icon } from "@/components/v2";

export const dynamic = "force-dynamic";

const ACTION_LABEL: Record<string, string> = {
  PYRAMID_ADJUST: "Juster pyramide",
  SESSION_ADD: "Legg til økt",
  SESSION_REMOVE: "Fjern økt",
  INTENSITY_ADJUST: "Juster intensitet",
  TAPER_ENGAGE: "Start taper",
  WITHDRAW: "Trekk fra",
  DRILL_SUGGEST: "Drill-forslag",
  TEST_SCHEDULE: "Planlegg test",
  PEER_COMPARE: "Sammenlign",
  RECOVERY_ADD: "Legg til hvile",
  ESCALATION: "Eskalering",
  DELOAD: "Pauseuke",
};

export default async function DagligBrief() {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const data = await getBriefData(coach);

  const ferskeForslag = await prisma.planAction.findMany({
    where: { status: "PENDING" },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const suggSchema = z.object({ forklaring: z.string() }).partial().nullable();
  const seenUserIds = new Set<string>();
  const fokusSpillere: FokusSpillerData[] = [];
  for (const a of ferskeForslag) {
    if (seenUserIds.has(a.user.id)) continue;
    seenUserIds.add(a.user.id);
    const name = a.user.name ?? "Ukjent spiller";
    const parts = name.split(" ").filter(Boolean);
    const initials = parts.length >= 2 ? (parts[0][0] + parts.at(-1)![0]).toUpperCase() : (parts[0]?.[0] ?? "?").toUpperCase();
    const isEscalation = a.actionType === "ESCALATION";
    const isWarn = ["TAPER_ENGAGE", "WITHDRAW", "DELOAD"].includes(a.actionType);
    const parsed = suggSchema.safeParse(a.suggestion);
    const forklaring = parsed.success ? parsed.data?.forklaring : undefined;
    fokusSpillere.push({
      id: a.user.id,
      name,
      initials,
      tone: "neu" as const,
      meta: ACTION_LABEL[a.actionType] ?? a.actionType,
      signal: isEscalation ? "Haster" : isWarn ? "Plan-justering" : "Forslag venter",
      signalType: isEscalation ? "alert" : isWarn ? "warn" : "info",
      reason: forklaring ?? `${ACTION_LABEL[a.actionType] ?? a.actionType} — foreslått av ${a.agentName}`,
    });
  }

  let aiBrief: string | null = null;
  let aiFeil: string | null = null;
  try {
    const klient = anthropicKlient();
    const respons = await klient.messages.create({
      model: COACH_MODEL,
      max_tokens: 400,
      system: bygBriefSystemPrompt(),
      messages: [{ role: "user", content: bygBriefUserPrompt(data) }],
    });
    aiBrief = respons.content.filter((b) => b.type === "text").map((b) => (b.type === "text" ? b.text : "")).join("");
  } catch (err) {
    aiFeil = err instanceof Error ? err.message : "AI-brief utilgjengelig.";
  }

  const idag = new Date();
  const ukeNr = (() => {
    const d = new Date(Date.UTC(idag.getFullYear(), idag.getMonth(), idag.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  })();
  const klokke = idag.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  const startTid = data.dagensTimer.start?.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
  const sluttTid = data.dagensTimer.slutt?.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={coach.name} avatarUrl={coach.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
        {/* Hode */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Caps>
                {idag.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase()} · Uke{" "}
                {ukeNr}
              </Caps>
              <StatusPill tone="lime">Live</StatusPill>
            </div>
            <div style={{ marginTop: 10 }}>
              <Tittel
                em={
                  data.dagensTimer.antall === 0
                    ? "Ingen økter i dag."
                    : `${data.dagensTimer.antall} ${data.dagensTimer.antall === 1 ? "økt" : "økter"} planlagt.`
                }
              >
                {idag.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long" }).replace(/^\w/, (c) => c.toUpperCase())}.
              </Tittel>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
              Brief generert {klokke} · genereres på nytt ved hvert besøk
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <PrintButton label="Skriv ut" />
            <EksportTrigger kind="brief" />
            <Link href="/admin/settings" style={{ textDecoration: "none" }}>
              <CTAPill ghost icon="settings">
                Innstillinger
              </CTAPill>
            </Link>
            <CTAPill ghost icon="mail">
              Send som e-post
            </CTAPill>
          </div>
        </div>

        {/* AI-agent hint */}
        <AgentStrip label="AK-agent · daglig brief">
          {data.dagensTimer.antall === 0
            ? "Ingen økter i dag — bruk dagen til plan-revisjon og godkjenningskøen."
            : `Du har ${data.dagensTimer.antall} ${data.dagensTimer.antall === 1 ? "økt" : "økter"} planlagt fra ${startTid} til ${sluttTid}. ${data.ventendeGodkjenninger > 0 ? `${data.ventendeGodkjenninger} agent-forslag venter på godkjenning.` : "Godkjenningskøen er tom."}`}
        </AgentStrip>

        {/* KPI-strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: T.gap }}>
          <KpiFlis label="Dagens økter" value={data.dagensTimer.antall} delta={data.dagensTimer.antall === 0 ? "Ingen bookinger" : `${startTid}–${sluttTid}`} />
          <KpiFlis label="Ventende godkjenninger" value={data.ventendeGodkjenninger} delta={data.ventendeGodkjenninger > 0 ? undefined : "Alt avklart"} />
          <KpiFlis label="Ubesvarte meldinger" value={data.ubesvarteMeldinger} delta={data.ubesvarteMeldinger === 0 ? "Innboks ryddig" : "direkte-meldinger"} />
          <KpiFlis label="Agent-output · 7d" value={data.ukenGenerert.signals} delta={`${data.ukenGenerert.planActions} plan-forslag`} />
        </div>

        {/* 01 — AI-brief */}
        <Kort eyebrow="01 · AI-brief — oppsummering av dagen" tint>
          {aiBrief ? (
            <p style={{ fontFamily: T.ui, fontSize: 13.5, lineHeight: 1.7, color: T.fg, whiteSpace: "pre-wrap", margin: 0 }}>{aiBrief}</p>
          ) : (
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0 }}>
              {aiFeil ? `Kunne ikke generere AI-brief: ${aiFeil}` : "Genererer brief…"}
            </p>
          )}
        </Kort>

        {/* 02 — Nyligste runder */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Caps>02 · Nyligste runder ({data.nyligeRunder.length})</Caps>
          {data.nyligeRunder.length === 0 ? (
            <Kort>
              <TomTilstand icon="activity" title="Ingen runder siste 24 timer" sub="Når spillere registrerer runder dukker de opp her." />
            </Kort>
          ) : (
            <Kort pad="6px 18px">
              {data.nyligeRunder.map((r, i, arr) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 0",
                    borderBottom: i === arr.length - 1 ? "none" : `1px solid ${T.border}`,
                  }}
                >
                  <div>
                    <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>{r.spiller}</div>
                    <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut }}>{r.bane}</div>
                  </div>
                  <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: r.sgTotal == null ? T.mut : r.sgTotal >= 0 ? T.up : T.down }}>
                    {r.sgTotal != null ? `${r.sgTotal >= 0 ? "+" : ""}${r.sgTotal.toFixed(1).replace(".", ",")}` : "—"}
                  </span>
                </div>
              ))}
            </Kort>
          )}
        </div>

        {/* 03 + 04 */}
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: T.gap, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Caps>03 · Agentenes anbefalinger</Caps>
            <Kort pad="12px 18px">
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 8, background: T.panel2, flexShrink: 0 }}>
                  <Icon name="bot" size={16} style={{ color: T.lime }} />
                </span>
                <div>
                  <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>Agent-pipeline aktiv</div>
                  <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2 }}>
                    {data.ukenGenerert.signals} signaler beregnet og {data.ukenGenerert.planActions} plan-forslag laget siste 7 dager.
                  </div>
                </div>
              </div>
            </Kort>

            {ferskeForslag.length === 0 ? (
              <Kort pad="12px 18px">
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 8, background: T.panel2, flexShrink: 0 }}>
                    <Icon name="check-circle" size={16} style={{ color: T.mut }} />
                  </span>
                  <div>
                    <div style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg }}>Ingen forslag venter</div>
                    <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2 }}>
                      Forslag kommer typisk etter mandag-cron eller etter ny spilleraktivitet.
                    </div>
                  </div>
                </div>
              </Kort>
            ) : (
              ferskeForslag.map((a) => {
                const sugg = a.suggestion as { forklaring?: string } | null;
                return (
                  <Link key={a.id} href={`/admin/spillere/${a.user.id}`} style={{ textDecoration: "none" }}>
                    <Kort hover pad="12px 18px">
                      <div style={{ display: "flex", gap: 12 }}>
                        <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 8, background: T.panel2, flexShrink: 0 }}>
                          <Icon name="sparkles" size={16} style={{ color: T.lime }} />
                        </span>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: T.ui, fontSize: 13, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {a.user.name}
                            </span>
                            <span style={{ fontFamily: T.mono, fontSize: 9, textTransform: "uppercase", color: T.mut, background: T.panel3, borderRadius: 4, padding: "1px 6px" }}>
                              {ACTION_LABEL[a.actionType] ?? a.actionType}
                            </span>
                          </div>
                          <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {sugg?.forklaring ?? a.agentName}
                          </div>
                        </div>
                      </div>
                    </Kort>
                  </Link>
                );
              })
            )}

            {data.ventendeGodkjenninger > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>{data.ventendeGodkjenninger} forslag venter totalt</span>
                <Link href="/admin/approvals" style={{ fontFamily: T.ui, fontSize: 12, color: T.lime, fontWeight: 600, textDecoration: "none" }}>
                  Åpne godkjenningskø →
                </Link>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Caps>04 · Krever oppmerksomhet</Caps>
            <FokusSpillerPanel spillere={fokusSpillere} />
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${T.border}`, paddingTop: 16 }}>
          <span style={{ fontFamily: T.mono, fontSize: 10.5, textTransform: "uppercase", color: T.mut }}>AgencyOS · Daglig brief</span>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>
            Uke {ukeNr} · {klokke}
          </span>
        </div>
      </div>
    </V2Shell>
  );
}
