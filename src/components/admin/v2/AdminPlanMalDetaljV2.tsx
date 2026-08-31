"use client";
import { TL } from "@/lib/v2/train-lock";
import { AK } from "@/lib/v2/ak-palett";

/**
 * AgencyOS — Plan-mal-detalj (`/admin/plan-templates/[id]`) — v2.
 * v2-port 17. juli 2026 (Team F1): erstatter template-detail (golfdata).
 * Samme datakontrakt og samme server actions (duplicateTemplate,
 * archiveTemplate, unarchiveTemplate) — kun presentasjonslaget er nytt:
 * KpiFlis-strip, uke-grid med aksefarger fra AK.ax, Pyramide for
 * disiplin-fordeling mot anbefalt baseline, og v2-dialog for økt-detaljer.
 *
 * Ærlighetsavvik fra golfdata-versjonen: den gamle KPI-stripen viste en
 * hardkodet «Completion-rate 87%» (plassholder) — fjernet her, vi viser
 * aldri oppdiktede tall.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type {
  LPhase,
  NgfKategori,
  PyramidArea,
  SessionEnvironment,
  SkillArea,
} from "@/generated/prisma/enums";
import { archiveTemplate, duplicateTemplate, unarchiveTemplate } from "@/app/admin/(legacy)/plan-templates/actions";
import { DAG_LABEL, ENV_LABEL, SKILL_LABEL, type DisciplinFordeling, type DrillEntry } from "@/components/admin/plan-templates/shared";
import { Kort, Caps, Knapp, CTAPill, KpiFlis, Pyramide, TomTilstand, Icon, HjelpTips, AKSE_NAVN } from "@/components/v2";

/* ── Datakontrakt (mappes fra Prisma i ruten) ─────────── */

export type PlanMalOkt = {
  id: string;
  ukeNr: number;
  dagNr: number;
  title: string;
  varighetMin: number;
  pyramidArea: PyramidArea;
  skillArea: SkillArea | null;
  environment: SessionEnvironment;
  drills: Array<DrillEntry & { exerciseName: string | null }>;
  focus: string | null;
  notes: string | null;
};

export type PlanMalDetalj = {
  id: string;
  name: string;
  description: string | null;
  kategori: NgfKategori;
  lPhase: LPhase;
  varighetUker: number;
  ukentligOktAntall: number;
  fordeling: DisciplinFordeling;
  anbefaltFordeling: DisciplinFordeling;
  minAlder: number | null;
  maxAlder: number | null;
  approved: boolean;
  usageCount: number;
  effectivenessAvg: number | null;
  sessions: PlanMalOkt[];
};

const PYR_ALLE: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
// Pyramide-rekkefølge topp→base (samme som mal-lista).
const AKSE_ORDEN: PyramidArea[] = ["TURN", "SPILL", "SLAG", "TEK", "FYS"];

export function AdminPlanMalDetaljV2({ template }: { template: PlanMalDetalj }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [aktivOkt, setAktivOkt] = useState<PlanMalOkt | null>(null);

  function onDuplicate() {
    startTransition(async () => {
      const res = await duplicateTemplate(template.id);
      if (res.ok) {
        router.push(`/admin/plan-templates/${res.data.templateId}`);
      } else {
        alert(`Kunne ikke duplisere: ${res.error}`);
      }
    });
  }

  function onToggleArchive() {
    startTransition(async () => {
      const res = template.approved
        ? await archiveTemplate(template.id)
        : await unarchiveTemplate(template.id);
      if (!res.ok) {
        alert(res.error);
      } else {
        router.refresh();
      }
    });
  }

  const rating =
    template.effectivenessAvg != null
      ? Math.min(5, Math.max(1, 3 + template.effectivenessAvg))
      : null;

  return (
    <div data-paper-wave-h="plan-mal-detalj" data-paper-pattern style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 960, margin: "0 auto", width: "100%" }}>
      {/* Topptekst */}
      <div>
        <div data-paper-pattern-topp data-paper-slug="agencyos-planbibliotek">
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Planmal</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>Detalj</span>
        </div>
        <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, margin: "8px 0 0", lineHeight: 1.55, maxWidth: 640 }}>
          {template.description ?? "Ingen beskrivelse lagt til ennå."}
        </p>
      </div>

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiFlis label="Brukt (ganger)" value={template.usageCount} />
        <KpiFlis
          label="SG-Total-delta"
          value={
            template.effectivenessAvg != null
              ? `${template.effectivenessAvg >= 0 ? "+" : ""}${template.effectivenessAvg.toFixed(1).replace(".", ",")}`
              : "—"
          }
          hjelp="malEffektivitet"
        />
        <KpiFlis label="Antall økter" value={template.sessions.length} />
        <KpiFlis label="Effektivitet" value={rating != null ? `${rating.toFixed(1).replace(".", ",")}/5` : "—"} hjelp="malEffektivitet" />
      </div>

      {/* Uke-program */}
      <Kort
        eyebrow={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Uke-program <HjelpTips k="pyramideAkse" size={11} />
          </span>
        }
        action={
          <span style={{ fontFamily: TL.font.mono, fontSize: 9, color: TL.mute }}>
            {template.sessions.length} økter · {template.varighetUker} uker
          </span>
        }
      >
        {template.sessions.length === 0 ? (
          <TomTilstand
            icon="calendar"
            title="Ingen økter i malen ennå"
            sub="Åpne editoren («Rediger struktur») for å legge inn økter uke for uke."
          />
        ) : (
          <UkeGrid
            varighetUker={template.varighetUker}
            sessions={template.sessions}
            onSelect={setAktivOkt}
          />
        )}
        <AkseLegende />
      </Kort>

      {/* Disiplin-fordeling */}
      <Kort
        eyebrow={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Disiplin-fordeling <HjelpTips k="pyramideAkse" size={11} />
          </span>
        }
        action={
          <span style={{ fontFamily: TL.font.mono, fontSize: 9, color: TL.mute }}>
            mot anbefalt for nivå {template.kategori}
          </span>
        }
      >
        <Pyramide
          data={AKSE_ORDEN.map((a) => ({
            akse: a,
            value: Math.round(template.fordeling[a] * 100),
            plan: Math.round(template.anbefaltFordeling[a] * 100),
          }))}
        />
        <p style={{ fontFamily: TL.font.sans, fontSize: 11, color: TL.mute, margin: "12px 0 0" }}>
          Strek = anbefalt baseline for nivå {template.kategori}. Tall: malens andel / anbefalt, i prosent.
        </p>
      </Kort>

      {/* Handlinger */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <Link href={`/admin/plan-templates/${template.id}/rediger`} style={{ textDecoration: "none" }}>
          <CTAPill icon="pencil">Rediger struktur</CTAPill>
        </Link>
        <Knapp ghost icon="copy" disabled={isPending} onClick={onDuplicate}>
          Dupliser
        </Knapp>
        <Knapp
          ghost
          icon="archive"
          disabled={isPending}
          onClick={onToggleArchive}
          style={{ color: template.approved ? TL.danger : TL.ok, borderColor: `color-mix(in srgb, ${template.approved ? TL.danger : TL.ok} 40%, transparent)` }}
        >
          {template.approved ? "Arkiver" : "Gjenåpne"}
        </Knapp>
        <Link href={`/admin/plan-templates/${template.id}/effectiveness`} style={{ textDecoration: "none" }}>
          <CTAPill ghost icon="line-chart">Se effekt-historikk</CTAPill>
        </Link>
      </div>

      {aktivOkt && <OktDialog okt={aktivOkt} onClose={() => setAktivOkt(null)} />}
    </div>
  );
}

/* ── Uke-grid (uker × dager) ──────────────────────────── */

function UkeGrid({
  varighetUker,
  sessions,
  onSelect,
}: {
  varighetUker: number;
  sessions: PlanMalOkt[];
  onSelect: (s: PlanMalOkt) => void;
}) {
  const uker = Array.from({ length: varighetUker }, (_, i) => i + 1);
  const dager = [1, 2, 3, 4, 5, 6, 7];

  function finnOkt(uke: number, dag: number): PlanMalOkt | undefined {
    return sessions.find((s) => s.ukeNr === uke && s.dagNr === dag);
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: 640 }}>
        {/* Dag-header */}
        <div style={{ display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", gap: 4 }}>
          <div />
          {dager.map((d) => (
            <div
              key={d}
              style={{ borderRadius: 8, background: TL.dock, border: `1px solid ${TL.hair}`, padding: "5px 0", textAlign: "center", fontFamily: TL.font.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: TL.mute }}
            >
              {DAG_LABEL[d - 1]}
            </div>
          ))}
        </div>

        {uker.map((uke) => (
          <div key={uke} style={{ marginTop: 4, display: "grid", gridTemplateColumns: "60px repeat(7, 1fr)", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: TL.dim, fontFamily: TL.font.mono, fontSize: 11, fontWeight: 700, color: TL.mute }}>
              Uke {uke}
            </div>
            {dager.map((dag) => {
              const s = finnOkt(uke, dag);
              return (
                <div key={dag} style={{ minHeight: 64 }}>
                  {s ? (
                    <button
                      type="button"
                      onClick={() => onSelect(s)}
                      className="v2-row-h v2-focus"
                      style={{ appearance: "none", cursor: "pointer", display: "flex", height: "100%", width: "100%", flexDirection: "column", alignItems: "flex-start", gap: 4, borderRadius: 8, border: `1px solid ${TL.hair}`, borderLeft: `3px solid ${AK.ax[s.pyramidArea]}`, background: TL.dock, padding: 8, textAlign: "left" }}
                    >
                      <span style={{ fontFamily: TL.font.sans, fontSize: 11, fontWeight: 600, color: TL.text, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {s.title}
                      </span>
                      <span style={{ marginTop: "auto", fontFamily: TL.font.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: TL.mute }}>
                        {s.varighetMin} min · {s.drills.length}d
                      </span>
                    </button>
                  ) : (
                    <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", borderRadius: 8, border: `1px dashed ${TL.hair}`, fontFamily: TL.font.mono, fontSize: 10, color: TL.mute }}>
                      —
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function AkseLegende() {
  return (
    <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
      {PYR_ALLE.map((o) => (
        <span key={o} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: TL.mute }}>
          <span aria-hidden style={{ width: 8, height: 8, borderRadius: 3, background: AK.ax[o] }} />
          {AKSE_NAVN[o]}
        </span>
      ))}
    </div>
  );
}

/* ── Økt-dialog (v2 role="dialog"-mønster) ────────────── */

function OktDialog({ okt, onClose }: { okt: PlanMalOkt; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={okt.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", background: TL.scrim, padding: 16 }}
    >
      <div
        className="v2-sheet-in"
        style={{ width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", borderRadius: TL.radius.card, background: TL.elev, border: `1px solid ${TL.hair}`, padding: 22, boxShadow: "none" }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Caps>
                Uke {okt.ukeNr} · {DAG_LABEL[okt.dagNr - 1]} · {okt.varighetMin} min · {ENV_LABEL[okt.environment]}
              </Caps>
              <HjelpTips k="miljo" size={11} />
            </span>
            <h2 style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: TL.text }}>
              {okt.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="v2-press v2-focus"
            style={{ appearance: "none", cursor: "pointer", width: 28, height: 28, borderRadius: 8, background: TL.dock, border: `1px solid ${TL.hair}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", color: TL.mute }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, color: TL.mute, background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 5, padding: "3px 7px" }}>
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: 9999, background: AK.ax[okt.pyramidArea] }} />
            {AKSE_NAVN[okt.pyramidArea]}
          </span>
          {okt.skillArea && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, color: TL.mute, background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 5, padding: "3px 7px" }}>
              {SKILL_LABEL[okt.skillArea]}
              <HjelpTips k="skillArea" size={10} />
            </span>
          )}
        </div>

        {okt.focus && (
          <div style={{ marginTop: 16 }}>
            <Caps>Fokus</Caps>
            <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text, margin: "6px 0 0", lineHeight: 1.55 }}>{okt.focus}</p>
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Caps>Drills ({okt.drills.length})</Caps>
            <HjelpTips k="csNivaa" size={11} />
          </span>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {okt.drills.map((d, i) => (
              <div key={`${d.exerciseId}-${i}`} style={{ borderRadius: TL.radius.row, border: `1px solid ${TL.hair}`, background: TL.dock, padding: "10px 13px" }}>
                <div style={{ fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, color: TL.text }}>
                  {d.exerciseName ?? d.exerciseId}
                </div>
                <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 10, fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: TL.mute }}>
                  {d.sets != null && <span>{d.sets} sett</span>}
                  {d.reps != null && <span>{d.reps} reps</span>}
                  {d.csTarget != null && <span>CS {d.csTarget}</span>}
                </div>
                {d.notes && (
                  <p style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, lineHeight: 1.5 }}>{d.notes}</p>
                )}
              </div>
            ))}
            {okt.drills.length === 0 && (
              <p style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, margin: 0 }}>Ingen drills definert for økten.</p>
            )}
          </div>
        </div>

        {okt.notes && (
          <div style={{ marginTop: 16 }}>
            <Caps>Notater</Caps>
            <p style={{ fontFamily: TL.font.sans, fontSize: 13, color: TL.text, margin: "6px 0 0", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{okt.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
