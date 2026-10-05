"use client";

/**
 * PlayerHQ · Logg treningsøkt — Precision Athletics.
 * Skjema for registrering av gjennomført økt med dato, område, varighet, øvelse, kvalitet og notater.
 * Lagringen går via POST /api/portal/trening/logg med redirect til /portal/gjennomfore?lagret=trening.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SgCategory } from "@/generated/prisma/client";

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
      setFeil("Noe gikk galt under lagring. Prøv igjen.");
    } finally {
      setLagrer(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="ph26l-form">
      <div className="ph26l-felt">
        <label htmlFor="logg-dato" className="ph26l-label">Dato</label>
        <input
          id="logg-dato"
          type="date"
          className="ph26l-input ph26l-mono"
          value={form.date}
          max={today}
          onChange={(e) => {
            const v = e.target.value;
            const trygg = v > today ? today : v;
            setForm((f) => ({ ...f, date: trygg }));
          }}
          required
        />
      </div>

      <div className="ph26l-felt">
        <span className="ph26l-label">Område</span>
        <div className="ph26l-pills" role="radiogroup" aria-label="Område">
          {OMRAADER.map((o) => {
            const valgt = form.sgArea === o.value;
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={valgt}
                data-valgt={valgt}
                className="ph26l-pill"
                onClick={() => setForm((f) => ({ ...f, sgArea: o.value }))}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="ph26l-felt">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label htmlFor="logg-varighet" className="ph26l-label">Varighet</label>
          <span className="ph26l-slider-verdi">{form.minutes} min</span>
        </div>
        <div className="ph26l-slider-wrap">
          <input
            id="logg-varighet"
            type="range"
            min={5}
            max={240}
            step={5}
            value={form.minutes}
            className="ph26l-slider"
            onChange={(e) => setForm((f) => ({ ...f, minutes: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div className="ph26l-felt">
        <label htmlFor="logg-drill" className="ph26l-label">
          Drill / øvelse <small>(valgfritt)</small>
        </label>
        <input
          id="logg-drill"
          type="text"
          className="ph26l-input"
          placeholder="F.eks. Clock drill, Gate drill"
          maxLength={100}
          value={form.drillName}
          onChange={(e) => setForm((f) => ({ ...f, drillName: e.target.value }))}
        />
      </div>

      <div className="ph26l-felt">
        <span className="ph26l-label">Kvalitet: {form.quality}/5</span>
        <div className="ph26l-pills" role="radiogroup" aria-label="Kvalitet">
          {[1, 2, 3, 4, 5].map((n) => {
            const valgt = form.quality === n;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={valgt}
                data-valgt={valgt}
                className="ph26l-pill"
                onClick={() => setForm((f) => ({ ...f, quality: n }))}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      <div className="ph26l-felt">
        <label htmlFor="logg-notater" className="ph26l-label">
          Notater <small>(valgfritt)</small>
        </label>
        <textarea
          id="logg-notater"
          className="ph26l-textarea"
          rows={3}
          maxLength={500}
          placeholder="Hva jobbet du med? Hva gikk bra?"
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>

      {feil && (
        <p role="alert" className="ph26l-feil">
          {feil}
        </p>
      )}

      <div className="ph26l-handlinger">
        <button type="submit" disabled={lagrer} className="ph26l-submit">
          {lagrer ? "Lagrer…" : "Lagre økt"}
        </button>
        <Link href="/portal/gjennomfore" className="ph26l-avbryt">
          Avbryt
        </Link>
      </div>
    </form>
  );
}
