"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, LayoutTemplate, X } from "lucide-react";
import {
  hentMalForhandsutfylling,
  opprettPlan,
  PLAN_FASE_LABELS,
  type AllokeringVekter,
  type OpprettPlanInput,
  type PlanFase,
  type UkeSkjema,
} from "./actions";

type Spiller = {
  id: string;
  name: string;
  hcp: number | null;
};

export type MalListeElement = {
  id: string;
  name: string;
  description: string | null;
  weeks: number;
};

const STEG_NAVN = [
  "Spiller",
  "Periode",
  "Faser",
  "Allokering",
  "Økt-skjema",
  "Bekreft",
] as const;

type StegNr = 1 | 2 | 3 | 4 | 5 | 6;

const ALLE_FASER: PlanFase[] = ["BASE", "GENERELL", "SPESIFIKK", "TAPER", "TOPPFORM"];

const STANDARD_ALLOKERING: AllokeringVekter = {
  FYS: 15,
  TEK: 25,
  SLAG: 25,
  SPILL: 25,
  TURN: 10,
};

const STANDARD_UKE: UkeSkjema = { okterPerUke: 3, varighetMin: 75 };

function isoIDag(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoOm(uker: number): string {
  const d = new Date();
  d.setDate(d.getDate() + uker * 7);
  return d.toISOString().slice(0, 10);
}

export function PlanWizard({
  spillere,
  maler = [],
}: {
  spillere: Spiller[];
  maler?: MalListeElement[];
}) {
  const router = useRouter();
  const [steg, setSteg] = useState<StegNr>(1);
  const [pending, startTransition] = useTransition();
  const [serverFeil, setServerFeil] = useState<string | null>(null);
  const [malModalOpen, setMalModalOpen] = useState(false);
  const [valgtMalNavn, setValgtMalNavn] = useState<string | null>(null);

  // State per steg
  const [spillerId, setSpillerId] = useState<string>("");
  const [sok, setSok] = useState("");
  const [navn, setNavn] = useState("");
  const [startDato, setStartDato] = useState(isoIDag());
  const [sluttDato, setSluttDato] = useState(isoOm(8));
  const [faser, setFaser] = useState<PlanFase[]>(["BASE", "SPESIFIKK", "TAPER"]);
  const [allokering, setAllokering] = useState<AllokeringVekter>(STANDARD_ALLOKERING);
  const [ukeSkjema, setUkeSkjema] = useState<UkeSkjema>(STANDARD_UKE);

  const filtrerteSpillere = useMemo(() => {
    const s = sok.trim().toLowerCase();
    if (!s) return spillere;
    return spillere.filter((sp) => sp.name.toLowerCase().includes(s));
  }, [spillere, sok]);

  const valgtSpiller = useMemo(
    () => spillere.find((s) => s.id === spillerId) ?? null,
    [spillere, spillerId],
  );

  const sumAllokering = useMemo(
    () =>
      allokering.FYS +
      allokering.TEK +
      allokering.SLAG +
      allokering.SPILL +
      allokering.TURN,
    [allokering],
  );

  const antallUker = useMemo(() => {
    const s = new Date(startDato);
    const e = new Date(sluttDato);
    if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
    const diff = (e.getTime() - s.getTime()) / (7 * 24 * 60 * 60 * 1000);
    return Math.max(0, Math.round(diff));
  }, [startDato, sluttDato]);

  const totalOkter = antallUker * ukeSkjema.okterPerUke;

  const stegFeil: string | null = (() => {
    if (steg === 1 && !spillerId) return "Velg en spiller.";
    if (steg === 2) {
      if (!navn.trim() || navn.trim().length < 2) return "Skriv et plan-navn (minst 2 tegn).";
      if (antallUker < 1) return "Sluttdato må være etter startdato.";
    }
    if (steg === 3 && (faser.length < 3 || faser.length > 5)) return "Velg 3–5 faser.";
    if (steg === 4 && sumAllokering !== 100) return `Sum må være 100 % (er nå ${sumAllokering}).`;
    if (steg === 5 && (ukeSkjema.okterPerUke < 1 || ukeSkjema.varighetMin < 15))
      return "Sjekk antall økter og varighet.";
    return null;
  })();

  function neste() {
    if (stegFeil) return;
    if (steg < 6) setSteg((steg + 1) as StegNr);
  }
  function forrige() {
    if (steg > 1) setSteg((steg - 1) as StegNr);
  }

  function sendInn(sendTilSpiller: boolean) {
    setServerFeil(null);
    const input: OpprettPlanInput = {
      spillerId,
      navn: navn.trim(),
      startDato,
      sluttDato,
      faser,
      allokering,
      ukeSkjema,
      sendTilSpiller,
    };
    startTransition(async () => {
      const res = await opprettPlan(input);
      if (res.ok) {
        router.push(`/admin/plans/${res.planId}`);
      } else {
        setServerFeil(res.feil);
      }
    });
  }

  function toggleFase(f: PlanFase) {
    setFaser((prev) => {
      if (prev.includes(f)) {
        return prev.filter((p) => p !== f);
      }
      if (prev.length >= 5) return prev;
      // Behold opprinnelig rekkefølge fra ALLE_FASER
      return ALLE_FASER.filter((x) => prev.includes(x) || x === f);
    });
  }

  function settVekt(omrade: keyof AllokeringVekter, value: number) {
    setAllokering((prev) => ({ ...prev, [omrade]: value }));
  }

  function velgMal(malId: string) {
    setServerFeil(null);
    startTransition(async () => {
      const data = await hentMalForhandsutfylling(malId);
      if (!data) {
        setServerFeil("Kunne ikke laste malen.");
        return;
      }
      setAllokering(data.allokering);
      setUkeSkjema(data.ukeSkjema);
      // Beregn ny sluttdato basert på mal-uker
      const start = new Date(startDato);
      const slutt = new Date(start.getTime() + data.weeks * 7 * 24 * 60 * 60 * 1000);
      setSluttDato(slutt.toISOString().slice(0, 10));
      setValgtMalNavn(data.navn);
      setMalModalOpen(false);
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
        <div>
          {valgtMalNavn ? (
            <p className="text-sm text-foreground">
              <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Mal lastet
              </span>{" "}
              <span className="font-display italic">{valgtMalNavn}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                — endre detaljene fritt før du oppretter planen.
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Start fra blank — eller forhåndsfyll wizarden fra en eksisterende mal.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setMalModalOpen(true)}
          disabled={pending || maler.length === 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <LayoutTemplate className="h-3.5 w-3.5" strokeWidth={1.8} />
          {maler.length === 0 ? "Ingen maler tilgjengelig" : "Start fra mal"}
        </button>
      </div>

      <ProgressStripe current={steg} />

      <div className="rounded-2xl border border-border bg-card px-6 py-6">
        {steg === 1 && (
          <Steg1Spiller
            spillere={filtrerteSpillere}
            valgtId={spillerId}
            sok={sok}
            onSok={setSok}
            onVelg={setSpillerId}
          />
        )}
        {steg === 2 && (
          <Steg2Periode
            navn={navn}
            setNavn={setNavn}
            startDato={startDato}
            setStartDato={setStartDato}
            sluttDato={sluttDato}
            setSluttDato={setSluttDato}
            antallUker={antallUker}
          />
        )}
        {steg === 3 && <Steg3Faser valgte={faser} onToggle={toggleFase} />}
        {steg === 4 && (
          <Steg4Allokering
            allokering={allokering}
            sum={sumAllokering}
            onChange={settVekt}
          />
        )}
        {steg === 5 && (
          <Steg5Skjema
            uke={ukeSkjema}
            setUke={setUkeSkjema}
            antallUker={antallUker}
            totalOkter={totalOkter}
          />
        )}
        {steg === 6 && (
          <Steg6Bekreft
            spiller={valgtSpiller}
            navn={navn}
            startDato={startDato}
            sluttDato={sluttDato}
            antallUker={antallUker}
            faser={faser}
            allokering={allokering}
            uke={ukeSkjema}
            totalOkter={totalOkter}
          />
        )}
      </div>

      {(stegFeil || serverFeil) && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {serverFeil ?? stegFeil}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-border pt-4">
        <button
          type="button"
          onClick={forrige}
          disabled={steg === 1 || pending}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
          Tilbake
        </button>

        {steg < 6 ? (
          <button
            type="button"
            onClick={neste}
            disabled={!!stegFeil || pending}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Neste
            <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => sendInn(false)}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? "Lagrer…" : "Lagre utkast"}
            </button>
            <button
              type="button"
              onClick={() => sendInn(true)}
              disabled={pending}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check className="h-4 w-4" strokeWidth={2} />
              {pending ? "Sender…" : "Send til spiller"}
            </button>
          </div>
        )}
      </div>

      {malModalOpen && (
        <StartFraMalModal
          maler={maler}
          pending={pending}
          onClose={() => setMalModalOpen(false)}
          onVelg={velgMal}
        />
      )}
    </div>
  );
}

/* =========================================================
   Start fra mal — modal
   ========================================================= */

function StartFraMalModal({
  maler,
  pending,
  onClose,
  onVelg,
}: {
  maler: MalListeElement[];
  pending: boolean;
  onClose: () => void;
  onVelg: (id: string) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Start fra mal
            </div>
            <h3 className="mt-1 font-display text-xl leading-tight tracking-tight">
              Velg en{" "}
              <span className="font-display italic text-primary">eksisterende mal</span>
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Allokering, økt-skjema og varighet forhåndsfylles. Du kan endre alt før
              du oppretter planen.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {maler.length === 0 ? (
          <p className="rounded-md border border-border bg-secondary/40 px-4 py-6 text-center text-sm text-muted-foreground">
            Ingen maler er lagret ennå. Lagre en eksisterende plan som mal først.
          </p>
        ) : (
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {maler.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onVelg(m.id)}
                disabled={pending}
                className="flex w-full items-start justify-between gap-3 rounded-lg border border-border bg-background p-4 text-left transition-colors hover:border-primary hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-base font-semibold text-foreground">
                    {m.name}
                  </div>
                  {m.description && (
                    <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {m.description}
                    </div>
                  )}
                </div>
                <div className="shrink-0 rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-semibold tabular-nums text-accent-foreground">
                  {m.weeks} uker
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Progress-stripe
   ========================================================= */

function ProgressStripe({ current }: { current: StegNr }) {
  return (
    <div className="grid grid-cols-6 gap-2.5">
      {STEG_NAVN.map((navn, idx) => {
        const num = (idx + 1) as StegNr;
        const state: "done" | "current" | "todo" =
          num < current ? "done" : num === current ? "current" : "todo";
        const isCurrent = state === "current";
        const isDone = state === "done";
        return (
          <div
            key={navn}
            className={`relative rounded-lg bg-card px-3 py-2.5 ${
              isCurrent ? "border-2 border-accent" : "border border-border"
            }`}
          >
            <div
              className={`mb-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full font-mono text-[11px] font-semibold leading-none ${
                isDone
                  ? "bg-primary text-primary-foreground"
                  : isCurrent
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {num}
            </div>
            <div className="text-xs font-semibold leading-tight text-foreground">
              {navn}
            </div>
            <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
              Steg {num} av 6
            </div>
            {isDone && (
              <Check
                className="absolute right-2 top-2 h-3.5 w-3.5 text-primary"
                strokeWidth={2.5}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   Steg 1 — Velg spiller
   ========================================================= */

function Steg1Spiller({
  spillere,
  valgtId,
  sok,
  onSok,
  onVelg,
}: {
  spillere: Spiller[];
  valgtId: string;
  sok: string;
  onSok: (s: string) => void;
  onVelg: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Steg 1
        </div>
        <h2 className="mt-1 font-display text-xl font-bold leading-tight tracking-tight">
          Hvem skal planen lages for?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Søk etter navn eller velg fra listen.
        </p>
      </div>

      <input
        value={sok}
        onChange={(e) => onSok(e.target.value)}
        placeholder="Søk på navn…"
        className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm"
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {spillere.length === 0 && (
          <p className="text-sm text-muted-foreground">Ingen spillere matcher søket.</p>
        )}
        {spillere.map((sp) => {
          const valgt = sp.id === valgtId;
          return (
            <button
              key={sp.id}
              type="button"
              onClick={() => onVelg(sp.id)}
              className={`flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                valgt
                  ? "border-2 border-accent bg-accent/10"
                  : "border border-border hover:bg-secondary"
              }`}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-semibold text-primary-foreground">
                {sp.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold leading-tight">
                  {sp.name}
                </div>
                <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                  HCP {sp.hcp ?? "–"}
                </div>
              </div>
              <div
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                  valgt
                    ? "border-2 border-accent bg-accent text-accent-foreground"
                    : "border-2 border-border"
                }`}
              >
                {valgt && <Check className="h-3 w-3" strokeWidth={2.5} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   Steg 2 — Periode
   ========================================================= */

function Steg2Periode({
  navn,
  setNavn,
  startDato,
  setStartDato,
  sluttDato,
  setSluttDato,
  antallUker,
}: {
  navn: string;
  setNavn: (s: string) => void;
  startDato: string;
  setStartDato: (s: string) => void;
  sluttDato: string;
  setSluttDato: (s: string) => void;
  antallUker: number;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Steg 2
        </div>
        <h2 className="mt-1 font-display text-xl font-bold leading-tight tracking-tight">
          Plan-navn og periode
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Hva heter planen, og når starter og slutter den?
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Plan-navn
        </label>
        <input
          value={navn}
          onChange={(e) => setNavn(e.target.value)}
          placeholder="F.eks. Sørlandsåpent-prep"
          className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Startdato
          </label>
          <input
            type="date"
            value={startDato}
            onChange={(e) => setStartDato(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sluttdato
          </label>
          <input
            type="date"
            value={sluttDato}
            onChange={(e) => setSluttDato(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm"
          />
        </div>
      </div>

      <div className="rounded-md border border-border bg-secondary/40 px-4 py-3 text-sm">
        <span className="font-medium text-muted-foreground">Varighet: </span>
        <span className="font-mono font-semibold tabular-nums">
          {antallUker} {antallUker === 1 ? "uke" : "uker"}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   Steg 3 — Faser
   ========================================================= */

function Steg3Faser({
  valgte,
  onToggle,
}: {
  valgte: PlanFase[];
  onToggle: (f: PlanFase) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Steg 3
        </div>
        <h2 className="mt-1 font-display text-xl font-bold leading-tight tracking-tight">
          Velg faser (3–5 av 5)
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fasene fordeles automatisk over periodens uker.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {ALLE_FASER.map((f) => {
          const valgt = valgte.includes(f);
          return (
            <button
              key={f}
              type="button"
              onClick={() => onToggle(f)}
              className={`flex items-center justify-between rounded-lg p-4 text-left transition-colors ${
                valgt
                  ? "border-2 border-primary bg-primary/5"
                  : "border border-border hover:bg-secondary"
              }`}
            >
              <div>
                <div className="font-display text-base font-semibold leading-tight">
                  {PLAN_FASE_LABELS[f]}
                </div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                  {f}
                </div>
              </div>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  valgt
                    ? "bg-primary text-primary-foreground"
                    : "border-2 border-border"
                }`}
              >
                {valgt ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : (
                  <X className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="text-sm text-muted-foreground">
        Valgt: <span className="font-mono font-semibold tabular-nums">{valgte.length}</span> /{" "}
        <span className="font-mono tabular-nums">5</span>
      </div>
    </div>
  );
}

/* =========================================================
   Steg 4 — Allokering (slidere)
   ========================================================= */

const PYR_OMRADER: {
  key: keyof AllokeringVekter;
  navn: string;
  beskrivelse: string;
}[] = [
  { key: "FYS", navn: "FYS", beskrivelse: "fysisk fundament" },
  { key: "TEK", navn: "TEK", beskrivelse: "teknikk" },
  { key: "SLAG", navn: "SLAG", beskrivelse: "slagprogresjon" },
  { key: "SPILL", navn: "SPILL", beskrivelse: "banespill" },
  { key: "TURN", navn: "TURN", beskrivelse: "turnering" },
];

function Steg4Allokering({
  allokering,
  sum,
  onChange,
}: {
  allokering: AllokeringVekter;
  sum: number;
  onChange: (omrade: keyof AllokeringVekter, value: number) => void;
}) {
  const ok = sum === 100;
  return (
    <div className="space-y-5">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Steg 4
        </div>
        <h2 className="mt-1 font-display text-xl font-bold leading-tight tracking-tight">
          Pyramide-allokering
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fordel 100 % mellom fokusområdene. Hver økt får et område proporsjonalt.
        </p>
      </div>

      <div className="space-y-1">
        {PYR_OMRADER.map(({ key, navn, beskrivelse }) => {
          const v = allokering[key];
          return (
            <div
              key={key}
              className="border-b border-border py-3 last:border-b-0"
            >
              <div className="grid grid-cols-[100px_1fr_60px] items-center gap-3">
                <div>
                  <div className="text-sm font-semibold leading-none">{navn}</div>
                  <div className="mt-1 text-xs leading-none text-muted-foreground">
                    {beskrivelse}
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={v}
                  onChange={(e) => onChange(key, Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="text-right font-mono text-base font-semibold tabular-nums">
                  {v} %
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <div>
          <div className="font-mono text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Sum
          </div>
          <div
            className={`mt-1 font-mono text-2xl font-semibold tabular-nums leading-none ${
              ok ? "text-primary" : "text-destructive"
            }`}
          >
            {sum} %
          </div>
        </div>
        {ok && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            Klar
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   Steg 5 — Ukentlig økt-skjema
   ========================================================= */

function Steg5Skjema({
  uke,
  setUke,
  antallUker,
  totalOkter,
}: {
  uke: UkeSkjema;
  setUke: (u: UkeSkjema) => void;
  antallUker: number;
  totalOkter: number;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Steg 5
        </div>
        <h2 className="mt-1 font-display text-xl font-bold leading-tight tracking-tight">
          Ukentlig økt-skjema
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Hvor mange økter per uke, og hvor lange?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Økter per uke
          </label>
          <input
            type="number"
            min={1}
            max={7}
            value={uke.okterPerUke}
            onChange={(e) =>
              setUke({ ...uke, okterPerUke: Number(e.target.value) })
            }
            className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Varighet per økt (min)
          </label>
          <input
            type="number"
            min={15}
            max={360}
            step={15}
            value={uke.varighetMin}
            onChange={(e) =>
              setUke({ ...uke, varighetMin: Number(e.target.value) })
            }
            className="w-full rounded-md border border-input bg-background px-4 py-2.5 text-sm"
          />
        </div>
      </div>

      <div className="rounded-md border border-border bg-secondary/40 px-4 py-3 text-sm">
        Total: <span className="font-mono font-semibold tabular-nums">{totalOkter}</span> økter over{" "}
        <span className="font-mono font-semibold tabular-nums">{antallUker}</span>{" "}
        {antallUker === 1 ? "uke" : "uker"} ·{" "}
        <span className="font-mono tabular-nums">
          {totalOkter * uke.varighetMin}
        </span>{" "}
        min totalt
      </div>
    </div>
  );
}

/* =========================================================
   Steg 6 — Bekreft
   ========================================================= */

function Steg6Bekreft({
  spiller,
  navn,
  startDato,
  sluttDato,
  antallUker,
  faser,
  allokering,
  uke,
  totalOkter,
}: {
  spiller: Spiller | null;
  navn: string;
  startDato: string;
  sluttDato: string;
  antallUker: number;
  faser: PlanFase[];
  allokering: AllokeringVekter;
  uke: UkeSkjema;
  totalOkter: number;
}) {
  return (
    <div className="space-y-5">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Steg 6
        </div>
        <h2 className="mt-1 font-display text-xl font-bold leading-tight tracking-tight">
          Bekreft og opprett plan
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sjekk detaljene før du oppretter planen.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Oppsummering tittel="Spiller og periode">
          <Linje label="Spiller" value={spiller?.name ?? "–"} />
          <Linje label="HCP" value={spiller?.hcp != null ? String(spiller.hcp) : "–"} />
          <Linje label="Plan-navn" value={navn || "–"} />
          <Linje label="Start" value={startDato} />
          <Linje label="Slutt" value={sluttDato} />
          <Linje label="Varighet" value={`${antallUker} uker`} last />
        </Oppsummering>

        <Oppsummering tittel="Faser">
          {faser.map((f, i) => (
            <Linje
              key={f}
              label={`Fase ${i + 1}`}
              value={PLAN_FASE_LABELS[f]}
              last={i === faser.length - 1}
            />
          ))}
        </Oppsummering>

        <Oppsummering tittel="Allokering">
          <Linje label="FYS" value={`${allokering.FYS} %`} />
          <Linje label="TEK" value={`${allokering.TEK} %`} />
          <Linje label="SLAG" value={`${allokering.SLAG} %`} />
          <Linje label="SPILL" value={`${allokering.SPILL} %`} />
          <Linje label="TURN" value={`${allokering.TURN} %`} last />
        </Oppsummering>

        <Oppsummering tittel="Økt-skjema">
          <Linje label="Per uke" value={`${uke.okterPerUke} økter`} />
          <Linje label="Varighet" value={`${uke.varighetMin} min`} />
          <Linje label="Totalt antall økter" value={String(totalOkter)} />
          <Linje
            label="Total tid"
            value={`${totalOkter * uke.varighetMin} min`}
            last
          />
        </Oppsummering>
      </div>
    </div>
  );
}

function Oppsummering({
  tittel,
  children,
}: {
  tittel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {tittel}
      </h3>
      <div>{children}</div>
    </div>
  );
}

function Linje({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-2 text-sm ${
        last ? "" : "border-b border-border"
      }`}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold tabular-nums">{value}</span>
    </div>
  );
}
