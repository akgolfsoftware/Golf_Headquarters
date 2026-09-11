"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { lagreSpillerVurdering } from "@/app/portal/(fullscreen)/live/[sessionId]/actions";

type Props = {
  sessionId: string;
  eksisterende?: { kvalitet: number; nesteFokus: string; folelse?: string | null; rpe?: number | null } | null;
};

/** Valgt PH-06: bevart vurdering som utfoldbar tilleggsinformasjon. */
export function SpillerVurderingForm({ sessionId, eksisterende }: Props) {
  const id = useId();
  const [kvalitet, setKvalitet] = useState(eksisterende?.kvalitet ?? 0);
  const [rpe, setRpe] = useState(eksisterende?.rpe ?? 0);
  const [nesteFokus, setNesteFokus] = useState(eksisterende?.nesteFokus ?? "");
  const [folelse, setFolelse] = useState(eksisterende?.folelse ?? "");
  const [lagret, setLagret] = useState(Boolean(eksisterende));
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const saving = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const savedRef = useRef<HTMLParagraphElement>(null);
  const submitted = useRef(false);
  useEffect(() => { if (feil) errorRef.current?.focus(); }, [feil]);
  useEffect(() => { if (lagret && submitted.current) savedRef.current?.focus(); }, [lagret]);

  function onSubmit() {
    if (saving.current) return;
    if (kvalitet < 1 || rpe < 1) {
      setFeil(kvalitet < 1 ? "Velg kvalitet 1–5." : "Velg hvor hard økta var (1–10).");
      return;
    }
    saving.current = true;
    setFeil(null);
    startTransition(async () => {
      try {
        const res = await lagreSpillerVurdering(sessionId, { kvalitet, nesteFokus, folelse: folelse || undefined, rpe });
        if (!res.ok) {
          setFeil(res.error ?? "Kunne ikke lagre vurderingen. Feltene er bevart — prøv igjen.");
          return;
        }
        submitted.current = true;
        setLagret(true);
      } catch {
        setFeil("Kunne ikke bekrefte lagringen. Feltene er bevart — prøv igjen.");
      } finally {
        saving.current = false;
      }
    });
  }

  if (lagret) return <section className="ph06-card ph06-rating" aria-label="Din vurdering">
    <h2 className="ph06-eyebrow">Din vurdering</h2>
    <p className="ph06-recap" role="status" tabIndex={-1} ref={savedRef}>
      Kvalitet: {kvalitet}/5{rpe > 0 ? ` · Anstrengelse ${rpe}/10` : ""}{folelse ? ` · ${folelse}` : ""}
    </p>
    {nesteFokus && <p className="ph06-recap">Neste fokus: {nesteFokus}</p>}
  </section>;

  return <details className="ph06-card ph06-details ph06-rating">
    <summary>Hvordan var økta?</summary>
    <p className="ph06-muted">Kvalitet og neste fokus deles med coachen. Du kan også lukke uten å vurdere.</p>
    <fieldset disabled={pending}>
      <fieldset>
        <legend>Kvalitet (1–5)</legend>
        <div className="ph06-rating-options">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-label={`Kvalitet ${n}`} aria-pressed={kvalitet === n} onClick={() => setKvalitet(n)}>{n}</button>)}</div>
      </fieldset>
      <fieldset>
        <legend>Hvor hard var økta? (1 = veldig lett · 10 = maksimal)</legend>
        <div className="ph06-rating-options">{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => <button key={n} type="button" aria-label={`Anstrengelse ${n} av 10`} aria-pressed={rpe === n} onClick={() => setRpe(n)}>{n}</button>)}</div>
      </fieldset>
      <label htmlFor={`${id}-folelse`}>Følelse (valgfritt)</label>
      <input id={`${id}-folelse`} value={folelse} onChange={(event) => setFolelse(event.target.value)} placeholder="F.eks. fokusert, sliten, motivert" maxLength={200} />
      <label htmlFor={`${id}-fokus`}>Neste fokus</label>
      <textarea id={`${id}-fokus`} value={nesteFokus} onChange={(event) => setNesteFokus(event.target.value)} placeholder="Hva bør neste økt prioritere?" rows={2} maxLength={500} />
      {feil && <p className="ph06-error" role="alert" tabIndex={-1} ref={errorRef}>{feil}</p>}
      <button type="button" className="ph06-secondary" onClick={onSubmit} disabled={pending}>{pending ? "Lagrer…" : feil ? "Prøv igjen" : "Lagre vurdering"}</button>
    </fieldset>
  </details>;
}
