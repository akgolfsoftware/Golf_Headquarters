"use client";
import { TL } from "@/lib/v2/train-lock";
/**
 * PlayerHQ · Logg treningsøkt — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SgCategory } from "@/generated/prisma/client";
import { Caps, Tittel, Kort, Knapp, PillVelger, Glider, Inndata, TekstOmraade, HjelpTips } from "@/components/v2";
// String-literaler (ikke verdi-import fra Prisma-klienten) — denne client-
// komponenten må ikke dra Node-moduler inn i nettleser-bundelen.
// Ordbok-kanon (docs/ordbok.json §sg.kategorier): norsk klarspråk i spiller-UI.
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
    <div style={{ maxWidth: 560, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <Caps>PlayerHQ · Trening</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="treningsøkt">Logg</Tittel>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Kort eyebrow="Økten">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Inndata
              label="Dato"
              type="date"
              mono
              value={form.date}
              onChange={(v) => {
                // Samme regel som legacy (max=today): aldri fremtidige datoer.
                const trygg = v > today ? today : v;
                setForm((f) => ({ ...f, date: trygg }));
              }}
            />

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                <span style={{ fontFamily: TL.font.sans, fontSize: 12, fontWeight: 600, color: TL.mute }}>Område</span>
                <HjelpTips k="sgOmrade" size={11} />
              </div>
              <PillVelger
                options={OMRAADER.map((o) => ({ v: o.value, l: o.label }))}
                value={form.sgArea}
                onChange={(v) => setForm((f) => ({ ...f, sgArea: v as SgCategory }))}
              />
            </div>

            <Glider
              label="Varighet"
              min={5}
              max={240}
              step={5}
              value={form.minutes}
              enhet="min"
              onChange={(n) => setForm((f) => ({ ...f, minutes: n }))}
            />

            <Inndata
              label="Drill / øvelse (valgfritt)"
              value={form.drillName}
              placeholder="F.eks. Clock drill, Gate drill"
              onChange={(v) => setForm((f) => ({ ...f, drillName: v.slice(0, 100) }))}
            />

            <div>
              <span style={{ fontFamily: TL.font.sans, fontSize: 12, fontWeight: 600, color: TL.mute, display: "block", marginBottom: 7 }}>
                Kvalitet: {form.quality}/5
              </span>
              <PillVelger
                options={[1, 2, 3, 4, 5].map((n) => ({ v: String(n), l: String(n) }))}
                value={String(form.quality)}
                onChange={(v) => setForm((f) => ({ ...f, quality: Number(v) }))}
              />
            </div>

            <TekstOmraade
              label="Notater (valgfritt)"
              value={form.notes}
              rows={3}
              placeholder="Hva jobbet du med? Hva gikk bra?"
              onChange={(v) => setForm((f) => ({ ...f, notes: v.slice(0, 500) }))}
            />
          </div>
        </Kort>

        {feil && (
          <p role="alert" style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.danger, margin: 0 }}>
            {feil}
          </p>
        )}

        <Knapp type="submit" full disabled={lagrer} icon="check">
          {lagrer ? "Lagrer…" : "Lagre økt"}
        </Knapp>
      </form>
    </div>
  );
}
