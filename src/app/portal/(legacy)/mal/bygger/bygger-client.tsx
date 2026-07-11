"use client";

// 5-stegs wizard for AI-mal-bygger på `/portal/mal/bygger`.
//
// Steg:
//   1) Velg mål (TURNERING / SVAKHET / GENERELL / EGENDEFINERT)
//   2) Få mal-anbefaling (PlanTemplate matchet på kategori + lPhase)
//   3) AI tilpasser (loading + bullet-liste over hva AI vurderer)
//   4) Forhåndsvis (2-panels layout — plan-oversikt + ukentlig grid)
//   5) Sendt (bekreftelse + neste handling)

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Edit3,
  Layers,
  Loader2,
  Lock,
  Plus,
  Send,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Wand2,
} from "lucide-react";
import {
  anbefalMal,
  genererPlanForslag,
  lagrePlan,
  sendTilGodkjenning,
} from "./actions";
import type {
  AnbefalingerResultat,
  ByggerKontekst,
  ByggerMaltype,
  GenerertForslag,
  MalAnbefaling,
} from "@/lib/plan-builder";
import type {
  PlanForslag,
  PlanForslagOkt,
  OktDag,
} from "@/lib/ai-plan/schema";

type Step = 1 | 2 | 3 | 4 | 5;

const STEG_NAVN: Record<Step, string> = {
  1: "Velg mål",
  2: "Få mal-anbefaling",
  3: "AI tilpasser",
  4: "Forhåndsvis",
  5: "Send til godkjenning",
};

const DAG_NAVN: Record<OktDag, string> = {
  MAN: "Man",
  TIR: "Tir",
  ONS: "Ons",
  TOR: "Tor",
  FRE: "Fre",
  LOR: "Lør",
  SON: "Søn",
};

const DAGER_REKKEFOLGE: OktDag[] = [
  "MAN",
  "TIR",
  "ONS",
  "TOR",
  "FRE",
  "LOR",
  "SON",
];

export function MalByggerWizard({ kontekst }: { kontekst: ByggerKontekst }) {
  const [steg, setSteg] = useState<Step>(1);
  const [pending, startTransition] = useTransition();

  // Steg 1
  const [maltype, setMaltype] = useState<ByggerMaltype | null>(null);
  const [turneringId, setTurneringId] = useState<string | null>(null);
  const [egendefinertTekst, setEgendefinertTekst] = useState("");

  // Steg 2
  const [anbefalinger, setAnbefalinger] =
    useState<AnbefalingerResultat | null>(null);
  const [valgtTemplate, setValgtTemplate] = useState<MalAnbefaling | null>(
    null,
  );
  const [visAlternativer, setVisAlternativer] = useState(false);

  // Steg 3 + 4
  const [generert, setGenerert] = useState<GenerertForslag | null>(null);
  const [redigertForslag, setRedigertForslag] = useState<PlanForslag | null>(
    null,
  );
  const [genererFeil, setGenererFeil] = useState<string | null>(null);

  // Steg 5
  const [lagretPlanId, setLagretPlanId] = useState<string | null>(null);
  const [sendtTilGodkjenning, setSendtTilGodkjenning] = useState(false);

  const erGratis = kontekst.spiller.tier === "GRATIS";

  function nullstill() {
    setSteg(1);
    setMaltype(null);
    setTurneringId(null);
    setEgendefinertTekst("");
    setAnbefalinger(null);
    setValgtTemplate(null);
    setVisAlternativer(false);
    setGenerert(null);
    setRedigertForslag(null);
    setGenererFeil(null);
    setLagretPlanId(null);
    setSendtTilGodkjenning(false);
  }

  function gaaTilSteg2() {
    if (!maltype) return;
    startTransition(async () => {
      const res = await anbefalMal({ maltype, turneringId });
      setAnbefalinger(res);
      setValgtTemplate(res.anbefalt);
      setSteg(2);
    });
  }

  function gaaTilSteg3() {
    setSteg(3);
    if (!maltype) return;
    startTransition(async () => {
      try {
        const res = await genererPlanForslag({
          maltype,
          turneringId,
          egendefinertTekst,
          valgtTemplateId: valgtTemplate?.templateId ?? null,
        });
        setGenerert(res);
        setRedigertForslag(res.forslag);
        setGenererFeil(null);
        setSteg(4);
      } catch (err) {
        setGenererFeil(
          err instanceof Error ? err.message : "Ukjent feil ved AI-generering.",
        );
      }
    });
  }

  function lagre(status: "DRAFT" | "PENDING_COACH") {
    if (!generert || !redigertForslag) return;
    startTransition(async () => {
      try {
        const startDato = new Date().toISOString().slice(0, 10);
        const res = await lagrePlan({
          generationId: generert.generationId,
          forslag: redigertForslag,
          status,
          startDato,
        });
        setLagretPlanId(res.planId);
        if (status === "PENDING_COACH") {
          await sendTilGodkjenning(res.planId);
          setSendtTilGodkjenning(true);
        }
        setSteg(5);
      } catch (err) {
        setGenererFeil(
          err instanceof Error ? err.message : "Kunne ikke lagre plan.",
        );
      }
    });
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Topbar */}
      <nav className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-2 sm:gap-4 sm:px-8 sm:py-[18px]">
        <Link
          href="/portal/mal"
          className="inline-flex h-11 items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Tilbake
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-foreground">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
          </span>
          <span className="font-display text-[14px] font-semibold">
            AI{" "}
            <em className="font-display italic font-normal text-primary">
              mal-bygger
            </em>
          </span>
        </div>
        <button
          type="button"
          onClick={nullstill}
          className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border bg-transparent px-4 font-mono text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:border-muted-foreground hover:text-foreground"
        >
          Start på nytt
        </button>
      </nav>

      {/* Hero */}
      <section className="border-b border-border bg-card px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            AI-COACH · DRIVET AV CLAUDE HAIKU 4.5
          </div>
          <h1 className="mt-2 font-display text-[36px] font-semibold leading-[1.05] -tracking-[0.02em] sm:text-[48px]">
            AI-
            <em className="font-display italic font-normal text-primary">
              mal-bygger
            </em>
          </h1>
          <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-muted-foreground">
            Vi bruker plan-templates kodifisert fra Anders&apos; coach-arbeid og
            tilpasser dem til din SG-data, mål og periodiseringsfase.
          </p>
        </div>
      </section>

      {/* Progress */}
      <ProgressBar steg={steg} />

      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8">
        {steg === 1 && (
          <Steg1VelgMal
            kontekst={kontekst}
            maltype={maltype}
            setMaltype={setMaltype}
            turneringId={turneringId}
            setTurneringId={setTurneringId}
            egendefinertTekst={egendefinertTekst}
            setEgendefinertTekst={setEgendefinertTekst}
            pending={pending}
            onNeste={gaaTilSteg2}
          />
        )}
        {steg === 2 && anbefalinger && (
          <Steg2Anbefaling
            anbefalinger={anbefalinger}
            valgtTemplate={valgtTemplate}
            setValgtTemplate={setValgtTemplate}
            visAlternativer={visAlternativer}
            setVisAlternativer={setVisAlternativer}
            pending={pending}
            onTilbake={() => setSteg(1)}
            onNeste={gaaTilSteg3}
          />
        )}
        {steg === 3 && (
          <Steg3AiTilpasser
            kontekst={kontekst}
            valgtTemplate={valgtTemplate}
            pending={pending}
            feil={genererFeil}
            onPrøvIgjen={gaaTilSteg3}
            onTilbake={() => setSteg(2)}
          />
        )}
        {steg === 4 && redigertForslag && (
          <Steg4Forhåndsvis
            forslag={redigertForslag}
            setForslag={setRedigertForslag}
            erGratis={erGratis}
            pending={pending}
            feil={genererFeil}
            onTilbake={() => setSteg(2)}
            onNullstill={nullstill}
            onLagreUtkast={() => lagre("DRAFT")}
            onSendGodkjenning={() => lagre("PENDING_COACH")}
          />
        )}
        {steg === 5 && (
          <Steg5Bekreftelse
            sendtTilGodkjenning={sendtTilGodkjenning}
            planId={lagretPlanId}
            onLagEnTil={nullstill}
          />
        )}
      </main>
    </div>
  );
}

// ============================================================================
// Progress bar
// ============================================================================

function ProgressBar({ steg }: { steg: Step }) {
  const steg_array: Step[] = [1, 2, 3, 4, 5];
  return (
    <div className="border-b border-border bg-background/90 px-4 py-4 sm:px-8">
      <div className="mx-auto flex max-w-[1200px] items-center gap-2 overflow-x-auto sm:gap-2">
        {steg_array.map((n, i) => (
          <div key={n} className="flex items-center gap-2 sm:gap-2">
            <div
              className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-mono font-semibold uppercase tracking-[0.06em] ${
                n === steg
                  ? "border-primary bg-primary text-primary-foreground"
                  : n < steg
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground"
              }`}
            >
              <span className="grid h-4 w-4 place-items-center rounded-full bg-current/20">
                {n < steg ? (
                  <Check className="h-3 w-3 text-current" strokeWidth={2.5} />
                ) : (
                  <span className="text-[10px] tabular-nums">{n}</span>
                )}
              </span>
              <span className="hidden sm:inline">{STEG_NAVN[n]}</span>
            </div>
            {i < steg_array.length - 1 && (
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
                strokeWidth={1.75}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Steg 1 — Velg mål
// ============================================================================

function Steg1VelgMal(props: {
  kontekst: ByggerKontekst;
  maltype: ByggerMaltype | null;
  setMaltype: (t: ByggerMaltype) => void;
  turneringId: string | null;
  setTurneringId: (id: string | null) => void;
  egendefinertTekst: string;
  setEgendefinertTekst: (s: string) => void;
  pending: boolean;
  onNeste: () => void;
}) {
  const {
    kontekst,
    maltype,
    setMaltype,
    turneringId,
    setTurneringId,
    egendefinertTekst,
    setEgendefinertTekst,
    pending,
    onNeste,
  } = props;

  const kanGaaVidere =
    maltype !== null &&
    (maltype !== "TURNERING" || turneringId !== null) &&
    (maltype !== "EGENDEFINERT" || egendefinertTekst.trim().length >= 10);

  return (
    <section className="space-y-6">
      <AgentStrip
        tekst={`Hva vil du oppnå med neste treningsplan, ${kontekst.spiller.fornavn}?`}
      />

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <MalKort
          icon={Trophy}
          tittel="Forberedelse til turnering"
          beskrivelse="Spisset plan mot en konkret turnering i kalenderen."
          valgt={maltype === "TURNERING"}
          onClick={() => setMaltype("TURNERING")}
        />
        <MalKort
          icon={Target}
          tittel="Forbedre svakeste område"
          beskrivelse={
            kontekst.svakhet
              ? `Din svakhet: ${kontekst.svakhet.skillArea}${kontekst.svakhet.sgDelta !== null ? ` (${kontekst.svakhet.sgDelta.toFixed(2)})` : ""}.`
              : "AI finner din SG-svakhet og fokuserer planen rundt det."
          }
          valgt={maltype === "SVAKHET"}
          onClick={() => setMaltype("SVAKHET")}
        />
        <MalKort
          icon={Layers}
          tittel="Generell utvikling"
          beskrivelse={
            kontekst.aktivLPhase
              ? `Følger din aktive fase: ${kontekst.aktivLPhase}.`
              : "Balansert utvikling på tvers av pyramiden."
          }
          valgt={maltype === "GENERELL"}
          onClick={() => setMaltype("GENERELL")}
        />
        <MalKort
          icon={Edit3}
          tittel="Egendefinert"
          beskrivelse="Beskriv selv hva du vil jobbe med."
          valgt={maltype === "EGENDEFINERT"}
          onClick={() => setMaltype("EGENDEFINERT")}
        />
      </div>

      {maltype === "TURNERING" && (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground">
            Velg turnering
          </div>
          {kontekst.kommendeTurneringer.length === 0 ? (
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              Du har ingen planlagte turneringer. Legg til en under{" "}
              <Link
                href="/portal/tren/turneringer"
                className="text-primary underline-offset-2 hover:underline"
              >
                Turneringer
              </Link>
              .
            </p>
          ) : (
            <div className="mt-2 grid gap-2">
              {kontekst.kommendeTurneringer.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTurneringId(t.id)}
                  className={`flex h-11 items-center justify-between rounded-md border px-4 text-left transition-colors ${
                    turneringId === t.id
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:border-muted-foreground"
                  }`}
                >
                  <div>
                    <div className="text-[14px] font-semibold text-foreground">
                      {t.navn}
                    </div>
                    {t.kategori && (
                      <div className="text-[11.5px] text-muted-foreground">
                        {t.kategori}
                      </div>
                    )}
                  </div>
                  <div className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    {t.dato ?? "Uten dato"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {maltype === "EGENDEFINERT" && (
        <div className="rounded-lg border border-border bg-card p-6">
          <label
            htmlFor="egendefinert"
            className="font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground"
          >
            Beskriv hva du vil jobbe med (minst 10 tegn)
          </label>
          <textarea
            id="egendefinert"
            value={egendefinertTekst}
            onChange={(e) => setEgendefinertTekst(e.target.value)}
            rows={4}
            placeholder="F.eks. Wedge-spill 50-100m, blokk-treninger først, deretter random …"
            className="mt-2 w-full rounded-md border border-input bg-background px-4 py-2 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30 sm:text-sm"
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onNeste}
          disabled={!kanGaaVidere || pending}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-[13px] font-bold tracking-tight text-foreground hover:bg-[#c5ed32] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
              Henter anbefaling …
            </>
          ) : (
            <>
              Neste
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </>
          )}
        </button>
      </div>
    </section>
  );
}

function MalKort(props: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tittel: string;
  beskrivelse: string;
  valgt: boolean;
  onClick: () => void;
}) {
  const Icon = props.icon;
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`flex items-start gap-4 rounded-xl border-2 p-6 text-left transition-all ${
        props.valgt
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-muted-foreground"
      }`}
    >
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
          props.valgt
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-[16px] font-semibold leading-tight -tracking-[0.01em]">
          {props.tittel}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          {props.beskrivelse}
        </p>
      </div>
    </button>
  );
}

// ============================================================================
// Steg 2 — Mal-anbefaling
// ============================================================================

function Steg2Anbefaling(props: {
  anbefalinger: AnbefalingerResultat;
  valgtTemplate: MalAnbefaling | null;
  setValgtTemplate: (m: MalAnbefaling) => void;
  visAlternativer: boolean;
  setVisAlternativer: (b: boolean) => void;
  pending: boolean;
  onTilbake: () => void;
  onNeste: () => void;
}) {
  const {
    anbefalinger,
    valgtTemplate,
    setValgtTemplate,
    visAlternativer,
    setVisAlternativer,
    pending,
    onTilbake,
    onNeste,
  } = props;

  if (!anbefalinger.anbefalt && anbefalinger.alternativer.length === 0) {
    return (
      <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
        <h3 className="font-display text-[18px] font-semibold text-foreground">
          Ingen mal funnet
        </h3>
        <p className="mt-2 text-[13.5px] text-muted-foreground">
          Vi fant ingen plan-template som matcher din kategori og fase. Du kan
          fortsatt la AI-en lage en plan fra scratch.
        </p>
        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onTilbake}
            className="h-11 rounded-full border border-border bg-transparent px-6 text-[12.5px] font-semibold text-foreground hover:border-muted-foreground"
          >
            Tilbake
          </button>
          <button
            type="button"
            onClick={onNeste}
            className="h-11 rounded-full bg-accent px-6 text-[13px] font-bold text-foreground hover:bg-[#c5ed32]"
          >
            Gå videre uten mal
          </button>
        </div>
      </section>
    );
  }

  const anbefaltMal = anbefalinger.anbefalt;
  const alternativer = anbefalinger.alternativer;

  return (
    <section className="space-y-6">
      <AgentStrip tekst="Basert på din NGF-kategori og aktive fase fant jeg denne malen til deg:" />

      {anbefaltMal && (
        <MalKortStor
          mal={anbefaltMal}
          valgt={valgtTemplate?.templateId === anbefaltMal.templateId}
          erAnbefalt
          onClick={() => setValgtTemplate(anbefaltMal)}
        />
      )}

      {visAlternativer && alternativer.length > 0 && (
        <div className="space-y-2">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground">
            Andre alternativer ({alternativer.length})
          </div>
          {alternativer.map((m) => (
            <MalKortStor
              key={m.templateId}
              mal={m}
              valgt={valgtTemplate?.templateId === m.templateId}
              onClick={() => setValgtTemplate(m)}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onTilbake}
            className="h-11 rounded-full border border-border bg-transparent px-6 text-[12.5px] font-semibold text-foreground hover:border-muted-foreground"
          >
            <ArrowLeft className="mr-1.5 inline h-4 w-4" strokeWidth={1.75} />
            Tilbake
          </button>
          {!visAlternativer && alternativer.length > 0 && (
            <button
              type="button"
              onClick={() => setVisAlternativer(true)}
              className="h-11 rounded-full border border-border bg-transparent px-6 text-[12.5px] font-semibold text-foreground hover:border-muted-foreground"
            >
              Vis andre alternativer ({alternativer.length})
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onNeste}
          disabled={!valgtTemplate || pending}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-[13px] font-bold text-foreground hover:bg-[#c5ed32] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Bruk denne malen
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </section>
  );
}

function MalKortStor(props: {
  mal: MalAnbefaling;
  valgt: boolean;
  erAnbefalt?: boolean;
  onClick: () => void;
}) {
  const { mal, valgt, erAnbefalt, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full rounded-xl border-2 p-6 text-left transition-all ${
        valgt
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-muted-foreground"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          {erAnbefalt && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-foreground">
              <Sparkles className="h-3 w-3" strokeWidth={1.75} />
              ANBEFALT
            </div>
          )}
          <h3 className="mt-2 font-display text-[20px] font-semibold leading-tight -tracking-[0.01em]">
            {mal.navn}
          </h3>
          {mal.beskrivelse && (
            <p className="mt-1.5 max-w-[600px] text-[13.5px] leading-relaxed text-muted-foreground">
              {mal.beskrivelse}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <Statistikk label="Varighet" verdi={`${mal.varighetUker} uker`} />
          <Statistikk
            label="Økter/uke"
            verdi={mal.ukentligOktAntall.toString()}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
        <DisciplinFordelingBar fordeling={mal.disciplinFordeling} />
        <div className="flex items-center gap-4 text-[12px] text-muted-foreground">
          <span>
            Brukt{" "}
            <strong className="font-semibold tabular-nums text-foreground">
              {mal.usageCount}
            </strong>{" "}
            ganger
          </span>
          {mal.effectivenessAvg !== null && (
            <span>
              Snitt-effekt:{" "}
              <strong className="font-mono font-semibold tabular-nums text-primary">
                {mal.effectivenessAvg >= 0 ? "+" : ""}
                {mal.effectivenessAvg.toFixed(2)}
              </strong>{" "}
              SG-Total
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function Statistikk({ label, verdi }: { label: string; verdi: string }) {
  return (
    <div>
      <div className="font-mono text-[9.5px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[14px] font-bold tabular-nums text-foreground">
        {verdi}
      </div>
    </div>
  );
}

const DISCIPLIN_FARGER: Record<string, string> = {
  FYS: "hsl(var(--primary))",
  TEK: "#3B7A66",
  SLAG: "#5E9C82",
  SPILL: "#A8D896",
  TURN: "hsl(var(--accent))",
};

const DISCIPLIN_NAVN: Record<string, string> = {
  FYS: "Fysisk",
  TEK: "Teknikk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

function DisciplinFordelingBar({
  fordeling,
}: {
  fordeling: Record<string, number>;
}) {
  const entries = Object.entries(fordeling).filter(([, v]) => v > 0);
  if (entries.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        {entries.map(([k, v]) => (
          <div
            key={k}
            style={{
              width: `${v * 100}%`,
              backgroundColor: DISCIPLIN_FARGER[k] ?? "#999",
            }}
            aria-label={`${DISCIPLIN_NAVN[k] ?? k}: ${Math.round(v * 100)}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10.5px] font-mono uppercase tracking-[0.06em] text-muted-foreground">
        {entries.map(([k, v]) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-sm"
              style={{ backgroundColor: DISCIPLIN_FARGER[k] ?? "#999" }}
            />
            {DISCIPLIN_NAVN[k] ?? k} {Math.round(v * 100)}%
          </span>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Steg 3 — AI tilpasser (loading)
// ============================================================================

function Steg3AiTilpasser(props: {
  kontekst: ByggerKontekst;
  valgtTemplate: MalAnbefaling | null;
  pending: boolean;
  feil: string | null;
  onPrøvIgjen: () => void;
  onTilbake: () => void;
}) {
  const { kontekst, valgtTemplate, pending, feil, onPrøvIgjen, onTilbake } =
    props;

  const bullets: string[] = [];
  if (kontekst.svakhet) {
    bullets.push(
      `Din SG-svakhet: ${kontekst.svakhet.skillArea}${kontekst.svakhet.sgDelta !== null ? ` (${kontekst.svakhet.sgDelta.toFixed(2)})` : ""}`,
    );
  }
  if (kontekst.aktivLPhase) {
    bullets.push(`Aktiv L-fase: ${kontekst.aktivLPhase}`);
  }
  if (valgtTemplate) {
    bullets.push(
      `Baseline-mal: ${valgtTemplate.navn} (brukt ${valgtTemplate.usageCount} ganger)`,
    );
  }
  if (kontekst.kommendeTurneringer.length > 0) {
    const t = kontekst.kommendeTurneringer[0];
    bullets.push(
      `Neste turnering: ${t.navn}${t.dato ? ` (${t.dato})` : ""}`,
    );
  }
  bullets.push("Pyramide-balanse fra siste 4 ukers økter");

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
        <div className="flex flex-col items-center gap-6 text-center">
          {feil ? (
            <>
              <div className="grid h-16 w-16 place-items-center rounded-full bg-destructive/10 text-destructive">
                <Lock className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="font-display text-[24px] font-semibold leading-tight -tracking-[0.01em]">
                  AI klarte ikke å fullføre
                </h2>
                <p className="mt-2 max-w-[480px] text-[13.5px] leading-relaxed text-muted-foreground">
                  {feil}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onTilbake}
                  className="h-11 rounded-full border border-border bg-transparent px-6 text-[12.5px] font-semibold text-foreground hover:border-muted-foreground"
                >
                  Tilbake
                </button>
                <button
                  type="button"
                  onClick={onPrøvIgjen}
                  className="h-11 rounded-full bg-primary px-6 text-[13px] font-bold text-primary-foreground hover:opacity-90"
                >
                  Prøv igjen
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <div className="grid h-20 w-20 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Wand2 className="h-9 w-9" strokeWidth={1.75} />
                </div>
                <Loader2
                  className="absolute -bottom-1 -right-1 h-7 w-7 animate-spin text-accent"
                  strokeWidth={1.75}
                />
              </div>
              <div>
                <h2 className="font-display text-[26px] font-semibold leading-tight -tracking-[0.01em]">
                  Anders&apos;{" "}
                  <em className="font-display italic font-normal text-primary">
                    AI tilpasser
                  </em>{" "}
                  malen til deg …
                </h2>
                <p className="mt-2 text-[13.5px] text-muted-foreground">
                  Dette tar typisk 10-15 sekunder.
                </p>
              </div>
              <ul className="w-full max-w-[460px] space-y-2.5 text-left">
                {bullets.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 rounded-md border border-border bg-background px-4 py-2.5"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                      strokeWidth={2}
                    />
                    <span className="text-[13px] leading-snug text-foreground">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
              {pending && (
                <div className="font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground">
                  Genererer …
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Steg 4 — Forhåndsvis
// ============================================================================

function Steg4Forhåndsvis(props: {
  forslag: PlanForslag;
  setForslag: (p: PlanForslag) => void;
  erGratis: boolean;
  pending: boolean;
  feil: string | null;
  onTilbake: () => void;
  onNullstill: () => void;
  onLagreUtkast: () => void;
  onSendGodkjenning: () => void;
}) {
  const {
    forslag,
    setForslag,
    erGratis,
    pending,
    feil,
    onTilbake,
    onNullstill,
    onLagreUtkast,
    onSendGodkjenning,
  } = props;

  function oppdaterNavn(navn: string) {
    setForslag({ ...forslag, navn });
  }

  function fjernOkt(idx: number) {
    const nyOkter = forslag.okter.filter((_, i) => i !== idx);
    setForslag({ ...forslag, okter: nyOkter });
  }

  // Disciplin-fordeling fra økter
  const disciplinFordeling = beregnDisciplinFordeling(forslag.okter);

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* Venstre — Plan-oversikt */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-6">
            <label
              htmlFor="plannavn"
              className="font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground"
            >
              Plan-navn
            </label>
            <input
              id="plannavn"
              type="text"
              value={forslag.navn}
              onChange={(e) => oppdaterNavn(e.target.value)}
              className="mt-1.5 w-full rounded-md border border-input bg-background px-4 py-2 text-base font-display font-semibold text-foreground focus:border-primary focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:ring-2 focus:ring-ring/30 sm:text-[18px]"
            />
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {forslag.beskrivelse}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground">
              Nøkkeltall
            </div>
            <dl className="mt-2 space-y-2.5">
              <Nokkel
                label="Varighet"
                verdi={`${forslag.periodeUker} uker`}
              />
              <Nokkel
                label="Antall økter"
                verdi={forslag.okter.length.toString()}
              />
              <Nokkel
                label="Snitt/uke"
                verdi={(
                  forslag.okter.length / Math.max(forslag.periodeUker, 1)
                ).toFixed(1)}
              />
            </dl>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground">
              Fokus-områder
            </div>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {forslag.fokusOmrader.map((f) => (
                <li
                  key={f}
                  className="rounded-full bg-accent/30 px-2.5 py-1 text-[11.5px] font-semibold text-foreground"
                >
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground">
              Disciplin-fordeling
            </div>
            <div className="mt-2">
              <DisciplinFordelingBar fordeling={disciplinFordeling} />
            </div>
          </div>
        </aside>

        {/* Høyre — Ukentlig grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[20px] font-semibold leading-tight -tracking-[0.01em]">
              Ukentlig grid
            </h2>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground">
              <Edit3 className="mr-1 inline h-3 w-3" strokeWidth={1.75} />
              Klikk for å redigere
            </div>
          </div>

          {Array.from({ length: forslag.periodeUker }, (_, ukeIdx) => {
            const uke = ukeIdx + 1;
            const okterIuken = forslag.okter
              .map((okt, idx) => ({ okt, idx }))
              .filter(({ okt }) => okt.uke === uke);
            return (
              <UkeRad
                key={uke}
                ukeNr={uke}
                okter={okterIuken}
                onFjern={fjernOkt}
              />
            );
          })}
        </div>
      </div>

      {feil && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-2 text-[13px] text-destructive">
          {feil}
        </div>
      )}

      {erGratis && (
        <div className="flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/10 px-4 py-4">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-foreground" strokeWidth={1.75} />
          <div className="text-[13px] leading-relaxed text-foreground">
            <strong className="font-semibold">GRATIS-konto:</strong> Du kan se
            forslaget, men ikke lagre det.{" "}
            <Link
              href="/portal/meg/abonnement"
              className="font-semibold text-primary underline-offset-2 hover:underline"
            >
              Oppgrader til PRO
            </Link>{" "}
            for å lagre planer.
          </div>
        </div>
      )}

      {/* Bunn-rad */}
      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onTilbake}
            className="h-11 rounded-full border border-border bg-transparent px-4 text-[12.5px] font-semibold text-foreground hover:border-muted-foreground"
          >
            <ArrowLeft className="mr-1.5 inline h-4 w-4" strokeWidth={1.75} />
            Tilbake
          </button>
          <button
            type="button"
            onClick={onNullstill}
            className="h-11 rounded-full border border-border bg-transparent px-4 text-[12.5px] font-semibold text-foreground hover:border-muted-foreground"
          >
            Start på nytt
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onLagreUtkast}
            disabled={pending || erGratis}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-[13px] font-bold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ClipboardList className="h-4 w-4" strokeWidth={1.75} />
            Lagre som utkast
          </button>
          <button
            type="button"
            onClick={onSendGodkjenning}
            disabled={pending || erGratis}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-accent px-6 text-[13px] font-bold text-foreground hover:bg-[#c5ed32] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                Sender …
              </>
            ) : (
              <>
                <Send className="h-4 w-4" strokeWidth={1.75} />
                Send til Anders
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function Nokkel({ label, verdi }: { label: string; verdi: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[12.5px] text-muted-foreground">{label}</dt>
      <dd className="font-mono text-[13px] font-bold tabular-nums text-foreground">
        {verdi}
      </dd>
    </div>
  );
}

function UkeRad(props: {
  ukeNr: number;
  okter: { okt: PlanForslagOkt; idx: number }[];
  onFjern: (idx: number) => void;
}) {
  const { ukeNr, okter, onFjern } = props;
  const [aapenIdx, setAapenIdx] = useState<number | null>(null);

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.10em] text-muted-foreground">
          Uke {ukeNr}
        </div>
        <div className="font-mono text-[10.5px] tabular-nums text-muted-foreground">
          {okter.length} økter
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-7">
        {DAGER_REKKEFOLGE.map((dag) => {
          const ipDag = okter.filter(({ okt }) => okt.dag === dag);
          return (
            <div
              key={dag}
              className="min-h-[80px] rounded-md border border-border bg-background p-2"
            >
              <div className="font-mono text-[9.5px] uppercase tracking-[0.10em] text-muted-foreground">
                {DAG_NAVN[dag]}
              </div>
              {ipDag.length === 0 ? (
                <div className="mt-2 grid h-8 place-items-center rounded border border-dashed border-border text-muted-foreground">
                  <Plus className="h-3 w-3" strokeWidth={1.75} />
                </div>
              ) : (
                <div className="mt-1.5 space-y-1.5">
                  {ipDag.map(({ okt, idx }) => (
                    <OktBokks
                      key={idx}
                      okt={okt}
                      idx={idx}
                      aapen={aapenIdx === idx}
                      onToggle={() =>
                        setAapenIdx(aapenIdx === idx ? null : idx)
                      }
                      onFjern={() => onFjern(idx)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OktBokks(props: {
  okt: PlanForslagOkt;
  idx: number;
  aapen: boolean;
  onToggle: () => void;
  onFjern: () => void;
}) {
  const { okt, aapen, onToggle, onFjern } = props;
  const farge = DISCIPLIN_FARGER[okt.type] ?? "#999";
  return (
    <div className="overflow-hidden rounded border border-border bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-1.5 px-1.5 py-1 text-left hover:bg-secondary/30"
      >
        <span
          className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: farge }}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[10.5px] font-semibold leading-tight text-foreground">
            {okt.fokus}
          </div>
          <div className="font-mono text-[9px] tabular-nums text-muted-foreground">
            {okt.varighetMin} min
          </div>
        </div>
      </button>
      {aapen && (
        <div className="border-t border-border bg-background px-2 py-2">
          <div className="font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
            Drills ({okt.drills.length})
          </div>
          <ul className="mt-1 space-y-1">
            {okt.drills.map((d, i) => (
              <li key={i} className="text-[10.5px] leading-snug text-foreground">
                <strong className="font-semibold">{d.navn}</strong>
                {(d.sets ?? d.antallSet) !== undefined &&
                  (d.reps ?? d.antallRep) !== undefined && (
                    <span className="ml-1 font-mono tabular-nums text-muted-foreground">
                      {d.sets ?? d.antallSet}×{d.reps ?? d.antallRep}
                    </span>
                  )}
                {d.csTarget !== undefined && (
                  <span className="ml-1 font-mono tabular-nums text-primary">
                    @{d.csTarget}%
                  </span>
                )}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFjern();
            }}
            className="mt-2 inline-flex items-center gap-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] text-destructive hover:underline"
          >
            <Trash2 className="h-3 w-3" strokeWidth={1.75} />
            Slett økt
          </button>
        </div>
      )}
    </div>
  );
}

function beregnDisciplinFordeling(
  okter: PlanForslagOkt[],
): Record<string, number> {
  if (okter.length === 0) return {};
  const totalt = okter.reduce((s, o) => s + o.varighetMin, 0);
  if (totalt === 0) return {};
  const acc: Record<string, number> = {};
  for (const o of okter) {
    const k = o.type;
    acc[k] = (acc[k] ?? 0) + o.varighetMin;
  }
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(acc)) {
    out[k] = v / totalt;
  }
  return out;
}

// ============================================================================
// Steg 5 — Bekreftelse
// ============================================================================

function Steg5Bekreftelse(props: {
  sendtTilGodkjenning: boolean;
  planId: string | null;
  onLagEnTil: () => void;
}) {
  const { sendtTilGodkjenning, onLagEnTil } = props;
  return (
    <section className="rounded-2xl border border-border bg-card p-8 sm:p-16">
      <div className="mx-auto flex max-w-[480px] flex-col items-center gap-6 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-accent text-foreground">
          <CheckCircle2 className="h-10 w-10" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="font-display text-[32px] font-semibold leading-tight -tracking-[0.02em]">
            {sendtTilGodkjenning ? "Sendt til Anders!" : "Lagret som utkast"}
          </h2>
          <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
            {sendtTilGodkjenning
              ? "Anders svarer vanligvis innen 24 timer. Du får varsel når planen er godkjent."
              : "Planen ligger nå som utkast under Mål-fanen. Du kan redigere eller sende den til godkjenning når du vil."}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            href="/portal/mal"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-[13px] font-bold text-primary-foreground hover:opacity-90"
          >
            Tilbake til Mål
          </Link>
          <button
            type="button"
            onClick={onLagEnTil}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-transparent px-6 text-[13px] font-bold text-foreground hover:border-muted-foreground"
          >
            Lag en plan til
          </button>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Felles
// ============================================================================

function AgentStrip({ tekst }: { tekst: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-foreground">
        <Sparkles className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <p className="pt-1 font-display text-[15px] leading-snug text-foreground">
        {tekst}
      </p>
    </div>
  );
}
