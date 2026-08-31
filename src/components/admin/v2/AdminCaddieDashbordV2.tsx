"use client";
import { TL } from "@/lib/v2/train-lock";
import { AK } from "@/lib/v2/ak-palett";

/**
 * AgencyOS Caddie-dashbord — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Co-agent: utkast · fleet · audit. T.* only.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Caps, Kort, Rad, StatusPill, Knapp, TomTilstand, CTAPill, Icon, type StatusTone } from "@/components/v2";
import type {
  AuditRow,
  CoAgentDraft,
  CoAgentProps,
  CoAgentStatus,
  FleetAgent,
  FleetSummary,
} from "@/lib/admin-caddie/co-agent-data";

const STATUS_TONE: Record<CoAgentStatus, StatusTone> = {
  live: "up",
  draft: "warn",
  paused: "info",
  review: "down",
};
const STATUS_LABEL: Record<CoAgentStatus, string> = {
  live: "Live",
  draft: "Utkast",
  paused: "Pause",
  review: "Eval",
};
const OUTCOME_TONE: Record<AuditRow["outcome"], StatusTone> = {
  ok: "up",
  appr: "lime",
  rej: "down",
  skip: "info",
  draft: "warn",
  routed: "up",
};

function SeksjonHode({ n, title, sub, badge }: { n: string; title: string; sub: string; badge: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <span style={{ fontFamily: TL.font.mono, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: TL.text }}>
        {n} · {title}
      </span>
      <span style={{ fontFamily: TL.font.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", color: TL.mute }}>{sub}</span>
      <span style={{ marginLeft: "auto", borderRadius: 9999, background: TL.dim, padding: "2px 9px", fontFamily: TL.font.mono, fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", color: TL.mute }}>
        {badge}
      </span>
    </div>
  );
}

function FotRegel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${TL.hair}`, fontFamily: TL.font.mono, fontSize: 10.5, lineHeight: 1.7, color: TL.mute }}>
      {children}
    </div>
  );
}

// ── SEKSJON 1 — UTKAST → GODKJENNING ────────────────────────────
function DraftPanelV2({ draft }: { draft: CoAgentDraft }) {
  const router = useRouter();
  if (!draft) {
    return (
      <Kort>
        <TomTilstand icon="check" title="Ingen utkast venter" sub="Co-agent foreslår kun endringer fra ekte data og godkjent drill-bank. Tom bank = ingen drill-forslag. Når noe venter: godkjenn, rediger eller avvis." />
      </Kort>
    );
  }
  // Godkjenn/rediger/avvis skjer på den ekte godkjenning-detaljsiden (samme
  // PlanAction, samme actions som /admin/godkjenninger) — aldri auto-send
  // herfra.
  const godkjennHref = `/admin/godkjenninger/${draft.id}`;
  return (
    <Kort>
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1.4fr_1fr]" style={{ gap: 18 }}>
        {/* meta + kilder */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
            <span style={{ width: 7, height: 7, borderRadius: 9999, background: TL.fill }} />
            <Caps size={9}>UTKAST FRA <span style={{ color: TL.text }}>{draft.agentName.toUpperCase()}</span></Caps>
          </div>
          <h3 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 18, fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.015em", color: TL.text }}>
            {draft.title}
          </h3>
          <p style={{ marginTop: 8, fontFamily: TL.font.sans, fontSize: 13, lineHeight: 1.5, color: TL.mute }}>{draft.rationale}</p>

          {draft.sources.length > 0 && (
            <div style={{ marginTop: 14, borderRadius: 12, border: `1px solid ${TL.hair}`, padding: "10px 12px" }}>
              <Caps size={9} style={{ marginBottom: 6 }}>BYGGET PÅ</Caps>
              {draft.sources.map((src, i) => (
                <div key={src.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < draft.sources.length - 1 ? `1px dashed ${TL.hair}` : "none" }}>
                  <span style={{ width: 22, height: 22, flex: "none", borderRadius: 6, background: TL.dock, display: "inline-flex", alignItems: "center", justifyContent: "center", color: TL.fill }}>
                    <Icon name={src.icon} size={12} />
                  </span>
                  <div style={{ minWidth: 0, flex: 1, fontFamily: TL.font.sans, fontSize: 12, fontWeight: 600, lineHeight: 1.3, color: TL.text }}>
                    {src.title}
                    {src.sub && <span style={{ marginTop: 1, display: "block", fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, color: TL.mute }}>{src.sub}</span>}
                  </div>
                  <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 800, color: TL.fill, fontVariantNumeric: "tabular-nums" }}>{src.weight}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* diff */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <StatusPill>Diff-visning</StatusPill>
            <span style={{ marginLeft: "auto", fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, color: TL.mute }}>
              {draft.versionLabel} · <b style={{ color: TL.text, fontWeight: 800 }}>{draft.changeLabel}</b>
            </span>
          </div>
          {draft.rows.length > 0 ? (
            <div style={{ borderRadius: 12, border: `1px solid ${TL.hair}`, overflow: "hidden" }}>
              {draft.rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[60px_1fr]" style={{ borderBottom: i < draft.rows.length - 1 ? `1px solid ${TL.hair}` : "none" }}>
                  <span style={{ borderRight: `1px solid ${TL.hair}`, background: TL.dock, padding: "9px 10px", fontFamily: TL.font.mono, fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: TL.mute }}>
                    {r.day}
                  </span>
                  <span style={{ padding: "9px 10px", fontFamily: TL.font.sans, fontSize: 12.5, lineHeight: 1.4, color: TL.text }}>
                    {r.text}
                    {r.sub && <span style={{ marginTop: 2, display: "block", fontFamily: TL.font.mono, fontSize: 9.5, fontWeight: 700, color: TL.mute }}>{r.sub}</span>}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ borderRadius: 12, border: `1px dashed ${TL.hair}`, padding: "18px 14px", textAlign: "center", fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute }}>
              Strukturert diff er ikke tilgjengelig for dette utkastet. Se sammendraget under.
            </div>
          )}
          <div style={{ marginTop: 12, display: "flex", gap: 10, borderRadius: 12, background: TL.dock, padding: "10px 12px" }}>
            <Icon name="git-pull-request" size={15} style={{ color: TL.fill, marginTop: 2, flex: "none" }} />
            <div>
              <Caps size={9} color={TL.fill} style={{ marginBottom: 2 }}>DIFF · SAMMENDRAG</Caps>
              <div style={{ fontFamily: TL.font.sans, fontSize: 12, lineHeight: 1.5, color: TL.text }}>{draft.diffSummary}</div>
            </div>
          </div>
        </div>

        {/* handlinger */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, borderRadius: 12, background: TL.fill, padding: "9px 11px" }}>
            <span style={{ width: 26, height: 26, borderRadius: 9999, background: TL.fill, color: TL.onFill, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: TL.font.sans, fontWeight: 700, fontSize: 11 }}>
              {draft.agentInitials}
            </span>
            <div style={{ fontFamily: TL.font.mono, fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", lineHeight: 1.3, color: TL.fill }}>
              FRA <span style={{ color: TL.text }}>{draft.agentName}</span>
              <span style={{ marginTop: 1, display: "block", fontFamily: TL.font.mono, fontSize: 8.5, fontWeight: 700, color: AK.farge.taakeMerkeA60 }}>co-agent · alfa</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 7, borderRadius: 10, border: `1px solid ${TL.hair}`, padding: "8px 10px", fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, color: TL.mute }}>
            <Icon name="clock" size={12} />
            Generert <b style={{ color: TL.text, fontWeight: 800 }}>{draft.generatedLabel}</b>
            {draft.dueLabel && <> · forfaller <b style={{ color: TL.text, fontWeight: 800 }}>{draft.dueLabel}</b></>}
          </div>

          {draft.confidence != null && (
            <div style={{ borderRadius: 12, border: `1px solid ${TL.hair}`, padding: 12 }}>
              <Caps size={9} style={{ marginBottom: 8 }}>MODELL-KONFIDENS</Caps>
              <div style={{ height: 6, borderRadius: 9999, background: TL.hair, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", borderRadius: 9999, width: `${draft.confidence}%`, background: TL.fill }} />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, fontFamily: TL.font.mono, fontSize: 11, fontWeight: 700, color: TL.text }}>
                <b style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>{draft.confidence}%</b>
                <span style={{ color: TL.mute }}>· {draft.confidenceNote}</span>
              </div>
            </div>
          )}

          <Knapp icon="check" full onClick={() => router.push(godkjennHref)}>Godkjenn og send</Knapp>
          <Knapp icon="pencil" ghost full onClick={() => router.push(godkjennHref)}>Rediger først</Knapp>
          <Knapp icon="x" ghost full onClick={() => router.push(godkjennHref)}>Avvis</Knapp>
        </div>
      </div>

      <FotRegel>
        <b style={{ color: TL.text, fontWeight: 800 }}>Prinsipp.</b> Tre-handlingsstruktur er hellig: <b style={{ color: TL.text }}>Godkjenn</b> (primær), <b style={{ color: TL.text }}>Rediger</b> (sekundær, åpner inline-edit), <b style={{ color: TL.text }}>Avvis</b> (tertiær, med valgfri grunn). Kildebruk er forklart med vekting — agenten viser arbeidet. Konfidens-score er aldri en knapp; den hjelper coachen velge hvor nøye diff-en må leses.
      </FotRegel>
    </Kort>
  );
}

// ── SEKSJON 2 — AGENT-FORVALTNING ───────────────────────────────
function ModenhetBars({ level }: { level: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }} aria-hidden>
      {[1, 2, 3, 4].map((i) => (
        <span key={i} style={{ width: 10, height: 13, borderRadius: 2, border: `1.5px solid ${i <= level ? TL.fill : TL.hair}`, background: i <= level ? TL.fill : "transparent" }} />
      ))}
    </span>
  );
}

function FleetPanelV2({ fleet, summary }: { fleet: FleetAgent[]; summary: FleetSummary }) {
  const stats: { label: string; value: string; tone?: "live" | "draft" }[] = [
    { label: "TOTALT", value: String(summary.total) },
    { label: "AKTIVE", value: String(summary.active), tone: "live" },
    { label: "UTKAST", value: String(summary.draft), tone: "draft" },
    { label: "SNITT TREFF", value: summary.avgAccuracy != null ? `${summary.avgAccuracy}%` : "—" },
    { label: "KJØRT 7D", value: String(summary.runs7d) },
  ];
  return (
    <Kort>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ gap: 12, paddingBottom: 14, marginBottom: 4, borderBottom: `1px solid ${TL.hair}` }}>
        <span style={{ fontFamily: TL.font.sans, fontSize: 16, fontWeight: 700, letterSpacing: "-0.015em", color: TL.text }}>Co-agent fleet</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {stats.map((s) => (
            <div key={s.label}>
              <Caps size={9}>{s.label}</Caps>
              <div style={{ fontFamily: TL.font.mono, fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em", color: s.tone === "live" ? TL.ok : s.tone === "draft" ? TL.warn : TL.text, fontVariantNumeric: "tabular-nums" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {fleet.length === 0 ? (
        <TomTilstand icon="bot" title="Ingen agent-kjøringer registrert" sub="Forvaltnings-tabellen fylles automatisk så snart co-agentene begynner å kjøre." />
      ) : (
        <div>
          {fleet.map((a, i) => (
            <Rad
              key={a.id}
              last={i === fleet.length - 1}
              leading={
                <span style={{ width: 30, height: 30, flex: "none", borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", background: TL.dock, color: TL.mute }}>
                  <Icon name={a.icon} size={14} />
                </span>
              }
              title={a.name}
              sub={a.role}
              trailing={null}
              meta={
                <div className="hidden sm:flex" style={{ alignItems: "center", gap: 16, flex: "none" }}>
                  <StatusPill tone={STATUS_TONE[a.status]}>{STATUS_LABEL[a.status]}</StatusPill>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ModenhetBars level={a.maturity} />
                    <span style={{ fontFamily: TL.font.mono, fontSize: 9.5, fontWeight: 800, color: TL.mute }}>{a.maturity}/4</span>
                  </div>
                  <span style={{ width: 60, fontFamily: TL.font.mono, fontSize: 11, fontWeight: 800, color: TL.mute, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {a.accuracy != null ? `${a.accuracy}%` : "—"}
                  </span>
                  <span style={{ width: 44, textAlign: "right", fontFamily: TL.font.mono, fontSize: 13, fontWeight: 800, color: TL.text }}>{a.runs7d}</span>
                </div>
              }
            />
          ))}
        </div>
      )}
      {/* mobil-detaljer under hver rad ville kreve egen liste; kort-lista over dekker kjernefeltene på alle bredder */}
      <FotRegel>
        <b style={{ color: TL.text, fontWeight: 800 }}>Prinsipp.</b> 4-trinns modenhet: Skisse (1) → Forslag (2) → Utkast (3) → Autopilot (4). En agent kan ikke hoppe modenhet — den må kjøres på N-nivå med ≥ 80% treff over ≥ 20 kjøringer for å promoteres. Treff under 60% eller for få kjøringer demper UI-en og blokkerer promotion.
      </FotRegel>
    </Kort>
  );
}

// ── SEKSJON 3 — AUDIT-LOG ───────────────────────────────────────
function AuditPanelV2({ audit }: { audit: AuditRow[] }) {
  return (
    <Kort>
      <div style={{ paddingBottom: 14, marginBottom: 4, borderBottom: `1px solid ${TL.hair}` }}>
        <span style={{ fontFamily: TL.font.sans, fontSize: 16, fontWeight: 700, letterSpacing: "-0.015em", color: TL.text }}>Audit · co-agent fleet</span>
      </div>
      {audit.length === 0 ? (
        <TomTilstand icon="file-text" title="Ingen hendelser ennå" sub="Hver tolkning, hvert utkast, hver godkjenning og hver avvisning lander her — agent og menneske i samme logg." />
      ) : (
        <div>
          {audit.map((r, i) => (
            <Rad
              key={r.id}
              last={i === audit.length - 1}
              leading={
                <span style={{ width: 8, height: 8, flex: "none", borderRadius: 9999, background: r.actor === "agent" ? TL.fill : TL.viz.target }} />
              }
              title={
                <span>
                  {r.actorName}{" "}
                  <span style={{ fontWeight: 400, color: TL.mute }}>{r.what}</span>
                </span>
              }
              sub={`${r.actorMeta} · ${r.dayLabel} ${r.timeLabel}`}
              meta={<StatusPill tone={OUTCOME_TONE[r.outcome]}>{r.outcomeLabel}</StatusPill>}
              trailing={null}
            />
          ))}
        </div>
      )}
      <FotRegel>
        <b style={{ color: TL.text, fontWeight: 800 }}>Prinsipp.</b> Agent og menneske er likestilt i audit-loggen — samme rad-form, samme tids-presisjon, samme verktøy. Avvist-rader med menneske-feedback brukes som treningsdata for å forbedre agentens forslag.
      </FotRegel>
    </Kort>
  );
}

// ── Hovedkomponent ──────────────────────────────────────────────
export function AdminCaddieDashbordV2({ coachFirstName: _coachFirstName, dateLabel, timeLabel, draft, fleet, fleetSummary, audit }: CoAgentProps) {
  const statusTekst = draft ? "Utkast venter" : fleetSummary.active > 0 ? `${fleetSummary.active} aktive` : "Klar";
  const statusTone: StatusTone = draft ? "warn" : fleetSummary.active > 0 ? "lime" : "info";

  return (
    <div data-paper-wave-h="caddie-dashbord" data-paper-pattern style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Caddie</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>Dashbord</span>
        </div>
          <p style={{ marginTop: 8, maxWidth: 720, fontFamily: TL.font.sans, fontSize: 13, lineHeight: 1.55, color: TL.mute }}>
            Utkast-til-godkjenning, agent-forvaltning og audit. Utgående handlinger krever alltid godkjenning.
          </p>
          <div style={{ marginTop: 10, fontFamily: TL.font.mono, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: TL.mute }}>
            {dateLabel} · {timeLabel}
          </div>
        </div>
        <StatusPill tone={statusTone}>{statusTekst}</StatusPill>
      </div>

      {/* B: én primær CTA */}
      <Link
        href={draft ? `/admin/godkjenninger/${draft.id}` : "/admin/godkjenninger"}
        style={{ textDecoration: "none", display: "block" }}
      >
        <CTAPill icon={draft ? "check" : "inbox"} full>
          {draft ? "Behandle utkast" : "Åpne godkjenninger"}
        </CTAPill>
      </Link>

      <SeksjonHode n="1" title="Utkast-til-godkjenning" sub="kildebruk · diff · godkjenn / rediger / avvis" badge="PLAN-JUSTERING" />
      <DraftPanelV2 draft={draft} />

      <SeksjonHode n="2" title="Agent-forvaltning" sub="status · modenhet · treffsikkerhet · sist kjørt" badge={`${fleet.length} ${fleet.length === 1 ? "AGENT" : "AGENTER"}`} />
      <FleetPanelV2 fleet={fleet} summary={fleetSummary} />

      <SeksjonHode n="3" title="Audit-log" sub="agent og menneske · samme logg · samme språk" badge={`SISTE ${audit.length} HENDELSER`} />
      <AuditPanelV2 audit={audit} />

      <Link href="/admin/agencyos/caddie/aktivitet" style={{ textDecoration: "none", display: "block" }}>
        <CTAPill ghost icon="activity" full>
          Se full aktivitetslogg
        </CTAPill>
      </Link>
    </div>
  );
}
