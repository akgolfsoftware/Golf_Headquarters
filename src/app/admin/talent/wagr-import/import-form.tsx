"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { importerWagrSpiller } from "./actions";

type Spiller = { id: string; name: string; email: string };

type Props = {
  spillere: Spiller[];
};

export function ImportForm({ spillere }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [resultat, setResultat] = useState<
    | { ok: true; userLinked: boolean }
    | { ok: false; feil: string }
    | null
  >(null);

  const [form, setForm] = useState({
    wagrUrl: "",
    fullName: "",
    country: "no",
    rank: "",
    ptsAvg: "",
    divisor: "",
    wins: "",
    top10s: "",
    bestRank: "",
    linkUserEmail: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setResultat(null);

    startTransition(async () => {
      const result = await importerWagrSpiller({
        wagrUrl: form.wagrUrl,
        fullName: form.fullName,
        country: form.country,
        rank: parseInt(form.rank, 10),
        ptsAvg: parseFloat(form.ptsAvg.replace(",", ".")),
        divisor: parseFloat(form.divisor.replace(",", ".") || "1"),
        wins: form.wins ? parseInt(form.wins, 10) : 0,
        top10s: form.top10s ? parseInt(form.top10s, 10) : 0,
        bestRank: form.bestRank ? parseInt(form.bestRank, 10) : undefined,
        linkUserEmail: form.linkUserEmail || undefined,
      });

      setResultat(result);

      if (result.ok) {
        // Reset form og naviger til benchmark-side etter 1.5s
        setTimeout(() => {
          router.push("/admin/talent/wagr-benchmark");
          router.refresh();
        }, 1500);
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-lg border border-border bg-card p-6 sm:p-8"
    >
      <h2 className="font-display text-lg font-semibold tracking-tight">
        Spillerdata
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="WAGR-URL eller slug"
          required
          hint="https://www.wagr.com/playerprofile/mathias-aase-41993"
        >
          <input
            type="text"
            required
            value={form.wagrUrl}
            onChange={(e) => setForm({ ...form, wagrUrl: e.target.value })}
            placeholder="playerprofile/..."
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-ring"
          />
        </Field>

        <Field label="Fullt navn" required>
          <input
            type="text"
            required
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            placeholder="Mathias Aase"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
        </Field>

        <Field label="Land (ISO 2-bokstav)" required hint="no, us, gb, ...">
          <input
            type="text"
            required
            maxLength={2}
            value={form.country}
            onChange={(e) =>
              setForm({ ...form, country: e.target.value.toLowerCase() })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
        </Field>

        <Field label="WAGR Rank" required>
          <input
            type="number"
            required
            min={1}
            value={form.rank}
            onChange={(e) => setForm({ ...form, rank: e.target.value })}
            placeholder="697"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
        </Field>

        <Field label="Pts Avg" required hint="Kan ha desimal: 504,1956">
          <input
            type="text"
            required
            value={form.ptsAvg}
            onChange={(e) => setForm({ ...form, ptsAvg: e.target.value })}
            placeholder="504,1956"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
        </Field>

        <Field label="Divisor" required>
          <input
            type="text"
            required
            value={form.divisor}
            onChange={(e) => setForm({ ...form, divisor: e.target.value })}
            placeholder="23,0754"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
        </Field>

        <Field label="Wins (valgfritt)">
          <input
            type="number"
            min={0}
            value={form.wins}
            onChange={(e) => setForm({ ...form, wins: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
        </Field>

        <Field label="Top 10-plasseringer (valgfritt)">
          <input
            type="number"
            min={0}
            value={form.top10s}
            onChange={(e) => setForm({ ...form, top10s: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
        </Field>

        <Field label="Beste rank (valgfritt)">
          <input
            type="number"
            min={1}
            value={form.bestRank}
            onChange={(e) => setForm({ ...form, bestRank: e.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          />
        </Field>

        <Field
          label="Koble til AK Golf-spiller (valgfritt)"
          hint="Email matches mot User i basen"
        >
          <select
            value={form.linkUserEmail}
            onChange={(e) =>
              setForm({ ...form, linkUserEmail: e.target.value })
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
          >
            <option value="">Ikke koble</option>
            {spillere.map((s) => (
              <option key={s.id} value={s.email}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </Field>
      </div>

      {resultat && !resultat.ok && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4"
        >
          <AlertCircle
            size={18}
            strokeWidth={1.75}
            className="mt-0.5 shrink-0 text-destructive"
          />
          <p className="text-sm text-destructive">{resultat.feil}</p>
        </div>
      )}

      {resultat?.ok && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-md border border-primary/30 bg-primary/10 p-4"
        >
          <CheckCircle2
            size={18}
            strokeWidth={1.75}
            className="mt-0.5 shrink-0 text-primary"
          />
          <p className="text-sm text-foreground">
            Snapshot lagret
            {resultat.userLinked && " og koblet til AK Golf-spiller"}. Sender
            deg til benchmark-siden...
          </p>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <a
          href="https://www.wagr.com/mens-ranking"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          Åpne wagr.com
          <ExternalLink size={12} strokeWidth={1.75} />
        </a>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {pending ? "Lagrer..." : "Lagre snapshot"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      )}
    </label>
  );
}
