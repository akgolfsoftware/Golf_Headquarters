"use client";

/**
 * AI-dispatch-panel på AgencyOS-cockpit.
 * Viser én «NÅ»-handling + maks 4 AI-rader (AgenticOS multi-AI-mal).
 * Kun v2-komponenter. Ingen emoji.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Caps,
  Kort,
  Rad,
  StatusPill,
  CTAPill,
  TomTilstand,
} from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import type { AiDispatchData } from "@/lib/agencyos/ai-dispatch-data";

export function AiDispatchPanelV2({ data }: { data: AiDispatchData }) {
  const router = useRouter();
  const hoy = data.rader.filter((r) => r.prioritet === "hoy").length;
  const totalKø =
    data.tellinger.planActions +
    data.tellinger.caddieDrafts +
    data.tellinger.sessionRequests;

  return (
    <Kort
      eyebrow="AI-dispatch"
      action={
        totalKø > 0 ? (
          <Caps size={9} color={T.warn}>
            {totalKø} i kø
          </Caps>
        ) : (
          <Caps size={9}>AgenticOS</Caps>
        )
      }
    >
      {/* Én ting NÅ */}
      {data.enTingNa && (
        <div
          style={{
            marginBottom: 12,
            padding: "12px 14px",
            borderRadius: 12,
            border: `1px solid ${T.border}`,
            background: T.panel2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <Caps size={9} color={T.mut}>
              Én ting NÅ
            </Caps>
            <p
              style={{
                margin: "6px 0 0",
                fontFamily: T.ui,
                fontSize: 14,
                fontWeight: 600,
                color: T.fg,
                lineHeight: 1.35,
              }}
            >
              {data.enTingNa.tekst}
            </p>
          </div>
          <Link href={data.enTingNa.href} style={{ textDecoration: "none" }}>
            <CTAPill icon="arrow-right">Åpne</CTAPill>
          </Link>
        </div>
      )}

      {hoy > 0 && (
        <div style={{ marginBottom: 8 }}>
          <StatusPill tone="warn">
            {hoy === 1 ? "1 AI-oppgave haster" : `${hoy} AI-oppgaver haster`}
          </StatusPill>
        </div>
      )}

      {data.rader.length === 0 ? (
        <TomTilstand
          icon="bot"
          title="Ingen AI-oppdrag"
          sub="Når agenter lager forslag, dukker de opp her."
        />
      ) : (
        data.rader.map((rad, i) => (
          <Rad
            key={rad.id}
            onClick={() => router.push(rad.href)}
            leading={
              <span
                style={{
                  width: 72,
                  flex: "none",
                  fontFamily: T.mono,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: rad.prioritet === "hoy" ? T.warn : T.mut,
                }}
              >
                {rad.tilLabel}
              </span>
            }
            title={
              <span
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  whiteSpace: "normal",
                }}
              >
                {rad.oppgave}
              </span>
            }
            sub={`Ferdig når: ${rad.ferdigNar}`}
            meta={
              rad.prioritet === "hoy" ? (
                <Caps size={9} color={T.warn}>
                  Haster
                </Caps>
              ) : (
                <Caps size={9}>Valgfri</Caps>
              )
            }
            last={i === data.rader.length - 1}
          />
        ))
      )}

      <div
        style={{
          marginTop: 12,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <Link href="/admin/godkjenninger" style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="check">
            Godkjenninger
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
      </div>
    </Kort>
  );
}
