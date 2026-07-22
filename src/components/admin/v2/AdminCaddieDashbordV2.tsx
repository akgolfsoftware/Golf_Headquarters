"use client";

/**
 * AgencyOS Caddie-dashbord — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * Co-agent: utkast · fleet · audit. T.* only.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Caps, Tittel, Kort, Rad, StatusPill, Knapp, TomTilstand, CTAPill, Icon, T, type StatusTone } from "@/components/v2";
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
      <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: T.fg }}>
        {n} · {title}
      </span>
      <span style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", color: T.mut }}>{sub}</span>
      <span style={{ marginLeft: "auto", borderRadius: 9999, background: T.panel3, padding: "2px 9px", fontFamily: T.mono, fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", color: T.mut }}>
        {badge}
      </span>
    </div>
  );
}

function FotRegel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.border}`, fontFamily: T.mono, fontSize: 10.5, lineHeight: 1.7, color: T.mut }}>
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
        <TomTilstand icon="check" title="Ingen utkast venter" sub="Når en co-agent foreslår en endring, dukker den opp her med kildebruk, diff og tre valg: godkjenn, rediger eller avvis." />
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
            <span style={{ width: 7, height: 7, borderRadius: 9999, background: T.lime }} />
            <Caps size={9}>UTKAST FRA <span style={{ color: T.fg }}>{draft.agentName.toUpperCase()}</span></Caps>
          </div>
          <h3 style={{ margin: 0, fontFamily: T.disp, fontSize: 18, fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.015em", color: T.fg }}>
            {draft.title}
          </h3>
          <p style={{ marginTop: 8, fontFamily: T.ui, fontSize: 13, lineHeight: 1.5, color: T.mut }}>{draft.rationale}</p>

          {draft.sources.length > 0 && (
            <div style={{ marginTop: 14, borderRadius: 12, border: `1px solid ${T.border}`, padding: "10px 12px" }}>
              <Caps size={9} style={{ marginBottom: 6 }}>BYGGET PÅ</Caps>
              {draft.sources.map((src, i) => (
                <div key={src.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < draft.sources.length - 1 ? `1px dashed ${T.border}` : "none" }}>
                  <span style={{ width: 22, height: 22, flex: "none", borderRadius: 6, background: T.panel2, display: "inline-flex", alignItems: "center", justifyContent: "center", color: T.lime }}>
                    <Icon name={src.icon} size={12} />
                  </span>
                  <div style={{ minWidth: 0, flex: 1, fontFamily: T.ui, fontSize: 12, fontWeight: 600, lineHeight: 1.3, color: T.fg }}>
                    {src.title}
                    {src.sub && <span style={{ marginTop: 1, display: "block", fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.mut }}>{src.sub}</span>}
                  </div>
                  <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 800, color: T.lime, fontVariantNumeric: "tabular-nums" }}>{src.weight}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* diff */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <StatusPill>Diff-visning</StatusPill>
            <span style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut }}>
              {draft.versionLabel} · <b style={{ color: T.fg, fontWeight: 800 }}>{draft.changeLabel}</b>
            </span>
          </div>
          {draft.rows.length > 0 ? (
            <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, overflow: "hidden" }}>
              {draft.rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[60px_1fr]" style={{ borderBottom: i < draft.rows.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ borderRight: `1px solid ${T.border}`, background: T.panel2, padding: "9px 10px", fontFamily: T.mono, fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mut }}>
                    {r.day}
                  </span>
                  <span style={{ padding: "9px 10px", fontFamily: T.ui, fontSize: 12.5, lineHeight: 1.4, color: T.fg }}>
                    {r.text}
                    {r.sub && <span style={{ marginTop: 2, display: "block", fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, color: T.mut }}>{r.sub}</span>}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ borderRadius: 12, border: `1px dashed ${T.border}`, padding: "18px 14px", textAlign: "center", fontFamily: T.ui, fontSize: 12.5, color: T.mut }}>
              Strukturert diff er ikke tilgjengelig for dette utkastet. Se sammendraget under.
            </div>
          )}
          <div style={{ marginTop: 12, display: "flex", gap: 10, borderRadius: 12, background: T.panel2, padding: "10px 12px" }}>
            <Icon name="git-pull-request" size={15} style={{ color: T.lime, marginTop: 2, flex: "none" }} />
            <div>
              <Caps size={9} color={T.lime} style={{ marginBottom: 2 }}>DIFF · SAMMENDRAG</Caps>
              <div style={{ fontFamily: T.ui, fontSize: 12, lineHeight: 1.5, color: T.fg }}>{draft.diffSummary}</div>
            </div>
          </div>
        </div>

        {/* handlinger */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, borderRadius: 12, background: T.forest, padding: "9px 11px" }}>
            <span style={{ width: 26, height: 26, borderRadius: 9999, background: T.lime, color: T.onLime, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.disp, fontWeight: 700, fontSize: 11 }}>
              {draft.agentInitials}
            </span>
            <div style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 800, textTransform: "uppercase", lineHeight: 1.3, color: T.lime }}>
              FRA <span style={{ color: T.fg }}>{draft.agentName}</span>
              <span style={{ marginTop: 1, display: "block", fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, color: "rgba(238,240,236,0.6)" }}>co-agent · alfa</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 7, borderRadius: 10, border: `1px solid ${T.border}`, padding: "8px 10px", fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.mut }}>
            <Icon name="clock" size={12} />
            Generert <b style={{ color: T.fg, fontWeight: 800 }}>{draft.generatedLabel}</b>
            {draft.dueLabel && <> · forfaller <b style={{ color: T.fg, fontWeight: 800 }}>{draft.dueLabel}</b></>}
          </div>

          {draft.confidence != null && (
            <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, padding: 12 }}>
              <Caps size={9} style={{ marginBottom: 8 }}>MODELL-KONFIDENS</Caps>
              <div style={{ height: 6, borderRadius: 9999, background: T.track, overflow: "hidden", marginBottom: 6 }}>
                <div style={{ height: "100%", borderRadius: 9999, width: `${draft.confidence}%`, background: T.lime }} />
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.fg }}>
                <b style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>{draft.confidence}%</b>
                <span style={{ color: T.mut }}>· {draft.confidenceNote}</span>
              </div>
            </div>
          )}

          <Knapp icon="check" full onClick={() => router.push(godkjennHref)}>Godkjenn og send</Knapp>
          <Knapp icon="pencil" ghost full onClick={() => router.push(godkjennHref)}>Rediger først</Knapp>
          <Knapp icon="x" ghost full onClick={() => router.push(godkjennHref)}>Avvis</Knapp>
        </div>
      </div>

      <FotRegel>
        <b style={{ color: T.fg, fontWeight: 800 }}>Prinsipp.</b> Tre-handlingsstruktur er hellig: <b style={{ color: T.fg }}>Godkjenn</b> (primær), <b style={{ color: T.fg }}>Rediger</b> (sekundær, åpner inline-edit), <b style={{ color: T.fg }}>Avvis</b> (tertiær, med valgfri grunn). Kildebruk er forklart med vekting — agenten viser arbeidet. Konfidens-score er aldri en knapp; den hjelper coachen velge hvor nøye diff-en må leses.
      </FotRegel>
    </Kort>
  );
}

// ── SEKSJON 2 — AGENT-FORVALTNING ───────────────────────────────
function ModenhetBars({ level }: { level: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }} aria-hidden>
      {[1, 2, 3, 4].map((i) => (
        <span key={i} style={{ width: 10, height: 13, borderRadius: 2, border: `1.5px solid ${i <= level ? T.lime : T.borderS}`, background: i <= level ? T.lime : "transparent" }} />
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between" style={{ gap: 12, paddingBottom: 14, marginBottom: 4, borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, letterSpacing: "-0.015em", color: T.fg }}>Co-agent fleet</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {stats.map((s) => (
            <div key={s.label}>
              <Caps size={9}>{s.label}</Caps>
              <div style={{ fontFamily: T.mono, fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em", color: s.tone === "live" ? T.up : s.tone === "draft" ? T.warn : T.fg, fontVariantNumeric: "tabular-nums" }}>
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
                <span style={{ width: 30, height: 30, flex: "none", borderRadius: 9, display: "inline-flex", alignItems: "center", justifyContent: "center", background: T.panel2, color: T.fg2 }}>
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
                    <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 800, color: T.fg2 }}>{a.maturity}/4</span>
                  </div>
                  <span style={{ width: 60, fontFamily: T.mono, fontSize: 11, fontWeight: 800, color: T.fg2, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {a.accuracy != null ? `${a.accuracy}%` : "—"}
                  </span>
                  <span style={{ width: 44, textAlign: "right", fontFamily: T.mono, fontSize: 13, fontWeight: 800, color: T.fg }}>{a.runs7d}</span>
                </div>
              }
            />
          ))}
        </div>
      )}
      {/* mobil-detaljer under hver rad ville kreve egen liste; kort-lista over dekker kjernefeltene på alle bredder */}
      <FotRegel>
        <b style={{ color: T.fg, fontWeight: 800 }}>Prinsipp.</b> 4-trinns modenhet: Skisse (1) → Forslag (2) → Utkast (3) → Autopilot (4). En agent kan ikke hoppe modenhet — den må kjøres på N-nivå med ≥ 80% treff over ≥ 20 kjøringer for å promoteres. Treff under 60% eller for få kjøringer demper UI-en og blokkerer promotion.
      </FotRegel>
    </Kort>
  );
}

// ── SEKSJON 3 — AUDIT-LOG ───────────────────────────────────────
function AuditPanelV2({ audit }: { audit: AuditRow[] }) {
  return (
    <Kort>
      <div style={{ paddingBottom: 14, marginBottom: 4, borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, letterSpacing: "-0.015em", color: T.fg }}>Audit · co-agent fleet</span>
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
                <span style={{ width: 8, height: 8, flex: "none", borderRadius: 9999, background: r.actor === "agent" ? T.lime : T.info }} />
              }
              title={
                <span>
                  {r.actorName}{" "}
                  <span style={{ fontWeight: 400, color: T.mut }}>{r.what}</span>
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
        <b style={{ color: T.fg, fontWeight: 800 }}>Prinsipp.</b> Agent og menneske er likestilt i audit-loggen — samme rad-form, samme tids-presisjon, samme verktøy. Avvist-rader med menneske-feedback brukes som treningsdata for å forbedre agentens forslag.
      </FotRegel>
    </Kort>
  );
}

// ── Hovedkomponent ──────────────────────────────────────────────
export function AdminCaddieDashbordV2({ coachFirstName, dateLabel, timeLabel, draft, fleet, fleetSummary, audit }: CoAgentProps) {
  const statusTekst = draft ? "Utkast venter" : fleetSummary.active > 0 ? `${fleetSummary.active} aktive` : "Klar";
  const statusTone: StatusTone = draft ? "warn" : fleetSummary.active > 0 ? "lime" : "info";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div>
          <Caps>AgencyOS · Co-agent</Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="caddien jobber for deg.">{`God dag, ${coachFirstName} —`}</Tittel>
          </div>
          <p style={{ marginTop: 8, maxWidth: 720, fontFamily: T.ui, fontSize: 13, lineHeight: 1.55, color: T.mut }}>
            Utkast-til-godkjenning, agent-forvaltning og audit. Utgående handlinger krever alltid godkjenning.
          </p>
          <div style={{ marginTop: 10, fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mut }}>
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
