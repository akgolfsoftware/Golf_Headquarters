"use client";

/**
 * PlayerHQ · Mål-detalj — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  T,
  Caps,
  Tittel,
  Kort,
  Knapp,
  StatusPill,
  ProgresjonsBar,
  NivaStige,
  Inndata,
  Velger,
  TekstOmraade,
  FilterChips,
  HjelpTips,
} from "@/components/v2";
import { Icon } from "@/components/v2/icon";
import {
  avbrytGoal,
  endreGoal,
  markeerGoalSomOppnaadd,
  type GoalInput,
} from "@/app/portal/(legacy)/mal/goals-actions";

export type MalStigeTrinn = {
  code: string;
  label: string;
  state: "here" | "passed" | "next" | "future";
};

export type MalDetaljV2Data = {
  id: string;
  typeLabel: string;
  tittel: string;
  goalType: string;
  status: "ACTIVE" | "ACHIEVED" | "ABANDONED";
  naaVerdi: number;
  maalVerdi: number;
  enhet: string;
  progressPct: number;
  fristTekst: string | null;
  etaUker: number | null;
  dagerIgjen: number | null;
  stige: MalStigeTrinn[];
  avbruttGrunn: string | null;
  erEget: boolean;
  initial: {
    title: string;
    type: string;
    targetValue: number | null;
    targetDate: string | null;
  };
};

const GOAL_TYPES: Array<{ value: string; label: string }> = [
  { value: "HCP_TARGET", label: "Handicap-mål" },
  { value: "ROUNDS_PER_MONTH", label: "Runder per måned" },
  { value: "SG_AREA", label: "SG-område" },
  { value: "FREE_TEXT", label: "Fritekst" },
];

const AVBRYT_GRUNNER = [
  "Skade eller helse",
  "Endret prioritet",
  "Urealistisk frist",
  "Annet",
];

function fmtVerdi(v: number): string {
  return v.toLocaleString("nb-NO", { maximumFractionDigits: 1 });
}

/* ── Modal-skall (interaktiv v2-overlay: mørkt bakteppe + panel-kort) ── */
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
      style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", background: "rgba(0,0,0,0.55)" }}
    >
      <div className="v2-sheet-in" style={{ width: "100%", maxWidth: 440, background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20, padding: "20px 22px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)", maxHeight: "86vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <Caps size={9}>{eyebrow}</Caps>
            <h2 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 19, letterSpacing: "-0.02em", color: T.fg, margin: "6px 0 0", lineHeight: 1.2 }}>{tittel}</h2>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            onClick={onClose}
            className="v2-press v2-focus"
            style={{ appearance: "none", width: 28, height: 28, borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flex: "none", color: T.fg2 }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── Handlinger (kun egne mål) — samme tre actions som legacy goal-client ── */
function MalHandlinger({ data }: { data: MalDetaljV2Data }) {
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

  return (
    <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Knapp ghost icon="pencil" disabled={pending} onClick={() => setModal("endre")}>
          Endre mål
        </Knapp>
        <Knapp icon="check" disabled={pending} onClick={() => setModal("feire")}>
          Marker som oppnådd
        </Knapp>
        <Knapp ghost icon="x" disabled={pending} onClick={() => setModal("avbryt")}>
          Avbryt mål
        </Knapp>
      </div>

      {modal === "endre" && (
        <EndreModal initial={data.initial} pending={pending} onClose={lukk} onConfirm={bekreftEndre} />
      )}
      {modal === "feire" && (
        <FeireModal tittel={data.initial.title} pending={pending} onClose={lukk} onConfirm={bekreftOppnadd} />
      )}
      {modal === "avbryt" && (
        <AvbrytModal tittel={data.initial.title} pending={pending} onClose={lukk} onConfirm={bekreftAvbryt} />
      )}
    </>
  );
}

function EndreModal({
  initial,
  pending,
  onClose,
  onConfirm,
}: {
  initial: MalDetaljV2Data["initial"];
  pending: boolean;
  onClose: () => void;
  onConfirm: (input: GoalInput) => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [type, setType] = useState(initial.type);
  const [targetValue, setTargetValue] = useState<string>(
    initial.targetValue != null ? String(initial.targetValue) : "",
  );
  const [targetDate, setTargetDate] = useState<string>(initial.targetDate ?? "");

  const dirty =
    title !== initial.title ||
    type !== initial.type ||
    targetValue !== (initial.targetValue != null ? String(initial.targetValue) : "") ||
    targetDate !== (initial.targetDate ?? "");

  function submit() {
    if (!title.trim()) return;
    onConfirm({
      type,
      title,
      targetValue: targetValue ? Number(targetValue) : null,
      targetDate: targetDate || null,
    });
  }

  return (
    <ModalSkall eyebrow="Mål · Endre" tittel="Endre mål" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>
        <Inndata label="Tittel" value={title} onChange={setTitle} />
        <Velger label="Type" options={GOAL_TYPES} value={type} onChange={setType} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Inndata label="Målverdi" type="number" value={targetValue} onChange={setTargetValue} placeholder="—" mono />
          <Inndata label="Frist" type="date" value={targetDate} onChange={setTargetDate} mono />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
        <Knapp ghost onClick={onClose}>Avbryt</Knapp>
        <Knapp icon="check" disabled={!dirty || pending || !title.trim()} onClick={submit}>
          {pending ? "Lagrer …" : "Lagre endringer"}
        </Knapp>
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", padding: "18px 0 4px" }}>
        <span style={{ width: 64, height: 64, borderRadius: 9999, background: `color-mix(in srgb, ${T.lime} 12%, transparent)`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="trophy" size={28} style={{ color: T.lime }} />
        </span>
        <div>
          <Caps size={9}>Du markerer at du har nådd</Caps>
          <p style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 18, color: T.fg, margin: "8px 0 0", lineHeight: 1.3 }}>
            «{tittel}»
          </p>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.6, margin: "8px 0 0" }}>
            Målet flyttes til arkivet og coach blir varslet. Du kan se det igjen under «Oppnådde mål».
          </p>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
        <Knapp ghost disabled={pending} onClick={onClose}>Ikke ennå</Knapp>
        <Knapp icon="check" disabled={pending} onClick={onConfirm}>
          {pending ? "Lagrer …" : "Bekreft og feir"}
        </Knapp>
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

  const samletGrunn = grunn === "Annet" ? annet : grunn;
  const kanAvbryte = !!samletGrunn.trim();

  return (
    <ModalSkall eyebrow="Mål · Avbryt" tittel="Avbryt mål" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
        <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
          Er du sikker på at du vil avbryte{" "}
          <span style={{ color: T.fg, fontWeight: 600 }}>«{tittel}»</span>? Målet
          beholdes i historikken, men markeres som avbrutt.
        </p>
        <div>
          <Caps size={9} style={{ marginBottom: 8 }}>Grunn</Caps>
          <FilterChips
            items={AVBRYT_GRUNNER}
            active={grunn ? [grunn] : []}
            onToggle={(g) => setGrunn(g === grunn ? "" : g)}
          />
        </div>
        {grunn === "Annet" && (
          <TekstOmraade label="Beskriv" value={annet} rows={3} onChange={setAnnet} placeholder="Hvorfor avbryter du?" />
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
        <Knapp ghost disabled={pending} onClick={onClose}>Behold mål</Knapp>
        <Knapp icon="x" disabled={pending || !kanAvbryte} onClick={() => onConfirm(samletGrunn)}>
          {pending ? "Avbryter …" : "Avbryt mål"}
        </Knapp>
      </div>
    </ModalSkall>
  );
}

export function MalDetaljV2({ data }: { data: MalDetaljV2Data }) {
  const statusPill =
    data.status === "ACHIEVED" ? (
      <StatusPill tone="up">Oppnådd</StatusPill>
    ) : data.status === "ABANDONED" ? (
      <StatusPill tone="down">Avbrutt</StatusPill>
    ) : (
      <StatusPill tone="lime">Aktivt</StatusPill>
    );

  const stigeNaa = data.stige.find((s) => s.state === "here")?.code;

  return (
    <div style={{ maxWidth: 720, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Header */}
      <div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Caps color={T.lime}>{data.typeLabel}</Caps>
          {data.goalType === "HCP_TARGET" && <HjelpTips k="hcp" size={12} />}
          {data.goalType === "SG_AREA" && <HjelpTips k="sgOmrade" size={12} />}
        </span>
        <div style={{ marginTop: 10 }}>
          <Tittel mobile>{data.tittel}</Tittel>
        </div>
        {data.fristTekst && (
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
            Frist: {data.fristTekst}
            {data.etaUker != null && ` · ETA: ~${data.etaUker} uker`}
          </p>
        )}
      </div>

      {/* Fremdrift */}
      <Kort eyebrow="Fremdrift" action={statusPill}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontFamily: T.mono, fontSize: 36, fontWeight: 700, color: T.fg, lineHeight: 0.9, fontVariantNumeric: "tabular-nums" }}>
            {fmtVerdi(data.naaVerdi)}
          </span>
          <span style={{ fontFamily: T.mono, fontSize: 13, color: T.mut, fontVariantNumeric: "tabular-nums" }}>
            / {fmtVerdi(data.maalVerdi)} {data.enhet}
          </span>
        </div>
        <div style={{ marginTop: 14 }}>
          <ProgresjonsBar variant="bar" value={Math.round(data.progressPct)} max={100} label="Av målet" />
        </div>
        {data.dagerIgjen != null && (
          <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.mut, marginTop: 8, display: "block" }}>
            {data.dagerIgjen} dager igjen
          </span>
        )}
      </Kort>

      {/* Nivå-stige (kun HCP-mål — bygget i siden, uendret logikk) */}
      {data.stige.length > 0 && stigeNaa && (
        <Kort eyebrow="Nivå-stige">
          <NivaStige
            trinn={data.stige.map((s) => s.code)}
            naa={stigeNaa}
            beskrivelser={Object.fromEntries(data.stige.map((s) => [s.code, s.label]))}
          />
        </Kort>
      )}

      {/* Avbrutt-grunn */}
      {data.status === "ABANDONED" && data.avbruttGrunn && (
        <Kort eyebrow="Årsak">
          <p style={{ fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.6, margin: 0 }}>
            {data.avbruttGrunn}
          </p>
        </Kort>
      )}

      {/* Handlinger — kun på egne mål */}
      {data.erEget && <MalHandlinger data={data} />}
    </div>
  );
}
