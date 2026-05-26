"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
    <form
      onSubmit={lagre}
      className="space-y-6 rounded-lg border border-border bg-card p-6"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        Min utstyrsbag
      </span>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>

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

      {feil && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {feil}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {pending ? "Lagrer…" : "Lagre utstyrsbag"}
        </button>
        {onAvbryt && (
          <button
            type="button"
            onClick={onAvbryt}
            disabled={pending}
            className="rounded-md border border-border bg-card px-6 py-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
          >
            Avbryt
          </button>
        )}
        {lagret && (
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
            Lagret ✓
          </span>
        )}
      </div>
    </form>
  );
}

const input =
  "w-full rounded-md border border-input bg-card px-4 py-2 text-sm text-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus:border-ring focus:ring-2 focus:ring-ring/30";

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
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </span>
        {hint && (
          <span className="text-[10px] text-muted-foreground/70">{hint}</span>
        )}
      </span>
      {children}
    </label>
  );
}
