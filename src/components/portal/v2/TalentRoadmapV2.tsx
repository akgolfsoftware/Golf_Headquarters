"use client";

/**
 * PlayerHQ · Talent · Roadmap — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import Link from "next/link";
import { T, Caps, Tittel, Kort, Rad, StatusPill, KpiFlis, TomTilstand, CTAPill, HjelpTips } from "@/components/v2";
import { Icon } from "@/components/v2/icon";

/* ── Data-kontrakt ─────────────────────────────────────────────────── */

export interface TalentRoadmapData {
  niva: string;
  ar: number;
  /** Faser fra sesongplanen (L-fase-navn + periode + fokus). */
  faser: { id: string; navn: string; periode: string; fokus: string | null }[];
  turneringer: { id: string; navn: string; datoTekst: string | null }[];
  milepaeler: { tittel: string; datoTekst: string | null; beskrivelse: string | null; oppnadd: boolean }[];
}

export function TalentRoadmapV2({ data }: { data: TalentRoadmapData }) {
  const altTomt =
    data.faser.length === 0 && data.turneringer.length === 0 && data.milepaeler.length === 0;

  return (
    <div data-paper-wave-g="talentroadmap" data-paper-portal-talent-roadmap style={{ display: "flex", flexDirection: "column", gap: T.gap, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* PRE-BETA — ærlig merking */}
      <Kort pad="12px 18px">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusPill tone="warn">Pre-beta</StatusPill>
          <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut }}>
            Sesongplan-funksjonen er under utbygging.
          </span>
        </div>
      </Kort>

      {/* Hode */}
      <div>
        <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: T.disp, fontSize: 17, fontWeight: 600, color: T.fg }}>Roadmap</h1>
          <span style={{ display: "block", fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 2 }}>Talent</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
          <StatusPill tone="lime">Nivå {data.niva}</StatusPill>
          <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut }}>Sesong {data.ar}</span>
        </div>
      </div>

      {/* KPI-strip — ekte tellinger */}
      <div className="grid grid-cols-3" style={{ gap: T.gap }}>
        <KpiFlis label="Faser i sesongplan" value={data.faser.length} instant />
        <KpiFlis label="Turneringer planlagt" value={data.turneringer.length} instant />
        <KpiFlis label="Milepæler registrert" value={data.milepaeler.length} instant />
      </div>

      {/* Faser fra sesongplan */}
      <Kort
        eyebrow={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Sesongplan · faser <HjelpTips k="lFase" size={11} />
          </span>
        }
      >
        {data.faser.length === 0 ? (
          <>
            <TomTilstand
              icon="calendar"
              title={`Ingen sesongplan for ${data.ar} ennå`}
              sub="Faser dukker opp her når planen er lagt i Workbench."
            />
            <div style={{ marginTop: 12 }}>
              <Link href="/portal/planlegge/workbench?zoom=uke" style={{ textDecoration: "none", display: "block" }}>
                <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", padding: "10px 16px",
                borderRadius: 12, background: T.handling, color: T.onHandling, fontFamily: T.ui, fontSize: 14, fontWeight: 600, minHeight: 56,
              }}>Åpne Workbench
                </span>
              </Link>
            </div>
          </>
        ) : (
          <div>
            {data.faser.map((fase, i) => (
              <Rad
                key={fase.id}
                title={fase.navn}
                sub={fase.fokus ?? undefined}
                meta={
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, flex: "none" }}>{fase.periode}</span>
                }
                trailing={null}
                last={i === data.faser.length - 1}
              />
            ))}
          </div>
        )}
      </Kort>

      {/* Turneringer */}
      {data.turneringer.length > 0 && (
        <Kort eyebrow="Planlagte turneringer">
          <div>
            {data.turneringer.map((t, i) => (
              <Rad
                key={t.id}
                leading={<Icon name="trophy" size={15} style={{ color: T.lime, flex: "none" }} />}
                title={t.navn}
                meta={
                  t.datoTekst ? (
                    <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, flex: "none" }}>{t.datoTekst}</span>
                  ) : undefined
                }
                trailing={null}
                last={i === data.turneringer.length - 1}
              />
            ))}
          </div>
        </Kort>
      )}

      {/* Milepæler */}
      {data.milepaeler.length > 0 && (
        <Kort eyebrow="Personlige milepæler">
          <div>
            {data.milepaeler.map((m, i) => (
              <Rad
                key={`${m.tittel}-${i}`}
                leading={
                  <Icon
                    name={m.oppnadd ? "check-circle" : "circle"}
                    size={17}
                    style={{ color: m.oppnadd ? T.up : T.mut, flex: "none" }}
                  />
                }
                title={m.tittel}
                sub={m.beskrivelse ?? undefined}
                meta={
                  m.datoTekst ? (
                    <span style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, flex: "none" }}>{m.datoTekst}</span>
                  ) : undefined
                }
                trailing={null}
                last={i === data.milepaeler.length - 1}
              />
            ))}
          </div>
        </Kort>
      )}

      {/* Alt tomt */}
      {altTomt && (
        <Kort>
          <TomTilstand
            icon="map"
            title="Ingen roadmap-data registrert ennå"
            sub="Faser, turneringer og milepæler dukker opp når planen legges."
          />
          <div style={{ marginTop: 12 }}>
            <Link href="/portal/planlegge/workbench?zoom=uke" style={{ textDecoration: "none", display: "block" }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 48, width: "100%", padding: "10px 16px",
                borderRadius: 12, background: T.handling, color: T.onHandling, fontFamily: T.ui, fontSize: 14, fontWeight: 600, minHeight: 56,
              }}>Åpne Workbench
              </span>
            </Link>
          </div>
        </Kort>
      )}
    </div>
  );
}
