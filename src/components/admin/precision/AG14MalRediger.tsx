"use client";

/**
 * Planmal-editor (/admin/plan-templates/[id]/rediger) i Precision Athletics,
 * under Plan-hub (AG-14).
 *
 * Bare utseendet er byttet. Handlingene og rekkefølgen er de samme som i
 * AdminPlanMalRedigerV2: updateTemplate (innstillinger), addTemplateSession /
 * updateTemplateSession / deleteTemplateSession (økter), setWeekDuration
 * (varighet for hele uka) og copyTemplateWeek (kopier uke, med spørsmål om
 * overskriving ved konflikt). Volum-linja regnes av beregnTemplateVolum.
 *
 * Endret: økt-rutenettet brytes per uke i stedet for 640 px med sidelengs
 * rulling. CS-mål på øvelsene vises ikke (CS-skalaen er utgått), men en
 * lagret verdi beholdes når økta lagres.
 */
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Clock, Copy, Plus, Trash2 } from "lucide-react";
import { AkseMerke, Knapp, KnappLenke, Meta, StatusPille } from "@/components/precision/pa";
import { SideHode } from "@/components/precision/pa-a4";
import { IkonKnapp, Sokefelt } from "@/components/precision/pa-a2";
import { Ark, Avkrysning, Dialog, Etikett, Felt, Inndata, Liste, Listerad, Nedtrekk, Seksjon, Tekstboks, Varsel } from "@/components/precision/pa-planhub";
import type { LPhase, NgfKategori, PyramidArea, SessionEnvironment, SkillArea } from "@/generated/prisma/enums";
import { addTemplateSession, copyTemplateWeek, deleteTemplateSession, setWeekDuration, updateTemplate, updateTemplateSession, type SessionInput, type TemplateUpdateInput } from "@/app/admin/(legacy)/plan-templates/actions";
import { DAG_LABEL, ENV_LABEL, SKILL_LABEL, type DisciplinFordeling, type DrillEntry } from "@/components/admin/plan-templates/shared";
import { beregnTemplateVolum } from "@/lib/plan-templates/beregn-volum";
import { formaterTall } from "@/lib/format-tall";
import { FordelingGlidere, MalMetadata, PYR_ALLE, UkeRutenett, akseAv, fordelingSum, type MalMetadataVerdier } from "./AG14MalFelles";

export type RedigerDrillValg = { id: string; name: string; pyramidArea: PyramidArea; skillArea: SkillArea | null };

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

const SKILL_ALLE: SkillArea[] = ["TEE_TOTAL", "TILNAERMING", "AROUND_GREEN", "PUTTING", "SPILL"];
const ENV_ALLE: SessionEnvironment[] = ["RANGE", "BANE", "STUDIO", "HJEM", "SIMULATOR", "GYM"];
// Varsel-terskel for sprik mellom glider-% og reell % (uendret).
const AVVIK_TERSKEL_PP = 10;

type ModalState = { kind: "closed" } | { kind: "create"; ukeNr: number; dagNr: number } | { kind: "edit"; session: RedigerOkt };
type UkeDialogState =
  | { kind: "ingen" }
  | { kind: "varighet"; ukeNr: number }
  | { kind: "kopier"; fraUke: number; konflikt: { tilUke: number; antallIMaal: number } | null }
  | { kind: "slett-okt"; sessionId: string };
type LagreMelding = { type: "ok" | "feil"; tekst: string };

const filtrer = (l: RedigerDrillValg[], q: string) => (q.trim() ? l.filter((d) => d.name.toLowerCase().includes(q.toLowerCase())) : l);

export function AG14MalRediger({ template, drillOptions }: { template: RedigerMal; drillOptions: RedigerDrillValg[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [meta, setMeta] = useState<MalMetadataVerdier>({
    name: template.name,
    description: template.description ?? "",
    kategori: template.kategori,
    lPhase: template.lPhase,
    varighetUker: template.varighetUker,
    ukentligOktAntall: template.ukentligOktAntall,
    minAlder: template.minAlder?.toString() ?? "",
    maxAlder: template.maxAlder?.toString() ?? "",
  });
  const [fordeling, setFordeling] = useState<DisciplinFordeling>(template.fordeling);
  const [approved, setApproved] = useState(template.approved);

  const [modal, setModal] = useState<ModalState>({ kind: "closed" });
  const [oktFeil, setOktFeil] = useState<string | null>(null);
  const [ukeDialog, setUkeDialog] = useState<UkeDialogState>({ kind: "ingen" });
  const [dialogFeil, setDialogFeil] = useState<string | null>(null);
  const [lagreMelding, setLagreMelding] = useState<LagreMelding | null>(null);
  const [drillSok, setDrillSok] = useState("");

  const sum = fordelingSum(fordeling);
  const sessions = template.sessions;
  const varighetUker = meta.varighetUker;
  const volum = useMemo(() => beregnTemplateVolum(sessions, varighetUker, fordeling), [sessions, varighetUker, fordeling]);
  const filtrerteDrills = useMemo(() => filtrer(drillOptions, drillSok), [drillSok, drillOptions]);

  function onSaveSettings() {
    if (sum !== 100) {
      setLagreMelding({ type: "feil", tekst: `Fordelingen må summere til 100 % (er nå ${sum} %).` });
      return;
    }
    const input: TemplateUpdateInput = {
      name: meta.name,
      description: meta.description || null,
      kategori: meta.kategori,
      lPhase: meta.lPhase,
      varighetUker: meta.varighetUker,
      ukentligOktAntall: meta.ukentligOktAntall,
      disciplinFordeling: fordeling,
      minAlder: meta.minAlder ? parseInt(meta.minAlder, 10) : null,
      maxAlder: meta.maxAlder ? parseInt(meta.maxAlder, 10) : null,
      approved,
    };
    setLagreMelding(null);
    startTransition(async () => {
      const res = await updateTemplate(template.id, input);
      if (res.ok) { router.refresh(); setLagreMelding({ type: "ok", tekst: "Lagret." }); }
      else setLagreMelding({ type: "feil", tekst: `Kunne ikke lagre: ${res.error}` });
    });
  }

  const aapneUkeDialog = (s: UkeDialogState) => { setDialogFeil(null); setUkeDialog(s); };
  const lukkUkeDialog = () => { setDialogFeil(null); setUkeDialog({ kind: "ingen" }); };

  function slettBekreftet(sessionId: string) {
    startTransition(async () => {
      const res = await deleteTemplateSession(sessionId);
      if (res.ok) { lukkUkeDialog(); router.refresh(); } else setDialogFeil(res.error);
    });
  }

  function settUkevarighet(ukeNr: number, varighetMin: number) {
    startTransition(async () => {
      const res = await setWeekDuration(template.id, ukeNr, varighetMin);
      if (res.ok) { lukkUkeDialog(); router.refresh(); } else setDialogFeil(res.error);
    });
  }

  // Samme rekkefølge som før: feil → vises; konflikt → «Overskriv»-spørsmål → nytt kall med overskriv=true.
  function kopierUke(fraUke: number, tilUke: number, overskriv: boolean) {
    if (!Number.isFinite(tilUke) || tilUke < 1 || tilUke > varighetUker) { setDialogFeil("Ugyldig uke."); return; }
    startTransition(async () => {
      const res = await copyTemplateWeek(template.id, fraUke, tilUke, overskriv);
      if (!res.ok) { setDialogFeil(res.error); return; }
      if (res.data.status === "konflikt") {
        setDialogFeil(null);
        setUkeDialog({ kind: "kopier", fraUke, konflikt: { tilUke, antallIMaal: res.data.antallIMaal } });
        return;
      }
      lukkUkeDialog();
      router.refresh();
    });
  }

  const planlagte = varighetUker * meta.ukentligOktAntall;

  return <div className="pa-side">
    <div><KnappLenke href={`/admin/plan-templates/${template.id}`} variant="ghost" icon={ArrowLeft} iconName="arrow-left">Mal-detalj</KnappLenke></div>
    <SideHode kicker="Planmal · rediger" title={template.name}
      sub="Innstillingene lagres med «Lagre innstillinger». En økt lagres når du lagrer den i økt-arket." />
    <div className="a10-knapperad">
      <StatusPille tone={isPending ? "warn" : "neutral"}>{isPending ? "Lagrer …" : `${drillOptions.length} øvelser i banken`}</StatusPille>
    </div>

    <div className="a10-to">
      <Seksjon tittel="Økter uke for uke" meta={`${sessions.length} AV ${planlagte} PLANLAGTE`}>
        <UkeRutenett
          varighetUker={varighetUker}
          okter={sessions.map((s) => ({ ...s, drillAntall: s.drills.length }))}
          deaktivert={isPending}
          onVelg={(id) => { const s = sessions.find((x) => x.id === id); if (s) setModal({ kind: "edit", session: s }); }}
          onNy={(uke, dag) => setModal({ kind: "create", ukeNr: uke, dagNr: dag })}
          ukeMeta={(uke) => { const min = volum.minPerUke[uke - 1] ?? 0; return min > 0 ? <Meta>{formaterTall(min / 60, 1, true)} T</Meta> : null; }}
          ukeHandlinger={(uke) => <span className="a10-knapperad" style={{ gap: 4 }}>
            <IkonKnapp icon={Clock} name="clock" aria-label={`Sett varighet for hele uke ${uke}`} title="Sett varighet for hele uka" disabled={isPending} onClick={() => aapneUkeDialog({ kind: "varighet", ukeNr: uke })} />
            <IkonKnapp icon={Copy} name="copy" aria-label={`Kopier uke ${uke} til …`} title="Kopier uka til …" disabled={isPending} onClick={() => aapneUkeDialog({ kind: "kopier", fraUke: uke, konflikt: null })} />
          </span>}
        />
      </Seksjon>

      <div className="a10-stabel">
        <Seksjon tittel="Innstillinger">
          <MalMetadata v={meta} onEndre={(p) => setMeta((x) => ({ ...x, ...p }))} />
          <div className="a10-stabel a10-stabel--tett">
            <div className="a10-seksjon__hode"><span className="kicker">Fordeling</span><StatusPille tone={sum === 100 ? "ok" : "warn"}>{sum} %</StatusPille></div>
            <FordelingGlidere fordeling={fordeling} onEndre={setFordeling} />
          </div>
          <div className="pa-card pa-card--sunken a10-seksjon" style={{ gap: 8 }}>
            <div className="a10-seksjon__hode"><span className="kicker">Volum</span><Meta>{volum.timerLabel}</Meta></div>
            {sessions.length > 0 && <div className="a10-aksenokler">{PYR_ALLE.map((p) => <span key={p} className="a10-aksenokkel"><AkseMerke axis={akseAv(p)} size="sm" /><Meta>{volum.realisertProsent[p]} %</Meta></span>)}</div>}
            {sum !== 100 && <Meta>FORDELINGEN SUMMERER TIL {sum} % · MÅ VÆRE 100 %</Meta>}
            {volum.storsteAvvik && volum.storsteAvvik.diffPp > AVVIK_TERSKEL_PP && <Meta>
              ØKTENE GIR {volum.storsteAvvik.omrade} {volum.realisertProsent[volum.storsteAvvik.omrade]} % · GLIDEREN SIER {Math.round(fordeling[volum.storsteAvvik.omrade] * 100)} %
            </Meta>}
          </div>
          <Avkrysning checked={approved} onChange={setApproved} label="Godkjent (tilgjengelig for AI)" />
        </Seksjon>

        <Seksjon tittel={`Øvelsesbank (${drillOptions.length})`}>
          <div className="a10-knapperad"><Sokefelt value={drillSok} onChange={setDrillSok} placeholder="Søk øvelse" label="Søk øvelse" /></div>
          <Meta>OPPSLAG. ØVELSER LEGGES TIL I ØKT-ARKET</Meta>
          {filtrerteDrills.length === 0
            ? <Meta>{drillOptions.length === 0 ? "INGEN ØVELSER I BANKEN" : "INGEN ØVELSER MATCHER SØKET"}</Meta>
            : <Liste label="Øvelsesbank">
              {filtrerteDrills.slice(0, 50).map((d) => <Listerad key={d.id} mal="auto minmax(0,1fr)" min={40}>
                <AkseMerke axis={akseAv(d.pyramidArea)} size="sm" /><Etikett a={d.name} />
              </Listerad>)}
            </Liste>}
          {filtrerteDrills.length > 50 && <Meta>+{filtrerteDrills.length - 50} FLERE · AVGRENS SØKET</Meta>}
        </Seksjon>
      </div>
    </div>

    <div className="a10-lagrelinje">
      {lagreMelding && <span role={lagreMelding.type === "feil" ? "alert" : "status"} className="a10-ev__tekst" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
        {lagreMelding.type === "feil" ? "Ikke lagret · " : ""}{lagreMelding.tekst}
      </span>}
      <Knapp icon={Check} iconName="check" onClick={onSaveSettings} loading={isPending}>Lagre innstillinger</Knapp>
    </div>

    {modal.kind !== "closed" && <OktArk
      key={modal.kind === "edit" ? modal.session.id : `${modal.ukeNr}-${modal.dagNr}`}
      state={modal}
      drillOptions={drillOptions}
      maxUke={varighetUker}
      isPending={isPending}
      serverFeil={oktFeil}
      onClose={() => { setModal({ kind: "closed" }); setOktFeil(null); }}
      onSave={(input, sessionId) => {
        setOktFeil(null);
        startTransition(async () => {
          const res = sessionId ? await updateTemplateSession(sessionId, input) : await addTemplateSession(template.id, input);
          if (res.ok) { setModal({ kind: "closed" }); router.refresh(); } else setOktFeil(res.error);
        });
      }}
      onDelete={modal.kind === "edit" ? () => { const sid = modal.session.id; setModal({ kind: "closed" }); setOktFeil(null); aapneUkeDialog({ kind: "slett-okt", sessionId: sid }); } : undefined}
    />}

    {ukeDialog.kind === "varighet" && <VarighetDialog ukeNr={ukeDialog.ukeNr} isPending={isPending} feil={dialogFeil} onClose={lukkUkeDialog} onLagre={(m) => settUkevarighet(ukeDialog.ukeNr, m)} />}
    {ukeDialog.kind === "kopier" && <KopierDialog fraUke={ukeDialog.fraUke} maxUke={varighetUker} konflikt={ukeDialog.konflikt} isPending={isPending} feil={dialogFeil} onClose={lukkUkeDialog} onKopier={(til, over) => kopierUke(ukeDialog.fraUke, til, over)} />}
    <Dialog open={ukeDialog.kind === "slett-okt"} onClose={lukkUkeDialog} tittel="Slette denne økta?"
      footer={<>
        <Knapp variant="signal" icon={Trash2} iconName="trash-2" onClick={() => ukeDialog.kind === "slett-okt" && slettBekreftet(ukeDialog.sessionId)} loading={isPending} loadingText="Sletter …">Slett økt</Knapp>
        <Knapp variant="ghost" onClick={lukkUkeDialog} disabled={isPending}>Avbryt</Knapp>
      </>}>
      <p className="a10-ev__tekst" style={{ margin: 0 }}>Økta fjernes fra malen. Dette kan ikke angres.</p>
      {dialogFeil && <Varsel tone="warn">{dialogFeil}</Varsel>}
    </Dialog>
  </div>;
}

/* ---------- Uke-dialoger ---------- */

function VarighetDialog({ ukeNr, isPending, feil, onClose, onLagre }: { ukeNr: number; isPending: boolean; feil: string | null; onClose: () => void; onLagre: (min: number) => void }) {
  const [minutter, setMinutter] = useState("");
  const parsed = parseInt(minutter, 10);
  return <Dialog open onClose={onClose} tittel={`Sett varighet for hele uke ${ukeNr}`}
    footer={<>
      <Knapp icon={Check} iconName="check" disabled={!Number.isFinite(parsed)} loading={isPending} onClick={() => onLagre(parsed)}>Lagre</Knapp>
      <Knapp variant="ghost" onClick={onClose} disabled={isPending}>Avbryt</Knapp>
    </>}>
    <Felt label="Ny varighet (minutter)" hint={`Gjelder alle økter i uke ${ukeNr}. Mellom 5 og 480 minutter.`}>
      <Inndata mono type="number" inputMode="numeric" placeholder="60" value={minutter} onChange={(e) => setMinutter(e.target.value)} />
    </Felt>
    {feil && <Varsel tone="warn">{feil}</Varsel>}
  </Dialog>;
}

function KopierDialog({ fraUke, maxUke, konflikt, isPending, feil, onClose, onKopier }: {
  fraUke: number; maxUke: number; konflikt: { tilUke: number; antallIMaal: number } | null; isPending: boolean; feil: string | null;
  onClose: () => void; onKopier: (tilUke: number, overskriv: boolean) => void;
}) {
  const valg = useMemo(() => Array.from({ length: maxUke }, (_, i) => i + 1).filter((u) => u !== fraUke).map((u) => ({ value: String(u), label: `Uke ${u}` })), [maxUke, fraUke]);
  const [tilUke, setTilUke] = useState(valg[0]?.value ?? "");
  const parsed = parseInt(tilUke, 10);
  if (konflikt) return <Dialog open onClose={onClose} tittel={`Kopier uke ${fraUke}`}
    footer={<>
      <Knapp variant="signal" icon={Copy} iconName="copy" loading={isPending} loadingText="Kopierer …" onClick={() => onKopier(konflikt.tilUke, true)}>Overskriv</Knapp>
      <Knapp variant="ghost" onClick={onClose} disabled={isPending}>Avbryt</Knapp>
    </>}>
    <p className="a10-ev__tekst" style={{ margin: 0 }}>Uke {konflikt.tilUke} har {konflikt.antallIMaal} økter fra før. Erstatte dem?</p>
    {feil && <Varsel tone="warn">{feil}</Varsel>}
  </Dialog>;
  return <Dialog open onClose={onClose} tittel={`Kopier uke ${fraUke} til …`}
    footer={<>
      <Knapp icon={Copy} iconName="copy" disabled={!Number.isFinite(parsed)} loading={isPending} loadingText="Kopierer …" onClick={() => onKopier(parsed, false)}>Kopier</Knapp>
      <Knapp variant="ghost" onClick={onClose} disabled={isPending}>Avbryt</Knapp>
    </>}>
    {valg.length > 0
      ? <Felt label="Kopier til uke"><Nedtrekk value={tilUke} onChange={(e) => setTilUke(e.target.value)} options={valg} /></Felt>
      : <p className="a10-ev__tekst" style={{ margin: 0 }}>Malen har ingen andre uker å kopiere til.</p>}
    {feil && <Varsel tone="warn">{feil}</Varsel>}
  </Dialog>;
}

/* ---------- Økt-ark (opprett / rediger) ---------- */

function OktArk({ state, drillOptions, maxUke, isPending, serverFeil, onClose, onSave, onDelete }: {
  state: Exclude<ModalState, { kind: "closed" }>;
  drillOptions: RedigerDrillValg[];
  maxUke: number;
  isPending: boolean;
  serverFeil: string | null;
  onClose: () => void;
  onSave: (input: SessionInput, sessionId?: string) => void;
  onDelete?: () => void;
}) {
  const initial: RedigerOkt = state.kind === "edit" ? state.session : {
    id: "", ukeNr: state.ukeNr, dagNr: state.dagNr, title: "", varighetMin: 60, pyramidArea: "TEK", skillArea: null, environment: "RANGE", drills: [], focus: null, notes: null,
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
  const [lokalFeil, setLokalFeil] = useState<string | null>(null);

  const filtrerte = useMemo(() => filtrer(drillOptions, drillSok), [drillSok, drillOptions]);
  const navnPerId = useMemo(() => new Map(drillOptions.map((d) => [d.id, d.name])), [drillOptions]);

  const addDrill = (exerciseId: string) => { if (!drills.some((d) => d.exerciseId === exerciseId)) setDrills([...drills, { exerciseId, sets: 3, reps: 10 }]); };
  const removeDrill = (idx: number) => setDrills(drills.filter((_, i) => i !== idx));
  const updateDrill = (idx: number, patch: Partial<DrillEntry>) => setDrills(drills.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  const tall = (v: string) => (v ? parseInt(v, 10) : undefined);

  function submit() {
    if (!title.trim()) { setLokalFeil("Tittel er påkrevd."); return; }
    setLokalFeil(null);
    onSave({
      ukeNr, dagNr, title: title.trim(), varighetMin, pyramidArea, skillArea: skillArea || null, environment,
      drillsJson: drills, focus: focus.trim() || null, notes: notes.trim() || null,
    }, state.kind === "edit" ? state.session.id : undefined);
  }

  const erEdit = state.kind === "edit";
  return <Ark open onClose={onClose} kicker={`Uke ${ukeNr} · ${DAG_LABEL[dagNr - 1] ?? "—"}`} tittel={erEdit ? "Rediger økt" : "Ny økt"}
    footer={<>
      <Knapp fullWidth icon={Check} iconName="check" onClick={submit} loading={isPending}>{erEdit ? "Lagre endring" : "Opprett økt"}</Knapp>
      <Knapp fullWidth variant="ghost" onClick={onClose} disabled={isPending}>Avbryt</Knapp>
    </>}>
    {(lokalFeil ?? serverFeil) && <Varsel tone="warn" tittel="Økta er ikke lagret">{lokalFeil ?? serverFeil}</Varsel>}
    <div className="a10-felt2">
      <Felt label="Uke"><Inndata mono type="number" min={1} max={maxUke} value={ukeNr} onChange={(e) => setUkeNr(parseInt(e.target.value || "0", 10))} /></Felt>
      <Felt label="Dag"><Nedtrekk value={String(dagNr)} onChange={(e) => setDagNr(parseInt(e.target.value, 10))} options={[1, 2, 3, 4, 5, 6, 7].map((d) => ({ value: String(d), label: DAG_LABEL[d - 1]! }))} /></Felt>
    </div>
    <Felt label="Tittel" required><Inndata value={title} onChange={(e) => setTitle(e.target.value)} /></Felt>
    <div className="a10-felt2">
      <Felt label="Varighet (min)"><Inndata mono type="number" min={5} max={480} value={varighetMin} onChange={(e) => setVarighetMin(parseInt(e.target.value || "0", 10))} /></Felt>
      <Felt label="Pyramide"><Nedtrekk value={pyramidArea} onChange={(e) => setPyramidArea(e.target.value as PyramidArea)} options={PYR_ALLE.map((p) => ({ value: p, label: p }))} /></Felt>
      <Felt label="Ferdighetsområde" valgfritt><Nedtrekk value={skillArea} onChange={(e) => setSkillArea(e.target.value as SkillArea | "")} options={[{ value: "", label: "—" }, ...SKILL_ALLE.map((s) => ({ value: s, label: SKILL_LABEL[s] }))]} /></Felt>
      <Felt label="Miljø"><Nedtrekk value={environment} onChange={(e) => setEnvironment(e.target.value as SessionEnvironment)} options={ENV_ALLE.map((v) => ({ value: v, label: ENV_LABEL[v] }))} /></Felt>
    </div>
    <Felt label="Fokus" valgfritt><Inndata value={focus} onChange={(e) => setFocus(e.target.value)} /></Felt>
    <Felt label="Notater" valgfritt><Tekstboks rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ minHeight: 88 }} /></Felt>

    <div className="a10-stabel a10-stabel--tett">
      <span className="kicker">Øvelser ({drills.length})</span>
      {drills.length === 0 && <Meta>INGEN ØVELSER LAGT TIL ENNÅ</Meta>}
      {drills.map((d, i) => <div key={`${d.exerciseId}-${i}`} className="pa-card pa-card--sunken a10-seksjon" style={{ gap: 8, padding: 12 }}>
        <div className="a10-seksjon__hode" style={{ alignItems: "center" }}>
          <span className="a10-etikett__a" style={{ flex: "1 1 auto", minWidth: 0 }}>{navnPerId.get(d.exerciseId) ?? "Øvelse ikke funnet"}</span>
          <IkonKnapp icon={Trash2} name="trash-2" aria-label="Fjern øvelsen fra økta" onClick={() => removeDrill(i)} />
        </div>
        <div className="a10-felt2">
          <Felt label="Sett"><Inndata mono type="number" placeholder="—" value={d.sets ?? ""} onChange={(e) => updateDrill(i, { sets: tall(e.target.value) })} /></Felt>
          <Felt label="Reps"><Inndata mono type="number" placeholder="—" value={d.reps ?? ""} onChange={(e) => updateDrill(i, { reps: tall(e.target.value) })} /></Felt>
        </div>
      </div>)}
      <div className="a10-knapperad"><Sokefelt value={drillSok} onChange={setDrillSok} placeholder="Søk øvelse å legge til" label="Søk øvelse å legge til" /></div>
      {filtrerte.length === 0 ? <Meta>INGEN ØVELSER MATCHER SØKET</Meta> : <div className="a10-stabel a10-stabel--tett" style={{ gap: 4 }}>
        {filtrerte.slice(0, 30).map((d) => {
          const valgt = drills.some((x) => x.exerciseId === d.id);
          return <button key={d.id} type="button" className="a10-ev a10-ev--klikk" disabled={valgt} onClick={() => addDrill(d.id)} style={{ opacity: valgt ? 0.55 : 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <span aria-hidden className="a10-ev__stripe" style={{ background: `var(--axis-${akseAv(d.pyramidArea)})` }} />
            <span className="a10-etikett__a" style={{ flex: "1 1 auto", minWidth: 0 }}>{d.name}</span>
            {valgt ? <Meta>LAGT TIL</Meta> : <Plus size={16} aria-hidden />}
          </button>;
        })}
      </div>}
    </div>

    {onDelete && <div><Knapp variant="ghost" icon={Trash2} iconName="trash-2" onClick={onDelete} disabled={isPending}>Slett økt</Knapp></div>}
  </Ark>;
}
