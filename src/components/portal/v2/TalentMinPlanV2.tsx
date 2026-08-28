"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ · Talent · Min plan — v2 Presis + B-pakke (status + akser + neste mål).
 * Ekte TalentTracking. Tom milepæl = vei til coach/workbench. T.* only.
 */

import Link from "next/link";
import { Caps, Kort, Rad, StatusPill, FordelingRad, TomTilstand, HjelpTips, CTAPill } from "@/components/v2";
import { Icon } from "@/components/v2/icon";
/* ── Data-kontrakt ─────────────────────────────────────────────────── */

export interface TalentMinPlanData {
  niva: string;
  /** Nivå/klubb/region/i programmet — ferdig formatert i page. */
  status: { label: string; value: string }[];
  /** De fem aksene (1–10, null = ikke vurdert). */
  akser: { label: string; verdi: number | null }[];
  /** Første ufullførte milepæl, eller null. */
  nesteMal: { tittel: string; beskrivelse: string | null; fristTekst: string | null } | null;
  milepaeler: { tittel: string; datoTekst: string | null; beskrivelse: string | null; fullfort: boolean }[];
}

export function TalentMinPlanV2({ data }: { data: TalentMinPlanData }) {
  return (
    <div data-paper-wave-g="talentminplan" data-paper-portal-talent-min-plan data-paper-slug="playerhq-talent" style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Hode */}
      <div>
        <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Min plan</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>Talent</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <StatusPill tone="lime">Nivå {data.niva}</StatusPill>
          <span style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute }}>
            Sporet på de fem aksene coachen din bruker for å plassere deg på nivå og bygge programmet ditt.
          </span>
        </div>
      </div>

      {/* Status-strip 2x2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 16 }}>
        {data.status.map((s) => (
          <Kort key={s.label} pad="14px 16px">
            <Caps size={9}>{s.label}</Caps>
            <span style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text, marginTop: 8, textTransform: "capitalize" }}>
              {s.value}
            </span>
          </Kort>
        ))}
      </div>

      {/* Fem akser */}
      <Kort
        eyebrow={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Mine fem akser <HjelpTips k="talentVurdering" size={11} />
          </span>
        }
      >
        {data.akser.map((a, i) => (
          <FordelingRad
            key={a.label}
            label={a.label}
            pct={a.verdi === null ? 0 : Math.max(0, Math.min(100, (a.verdi / 10) * 100))}
            value={a.verdi === null ? "—" : `${a.verdi.toFixed(1).replace(".", ",")} / 10`}
            kol2
            last={i === data.akser.length - 1}
          />
        ))}
      </Kort>

      {/* Neste mål */}
      <Kort tint eyebrow="Neste mål">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <span
            aria-hidden
            style={{ width: 36, height: 36, borderRadius: 11, background: `color-mix(in srgb, ${TL.fill} 14%, transparent)`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}
          >
            <Icon name="target" size={16} style={{ color: TL.fill }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            {data.nesteMal ? (
              <>
                <div style={{ fontFamily: TL.font.sans, fontSize: 17, fontWeight: 700, color: TL.text, lineHeight: 1.2 }}>
                  {data.nesteMal.tittel}
                </div>
                {data.nesteMal.beskrivelse && (
                  <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.55, margin: "6px 0 0" }}>
                    {data.nesteMal.beskrivelse}
                  </p>
                )}
                {data.nesteMal.fristTekst && (
                  <span style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, display: "block", marginTop: 7 }}>
                    Frist {data.nesteMal.fristTekst}
                  </span>
                )}
              </>
            ) : (
              <>
                <div style={{ fontFamily: TL.font.sans, fontSize: 17, fontWeight: 700, color: TL.text, lineHeight: 1.2 }}>
                  Ingen aktive milepæler
                </div>
                <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.55, margin: "6px 0 0" }}>
                  Coachen din legger inn neste milepæl etter neste evaluering. I mellomtiden: hold tråden i ukeplanen.
                </p>
              </>
            )}
          </div>
        </div>
      </Kort>

      {/* B: primær vei når neste mål mangler */}
      {!data.nesteMal && (
        <Link href="/portal/coach/melding" style={{ textDecoration: "none", display: "block" }}>
          <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 16px",
                borderRadius: 12, background: TL.fill, color: TL.onFill, fontFamily: TL.font.sans, fontSize: 14, fontWeight: 600, minHeight: 56,
              }}>Spør coach om neste mål
          </span>
        </Link>
      )}

      {/* Milepæler */}
      <Kort eyebrow="Milepæler">
        {data.milepaeler.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TomTilstand
              icon="flag"
              title="Ingen milepæler registrert ennå"
              sub="Coachen legger inn milepæler — hold tråden i ukeplanen i mellomtiden."
            />
            <Link href="/portal/planlegge/workbench?zoom=uke" style={{ textDecoration: "none", display: "block" }}>
              <CTAPill ghost full icon="calendar">
                Åpne Workbench
              </CTAPill>
            </Link>
          </div>
        ) : (
          <div>
            {data.milepaeler.map((m, i) => (
              <Rad
                key={`${m.tittel}-${i}`}
                leading={
                  <Icon
                    name={m.fullfort ? "check-circle" : "circle"}
                    size={17}
                    style={{ color: m.fullfort ? TL.ok : TL.mute, flex: "none" }}
                  />
                }
                title={m.tittel}
                sub={m.beskrivelse ?? undefined}
                meta={
                  m.datoTekst ? (
                    <span style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, flex: "none" }}>{m.datoTekst}</span>
                  ) : undefined
                }
                trailing={null}
                last={i === data.milepaeler.length - 1}
              />
            ))}
          </div>
        )}
      </Kort>
    </div>
  );
}
