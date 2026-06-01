"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Save } from "lucide-react";
import { lagreUtstyrsbag, type UtstyrsbagInput } from "./actions";

type Props = {
  initial: UtstyrsbagInput;
  onAvbryt?: () => void;
};

const FELT_MAX = 200;

export function UtstyrsbagForm({ initial, onAvbryt }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [lagret, setLagret] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  const [driver, setDriver] = useState(initial.driver ?? "");
  const [fairwayWoods, setFairwayWoods] = useState(initial.fairwayWoods ?? "");
  const [hybrids, setHybrids] = useState(initial.hybrids ?? "");
  const [irons, setIrons] = useState(initial.irons ?? "");
  const [wedges, setWedges] = useState(initial.wedges ?? "");
  const [putter, setPutter] = useState(initial.putter ?? "");
  const [ball, setBall] = useState(initial.ball ?? "");
  const [bag, setBag] = useState(initial.bag ?? "");
  const [notes, setNotes] = useState(initial.notes ?? "");

  function lagre(e: React.FormEvent) {
    e.preventDefault();
    setFeil(null);

    const felter = {
      driver,
      fairwayWoods,
      hybrids,
      irons,
      wedges,
      putter,
      ball,
      bag,
      notes,
    };
    for (const [navn, verdi] of Object.entries(felter)) {
      if (verdi.length > FELT_MAX) {
        setFeil(`Feltet "${navn}" er for langt (maks ${FELT_MAX} tegn).`);
        return;
      }
    }

    startTransition(async () => {
      try {
        await lagreUtstyrsbag(felter);
        setLagret(true);
        router.refresh();
        setTimeout(() => setLagret(false), 1500);
      } catch (err) {
        setFeil(err instanceof Error ? err.message : "Kunne ikke lagre.");
      }
    });
  }

  return (
    <form onSubmit={lagre} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-card p-4">
        <Felt label="Driver" hint="Merke + modell + loft">
          <input
            type="text"
            value={driver}
            onChange={(e) => setDriver(e.target.value)}
            placeholder="f.eks. TaylorMade Qi10 9°"
            maxLength={FELT_MAX}
            className={input}
          />
        </Felt>
        <Felt label="Fairway-køller" hint="3- og 5-wood, evt. mini">
          <input
            type="text"
            value={fairwayWoods}
            onChange={(e) => setFairwayWoods(e.target.value)}
            placeholder="f.eks. TaylorMade Qi10 3W + 5W"
            maxLength={FELT_MAX}
            className={input}
          />
        </Felt>
        <Felt label="Hybrider" hint="Hybrid-modeller">
          <input
            type="text"
            value={hybrids}
            onChange={(e) => setHybrids(e.target.value)}
            placeholder="f.eks. Ping G430 22°"
            maxLength={FELT_MAX}
            className={input}
          />
        </Felt>
        <Felt label="Jernsett" hint="Modell + spennvidde">
          <input
            type="text"
            value={irons}
            onChange={(e) => setIrons(e.target.value)}
            placeholder="f.eks. Mizuno JPX925 5–PW"
            maxLength={FELT_MAX}
            className={input}
          />
        </Felt>
        <Felt label="Wedger" hint="Loft og grind">
          <input
            type="text"
            value={wedges}
            onChange={(e) => setWedges(e.target.value)}
            placeholder="f.eks. Vokey 50/54/58"
            maxLength={FELT_MAX}
            className={input}
          />
        </Felt>
        <Felt label="Putter" hint="Modell + lengde">
          <input
            type="text"
            value={putter}
            onChange={(e) => setPutter(e.target.value)}
            placeholder="f.eks. Scotty Cameron Newport 34″"
            maxLength={FELT_MAX}
            className={input}
          />
        </Felt>
        <Felt label="Ball" hint="Modell">
          <input
            type="text"
            value={ball}
            onChange={(e) => setBall(e.target.value)}
            placeholder="f.eks. Titleist Pro V1"
            maxLength={FELT_MAX}
            className={input}
          />
        </Felt>
        <Felt label="Bag" hint="Stativ, cart, tour-bag">
          <input
            type="text"
            value={bag}
            onChange={(e) => setBag(e.target.value)}
            placeholder="f.eks. Sun Mountain C-130"
            maxLength={FELT_MAX}
            className={input}
          />
        </Felt>
        <Felt label="Notater" hint="Skaft, grep, fitting-data">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="f.eks. Project X 6.0 i jernsett, Golf Pride MCC grep"
            maxLength={FELT_MAX}
            rows={4}
            className={`${input} resize-y`}
          />
        </Felt>
      </div>

      {feil && (
        <div className="rounded-[12px] border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-[13px] text-destructive">
          {feil}
        </div>
      )}

      {/* lagre-bar */}
      <div className="sticky bottom-0 flex items-center gap-2.5 rounded-[14px] border border-border bg-secondary px-4 py-3">
        <span className="inline-flex flex-1 items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.04em] text-muted-foreground">
          {pending ? (
            <>
              <Loader2 className="h-[13px] w-[13px] animate-spin" strokeWidth={2} aria-hidden />
              Lagrer …
            </>
          ) : lagret ? (
            <>
              <Check className="h-[13px] w-[13px] text-primary" strokeWidth={2} aria-hidden />
              Lagret
            </>
          ) : (
            "Alle felter er valgfrie"
          )}
        </span>
        {onAvbryt && (
          <button
            type="button"
            onClick={onAvbryt}
            disabled={pending}
            className="inline-flex h-[46px] items-center rounded-[12px] px-4 font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            Avbryt
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-[46px] items-center gap-2 rounded-[12px] bg-primary px-5 font-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-accent transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          {pending ? "Lagrer" : "Lagre"}
        </button>
      </div>
    </form>
  );
}

const input =
  "w-full rounded-[11px] border border-input bg-card px-3.5 py-2.5 text-[15px] text-foreground outline-none transition-colors focus-visible:outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function Felt({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </span>
        {hint && (
          <span className="font-mono text-[9px] tracking-[0.02em] text-muted-foreground/70">
            {hint}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}
