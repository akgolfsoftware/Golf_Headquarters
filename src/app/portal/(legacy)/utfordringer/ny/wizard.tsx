"use client";

/**
 * NyUtfordringWizard — seks-stegs wizard for å lage en egen DrillChallenge.
 *   1. Tittel + Beskrivelse
 *   2. Type (Lengde / Nøyaktighet / Putting / Scrambling / Score / Mental / Annet)
 *   3. Mål-verdi + enhet
 *   4. Tidsfrist (dato-picker — valgfri)
 *   5. Inviter venner (skjelett-UI for søk + multi-select)
 *   6. Opprett (sammendrag + lagre)
 */
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  Loader2,
  Save,
  Search,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { useToast } from "@/components/shared/toast-provider";
import { opprettCustomChallenge } from "./actions";

type ChallengeType =
  | "lengde"
  | "noyaktighet"
  | "putting"
  | "scrambling"
  | "score"
  | "mental"
  | "annet";

type DrillRef = {
  id: string;
  name: string;
  pyramidArea: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
};

type Venn = { id: string; navn: string };

const TYPER: Array<{
  verdi: ChallengeType;
  navn: string;
  beskrivelse: string;
  Icon: typeof Target;
  fargeKlasse: string;
}> = [
  {
    verdi: "lengde",
    navn: "Lengde",
    beskrivelse: "Drive- eller utslagslengde",
    Icon: ArrowRight,
    fargeKlasse: "border-amber-500/30 bg-amber-500/5",
  },
  {
    verdi: "noyaktighet",
    navn: "Nøyaktighet",
    beskrivelse: "GIR, FIR, sideavvik",
    Icon: Target,
    fargeKlasse: "border-emerald-500/30 bg-emerald-500/5",
  },
  {
    verdi: "putting",
    navn: "Putting",
    beskrivelse: "% inn fra distanser",
    Icon: Sparkles,
    fargeKlasse: "border-blue-500/30 bg-blue-500/5",
  },
  {
    verdi: "scrambling",
    navn: "Scrambling",
    beskrivelse: "Up-and-down rundt green",
    Icon: Trophy,
    fargeKlasse: "border-orange-500/30 bg-orange-500/5",
  },
  {
    verdi: "score",
    navn: "Score",
    beskrivelse: "Lavest score eller stableford",
    Icon: Trophy,
    fargeKlasse: "border-primary/30 bg-primary/5",
  },
  {
    verdi: "mental",
    navn: "Mental",
    beskrivelse: "Fokus, ro, rutine",
    Icon: Brain,
    fargeKlasse: "border-purple-500/30 bg-purple-500/5",
  },
  {
    verdi: "annet",
    navn: "Annet",
    beskrivelse: "Fritt format",
    Icon: Users,
    fargeKlasse: "border-border bg-card",
  },
];

const ENHETER = [
  "antall",
  "meter",
  "yard",
  "%",
  "score",
  "sekunder",
  "minutter",
  "egendefinert",
] as const;
type Enhet = (typeof ENHETER)[number];

type State = {
  navn: string;
  beskrivelse: string;
  type: ChallengeType | null;
  drillId: string;
  malVerdi: string;
  enhet: Enhet;
  egenEnhet: string;
  endAt: string;
  inviterte: string[];
  vennSok: string;
};

const initialState: State = {
  navn: "",
  beskrivelse: "",
  type: null,
  drillId: "",
  malVerdi: "",
  enhet: "antall",
  egenEnhet: "",
  endAt: "",
  inviterte: [],
  vennSok: "",
};

type Props = {
  venner: Venn[];
  drills: DrillRef[];
};

export function NyUtfordringWizard({ venner, drills }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [steg, setSteg] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [state, setState] = useState<State>(initialState);
  const [feilmelding, setFeilmelding] = useState<string | null>(null);

  const kanGåVidere = useMemo(() => {
    switch (steg) {
      case 1:
        return state.navn.trim().length >= 2;
      case 2:
        return state.type !== null;
      case 3:
        return state.malVerdi.trim().length > 0;
      case 4:
        return true;
      case 5:
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  }, [steg, state]);

  function oppdater<K extends keyof State>(felt: K, verdi: State[K]) {
    setState((s) => ({ ...s, [felt]: verdi }));
    setFeilmelding(null);
  }

  function toggleInvitert(id: string) {
    setState((s) => {
      const finnes = s.inviterte.includes(id);
      return {
        ...s,
        inviterte: finnes
          ? s.inviterte.filter((x) => x !== id)
          : [...s.inviterte, id],
      };
    });
  }

  function lagre() {
    if (!state.type) {
      setFeilmelding("Mangler type.");
      return;
    }

    const enhetTekst =
      state.enhet === "egendefinert"
        ? state.egenEnhet.trim() || "enhet"
        : state.enhet;

    const beskrivelse = [
      state.beskrivelse.trim(),
      state.malVerdi.trim()
        ? `Mål: ${state.malVerdi.trim()} ${enhetTekst}`
        : "",
    ]
      .filter((s) => s.length > 0)
      .join("\n\n");

    startTransition(async () => {
      try {
        const result = await opprettCustomChallenge({
          name: state.navn,
          description: beskrivelse || null,
          drillId: state.drillId || null,
          endAt: state.endAt || null,
          type: state.type!,
          targetValue: state.malVerdi || null,
          targetUnit: enhetTekst || null,
          inviteUserIds: state.inviterte,
        });

        if (result.ok) {
          toast.success("Utfordring opprettet");
          router.push(`/portal/utfordringer/${result.id}`);
          router.refresh();
        }
      } catch (err) {
        setFeilmelding(
          err instanceof Error ? err.message : "Kunne ikke lagre utfordringen.",
        );
      }
    });
  }

  const filtrerteVenner = useMemo(() => {
    const q = state.vennSok.trim().toLowerCase();
    if (!q) return venner;
    return venner.filter((v) => v.navn.toLowerCase().includes(q));
  }, [venner, state.vennSok]);

  return (
    <div className="space-y-8">
      <StegIndikator aktivt={steg} />

      {feilmelding && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive"
        >
          {feilmelding}
        </div>
      )}

      {steg === 1 && <Steg1 state={state} oppdater={oppdater} />}
      {steg === 2 && <Steg2 state={state} oppdater={oppdater} drills={drills} />}
      {steg === 3 && <Steg3 state={state} oppdater={oppdater} />}
      {steg === 4 && <Steg4 state={state} oppdater={oppdater} />}
      {steg === 5 && (
        <Steg5
          state={state}
          oppdater={oppdater}
          venner={filtrerteVenner}
          toggleInvitert={toggleInvitert}
        />
      )}
      {steg === 6 && (
        <Steg6
          state={state}
          venner={venner}
          drills={drills}
          pending={pending}
          onLagre={lagre}
        />
      )}

      {steg < 6 && (
        <div className="flex items-center justify-between gap-2 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => setSteg((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4 | 5) : s))}
            disabled={steg === 1}
            className="inline-flex h-11 items-center gap-1.5 rounded-md border border-input bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft size={16} strokeWidth={1.75} />
            Tilbake
          </button>
          <button
            type="button"
            onClick={() => setSteg((s) => (s < 6 ? ((s + 1) as 2 | 3 | 4 | 5 | 6) : s))}
            disabled={!kanGåVidere}
            className="inline-flex h-11 items-center gap-1.5 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Videre
            <ArrowRight size={16} strokeWidth={1.75} />
          </button>
        </div>
      )}
    </div>
  );
}

function StegIndikator({ aktivt }: { aktivt: 1 | 2 | 3 | 4 | 5 | 6 }) {
  const titler = ["Tittel", "Type", "Mål", "Frist", "Inviter", "Opprett"];
  return (
    <ol className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
      {titler.map((tittel, i) => {
        const nr = (i + 1) as 1 | 2 | 3 | 4 | 5 | 6;
        const erAktiv = nr === aktivt;
        const erFerdig = nr < aktivt;
        return (
          <li key={tittel} className="flex items-center gap-2">
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full border ${
                erFerdig
                  ? "border-primary bg-primary text-primary-foreground"
                  : erAktiv
                  ? "border-primary text-primary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {erFerdig ? <Check size={12} strokeWidth={2} /> : nr}
            </span>
            <span className={erAktiv ? "text-foreground" : ""}>{tittel}</span>
            {i < titler.length - 1 && <ChevronRight size={12} strokeWidth={1.75} />}
          </li>
        );
      })}
    </ol>
  );
}

// ---------- Steg 1: Tittel + Beskrivelse ----------

function Steg1({
  state,
  oppdater,
}: {
  state: State;
  oppdater: <K extends keyof State>(felt: K, verdi: State[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="challenge-navn" className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Tittel
          </span>
        </label>
        <input
          id="challenge-navn"
          type="text"
          value={state.navn}
          onChange={(e) => oppdater("navn", e.target.value)}
          placeholder="F.eks. «20-fots putts på en uke»"
          maxLength={120}
          className="w-full rounded-md border border-input bg-card px-4 py-2 font-display text-2xl outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <p className="text-xs text-muted-foreground">
          Minst 2 tegn. {state.navn.length}/120.
        </p>
      </div>
      <div className="space-y-2">
        <label htmlFor="challenge-beskrivelse" className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Beskrivelse (valgfri)
          </span>
        </label>
        <textarea
          id="challenge-beskrivelse"
          value={state.beskrivelse}
          onChange={(e) => oppdater("beskrivelse", e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Hva går utfordringen ut på? Hvordan teller scoren?"
          className="w-full rounded-md border border-input bg-card px-4 py-2 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </div>
    </div>
  );
}

// ---------- Steg 2: Type + valgfri drill ----------

function Steg2({
  state,
  oppdater,
  drills,
}: {
  state: State;
  oppdater: <K extends keyof State>(felt: K, verdi: State[K]) => void;
  drills: DrillRef[];
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Type utfordring
        </span>
        <div
          role="radiogroup"
          aria-label="Velg type utfordring"
          className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TYPER.map((t) => {
            const valgt = state.type === t.verdi;
            return (
              <button
                key={t.verdi}
                type="button"
                role="radio"
                aria-checked={valgt}
                onClick={() => oppdater("type", t.verdi)}
                className={`flex items-start gap-2 rounded-lg border p-4 text-left transition-all ${
                  valgt
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                    : `${t.fargeKlasse} hover:border-primary/60`
                }`}
              >
                <span className="rounded-md border border-border bg-card p-2">
                  <t.Icon size={16} strokeWidth={1.75} />
                </span>
                <div>
                  <div className="font-display text-base font-semibold tracking-tight">
                    {t.navn}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t.beskrivelse}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="drill-id" className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Knytt til drill (valgfritt)
          </span>
        </label>
        <select
          id="drill-id"
          value={state.drillId}
          onChange={(e) => oppdater("drillId", e.target.value)}
          className="w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          <option value="">— Fritt format (ingen drill) —</option>
          {drills.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} ({d.pyramidArea})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ---------- Steg 3: Mål-verdi + enhet ----------

function Steg3({
  state,
  oppdater,
}: {
  state: State;
  oppdater: <K extends keyof State>(felt: K, verdi: State[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="mal-verdi" className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Mål-verdi
            </span>
          </label>
          <input
            id="mal-verdi"
            type="text"
            value={state.malVerdi}
            onChange={(e) => oppdater("malVerdi", e.target.value)}
            placeholder="F.eks. 10 eller 65"
            maxLength={40}
            className="w-full rounded-md border border-input bg-card px-4 py-2.5 font-mono text-sm tabular-nums outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="enhet" className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Enhet
            </span>
          </label>
          <select
            id="enhet"
            value={state.enhet}
            onChange={(e) => oppdater("enhet", e.target.value as Enhet)}
            className="w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
          >
            {ENHETER.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>
      {state.enhet === "egendefinert" && (
        <div className="space-y-2">
          <label htmlFor="egen-enhet" className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Egendefinert enhet
            </span>
          </label>
          <input
            id="egen-enhet"
            type="text"
            value={state.egenEnhet}
            onChange={(e) => oppdater("egenEnhet", e.target.value)}
            placeholder="F.eks. «runder» eller «pizza»"
            maxLength={40}
            className="w-full rounded-md border border-input bg-card px-4 py-2.5 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
      )}
    </div>
  );
}

// ---------- Steg 4: Tidsfrist ----------

function Steg4({
  state,
  oppdater,
}: {
  state: State;
  oppdater: <K extends keyof State>(felt: K, verdi: State[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="end-at" className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Sluttdato (valgfri)
          </span>
        </label>
        <input
          id="end-at"
          type="datetime-local"
          value={state.endAt}
          onChange={(e) => oppdater("endAt", e.target.value)}
          className="w-full rounded-md border border-input bg-card px-4 py-2.5 font-mono text-sm tabular-nums outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <p className="text-xs text-muted-foreground">
          La stå tom for åpen tidsramme — du kan avslutte utfordringen manuelt
          når som helst.
        </p>
      </div>
    </div>
  );
}

// ---------- Steg 5: Inviter venner ----------

function Steg5({
  state,
  oppdater,
  venner,
  toggleInvitert,
}: {
  state: State;
  oppdater: <K extends keyof State>(felt: K, verdi: State[K]) => void;
  venner: Venn[];
  toggleInvitert: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="venn-sok" className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Inviter venner (valgfritt)
          </span>
        </label>
        <div className="relative">
          <Search
            size={14}
            strokeWidth={1.75}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="venn-sok"
            type="text"
            value={state.vennSok}
            onChange={(e) => oppdater("vennSok", e.target.value)}
            placeholder="Søk i venneliste"
            className="w-full rounded-md border border-input bg-card py-2.5 pl-8 pr-4 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      {venner.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
          <Users
            size={20}
            strokeWidth={1.5}
            className="mx-auto mb-2 text-muted-foreground"
          />
          <p className="text-sm text-muted-foreground">
            {state.vennSok
              ? "Ingen venner matcher søket."
              : "Ingen venner registrert enda. Du kan opprette utfordringen og dele lenken etterpå."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {venner.map((v) => {
            const valgt = state.inviterte.includes(v.id);
            return (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => toggleInvitert(v.id)}
                  aria-pressed={valgt}
                  className={`flex w-full items-center justify-between gap-2 rounded-md border p-4 text-left transition-all ${
                    valgt
                      ? "border-primary bg-primary/10"
                      : "border-input hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary font-mono text-xs font-semibold uppercase">
                      {v.navn
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <span className="text-sm">{v.navn}</span>
                  </div>
                  {valgt && (
                    <Check size={14} strokeWidth={2} className="text-primary" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {state.inviterte.length > 0 && (
        <p className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {state.inviterte.length} venn{state.inviterte.length === 1 ? "" : "er"}{" "}
          valgt
        </p>
      )}
    </div>
  );
}

// ---------- Steg 6: Opprett ----------

function Steg6({
  state,
  venner,
  drills,
  pending,
  onLagre,
}: {
  state: State;
  venner: Venn[];
  drills: DrillRef[];
  pending: boolean;
  onLagre: () => void;
}) {
  const type = state.type ? TYPER.find((t) => t.verdi === state.type)! : null;
  const drill = state.drillId
    ? drills.find((d) => d.id === state.drillId)
    : null;
  const valgteVenner = venner.filter((v) => state.inviterte.includes(v.id));
  const enhet =
    state.enhet === "egendefinert"
      ? state.egenEnhet || "enhet"
      : state.enhet;
  const slutt = state.endAt
    ? new Date(state.endAt).toLocaleString("nb-NO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Forhåndsvisning
        </div>
        <h2 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight">
          {state.navn || (
            <em className="text-muted-foreground">(uten navn)</em>
          )}
        </h2>
        {type && (
          <span
            className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-4 py-1 text-xs ${type.fargeKlasse}`}
          >
            <type.Icon size={12} strokeWidth={1.75} />
            {type.navn}
          </span>
        )}
        {state.beskrivelse && (
          <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
            {state.beskrivelse}
          </p>
        )}

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
          {state.malVerdi && (
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Mål
              </dt>
              <dd className="mt-1 font-mono text-sm font-semibold tabular-nums">
                {state.malVerdi} {enhet}
              </dd>
            </div>
          )}
          {drill && (
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Drill
              </dt>
              <dd className="mt-1 text-sm">{drill.name}</dd>
            </div>
          )}
          {slutt && (
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Slutter
              </dt>
              <dd className="mt-1 font-mono text-sm tabular-nums">{slutt}</dd>
            </div>
          )}
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Invitert
            </dt>
            <dd className="mt-1 text-sm">
              {valgteVenner.length === 0
                ? "Ingen"
                : valgteVenner.map((v) => v.navn).join(", ")}
            </dd>
          </div>
        </dl>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onLagre}
          disabled={pending}
          className="inline-flex h-11 items-center gap-1.5 rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 size={14} strokeWidth={1.75} className="animate-spin" />
          ) : (
            <Save size={14} strokeWidth={1.75} />
          )}
          Opprett utfordring
        </button>
      </div>
    </div>
  );
}

