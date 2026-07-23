"use client";

/**
 * AI-dispatch-panel — komplett polish (Mobbin-inspo: Linear · Superhuman · Notion AI).
 *
 * Hierarki (5 sek):
 * 1) Én ting NÅ (lime) → 2) mini-status → 3) haster-rader → 4) valgfrie → 5) snarveier
 *
 * Tokens: AK v2. Lime KUN på NÅ/live-steg. Ingen emoji. ADHD: én primær CTA.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Caps,
  Kort,
  StatusPill,
  CTAPill,
  TomTilstand,
  Icon,
} from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import type { AiDispatchData, AiDispatchRad } from "@/lib/agencyos/ai-dispatch-build";

const TEAM_STEG = ["Research", "Utkast", "Review"] as const;

function TeamStegIndikator({ mode }: { mode: "running" | "failed" | "idle" }) {
  const aktiv = mode === "running" ? 0 : mode === "failed" ? 2 : -1;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        marginTop: 8,
        flexWrap: "wrap",
      }}
      aria-label={`Agent-team: ${TEAM_STEG.join(", ")}`}
    >
      {TEAM_STEG.map((navn, i) => {
        const erAktiv = i === aktiv && mode === "running";
        const erFeil = mode === "failed" && i === 2;
        const ferdig = mode === "running" ? i < aktiv : mode === "idle";
        const farge = erFeil ? T.down : erAktiv ? T.lime : ferdig && mode === "idle" ? T.mut : T.mut;
        const bg = erFeil
          ? `color-mix(in srgb, ${T.down} 14%, transparent)`
          : erAktiv
            ? `color-mix(in srgb, ${T.lime} 14%, transparent)`
            : T.panel3;
        return (
          <span key={navn} style={{ display: "inline-flex", alignItems: "center" }}>
            {i > 0 && (
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 1,
                  background: T.border,
                  flex: "none",
                }}
              />
            )}
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                color: farge,
                background: bg,
                borderRadius: 6,
                padding: "3px 7px",
                border: `1px solid ${erAktiv || erFeil ? "transparent" : T.border}`,
              }}
            >
              {i + 1}·{navn}
            </span>
          </span>
        );
      })}
    </div>
  );
}

function teamMode(rad: AiDispatchRad): "running" | "failed" | "idle" | null {
  if (rad.til !== "agent-team") return null;
  if (rad.id === "agent-team-running") return "running";
  if (rad.id === "agent-team-failed") return "failed";
  return "idle";
}

function MiniStat({
  label,
  value,
  warn,
}: {
  label: string;
  value: number;
  warn?: boolean;
}) {
  if (value <= 0) return null;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minWidth: 56,
        padding: "8px 10px",
        borderRadius: 10,
        background: warn
          ? `color-mix(in srgb, ${T.warn} 10%, ${T.panel2})`
          : T.panel2,
        border: `1px solid ${warn ? `color-mix(in srgb, ${T.warn} 35%, ${T.border})` : T.border}`,
      }}
    >
      <span
        style={{
          fontFamily: T.mono,
          fontSize: 16,
          fontWeight: 700,
          color: warn ? T.warn : T.fg,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </span>
      <Caps size={9} color={T.mut}>
        {label}
      </Caps>
    </div>
  );
}

function DispatchRad({
  rad,
  last,
  onOpen,
}: {
  rad: AiDispatchRad;
  last: boolean;
  onOpen: () => void;
}) {
  const haster = rad.prioritet === "hoy";
  const team = teamMode(rad);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="v2-row-h v2-focus"
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 0,
        width: "100%",
        textAlign: "left",
        appearance: "none",
        background: haster
          ? `color-mix(in srgb, ${T.warn} 8%, transparent)`
          : "transparent",
        border: haster ? `1px solid color-mix(in srgb, ${T.warn} 22%, ${T.border})` : "none",
        borderBottom: haster || last ? (haster ? undefined : "none") : `1px solid ${T.border}`,
        borderRadius: haster ? 12 : 0,
        margin: haster ? "0 0 8px" : 0,
        padding: 0,
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 3,
          flex: "none",
          background: haster ? T.warn : "transparent",
        }}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: haster ? "13px 12px 13px 14px" : "12px 8px 12px 12px",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 4,
            }}
          >
            <Caps size={9} color={haster ? T.warn : T.mut}>
              {rad.tilLabel}
            </Caps>
            {haster ? (
              <StatusPill tone="warn">Haster</StatusPill>
            ) : (
              <Caps size={9}>Valgfri</Caps>
            )}
          </div>
          <div
            style={{
              fontFamily: T.ui,
              fontSize: 13.5,
              fontWeight: 600,
              color: T.fg,
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {rad.oppgave}
          </div>
          <div
            style={{
              fontFamily: T.ui,
              fontSize: 11.5,
              color: T.mut,
              marginTop: 3,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Ferdig når: {rad.ferdigNar}
          </div>
          {team && <TeamStegIndikator mode={team} />}
        </div>
        <Icon name="chevron-right" size={14} style={{ color: T.mut, flex: "none" }} />
      </div>
    </button>
  );
}

function SeksjonTittel({
  children,
  meta,
}: {
  children: string;
  meta?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        margin: "4px 0 8px",
      }}
    >
      <Caps size={9} color={T.mut}>
        {children}
      </Caps>
      {meta && (
        <Caps size={9} color={T.mut}>
          {meta}
        </Caps>
      )}
    </div>
  );
}

export function AiDispatchPanelV2({ data }: { data: AiDispatchData }) {
  const router = useRouter();
  const hasterRader = data.rader.filter((r) => r.prioritet === "hoy");
  const valgfriRader = data.rader.filter((r) => r.prioritet !== "hoy");
  const t = data.tellinger;
  const totalKø =
    t.planActions + t.caddieDrafts + t.sessionRequests + t.innboksNye + t.agentRunsFailed;
  const harKø = totalKø > 0;

  const mini = (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 14,
      }}
    >
      <MiniStat label="Plan" value={t.planActions} warn={t.planActions > 0} />
      <MiniStat label="Caddie" value={t.caddieDrafts} warn={t.caddieDrafts > 0} />
      <MiniStat label="Forespørsel" value={t.sessionRequests} warn={t.sessionRequests > 0} />
      <MiniStat label="E-post" value={t.innboksNye} warn={t.innboksNye > 0} />
      <MiniStat label="Team feil" value={t.agentRunsFailed} warn={t.agentRunsFailed > 0} />
      <MiniStat label="Team kjører" value={t.agentRunsRunning} />
    </div>
  );

  const harMini =
    t.planActions +
      t.caddieDrafts +
      t.sessionRequests +
      t.innboksNye +
      t.agentRunsFailed +
      t.agentRunsRunning >
    0;

  return (
    <Kort
      eyebrow="AI-dispatch"
      action={
        harKø ? (
          <StatusPill tone="warn">
            {totalKø === 1 ? "1 i kø" : `${totalKø} i kø`}
          </StatusPill>
        ) : (
          <StatusPill tone="lime">Klar</StatusPill>
        )
      }
      pad="18px 18px"
    >
      {/* ── 1. Én ting NÅ (Linear priority) ─────────────────────── */}
      {data.enTingNa && (
        <div
          style={{
            marginBottom: 14,
            borderRadius: 14,
            border: `1px solid ${T.borderS}`,
            background: `linear-gradient(135deg, color-mix(in srgb, ${T.lime} 6%, ${T.panel2}) 0%, ${T.panel2} 55%)`,
            overflow: "hidden",
            display: "flex",
            alignItems: "stretch",
            boxShadow: `0 0 0 1px color-mix(in srgb, ${T.lime} 8%, transparent)`,
          }}
        >
          <span
            aria-hidden
            style={{
              width: 4,
              flex: "none",
              background: T.lime,
            }}
          />
          <div
            style={{
              flex: 1,
              minWidth: 0,
              padding: "16px 16px 16px 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Caps size={9} color={T.lime}>
                  Én ting NÅ
                </Caps>
                <Caps size={9} color={T.mut}>
                  Prioritet 1
                </Caps>
              </div>
              <p
                style={{
                  margin: "10px 0 0",
                  fontFamily: T.disp,
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: "-0.025em",
                  color: T.fg,
                  lineHeight: 1.2,
                }}
              >
                {data.enTingNa.tekst}
              </p>
            </div>
            <Link
              href={data.enTingNa.href}
              style={{ textDecoration: "none" }}
              className="v2-focus"
            >
              <CTAPill icon="arrow-right">Gjør dette</CTAPill>
            </Link>
          </div>
        </div>
      )}

      {/* ── 2. Mini-status (kun tall som > 0) ───────────────────── */}
      {harMini && mini}

      {/* ── 3–4. Rader ─────────────────────────────────────────── */}
      {data.rader.length === 0 ? (
        <TomTilstand
          icon="bot"
          title="Ingen AI-oppdrag"
          sub="Når agenter lager forslag, dukker de opp her."
        />
      ) : (
        <>
          {hasterRader.length > 0 && (
            <div style={{ marginBottom: valgfriRader.length > 0 ? 12 : 0 }}>
              <SeksjonTittel meta={`${hasterRader.length}`}>
                Haster
              </SeksjonTittel>
              {hasterRader.map((rad, i) => (
                <DispatchRad
                  key={rad.id}
                  rad={rad}
                  last={i === hasterRader.length - 1}
                  onOpen={() => router.push(rad.href)}
                />
              ))}
            </div>
          )}

          {valgfriRader.length > 0 && (
            <div>
              <SeksjonTittel meta={`${valgfriRader.length}`}>
                Valgfritt
              </SeksjonTittel>
              <div
                style={{
                  borderRadius: 12,
                  border: `1px solid ${T.border}`,
                  overflow: "hidden",
                  background: T.panel2,
                }}
              >
                {valgfriRader.map((rad, i) => (
                  <DispatchRad
                    key={rad.id}
                    rad={rad}
                    last={i === valgfriRader.length - 1}
                    onOpen={() => router.push(rad.href)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── 5. Snarveier ───────────────────────────────────────── */}
      <div
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: `1px solid ${T.border}`,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <Link href="/admin/godkjenninger" style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="check">
            Godkjenninger
            {t.planActions > 0 ? ` (${t.planActions})` : ""}
          </CTAPill>
        </Link>
        <Link href="/admin/agent-team" style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="bot">
            Agent-team
          </CTAPill>
        </Link>
        <Link href="/admin/agents" style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="activity">
            Agenter
          </CTAPill>
        </Link>
        <Link href="/admin/caddie" style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="message-square">
            Caddie
            {t.caddieDrafts > 0 ? ` (${t.caddieDrafts})` : ""}
          </CTAPill>
        </Link>
        {t.innboksNye > 0 && (
          <Link href="/admin/innboks-epost" style={{ textDecoration: "none" }}>
            <CTAPill ghost icon="mail">
              Innboks ({t.innboksNye})
            </CTAPill>
          </Link>
        )}
      </div>
    </Kort>
  );
}
