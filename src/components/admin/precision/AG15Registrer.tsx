"use client";

/**
 * AG-15 Registrer test (designløftet 20.10.2026). Fasit: canvaset «AgencyOS
 * nøkkelskjermer», tavlene Registrer og Registrer-mobil (godkjent 20.10).
 *
 * Coachen fører én spiller om gangen på en stasjon: ett felt per slag etter
 * protokollen, poeng eller resultat underveis, «Lagre utkast» og «Lagre og ta neste
 * spiller». Lagringen er saveTnTestSomCoach: serveren bestemmer spiller, protokoll
 * og antall slag, og sjekker at coachen er trener for gruppa og at testen er en
 * trener kan føre. Det coachen fører er kontrollert med en gang.
 */
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { saveTnTestSomCoach } from "@/app/team-norway/tn-testforing-actions";
import { tnFormat, tnScore, tnValidate, type TnValues } from "@/lib/portal-tester/tn-scoring";
import { GATE_POENG_VALG, GATE_POENG_IDS } from "@/lib/portal-tester/tn-catalog";
import type { RegistreringData } from "@/lib/admin/tester/testdag-data";
import "@/styles/agencyos-ny-testdag.css";

const STATUS: Record<string, string> = { PENDING: "Venter", DONE: "Lagret", SKIPPED: "Hoppet over", ABSENT: "Ikke møtt" };

export function AG15Registrer({ d }: { d: RegistreringData }) {
  const router = useRouter();
  const p = d.protokoll;
  const [values, setValues] = useState<TnValues>(d.utkast?.values ?? {});
  const [revision, setRevision] = useState(d.utkast?.revision ?? 0);
  const [notes, setNotes] = useState(d.utkast?.notes ?? "");
  const [feil, setFeil] = useState<string | null>(null);
  const [melding, setMelding] = useState<string | null>(null);
  const [venter, start] = useTransition();
  const laast = d.status !== "PENDING" || !d.testdag.aktiv;
  const tilbake = d.testdag.eventId ? `/admin/tester/testdag/${d.testdag.eventId}` : "/admin/tester";

  const sett = (rad: number, key: string, v: string | number | null) => {
    setMelding(null);
    setValues((s) => {
      const r = { ...(s[String(rad + 1)] ?? {}) };
      if (v === null || v === "") delete r[key]; else r[key] = v;
      const n = { ...s };
      if (Object.keys(r).length) n[String(rad + 1)] = r; else delete n[String(rad + 1)];
      return n;
    });
  };

  const fort = p.rows.filter((r, i) => r.fields.every((f) => f.optional || f.requiredUnless || values[String(i + 1)]?.[f.key] != null)).length;
  const komplett = useMemo(() => tnValidate(p, values, true) === null, [p, values]);
  const resultat = useMemo(() => {
    if (komplett) { try { return tnFormat(tnScore(p, values).metrics[0]); } catch { return null; } }
    if ((GATE_POENG_IDS as readonly string[]).includes(p.id)) {
      const sum = p.rows.reduce((a, _, i) => a + (GATE_POENG_VALG[values[String(i + 1)]?.ok as keyof typeof GATE_POENG_VALG] ?? 0), 0);
      return `${sum} / ${4 * p.rows.length} p så langt`;
    }
    return null;
  }, [komplett, p, values]);

  const lagre = (intent: "draft" | "complete") => start(async () => {
    setFeil(null); setMelding(null);
    const r = await saveTnTestSomCoach({ testDayParticipantId: d.deltakerId, revision, values, notes, intent });
    if (!r.ok) { setFeil(r.error); return; }
    setRevision(r.revision);
    if (intent === "draft") { setMelding("Utkastet er lagret."); return; }
    router.push(d.nesteId ? `/admin/tester/registrer/${d.nesteId}` : tilbake);
    router.refresh();
  });

  return <div className="agn-s tdg">
    <Link href={tilbake} className="ag-tilbake"><ChevronLeft className="ikon" aria-hidden />{d.testdag.eventId ? "Testdagen" : "Tester"}</Link>
    <header className="tdg-topp">
      <span className="meta">Teknikk og PEI · {d.testdag.tittel}</span>
      <h1>{p.name}</h1>
      <p className="tdg-ingress">{p.rows.length} slag. Du fører Teknikk- og PEI-testene; det du fører er kontrollert med en gang.</p>
    </header>
    <div className="tdg-to">
      <div className="tdg-skjema">
        <section aria-label="Slagene" className="tdg-slag">
          <div className="tdg-sek-topp"><h2>{d.spiller}</h2><span className="num">{fort} / {p.rows.length} slag ført</span></div>
          {resultat && <p className="tdg-sum num">{resultat}</p>}
          {d.resultat && laast && <p className="tdg-sum num">Lagret: {d.resultat}</p>}
          <ol className="tdg-rader">
            {p.rows.map((rad, i) => <li key={i} className="tdg-slagrad">
              <span className="tdg-slag-nr num">{i + 1}</span>
              <span className="tdg-slag-tekst">{rad.label}</span>
              <span className="tdg-felter">
                {rad.fields.map((f) => f.choices
                  ? <span key={f.key} role="group" aria-label={`Slag ${i + 1}: ${f.label}`} className="tdg-knapper">
                    {f.choices.map((c) => <button key={c} type="button" disabled={laast} aria-pressed={values[String(i + 1)]?.[f.key] === c}
                      onClick={() => sett(i, f.key, values[String(i + 1)]?.[f.key] === c ? null : c)}>{c}</button>)}
                  </span>
                  : <label key={f.key} className="tdg-tall"><span>{f.label}{f.unit ? ` (${f.unit})` : ""}</span>
                    <input type="text" inputMode="decimal" disabled={laast} value={values[String(i + 1)]?.[f.key] ?? ""}
                      onChange={(e) => { const t = e.target.value.replace(",", "."); sett(i, f.key, t === "" ? null : Number.isFinite(Number(t)) ? Number(t) : null); }} /></label>)}
              </span>
            </li>)}
          </ol>
          <label className="tdg-felt"><span className="etikett">Notat (valgfritt)</span><textarea rows={2} maxLength={2000} disabled={laast} value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
          {feil && <p className="feiltekst" role="alert">{feil}</p>}
          {melding && <p className="tdg-forklar" role="status">{melding}</p>}
          {!laast && <div className="tdg-handlinger">
            <button type="button" className="knapp pri stor" disabled={venter || !komplett} onClick={() => lagre("complete")}>{venter ? "Lagrer …" : d.nesteId ? "Lagre og ta neste spiller" : "Lagre"}</button>
            <button type="button" className="knapp sek" disabled={venter} onClick={() => lagre("draft")}>Lagre utkast</button>
          </div>}
          {laast && <p className="tdg-forklar">{!d.testdag.aktiv ? "Testdagen er avsluttet." : `Status: ${STATUS[d.status]}.`}</p>}
        </section>
      </div>
      <aside className="tdg-oppsummering" aria-label="Spillere på stasjonen">
        <span className="meta">Spillere på stasjonen</span>
        <div className="tdg-liste">
          {d.andre.map((x) => <Link key={x.id} href={`/admin/tester/registrer/${x.id}`} aria-current={x.id === d.deltakerId ? "true" : undefined} className="tdg-linje">
            <b>{x.spiller}</b><span className="num">{STATUS[x.status]}</span>
          </Link>)}
        </div>
      </aside>
    </div>
  </div>;
}
