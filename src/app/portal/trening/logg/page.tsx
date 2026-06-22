"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SgCategory } from "@/generated/prisma/client";

// String-literaler (ikke verdi-import fra Prisma-klienten) — denne client-
// komponenten må ikke dra Node-moduler inn i nettleser-bundelen.
const OMRAADER: { value: SgCategory; label: string }[] = [
  { value: "OTT", label: "Off the tee" },
  { value: "APP", label: "Approach" },
  { value: "ARG", label: "Around green" },
  { value: "PUTT", label: "Putting" },
];

export default function TreningLoggPage() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    date: today,
    sgArea: "OTT" as SgCategory,
    minutes: 30,
    drillName: "",
    quality: 3,
    notes: "",
  });
  const [lagrer, setLagrer] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLagrer(true);
    setFeil(null);
    try {
      const res = await fetch("/api/portal/trening/logg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          drillName: form.drillName || undefined,
          notes: form.notes || undefined,
        }),
      });
      if (!res.ok) throw new Error("Kunne ikke lagre");
      router.push("/portal/gjennomfore");
    } catch {
      setFeil("Noe gikk galt. Prøv igjen.");
    } finally {
      setLagrer(false);
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-md">
      <h1 className="font-display text-[28px] font-bold leading-[1.1] tracking-tight mb-6">
        Logg treningsøkt
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Dato</label>
          <input
            type="date"
            value={form.date}
            max={today}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="w-full border rounded px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Område</label>
          <div className="grid grid-cols-2 gap-2">
            {OMRAADER.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, sgArea: o.value }))}
                className={`border rounded px-3 py-2 text-sm font-medium transition-colors ${
                  form.sgArea === o.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Varighet: {form.minutes} min
          </label>
          <input
            type="range"
            min={5}
            max={240}
            step={5}
            value={form.minutes}
            onChange={(e) =>
              setForm((f) => ({ ...f, minutes: Number(e.target.value) }))
            }
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5 min</span>
            <span>240 min</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Drill / øvelse (valgfritt)
          </label>
          <input
            type="text"
            value={form.drillName}
            onChange={(e) =>
              setForm((f) => ({ ...f, drillName: e.target.value }))
            }
            placeholder="F.eks. Clock drill, Gate drill"
            className="w-full border rounded px-3 py-2 text-sm"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Kvalitet: {form.quality}/5
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setForm((f) => ({ ...f, quality: n }))}
                className={`flex-1 border rounded py-2 text-sm font-medium transition-colors ${
                  form.quality === n
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Notater (valgfritt)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="w-full border rounded px-3 py-2 text-sm"
            rows={3}
            maxLength={500}
            placeholder="Hva jobbet du med? Hva gikk bra?"
          />
        </div>

        {feil && <p className="text-sm text-destructive">{feil}</p>}

        <button
          type="submit"
          disabled={lagrer}
          className="w-full bg-primary text-primary-foreground rounded px-4 py-2 font-medium disabled:opacity-50"
        >
          {lagrer ? "Lagrer..." : "Lagre økt"}
        </button>
      </form>
    </div>
  );
}
