/**
 * PlayerHQ · Økt-detalj (planlagt) — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import type { ReactNode } from "react";
import Link from "next/link";
import {
  T,
  Caps,
  Tittel,
  Kort,
  CTAPill,
  Knapp,
  StatusPill,
  AvatarInit,
  MikroMeta,
  TomTilstand,
  HjelpTips,
  type StatusTone,
} from "@/components/v2";

export type OktPlanlagtDeltaker = {
  id: string;
  navn: string;
  statusLabel: string;
  statusTone: StatusTone;
};

export type OktPlanlagtV2Data = {
  sessionId: string;
  timing: "idag" | "fremtid" | "forfalt";
  datoLang: string;
  tittel: string;
  varighet: number;
  startTid: string;
  miljo: string | null;
  coachNotat: string | null;
  coachNotatTid: string;
  coachNavn: string;
  drills: {
    id: string;
    navn: string;
    durationMinutes: number | null;
    repetitions: number | null;
    pyramide: string | null;
  }[];
  totalDrillMin: number;
  erDelt: boolean;
  deltakere: OktPlanlagtDeltaker[];
  maxDeltakere: number | null;
  erHost: boolean;
};

export function OktPlanlagtV2({
  data,
  inviterSlot,
}: {
  data: OktPlanlagtV2Data;
  /** Ferdig rendret InviteFriendTrigger (kun når host kan invitere). */
  inviterSlot?: ReactNode;
}) {
  return (
    <div style={{ maxWidth: 620, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Hero */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {data.timing === "idag" && <StatusPill tone="lime">I dag · {data.datoLang}</StatusPill>}
          {data.timing === "fremtid" && <Caps>Planlagt · {data.datoLang}</Caps>}
          {data.timing === "forfalt" && <StatusPill tone="warn">Ikke startet · {data.datoLang}</StatusPill>}
        </div>
        <div style={{ marginTop: 12 }}>
          <Tittel>{data.tittel}</Tittel>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
          <MikroMeta icon="clock">
            {data.varighet} min · {data.startTid}
          </MikroMeta>
          {data.drills.length > 0 && (
            <MikroMeta icon="target">{data.drills.length} drills</MikroMeta>
          )}
          {data.miljo && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: T.lime, background: `color-mix(in srgb, ${T.lime} 11%, transparent)`, borderRadius: 9999, padding: "3px 9px" }}>
                {data.miljo}
              </span>
              <HjelpTips k="miljo" size={11} />
            </span>
          )}
        </div>
      </div>

      {/* Coach-notat */}
      {data.coachNotat && (
        <Kort tint>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <AvatarInit navn={data.coachNavn} size={32} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: T.disp, fontSize: 13.5, fontWeight: 700, color: T.fg, lineHeight: 1.2 }}>
                {data.coachNavn}
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 9.5, color: T.mut, marginTop: 2 }}>
                Coach-notat · {data.coachNotatTid}
              </div>
            </div>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 13, lineHeight: 1.6, color: T.fg2, whiteSpace: "pre-wrap", margin: "12px 0 0" }}>
            {data.coachNotat}
          </p>
        </Kort>
      )}

      {/* Drills */}
      {data.drills.length > 0 ? (
        <Kort
          eyebrow="Drills i planen"
          action={
            data.totalDrillMin > 0 ? (
              <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, fontVariantNumeric: "tabular-nums" }}>
                {data.totalDrillMin} min
              </span>
            ) : undefined
          }
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data.drills.map((drill, i) => {
              const last = i === data.drills.length - 1;
              const meta = [
                drill.durationMinutes ? `${drill.durationMinutes} min` : null,
                drill.repetitions ? `${drill.repetitions} reps` : null,
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <div key={drill.id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "11px 0", borderBottom: last ? "none" : `1px solid ${T.border}` }}>
                  <span style={{ marginTop: 6, width: 7, height: 7, flex: "none", borderRadius: 9999, background: T.lime }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg, lineHeight: 1.35 }}>
                      {drill.navn}
                    </div>
                    {meta && (
                      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, marginTop: 2 }}>{meta}</div>
                    )}
                  </div>
                  {drill.pyramide && (
                    <span style={{ flex: "none", fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 9999, padding: "3px 9px" }}>
                      {drill.pyramide}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Kort>
      ) : (
        <Kort>
          <TomTilstand
            icon="target"
            title="Ingen drills ennå"
            sub="Legg til drills i Workbench — eller start økten likevel."
          />
          <div style={{ marginTop: 12 }}>
            <Link href="/portal/planlegge/workbench?zoom=uke" style={{ textDecoration: "none", display: "block" }}>
              <CTAPill ghost full icon="calendar">
                Åpne Workbench
              </CTAPill>
            </Link>
          </div>
        </Kort>
      )}

      {/* Trene sammen — kun for delte økter */}
      {data.erDelt && (
        <Kort
          eyebrow={
            <>
              Trene sammen · {data.deltakere.length}
              {data.maxDeltakere != null ? ` av ${data.maxDeltakere}` : ""}
            </>
          }
          action={inviterSlot}
        >
          {data.deltakere.length === 0 ? (
            <TomTilstand
              icon="users"
              title="Ingen er invitert ennå"
              sub={data.erHost ? "Trykk «Inviter kompis» for å invitere noen." : undefined}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {data.deltakere.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i === data.deltakere.length - 1 ? "none" : `1px solid ${T.border}` }}>
                  <AvatarInit navn={p.navn} size={30} />
                  <span style={{ flex: 1, minWidth: 0, fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.navn}
                  </span>
                  <StatusPill tone={p.statusTone}>{p.statusLabel}</StatusPill>
                </div>
              ))}
            </div>
          )}
        </Kort>
      )}

      {/* CTA-er */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
        <Link href={`/portal/tren/${data.sessionId}`} style={{ textDecoration: "none", display: "block" }}>
          <CTAPill icon="play" full>Start økt</CTAPill>
        </Link>
        <Knapp ghost full disabled>
          Utsett til i morgen
        </Knapp>
      </div>
    </div>
  );
}
