"use client";

/**
 * PH19Enkeltmal — Mål-detalj i Precision Athletics.
 * Kilde: Claude Design arkiv/2026-09-30/playerhq/screens/PH-19.jsx
 *
 * Beholder alle eksisterende handlinger (endreGoal, markeerGoalSomOppnaadd, avbrytGoal)
 * og A-K nivåstigen, men med ren Precision Athletics styling og komponenter.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Edit2, HelpCircle, Trophy, X } from "lucide-react";
import { Ikon, StatusPille, TomTilstand } from "@/components/precision/pa";
import {
  avbrytGoal,
  endreGoal,
  markeerGoalSomOppnaadd,
  type GoalInput,
} from "@/app/portal/(legacy)/mal/goals-actions";
import type { GoalCategory } from "@/generated/prisma/client";
import { PYR_REKKEFOLGE, PYR_LABEL } from "@/lib/pyramide";
import { SG_OMRADER, SG_OMRADE_NAVN, erSgOmrade } from "@/lib/domain/maal-fremdrift";
import { erPlanNivaa, PLAN_NIVAAER, PLAN_NIVAA_LABEL } from "@/lib/domain/maal-plannivaa";
import type { MalDetaljV2Data, MalTestOption } from "@/components/portal/v2/MalDetaljV2";

export type PH19EnkeltmalProps = {
  data: MalDetaljV2Data;
  testOptions?: MalTestOption[];
};

const GOAL_TYPES: Array<{ value: string; label: string }> = [
  { value: "HCP_TARGET", label: "Handicap-mål" },
  { value: "ROUNDS_PER_MONTH", label: "Runder per måned" },
  { value: "SG_AREA", label: "SG-område" },
  { value: "SESSION_FREQUENCY", label: "Øktfrekvens" },
  { value: "TEST_SCORE", label: "Testresultat" },
  { value: "FREE_TEXT", label: "Fritekst" },
];

const PLAN_NIVAA_VALG: Array<{ value: string; label: string }> = [
  { value: "", label: "Automatisk fra frist" },
  ...PLAN_NIVAAER.map((n) => ({ value: n, label: PLAN_NIVAA_LABEL[n] })),
];

const PYRAMID_OPTIONS = PYR_REKKEFOLGE.map((a) => ({ value: a, label: PYR_LABEL[a] }));

const SG_OMRADE_VALG: Array<{ value: string; label: string }> = SG_OMRADER.map((o) => ({
  value: o,
  label: SG_OMRADE_NAVN[o],
}));

const AVBRYT_GRUNNER = [
  "Skade eller helse",
  "Endret prioritet",
  "Urealistisk frist",
  "Annet",
];

function fmtVerdi(v: number): string {
  return v.toLocaleString("nb-NO", { maximumFractionDigits: 1 });
}

function ModalSkall({
  eyebrow,
  tittel,
  onClose,
  children,
}: {
  eyebrow: string;
  tittel: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "var(--scrim-modal)",
      }}
    >
      <div
        className="pa-card"
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--surface-card)",
          border: "1px solid var(--border-hairline)",
          borderRadius: 12,
          padding: 24,
          maxHeight: "86vh",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <div>
            <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>{eyebrow}</span>
            <h2 style={{ font: "var(--type-title-s)", color: "var(--text-primary)", margin: "4px 0 0" }}>{tittel}</h2>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <Ikon icon={X} size={18} name="x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EndreModal({
  initial,
  testOptions,
  pending,
  onClose,
  onConfirm,
}: {
  initial: MalDetaljV2Data["initial"];
  testOptions: MalTestOption[];
  pending: boolean;
  onClose: () => void;
  onConfirm: (input: GoalInput) => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [category, setCategory] = useState<GoalCategory>(initial.category);
  const [type, setType] = useState(initial.type);
  const [targetValue, setTargetValue] = useState<string>(
    initial.targetValue != null ? String(initial.targetValue) : "",
  );
  const [targetDate, setTargetDate] = useState<string>(initial.targetDate ?? "");
  const [linkedPyramidArea, setLinkedPyramidArea] = useState<string>(initial.linkedPyramidArea ?? "");
  const [linkedTestId, setLinkedTestId] = useState<string>(initial.linkedTestId ?? "");
  const [sgOmrade, setSgOmrade] = useState<string>(initial.sgOmrade ?? "");
  const [planNivaa, setPlanNivaa] = useState<string>(initial.planNivaa ?? "");

  const erSg = type === "SG_AREA";
  const manglerOmrade = erSg && !sgOmrade;

  function submit() {
    if (!title.trim() || manglerOmrade) return;
    onConfirm({
      type,
      category,
      title,
      targetValue: targetValue ? Number(targetValue) : null,
      targetDate: targetDate || null,
      linkedPyramidArea:
        type === "SESSION_FREQUENCY" && linkedPyramidArea
          ? (linkedPyramidArea as GoalInput["linkedPyramidArea"])
          : null,
      linkedTestId: type === "TEST_SCORE" && linkedTestId ? linkedTestId : null,
      sgOmrade: erSg && erSgOmrade(sgOmrade) ? sgOmrade : null,
      planNivaa: erPlanNivaa(planNivaa) ? planNivaa : null,
    });
  }

  return (
    <ModalSkall eyebrow="Målsetning · Rediger" tittel="Endre mål" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ font: "var(--type-kicker)", display: "block", marginBottom: 6 }}>Kategori</label>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setCategory("OUTCOME")}
              className={`pa-btn ${category === "OUTCOME" ? "pa-btn--primary" : "pa-btn--secondary"}`}
              style={{ flex: 1 }}
            >
              Resultatmål
            </button>
            <button
              type="button"
              onClick={() => setCategory("PROCESS")}
              className={`pa-btn ${category === "PROCESS" ? "pa-btn--primary" : "pa-btn--secondary"}`}
              style={{ flex: 1 }}
            >
              Prosessmål
            </button>
          </div>
        </div>

        <div>
          <label style={{ font: "var(--type-meta)", display: "block", marginBottom: 4 }}>Tittel</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="pa-input"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-hairline)", background: "var(--surface-card)", color: "var(--text-primary)" }}
          />
        </div>

        <div>
          <label style={{ font: "var(--type-meta)", display: "block", marginBottom: 4 }}>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-hairline)", background: "var(--surface-card)", color: "var(--text-primary)" }}
          >
            {GOAL_TYPES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {erSg && (
          <div>
            <label style={{ font: "var(--type-meta)", display: "block", marginBottom: 4 }}>SG-område</label>
            <select
              value={sgOmrade}
              onChange={(e) => setSgOmrade(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-hairline)", background: "var(--surface-card)", color: "var(--text-primary)" }}
            >
              <option value="">Velg SG-område</option>
              {SG_OMRADE_VALG.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ font: "var(--type-meta)", display: "block", marginBottom: 4 }}>Målverdi</label>
            <input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-hairline)", background: "var(--surface-card)", color: "var(--text-primary)" }}
            />
          </div>
          <div>
            <label style={{ font: "var(--type-meta)", display: "block", marginBottom: 4 }}>Frist</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-hairline)", background: "var(--surface-card)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        <div>
          <label style={{ font: "var(--type-meta)", display: "block", marginBottom: 4 }}>Planleggingsnivå</label>
          <select
            value={planNivaa}
            onChange={(e) => setPlanNivaa(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-hairline)", background: "var(--surface-card)", color: "var(--text-primary)" }}
          >
            {PLAN_NIVAA_VALG.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {type === "SESSION_FREQUENCY" && (
          <div>
            <label style={{ font: "var(--type-meta)", display: "block", marginBottom: 4 }}>Treningskategori</label>
            <select
              value={linkedPyramidArea}
              onChange={(e) => setLinkedPyramidArea(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-hairline)", background: "var(--surface-card)", color: "var(--text-primary)" }}
            >
              <option value="">Velg kategori</option>
              {PYRAMID_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}

        {type === "TEST_SCORE" && testOptions.length > 0 && (
          <div>
            <label style={{ font: "var(--type-meta)", display: "block", marginBottom: 4 }}>Test</label>
            <select
              value={linkedTestId}
              onChange={(e) => setLinkedTestId(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-hairline)", background: "var(--surface-card)", color: "var(--text-primary)" }}
            >
              <option value="">Velg test</option>
              {testOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button type="button" onClick={onClose} className="pa-btn pa-btn--secondary">
            Avbryt
          </button>
          <button
            type="button"
            disabled={pending || !title.trim() || manglerOmrade}
            onClick={submit}
            className="pa-btn pa-btn--primary"
          >
            {pending ? "Lagrer …" : "Lagre endringer"}
          </button>
        </div>
      </div>
    </ModalSkall>
  );
}

function FeireModal({
  tittel,
  pending,
  onClose,
  onConfirm,
}: {
  tittel: string;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalSkall eyebrow="Gratulerer" tittel="Mål oppnådd" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center", padding: "16px 0" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--surface-card)", display: "grid", placeItems: "center" }}>
          <Ikon icon={Trophy} size={32} name="trophy" />
        </div>
        <div>
          <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>DU MARKERER AT DU HAR NÅDD</span>
          <p style={{ font: "var(--type-title-s)", color: "var(--text-primary)", margin: "6px 0 0" }}>«{tittel}»</p>
          <p style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", margin: "8px 0 0" }}>
            Målet markeres som oppnådd og coach varsles.
          </p>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <button type="button" disabled={pending} onClick={onClose} className="pa-btn pa-btn--secondary">
          Ikke ennå
        </button>
        <button type="button" disabled={pending} onClick={onConfirm} className="pa-btn pa-btn--primary">
          {pending ? "Lagrer …" : "Bekreft og feir"}
        </button>
      </div>
    </ModalSkall>
  );
}

function AvbrytModal({
  tittel,
  pending,
  onClose,
  onConfirm,
}: {
  tittel: string;
  pending: boolean;
  onClose: () => void;
  onConfirm: (grunn: string) => void;
}) {
  const [grunn, setGrunn] = useState<string>("");
  const [annet, setAnnet] = useState<string>("");
  const samlet = grunn === "Annet" ? annet : grunn;

  return (
    <ModalSkall eyebrow="Målsetning" tittel="Avbryt mål" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", margin: 0 }}>
          Er du sikker på at du vil avbryte <strong>«{tittel}»</strong>? Målet beholdes i historikken som avbrutt.
        </p>
        <div>
          <label style={{ font: "var(--type-meta)", display: "block", marginBottom: 6 }}>Grunn</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {AVBRYT_GRUNNER.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGrunn(g === grunn ? "" : g)}
                className={`pa-btn ${grunn === g ? "pa-btn--primary" : "pa-btn--secondary"}`}
                style={{ fontSize: 13, height: 32, padding: "0 10px" }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        {grunn === "Annet" && (
          <textarea
            value={annet}
            onChange={(e) => setAnnet(e.target.value)}
            placeholder="Beskriv hvorfor målet avbrytes"
            rows={3}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid var(--border-hairline)", background: "var(--surface-card)", color: "var(--text-primary)" }}
          />
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <button type="button" disabled={pending} onClick={onClose} className="pa-btn pa-btn--secondary">
          Behold mål
        </button>
        <button
          type="button"
          disabled={pending || !samlet.trim()}
          onClick={() => onConfirm(samlet)}
          className="pa-btn pa-btn--secondary"
          style={{ color: "var(--warn)" }}
        >
          {pending ? "Avbryter …" : "Avbryt mål"}
        </button>
      </div>
    </ModalSkall>
  );
}

export function PH19Enkeltmal({ data, testOptions = [] }: PH19EnkeltmalProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [modal, setModal] = useState<"endre" | "feire" | "avbryt" | null>(null);

  function lukk() {
    if (!pending) setModal(null);
  }

  function bekreftEndre(input: GoalInput) {
    startTransition(async () => {
      await endreGoal(data.id, input);
      router.refresh();
      setModal(null);
    });
  }

  function bekreftOppnadd() {
    startTransition(async () => {
      await markeerGoalSomOppnaadd(data.id);
      router.refresh();
      setModal(null);
    });
  }

  function bekreftAvbryt(grunn: string) {
    startTransition(async () => {
      await avbrytGoal(data.id, grunn);
      router.push("/portal/mal");
    });
  }

  const statusTone =
    data.status === "ACHIEVED" ? "ok" : data.status === "ABANDONED" ? "neutral" : "ok";

  const stigeNaa = data.stige.find((s) => s.state === "here")?.code;

  return (
    <div className="pa-side" style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720, margin: "0 auto", width: "100%" }}>
      {/* Tilbake-lenke */}
      <Link href="/portal/mal" className="pa-btn pa-btn--secondary" style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6 }}>
        <Ikon icon={ArrowLeft} size={15} name="arrow-left" />
        <span>Målsetninger</span>
      </Link>

      {/* Tittelkort */}
      <header className="pa-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StatusPille tone="neutral">{data.category === "OUTCOME" ? "Resultatmål" : "Prosessmål"}</StatusPille>
            <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>{data.typeLabel}</span>
          </div>
          <StatusPille tone={statusTone}>
            {data.status === "ACHIEVED" ? "Oppnådd" : data.status === "ABANDONED" ? "Avbrutt" : "Aktivt"}
          </StatusPille>
        </div>

        <h1 style={{ font: "var(--type-title-m)", color: "var(--text-primary)", margin: 0 }}>{data.tittel}</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {data.fristTekst && (
            <p style={{ font: "var(--type-meta)", color: "var(--text-muted)", margin: 0 }}>
              FRIST {data.fristTekst.toUpperCase()}
              {data.etaUker != null && ` · BEREGNET: ~${data.etaUker} UKER`}
            </p>
          )}
          {data.status === "ACHIEVED" && data.achievedAtTekst && (
            <p style={{ font: "var(--type-meta)", color: "var(--ok)", margin: 0 }}>
              OPPNÅDD {data.achievedAtTekst.toUpperCase()}
            </p>
          )}
          {data.linkedPyramidAreaLabel && (
            <p style={{ font: "var(--type-meta)", color: "var(--text-secondary)", margin: 0 }}>
              KOBLET TIL: {data.linkedPyramidAreaLabel.toUpperCase()}
            </p>
          )}
        </div>
      </header>

      {/* Fremdriftskort */}
      <section className="pa-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>Fremdrift</span>

        {data.hasData ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ font: "700 36px/1 var(--font-mono)", color: "var(--text-primary)" }}>
                {fmtVerdi(data.naaVerdi)}
              </span>
              <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>
                / {fmtVerdi(data.maalVerdi)} {data.enhet} ({Math.round(data.progressPct)} %)
              </span>
            </div>

            {/* Progresjonslinje */}
            <div style={{ width: "100%", height: 8, borderRadius: 999, background: "var(--border-hairline)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, data.progressPct))}%`,
                  height: "100%",
                  background: data.progressPct >= 100 ? "var(--ok)" : "var(--primary)",
                  borderRadius: 999,
                }}
              />
            </div>

            <p style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", margin: 0 }}>
              {data.fremdriftTekst}
            </p>
          </div>
        ) : (
          <TomTilstand
            icon={HelpCircle}
            title="Ingen data ennå"
            text={data.fremdriftTekst}
          />
        )}

        {data.dagerIgjen != null && (
          <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>
            {data.dagerIgjen} DAGER IGJEN TIL FRIST
          </span>
        )}
      </section>

      {/* Nivåstige (hvis HCP-mål) */}
      {data.stige.length > 0 && stigeNaa && (
        <section className="pa-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>Nivå-stige (NGF-kategori)</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {data.stige.map((trinn) => {
              const erNaa = trinn.code === stigeNaa;
              return (
                <div
                  key={trinn.code}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: erNaa ? "2px solid var(--primary)" : "1px solid var(--border-hairline)",
                    background: erNaa ? "var(--surface-card)" : "transparent",
                  }}
                >
                  <span style={{ font: "700 18px/1 var(--font-sans)", color: "var(--text-primary)" }}>{trinn.code}</span>
                  <span style={{ font: "var(--type-meta)", color: "var(--text-muted)" }}>{trinn.label}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Avbrutt årsak */}
      {data.status === "ABANDONED" && data.avbruttGrunn && (
        <section className="pa-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ font: "var(--type-kicker)", color: "var(--text-muted)" }}>Årsak for avbrudd</span>
          <p style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", margin: 0 }}>{data.avbruttGrunn}</p>
        </section>
      )}

      {/* Handlingsknapper hvis spillerens eget mål */}
      {data.erEget && data.status === "ACTIVE" && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          <button
            type="button"
            disabled={pending}
            onClick={() => setModal("endre")}
            className="pa-btn pa-btn--secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Ikon icon={Edit2} size={15} name="edit" />
            <span>Endre mål</span>
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setModal("feire")}
            className="pa-btn pa-btn--primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Ikon icon={Check} size={15} name="check" />
            <span>Marker som oppnådd</span>
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => setModal("avbryt")}
            className="pa-btn pa-btn--secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--warn)" }}
          >
            <Ikon icon={X} size={15} name="x" />
            <span>Avbryt mål</span>
          </button>
        </div>
      )}

      {/* Modaler */}
      {modal === "endre" && (
        <EndreModal
          initial={data.initial}
          testOptions={testOptions}
          pending={pending}
          onClose={lukk}
          onConfirm={bekreftEndre}
        />
      )}
      {modal === "feire" && (
        <FeireModal tittel={data.initial.title} pending={pending} onClose={lukk} onConfirm={bekreftOppnadd} />
      )}
      {modal === "avbryt" && (
        <AvbrytModal tittel={data.initial.title} pending={pending} onClose={lukk} onConfirm={bekreftAvbryt} />
      )}
    </div>
  );
}
