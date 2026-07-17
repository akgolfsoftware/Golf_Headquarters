"use client";

/**
 * AgencyOS — Plan-mal-editor (`/admin/plan-templates/[id]/rediger`) — v2.
 * v2-port 17. juli 2026 (Team F1): erstatter template-editor + volum-linje
 * (golfdata). ALL logikk er beholdt eksakt:
 *   - Server actions: updateTemplate, addTemplateSession, updateTemplateSession,
 *     deleteTemplateSession, setWeekDuration, copyTemplateWeek.
 *   - Volum-linje (timer/uke + reell pyramidefordeling) via
 *     beregnTemplateVolum i src/lib/plan-templates/ — urørt.
 *   - Masseredigering: «sett varighet for hele uka» og «kopier uke→uke» med
 *     konflikt-bekreftelse (retry med overskriv=true) — samme logikk-rekkefølge
 *     som før, men prompt()/confirm()/alert() er erstattet med v2-dialoger
 *     (kvalitetshale 17. juli 2026): lokalt ModalSkall (idiom fra MalDetaljV2)
 *     + Inndata/Velger, og feil/statuser vises inline i stedet for alert().
 * Kun presentasjonen er byttet til v2 (Kort/Knapp/T-tokens/HjelpTips).
 *
 * 3-pane på desktop (som før): drill-bibliotek · økt-grid · innstillinger.
 * Mobil: stabler vertikalt (grid-en først).
 */

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  LPhase,
  NgfKategori,
  PyramidArea,
  SessionEnvironment,
  SkillArea,
} from "@/generated/prisma/enums";
import {
  addTemplateSession,
  copyTemplateWeek,
  deleteTemplateSession,
  setWeekDuration,
  updateTemplate,
  updateTemplateSession,
  type SessionInput,
  type TemplateUpdateInput,
} from "@/app/admin/(legacy)/plan-templates/actions";
import {
  DAG_LABEL,
  ENV_LABEL,
  FASE_ALLE,
  FASE_LABEL,
  KATEGORI_ALLE,
  KATEGORI_LABEL,
  SKILL_LABEL,
  type DisciplinFordeling,
  type DrillEntry,
} from "@/components/admin/plan-templates/shared";
import { beregnTemplateVolum } from "@/lib/plan-templates/beregn-volum";
import {
  Kort,
  Caps,
  Tittel,
  Knapp,
  Inndata,
  Velger,
  Icon,
  HjelpTips,
  AKSE_NAVN,
  T,
} from "@/components/v2";

/* ── Datakontrakter (mappes fra Prisma i ruten) ───────── */

export type RedigerDrillValg = {
  id: string;
  name: string;
  pyramidArea: PyramidArea;
  skillArea: SkillArea | null;
};

export type RedigerOkt = {
  id: string;
  ukeNr: number;
  dagNr: number;
  title: string;
  varighetMin: number;
  pyramidArea: PyramidArea;
  skillArea: SkillArea | null;
  environment: SessionEnvironment;
  drills: DrillEntry[];
  focus: string | null;
  notes: string | null;
};

export type RedigerMal = {
  id: string;
  name: string;
  description: string | null;
  kategori: NgfKategori;
  lPhase: LPhase;
  varighetUker: number;
  ukentligOktAntall: number;
  fordeling: DisciplinFordeling;
  minAlder: number | null;
  maxAlder: number | null;
  approved: boolean;
  sessions: RedigerOkt[];
};

const PYR_ALLE: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const SKILL_ALLE: SkillArea[] = ["TEE_TOTAL", "TILNAERMING", "AROUND_GREEN", "PUTTING", "SPILL"];
const ENV_ALLE: SessionEnvironment[] = ["RANGE", "BANE", "STUDIO", "HJEM", "SIMULATOR", "GYM"];

// Varsel-terskel for sprik mellom glider-% og reell % (fra volum-linje.tsx)
const AVVIK_TERSKEL_PP = 10;

type ModalState =
  | { kind: "closed" }
  | { kind: "create"; ukeNr: number; dagNr: number }
  | { kind: "edit"; session: RedigerOkt };

// Uke-verktøy og bekreftelser (erstatter prompt()/confirm()-flytene fra golfdata)
type UkeDialogState =
  | { kind: "ingen" }
  | { kind: "varighet"; ukeNr: number }
  | { kind: "kopier"; fraUke: number; konflikt: { tilUke: number; antallIMaal: number } | null }
  | { kind: "slett-okt"; sessionId: string };

type LagreMelding = { type: "ok" | "feil"; tekst: string };

/* ── v2-feltstiler (samme idiom som AdminDrillRedigerV2) ── */

const FELT_STIL: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  borderRadius: 10,
  border: `1px solid ${T.border}`,
  background: T.panel2,
  padding: "9px 12px",
  fontFamily: T.ui,
  fontSize: 13,
  color: T.fg,
  outline: "none",
  boxSizing: "border-box",
};

type HjelpKey = "lFase" | "pyramideAkse" | "skillArea" | "miljo" | "csNivaa";

function Etikett({ children, hjelp }: { children: React.ReactNode; hjelp?: HjelpKey }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: T.mut }}>
      {children}
      {hjelp && <HjelpTips k={hjelp} size={11} />}
    </span>
  );
}

function Felt({ label, hjelp, children }: { label: React.ReactNode; hjelp?: HjelpKey; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <Etikett hjelp={hjelp}>{label}</Etikett>
      {children}
    </label>
  );
}

function IkonKnappLiten({
  icon,
  title,
  disabled,
  onClick,
}: {
  icon: string;
  title: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className="v2-press v2-focus"
      style={{ appearance: "none", cursor: disabled ? "default" : "pointer", width: 20, height: 20, borderRadius: 6, border: 0, background: "transparent", color: T.mut, display: "inline-flex", alignItems: "center", justifyContent: "center", opacity: disabled ? 0.5 : 1 }}
    >
      <Icon name={icon} size={12} />
    </button>
  );
}

// Destruktiv ghost-Knapp (samme idiom som «Slett økt» i økt-dialogen)
const KNAPP_FARE_STIL: React.CSSProperties = {
  color: T.down,
  borderColor: `color-mix(in srgb, ${T.down} 40%, transparent)`,
};

function FeilBoks({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      style={{ margin: 0, borderRadius: 10, border: `1px solid color-mix(in srgb, ${T.down} 40%, transparent)`, background: `color-mix(in srgb, ${T.down} 10%, transparent)`, padding: "9px 12px", fontFamily: T.ui, fontSize: 12, color: T.down, lineHeight: 1.5 }}
    >
      {children}
    </p>
  );
}

/* ── Modal-skall (lokal variant av idiomet i MalDetaljV2) ─ */

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
      aria-label={tittel}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ position: "fixed", inset: 0, zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", background: "rgba(0,0,0,0.55)" }}
    >
      <div
        className="v2-sheet-in"
        style={{ width: "100%", maxWidth: 440, background: T.panel, border: `1px solid ${T.borderS}`, borderRadius: 20, padding: "20px 22px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)", maxHeight: "86vh", overflowY: "auto" }}
      >
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

/* ── Hovedkomponent ───────────────────────────────────── */

export function AdminPlanMalRedigerV2({
  template,
  drillOptions,
}: {
  template: RedigerMal;
  drillOptions: RedigerDrillValg[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Innstillinger-state (kan endres lokalt før lagring) — identisk med golfdata-versjonen
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description ?? "");
  const [kategori, setKategori] = useState<NgfKategori>(template.kategori);
  const [lPhase, setLPhase] = useState<LPhase>(template.lPhase);
  const [varighetUker, setVarighetUker] = useState(template.varighetUker);
  const [ukentligOktAntall, setUkentligOktAntall] = useState(template.ukentligOktAntall);
  const [fordeling, setFordeling] = useState<DisciplinFordeling>(template.fordeling);
  const [minAlder, setMinAlder] = useState<string>(template.minAlder?.toString() ?? "");
  const [maxAlder, setMaxAlder] = useState<string>(template.maxAlder?.toString() ?? "");
  const [approved, setApproved] = useState(template.approved);

  const [modal, setModal] = useState<ModalState>({ kind: "closed" });
  const [oktFeil, setOktFeil] = useState<string | null>(null); // server-feil vist inline i økt-dialogen
  const [ukeDialog, setUkeDialog] = useState<UkeDialogState>({ kind: "ingen" });
  const [dialogFeil, setDialogFeil] = useState<string | null>(null); // server-feil vist inline i uke-dialogene
  const [lagreMelding, setLagreMelding] = useState<LagreMelding | null>(null); // inline-status for «Lagre innstillinger»
  const [drillSok, setDrillSok] = useState("");

  const fordelingSum = useMemo(() => {
    return Math.round(
      (fordeling.FYS + fordeling.TEK + fordeling.SLAG + fordeling.SPILL + fordeling.TURN) * 100,
    );
  }, [fordeling]);

  const sessions = template.sessions;

  const volum = useMemo(
    () => beregnTemplateVolum(sessions, varighetUker, fordeling),
    [sessions, varighetUker, fordeling],
  );

  const filtererteDrills = useMemo(() => {
    if (!drillSok.trim()) return drillOptions;
    const q = drillSok.toLowerCase();
    return drillOptions.filter((d) => d.name.toLowerCase().includes(q));
  }, [drillSok, drillOptions]);

  function onSaveSettings() {
    if (fordelingSum !== 100) {
      setLagreMelding({ type: "feil", tekst: `Disiplin-fordelingen må summere til 100 % (er nå ${fordelingSum} %).` });
      return;
    }
    const input: TemplateUpdateInput = {
      name,
      description: description || null,
      kategori,
      lPhase,
      varighetUker,
      ukentligOktAntall,
      disciplinFordeling: fordeling,
      minAlder: minAlder ? parseInt(minAlder, 10) : null,
      maxAlder: maxAlder ? parseInt(maxAlder, 10) : null,
      approved,
    };
    setLagreMelding(null);
    startTransition(async () => {
      const res = await updateTemplate(template.id, input);
      if (res.ok) {
        router.refresh();
        setLagreMelding({ type: "ok", tekst: "Lagret." });
      } else {
        setLagreMelding({ type: "feil", tekst: `Kunne ikke lagre: ${res.error}` });
      }
    });
  }

  function aapneUkeDialog(state: UkeDialogState) {
    setDialogFeil(null);
    setUkeDialog(state);
  }

  function lukkUkeDialog() {
    setDialogFeil(null);
    setUkeDialog({ kind: "ingen" });
  }

  // Kjøres først etter «Slett»-bekreftelse i dialogen (før: confirm())
  function onDeleteSessionBekreftet(sessionId: string) {
    startTransition(async () => {
      const res = await deleteTemplateSession(sessionId);
      if (res.ok) {
        lukkUkeDialog();
        router.refresh();
      } else {
        setDialogFeil(res.error);
      }
    });
  }

  function findSession(ukeNr: number, dagNr: number): RedigerOkt | undefined {
    return sessions.find((s) => s.ukeNr === ukeNr && s.dagNr === dagNr);
  }

  // Kjøres fra varighet-dialogen (før: prompt())
  function onSetWeekDurationBekreftet(ukeNr: number, varighetMin: number) {
    startTransition(async () => {
      const res = await setWeekDuration(template.id, ukeNr, varighetMin);
      if (res.ok) {
        lukkUkeDialog();
        router.refresh();
      } else {
        setDialogFeil(res.error);
      }
    });
  }

  // Kjøres fra kopier-dialogen (før: prompt() + confirm() + retry).
  // Samme logikk-rekkefølge som før: feil → vises; konflikt → «Overskriv»-
  // spørsmål (nå i modalen) → nytt kall med overskriv=true; ellers refresh.
  function onCopyWeekUtfor(fraUke: number, tilUke: number, overskriv: boolean) {
    if (!Number.isFinite(tilUke) || tilUke < 1 || tilUke > varighetUker) {
      setDialogFeil("Ugyldig uke.");
      return;
    }
    startTransition(async () => {
      const res = await copyTemplateWeek(template.id, fraUke, tilUke, overskriv);
      if (!res.ok) {
        setDialogFeil(res.error);
        return;
      }
      if (res.data.status === "konflikt") {
        setDialogFeil(null);
        setUkeDialog({ kind: "kopier", fraUke, konflikt: { tilUke, antallIMaal: res.data.antallIMaal } });
        return;
      }
      lukkUkeDialog();
      router.refresh();
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Topptekst */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <Caps>Redigerer</Caps>
          <div style={{ marginTop: 6 }}>
            <Tittel em={template.name}>Rediger:</Tittel>
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, margin: "8px 0 0", lineHeight: 1.55, maxWidth: 640 }}>
            Endringer på innstillinger må lagres separat. Endringer på enkeltøkter lagres når du klikker «Lagre endring».
          </p>
        </div>
        <Knapp icon="check" disabled={isPending} onClick={onSaveSettings}>
          {isPending ? "Lagrer…" : "Lagre innstillinger"}
        </Knapp>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr_280px]">
        {/* Venstre: drill-bibliotek */}
        <div className="order-2 min-w-0 lg:order-1">
        <Kort pad="14px 16px" style={{ height: "100%" }}>
          <Caps>Drill-bibliotek ({drillOptions.length})</Caps>
          <div style={{ position: "relative", marginTop: 10 }}>
            <Icon
              name="search"
              size={13}
              style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.mut, pointerEvents: "none" }}
            />
            <input
              type="text"
              value={drillSok}
              onChange={(e) => setDrillSok(e.target.value)}
              placeholder="Søk drill"
              aria-label="Søk drill"
              style={{ ...FELT_STIL, marginTop: 0, paddingLeft: 30 }}
            />
          </div>
          <p style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, margin: "8px 0 0", lineHeight: 1.5 }}>
            Bibliotek-referanse. Drills legges til på en økt via «Legg til» i grid-en.
          </p>
          <div style={{ marginTop: 8, maxHeight: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
            {filtererteDrills.slice(0, 50).map((d) => (
              <div
                key={d.id}
                style={{ display: "flex", alignItems: "center", gap: 7, borderRadius: 8, border: `1px solid ${T.border}`, background: T.panel2, padding: "6px 8px" }}
              >
                <span aria-hidden style={{ width: 6, height: 6, borderRadius: 9999, background: T.ax[d.pyramidArea], flex: "none" }} />
                <span style={{ fontFamily: T.ui, fontSize: 11, color: T.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
              </div>
            ))}
            {filtererteDrills.length > 50 && (
              <p style={{ fontFamily: T.ui, fontSize: 10.5, color: T.mut, margin: "2px 0 0" }}>
                +{filtererteDrills.length - 50} flere. Avgrens søket.
              </p>
            )}
            {filtererteDrills.length === 0 && (
              <p style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, margin: "2px 0 0" }}>
                Ingen drills matcher søket.
              </p>
            )}
          </div>
        </Kort>
        </div>

        {/* Midt: økt-grid */}
        <div className="order-1 min-w-0 lg:order-2">
        <Kort
          style={{ height: "100%" }}
          eyebrow={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              Økt-grid <HjelpTips k="pyramideAkse" size={11} />
            </span>
          }
          action={
            <span style={{ fontFamily: T.mono, fontSize: 9, color: T.mut }}>
              {sessions.length} av {varighetUker * ukentligOktAntall} planlagte
            </span>
          }
        >
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 640 }}>
              {/* Dag-header */}
              <div style={{ display: "grid", gridTemplateColumns: "72px repeat(7, 1fr)", gap: 4, paddingBottom: 4 }}>
                <div />
                {DAG_LABEL.map((d) => (
                  <div
                    key={d}
                    style={{ borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, padding: "4px 0", textAlign: "center", fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: T.mut }}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {Array.from({ length: varighetUker }, (_, i) => i + 1).map((uke) => {
                const ukeMin = volum.minPerUke[uke - 1] ?? 0;
                const ukeTimer = Math.round((ukeMin / 60) * 10) / 10;
                return (
                  <div key={uke} style={{ marginTop: 4, display: "grid", gridTemplateColumns: "72px repeat(7, 1fr)", gap: 4 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, borderRadius: 8, background: T.panel3, padding: "4px 0", fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.fg2 }}>
                      <span>{uke}</span>
                      {/* Uke-volum (fra beregnTemplateVolum) — skjules for tomme uker */}
                      {ukeMin > 0 && (
                        <span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.mut, fontVariantNumeric: "tabular-nums" }}>
                          {ukeTimer.toFixed(1).replace(".", ",")} t
                        </span>
                      )}
                      <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                        <IkonKnappLiten icon="clock" title="Sett varighet for hele uka" disabled={isPending} onClick={() => aapneUkeDialog({ kind: "varighet", ukeNr: uke })} />
                        <IkonKnappLiten icon="copy" title="Kopier uka til …" disabled={isPending} onClick={() => aapneUkeDialog({ kind: "kopier", fraUke: uke, konflikt: null })} />
                      </div>
                    </div>
                    {[1, 2, 3, 4, 5, 6, 7].map((dag) => {
                      const s = findSession(uke, dag);
                      return (
                        <div key={dag} style={{ minHeight: 64 }}>
                          {s ? (
                            <button
                              type="button"
                              onClick={() => setModal({ kind: "edit", session: s })}
                              className="v2-row-h v2-focus"
                              style={{ appearance: "none", cursor: "pointer", display: "flex", height: "100%", width: "100%", flexDirection: "column", gap: 4, borderRadius: 8, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.ax[s.pyramidArea]}`, background: T.panel2, padding: 6, textAlign: "left" }}
                            >
                              <span style={{ fontFamily: T.ui, fontSize: 11, fontWeight: 600, color: T.fg, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                {s.title}
                              </span>
                              <span style={{ marginTop: "auto", fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: T.mut }}>
                                {s.varighetMin}m · {s.drills.length}d
                              </span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setModal({ kind: "create", ukeNr: uke, dagNr: dag })}
                              aria-label={`Ny økt uke ${uke}, ${DAG_LABEL[dag - 1]}`}
                              className="v2-press v2-focus"
                              style={{ appearance: "none", cursor: "pointer", display: "flex", height: "100%", width: "100%", alignItems: "center", justifyContent: "center", borderRadius: 8, border: `1px dashed ${T.border}`, background: "transparent", color: T.mut }}
                            >
                              <Icon name="plus" size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </Kort>
        </div>

        {/* Høyre: innstillinger */}
        <div className="order-3 min-w-0">
        <Kort pad="14px 16px" style={{ height: "100%" }}>
          <Caps>Innstillinger</Caps>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            <Felt label="Navn">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={FELT_STIL} />
            </Felt>
            <Felt label="Beskrivelse">
              <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...FELT_STIL, resize: "vertical", lineHeight: 1.5 }} />
            </Felt>
            <Felt label="Kategori">
              <select value={kategori} onChange={(e) => setKategori(e.target.value as NgfKategori)} style={FELT_STIL}>
                {KATEGORI_ALLE.map((k) => (
                  <option key={k} value={k}>{KATEGORI_LABEL[k]}</option>
                ))}
              </select>
            </Felt>
            <Felt label="Fase" hjelp="lFase">
              <select value={lPhase} onChange={(e) => setLPhase(e.target.value as LPhase)} style={FELT_STIL}>
                {FASE_ALLE.map((f) => (
                  <option key={f} value={f}>{FASE_LABEL[f]}</option>
                ))}
              </select>
            </Felt>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Felt label="Varighet (uker)">
                <input type="number" min={1} max={52} value={varighetUker} onChange={(e) => setVarighetUker(parseInt(e.target.value || "0", 10))} style={FELT_STIL} />
              </Felt>
              <Felt label="Økt/uke">
                <input type="number" min={1} max={14} value={ukentligOktAntall} onChange={(e) => setUkentligOktAntall(parseInt(e.target.value || "0", 10))} style={FELT_STIL} />
              </Felt>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <Felt label="Min alder">
                <input type="text" value={minAlder} onChange={(e) => setMinAlder(e.target.value)} placeholder="—" style={FELT_STIL} />
              </Felt>
              <Felt label="Maks alder">
                <input type="text" value={maxAlder} onChange={(e) => setMaxAlder(e.target.value)} placeholder="—" style={FELT_STIL} />
              </Felt>
            </div>

            {/* Disiplin-fordeling (glidere) */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <Etikett hjelp="pyramideAkse">Disiplin-fordeling</Etikett>
                <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: fordelingSum === 100 ? T.up : T.down, fontVariantNumeric: "tabular-nums" }}>
                  {fordelingSum}%
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                {PYR_ALLE.map((p) => (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span aria-hidden style={{ width: 7, height: 7, borderRadius: 3, background: T.ax[p], flex: "none" }} />
                    <span style={{ width: 56, flex: "none", fontFamily: T.ui, fontSize: 11, fontWeight: 600, color: T.fg2 }}>{AKSE_NAVN[p]}</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(fordeling[p] * 100)}
                      onChange={(e) =>
                        setFordeling({ ...fordeling, [p]: parseInt(e.target.value, 10) / 100 })
                      }
                      aria-label={`Andel ${AKSE_NAVN[p]}`}
                      style={{ flex: 1, accentColor: T.ax[p], minWidth: 0 }}
                    />
                    <span style={{ width: 36, flex: "none", textAlign: "right", fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>
                      {Math.round(fordeling[p] * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Volum-sammendrag (beregnTemplateVolum — samme tekster/terskler som volum-linje) */}
            <div style={{ borderRadius: T.rRow, border: `1px solid ${T.border}`, background: T.panel2, padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <Caps size={9}>Volum</Caps>
                <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.fg, fontVariantNumeric: "tabular-nums" }}>{volum.timerLabel}</span>
              </div>
              {sessions.length > 0 && (
                <div style={{ marginTop: 7, display: "flex", flexWrap: "wrap", gap: "3px 12px" }}>
                  {PYR_ALLE.map((p) => (
                    <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, color: T.mut }}>
                      <span aria-hidden style={{ width: 6, height: 6, borderRadius: 9999, background: T.ax[p] }} />
                      {AKSE_NAVN[p]} {volum.realisertProsent[p]}%
                    </span>
                  ))}
                </div>
              )}
              {fordelingSum !== 100 && (
                <p style={{ margin: "7px 0 0", fontFamily: T.ui, fontSize: 10.5, color: T.down, lineHeight: 1.5 }}>
                  Fordelingen summerer til {fordelingSum} % — må være 100 %.
                </p>
              )}
              {volum.storsteAvvik && volum.storsteAvvik.diffPp > AVVIK_TERSKEL_PP && (
                <p style={{ margin: "5px 0 0", fontFamily: T.ui, fontSize: 10.5, color: T.down, lineHeight: 1.5 }}>
                  Øktene gir {AKSE_NAVN[volum.storsteAvvik.omrade]} {volum.realisertProsent[volum.storsteAvvik.omrade]} % —
                  glideren sier {Math.round(fordeling[volum.storsteAvvik.omrade] * 100)} %.
                </p>
              )}
            </div>

            {/* Godkjent-avkryssing (v2-idiom) */}
            <div
              onClick={() => setApproved(!approved)}
              role="checkbox"
              aria-checked={approved}
              tabIndex={0}
              className="v2-focus"
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  setApproved(!approved);
                }
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", width: "fit-content" }}
            >
              <span style={{ width: 18, height: 18, borderRadius: 6, background: approved ? T.lime : T.panel2, border: `1px solid ${approved ? "transparent" : T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                {approved && <Icon name="check" size={12} style={{ color: T.onLime }} />}
              </span>
              <span style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg }}>Godkjent (tilgjengelig for AI)</span>
            </div>
          </div>
        </Kort>
        </div>
      </div>

      {/* Sticky lagre-bar (samme mønster som AdminDrillRedigerV2) */}
      <div style={{ position: "sticky", bottom: 0, zIndex: 20, background: `color-mix(in srgb, ${T.bg} 95%, transparent)`, backdropFilter: "blur(6px)", borderTop: `1px solid ${T.border}`, padding: "10px 0", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
        {lagreMelding && (
          <span
            role={lagreMelding.type === "feil" ? "alert" : "status"}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.ui, fontSize: 12, fontWeight: 600, color: lagreMelding.type === "feil" ? T.down : T.up, textAlign: "right", lineHeight: 1.4 }}
          >
            <Icon name={lagreMelding.type === "feil" ? "alert-triangle" : "check"} size={13} style={{ flex: "none" }} />
            {lagreMelding.tekst}
          </span>
        )}
        <Knapp icon="check" disabled={isPending} onClick={onSaveSettings}>
          {isPending ? "Lagrer…" : "Lagre innstillinger"}
        </Knapp>
      </div>

      {modal.kind !== "closed" && (
        <OktRedigerDialog
          state={modal}
          drillOptions={drillOptions}
          maxUke={varighetUker}
          isPending={isPending}
          serverFeil={oktFeil}
          onClose={() => {
            setModal({ kind: "closed" });
            setOktFeil(null);
          }}
          onSave={(input, sessionId) => {
            setOktFeil(null);
            startTransition(async () => {
              const res = sessionId
                ? await updateTemplateSession(sessionId, input)
                : await addTemplateSession(template.id, input);
              if (res.ok) {
                setModal({ kind: "closed" });
                router.refresh();
              } else {
                setOktFeil(res.error);
              }
            });
          }}
          onDelete={
            modal.kind === "edit"
              ? () => {
                  const sid = modal.session.id;
                  setModal({ kind: "closed" });
                  setOktFeil(null);
                  aapneUkeDialog({ kind: "slett-okt", sessionId: sid });
                }
              : undefined
          }
        />
      )}

      {ukeDialog.kind === "varighet" && (
        <VarighetUkeDialog
          ukeNr={ukeDialog.ukeNr}
          isPending={isPending}
          feil={dialogFeil}
          onClose={lukkUkeDialog}
          onLagre={(min) => onSetWeekDurationBekreftet(ukeDialog.ukeNr, min)}
        />
      )}

      {ukeDialog.kind === "kopier" && (
        <KopierUkeDialog
          fraUke={ukeDialog.fraUke}
          maxUke={varighetUker}
          konflikt={ukeDialog.konflikt}
          isPending={isPending}
          feil={dialogFeil}
          onClose={lukkUkeDialog}
          onKopier={(tilUke, overskriv) => onCopyWeekUtfor(ukeDialog.fraUke, tilUke, overskriv)}
        />
      )}

      {ukeDialog.kind === "slett-okt" && (
        <BekreftSlettOktDialog
          isPending={isPending}
          feil={dialogFeil}
          onClose={lukkUkeDialog}
          onBekreft={() => onDeleteSessionBekreftet(ukeDialog.sessionId)}
        />
      )}
    </div>
  );
}

/* ── Uke-dialoger (erstatter prompt()/confirm()-flytene) ── */

function VarighetUkeDialog({
  ukeNr,
  isPending,
  feil,
  onClose,
  onLagre,
}: {
  ukeNr: number;
  isPending: boolean;
  feil: string | null;
  onClose: () => void;
  onLagre: (varighetMin: number) => void;
}) {
  const [minutter, setMinutter] = useState("");
  const parsed = parseInt(minutter, 10);
  const gyldig = Number.isFinite(parsed);
  return (
    <ModalSkall eyebrow={`Uke ${ukeNr}`} tittel="Sett varighet for hele uka" onClose={onClose}>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <Inndata
          label="Ny varighet (minutter)"
          type="number"
          mono
          suffix="min"
          placeholder="60"
          value={minutter}
          onChange={setMinutter}
        />
        <p style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, margin: 0, lineHeight: 1.55 }}>
          Gjelder alle økter i uke {ukeNr}. Mellom 5 og 480 minutter.
        </p>
        {feil && <FeilBoks>{feil}</FeilBoks>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Knapp ghost disabled={isPending} onClick={onClose}>
            Avbryt
          </Knapp>
          <Knapp icon="check" disabled={isPending || !gyldig} onClick={() => onLagre(parsed)}>
            {isPending ? "Lagrer…" : "Lagre"}
          </Knapp>
        </div>
      </div>
    </ModalSkall>
  );
}

function KopierUkeDialog({
  fraUke,
  maxUke,
  konflikt,
  isPending,
  feil,
  onClose,
  onKopier,
}: {
  fraUke: number;
  maxUke: number;
  konflikt: { tilUke: number; antallIMaal: number } | null;
  isPending: boolean;
  feil: string | null;
  onClose: () => void;
  onKopier: (tilUke: number, overskriv: boolean) => void;
}) {
  const ukeValg = useMemo(
    () =>
      Array.from({ length: maxUke }, (_, i) => i + 1)
        .filter((u) => u !== fraUke)
        .map((u) => ({ value: u.toString(), label: `Uke ${u}` })),
    [maxUke, fraUke],
  );
  const [tilUke, setTilUke] = useState<string>(ukeValg[0]?.value ?? "");
  const parsed = parseInt(tilUke, 10);
  return (
    <ModalSkall eyebrow={`Uke ${fraUke}`} tittel="Kopier uka til …" onClose={onClose}>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        {konflikt ? (
          <>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, margin: 0, lineHeight: 1.55 }}>
              Uke {konflikt.tilUke} har {konflikt.antallIMaal} økter fra før. Erstatte dem?
            </p>
            {feil && <FeilBoks>{feil}</FeilBoks>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Knapp ghost disabled={isPending} onClick={onClose}>
                Avbryt
              </Knapp>
              <Knapp ghost icon="copy" disabled={isPending} onClick={() => onKopier(konflikt.tilUke, true)} style={KNAPP_FARE_STIL}>
                {isPending ? "Kopierer…" : "Overskriv"}
              </Knapp>
            </div>
          </>
        ) : (
          <>
            {ukeValg.length > 0 ? (
              <Velger label="Kopier til uke" options={ukeValg} value={tilUke} onChange={setTilUke} />
            ) : (
              <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0, lineHeight: 1.55 }}>
                Malen har ingen andre uker å kopiere til.
              </p>
            )}
            {feil && <FeilBoks>{feil}</FeilBoks>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Knapp ghost disabled={isPending} onClick={onClose}>
                Avbryt
              </Knapp>
              <Knapp icon="copy" disabled={isPending || !Number.isFinite(parsed)} onClick={() => onKopier(parsed, false)}>
                {isPending ? "Kopierer…" : "Lagre"}
              </Knapp>
            </div>
          </>
        )}
      </div>
    </ModalSkall>
  );
}

function BekreftSlettOktDialog({
  isPending,
  feil,
  onClose,
  onBekreft,
}: {
  isPending: boolean;
  feil: string | null;
  onClose: () => void;
  onBekreft: () => void;
}) {
  return (
    <ModalSkall eyebrow="Bekreft" tittel="Slette denne økten?" onClose={onClose}>
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.fg2, margin: 0, lineHeight: 1.55 }}>
          Økten fjernes fra malen. Dette kan ikke angres.
        </p>
        {feil && <FeilBoks>{feil}</FeilBoks>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Knapp ghost disabled={isPending} onClick={onClose}>
            Avbryt
          </Knapp>
          <Knapp ghost icon="trash-2" disabled={isPending} onClick={onBekreft} style={KNAPP_FARE_STIL}>
            {isPending ? "Sletter…" : "Slett økt"}
          </Knapp>
        </div>
      </div>
    </ModalSkall>
  );
}

/* ── Økt-dialog (opprett/rediger) ─────────────────────── */

function OktRedigerDialog({
  state,
  drillOptions,
  maxUke,
  isPending,
  serverFeil,
  onClose,
  onSave,
  onDelete,
}: {
  state: ModalState;
  drillOptions: RedigerDrillValg[];
  maxUke: number;
  isPending: boolean;
  serverFeil: string | null;
  onClose: () => void;
  onSave: (input: SessionInput, sessionId?: string) => void;
  onDelete?: () => void;
}) {
  const initial: RedigerOkt =
    state.kind === "edit"
      ? state.session
      : {
          id: "",
          ukeNr: state.kind === "create" ? state.ukeNr : 1,
          dagNr: state.kind === "create" ? state.dagNr : 1,
          title: "",
          varighetMin: 60,
          pyramidArea: "TEK",
          skillArea: null,
          environment: "RANGE",
          drills: [],
          focus: null,
          notes: null,
        };

  const [title, setTitle] = useState(initial.title);
  const [varighetMin, setVarighetMin] = useState(initial.varighetMin);
  const [pyramidArea, setPyramidArea] = useState<PyramidArea>(initial.pyramidArea);
  const [skillArea, setSkillArea] = useState<SkillArea | "">(initial.skillArea ?? "");
  const [environment, setEnvironment] = useState<SessionEnvironment>(initial.environment);
  const [ukeNr, setUkeNr] = useState(initial.ukeNr);
  const [dagNr, setDagNr] = useState(initial.dagNr);
  const [focus, setFocus] = useState(initial.focus ?? "");
  const [notes, setNotes] = useState(initial.notes ?? "");
  const [drills, setDrills] = useState<DrillEntry[]>(initial.drills);
  const [drillSok, setDrillSok] = useState("");
  const [lokalFeil, setLokalFeil] = useState<string | null>(null); // klientvalidering (før: alert())

  const filtererteDrills = useMemo(() => {
    if (!drillSok.trim()) return drillOptions;
    const q = drillSok.toLowerCase();
    return drillOptions.filter((d) => d.name.toLowerCase().includes(q));
  }, [drillSok, drillOptions]);

  const navnPerId = useMemo(
    () => new Map(drillOptions.map((d) => [d.id, d.name])),
    [drillOptions],
  );

  function addDrill(exerciseId: string) {
    if (drills.some((d) => d.exerciseId === exerciseId)) return;
    setDrills([...drills, { exerciseId, sets: 3, reps: 10 }]);
  }

  function removeDrill(idx: number) {
    setDrills(drills.filter((_, i) => i !== idx));
  }

  function updateDrill(idx: number, patch: Partial<DrillEntry>) {
    setDrills(drills.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  }

  function submit() {
    if (!title.trim()) {
      setLokalFeil("Tittel er påkrevd.");
      return;
    }
    setLokalFeil(null);
    const input: SessionInput = {
      ukeNr,
      dagNr,
      title: title.trim(),
      varighetMin,
      pyramidArea,
      skillArea: skillArea || null,
      environment,
      drillsJson: drills,
      focus: focus.trim() || null,
      notes: notes.trim() || null,
    };
    onSave(input, state.kind === "edit" ? state.session.id : undefined);
  }

  const gridTo: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={state.kind === "edit" ? "Rediger økt" : "Ny økt"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ position: "fixed", inset: 0, zIndex: 50, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.55)", padding: 16 }}
    >
      <div
        className="v2-sheet-in"
        style={{ width: "100%", maxWidth: 640, maxHeight: "92vh", overflowY: "auto", borderRadius: T.rCard, background: T.panel, border: `1px solid ${T.borderS}`, padding: 22, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0, fontFamily: T.disp, fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: T.fg }}>
            {state.kind === "edit" ? "Rediger økt" : "Ny økt"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Lukk"
            className="v2-press v2-focus"
            style={{ appearance: "none", cursor: "pointer", width: 28, height: 28, borderRadius: 8, background: T.panel2, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none", color: T.fg2 }}
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        <div style={gridTo}>
          <Felt label="Uke">
            <input type="number" min={1} max={maxUke} value={ukeNr} onChange={(e) => setUkeNr(parseInt(e.target.value || "0", 10))} style={FELT_STIL} />
          </Felt>
          <Felt label="Dag">
            <select value={dagNr.toString()} onChange={(e) => setDagNr(parseInt(e.target.value, 10))} style={FELT_STIL}>
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <option key={d} value={d.toString()}>{DAG_LABEL[d - 1]}</option>
              ))}
            </select>
          </Felt>
        </div>

        <div style={{ marginTop: 10 }}>
          <Felt label="Tittel">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={FELT_STIL} />
          </Felt>
        </div>

        <div style={gridTo}>
          <Felt label="Varighet (min)">
            <input type="number" min={5} max={480} value={varighetMin} onChange={(e) => setVarighetMin(parseInt(e.target.value || "0", 10))} style={FELT_STIL} />
          </Felt>
          <Felt label="Pyramide-område" hjelp="pyramideAkse">
            <select value={pyramidArea} onChange={(e) => setPyramidArea(e.target.value as PyramidArea)} style={FELT_STIL}>
              {PYR_ALLE.map((p) => (
                <option key={p} value={p}>{AKSE_NAVN[p]}</option>
              ))}
            </select>
          </Felt>
        </div>

        <div style={gridTo}>
          <Felt label="Ferdighetsområde" hjelp="skillArea">
            <select value={skillArea} onChange={(e) => setSkillArea(e.target.value as SkillArea | "")} style={FELT_STIL}>
              <option value="">—</option>
              {SKILL_ALLE.map((s) => (
                <option key={s} value={s}>{SKILL_LABEL[s]}</option>
              ))}
            </select>
          </Felt>
          <Felt label="Miljø" hjelp="miljo">
            <select value={environment} onChange={(e) => setEnvironment(e.target.value as SessionEnvironment)} style={FELT_STIL}>
              {ENV_ALLE.map((env) => (
                <option key={env} value={env}>{ENV_LABEL[env]}</option>
              ))}
            </select>
          </Felt>
        </div>

        <div style={{ marginTop: 10 }}>
          <Felt label="Fokus">
            <input type="text" value={focus} onChange={(e) => setFocus(e.target.value)} style={FELT_STIL} />
          </Felt>
        </div>
        <div style={{ marginTop: 10 }}>
          <Felt label="Notater">
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ ...FELT_STIL, resize: "vertical", lineHeight: 1.5 }} />
          </Felt>
        </div>

        {/* Drills */}
        <div style={{ marginTop: 18 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Caps>Drills ({drills.length})</Caps>
            <HjelpTips k="csNivaa" size={11} />
          </span>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {drills.map((d, i) => (
              <div key={`${d.exerciseId}-${i}`} style={{ borderRadius: T.rRow, border: `1px solid ${T.border}`, background: T.panel2, padding: "9px 11px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ minWidth: 0, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {navnPerId.get(d.exerciseId) ?? d.exerciseId}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeDrill(i)}
                    aria-label="Fjern drill"
                    className="v2-press v2-focus"
                    style={{ appearance: "none", cursor: "pointer", width: 26, height: 26, borderRadius: 8, border: 0, background: "transparent", color: T.down, display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "none" }}
                  >
                    <Icon name="trash-2" size={13} />
                  </button>
                </div>
                <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                  <input
                    type="number"
                    placeholder="Sett"
                    aria-label="Sett"
                    value={d.sets ?? ""}
                    onChange={(e) =>
                      updateDrill(i, { sets: e.target.value ? parseInt(e.target.value, 10) : undefined })
                    }
                    style={{ ...FELT_STIL, marginTop: 0, padding: "7px 10px", fontSize: 12, fontFamily: T.mono, fontVariantNumeric: "tabular-nums" }}
                  />
                  <input
                    type="number"
                    placeholder="Reps"
                    aria-label="Reps"
                    value={d.reps ?? ""}
                    onChange={(e) =>
                      updateDrill(i, { reps: e.target.value ? parseInt(e.target.value, 10) : undefined })
                    }
                    style={{ ...FELT_STIL, marginTop: 0, padding: "7px 10px", fontSize: 12, fontFamily: T.mono, fontVariantNumeric: "tabular-nums" }}
                  />
                  <input
                    type="number"
                    placeholder="CS-mål"
                    aria-label="CS-mål"
                    value={d.csTarget ?? ""}
                    onChange={(e) =>
                      updateDrill(i, { csTarget: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                    style={{ ...FELT_STIL, marginTop: 0, padding: "7px 10px", fontSize: 12, fontFamily: T.mono, fontVariantNumeric: "tabular-nums" }}
                  />
                </div>
              </div>
            ))}
            {drills.length === 0 && (
              <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, margin: 0 }}>Ingen drills lagt til ennå.</p>
            )}
          </div>

          {/* Drill-velger */}
          <div style={{ marginTop: 10, borderRadius: T.rRow, border: `1px solid ${T.border}`, background: T.panel2, padding: 10 }}>
            <div style={{ position: "relative" }}>
              <Icon
                name="search"
                size={13}
                style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.mut, pointerEvents: "none" }}
              />
              <input
                type="text"
                value={drillSok}
                onChange={(e) => setDrillSok(e.target.value)}
                placeholder="Søk drill å legge til"
                aria-label="Søk drill å legge til"
                style={{ ...FELT_STIL, marginTop: 0, paddingLeft: 30, background: T.panel3 }}
              />
            </div>
            <div style={{ marginTop: 8, maxHeight: 160, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
              {filtererteDrills.slice(0, 30).map((d) => {
                const valgt = drills.some((dr) => dr.exerciseId === d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => addDrill(d.id)}
                    disabled={valgt}
                    className="v2-row-h v2-focus"
                    style={{ appearance: "none", cursor: valgt ? "default" : "pointer", display: "flex", width: "100%", alignItems: "center", gap: 8, borderRadius: 8, border: 0, background: "transparent", padding: "6px 8px", textAlign: "left", opacity: valgt ? 0.5 : 1 }}
                  >
                    <span aria-hidden style={{ width: 6, height: 6, borderRadius: 9999, background: T.ax[d.pyramidArea], flex: "none" }} />
                    <span style={{ flex: 1, minWidth: 0, fontFamily: T.ui, fontSize: 11.5, color: T.fg, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</span>
                    {valgt && <Icon name="check" size={12} style={{ color: T.lime, flex: "none" }} />}
                  </button>
                );
              })}
              {filtererteDrills.length === 0 && (
                <p style={{ fontFamily: T.ui, fontSize: 11, color: T.mut, margin: "2px 0 0" }}>Ingen drills matcher søket.</p>
              )}
            </div>
          </div>
        </div>

        {(lokalFeil ?? serverFeil) && (
          <div style={{ marginTop: 14 }}>
            <FeilBoks>{lokalFeil ?? serverFeil}</FeilBoks>
          </div>
        )}

        <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          {onDelete ? (
            <Knapp
              ghost
              icon="trash-2"
              disabled={isPending}
              onClick={onDelete}
              style={KNAPP_FARE_STIL}
            >
              Slett økt
            </Knapp>
          ) : (
            <span />
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Knapp ghost disabled={isPending} onClick={onClose}>
              Avbryt
            </Knapp>
            <Knapp icon="check" disabled={isPending} onClick={submit}>
              {state.kind === "edit" ? "Lagre endring" : "Opprett økt"}
            </Knapp>
          </div>
        </div>
      </div>
    </div>
  );
}
