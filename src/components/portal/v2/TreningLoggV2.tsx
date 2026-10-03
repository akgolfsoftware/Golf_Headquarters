"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SgCategory } from "@/generated/prisma/client";
import { Knapp } from "@/components/precision/pa";

const OMRAADER: { value: SgCategory; label: string }[] = [
  { value: "OTT", label: "Tee-slag" },
  { value: "APP", label: "Innspill" },
  { value: "ARG", label: "Nærspill" },
  { value: "PUTT", label: "Putting" },
];

export function TreningLoggV2() {
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
      router.push("/portal/gjennomfore?lagret=trening");
    } catch {
      setFeil("Noe gikk galt. Prøv igjen.");
    } finally {
      setLagrer(false);
    }
  }

  return (
    <form className="ph26l" onSubmit={handleSubmit}>
      <header>
        <p>PlayerHQ · Trening</p>
        <h1>Logg treningsøkt</h1>
      </header>
      <section className="pa-card ph26l-kort">
        <label>Dato<input type="date" max={today} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value > today ? today : e.target.value }))} /></label>
        <fieldset>
          <legend>Område</legend>
          <div>
            {OMRAADER.map((o) => (
              <button key={o.value} type="button" aria-pressed={form.sgArea === o.value} onClick={() => setForm((f) => ({ ...f, sgArea: o.value }))}>{o.label}</button>
            ))}
          </div>
        </fieldset>
        <label>Varighet · {form.minutes} min
          <input type="range" min={5} max={240} step={5} value={form.minutes} onChange={(e) => setForm((f) => ({ ...f, minutes: Number(e.target.value) }))} />
        </label>
        <label>Drill / øvelse (valgfritt)
          <input value={form.drillName} placeholder="F.eks. Clock drill, Gate drill" maxLength={100} onChange={(e) => setForm((f) => ({ ...f, drillName: e.target.value.slice(0, 100) }))} />
        </label>
        <fieldset>
          <legend>Kvalitet: {form.quality}/5</legend>
          <div>
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" aria-pressed={form.quality === n} onClick={() => setForm((f) => ({ ...f, quality: n }))}>{n}</button>
            ))}
          </div>
        </fieldset>
        <label>Notater (valgfritt)
          <textarea rows={3} maxLength={500} placeholder="Hva jobbet du med? Hva gikk bra?" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value.slice(0, 500) }))} />
        </label>
      </section>
      {feil && <p role="alert">{feil}</p>}
      <Knapp type="submit" fullWidth loading={lagrer} disabled={lagrer}>{lagrer ? "Lagrer…" : "Lagre økt"}</Knapp>
    </form>
  );
}
