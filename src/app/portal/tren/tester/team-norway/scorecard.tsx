"use client";

/** Functional Excel-v3 scorecard. Visual direction remains open; no design approval implied. */
import { useState, useTransition } from "react";
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { TN_VERSION, type TnProtocol } from "@/lib/portal-tester/tn-catalog";
import { tnFormat, tnRowError, tnScore, tnValidate, type TnValues, type TnResult } from "@/lib/portal-tester/tn-scoring";
import { saveTnTest } from "./actions";

const inputStyle = { minHeight: 44, width: "100%", padding: 10, border: `1px solid ${TL.hair}`, borderRadius: 8, background: TL.dock, color: TL.text };
const buttonStyle = { ...inputStyle, width: "auto", cursor: "pointer" };
export function TnScorecard({ protocol: p, initial, savedResult }: {
  protocol: TnProtocol;
  savedResult?: TnResult;
  initial?: { sessionId: string; revision: number; values: TnValues; notes: string; status: string };
}) {
  const [sessionId] = useState(() => initial?.sessionId ?? crypto.randomUUID());
  const [revision, setRevision] = useState(initial?.revision ?? 0);
  const [raw, setRaw] = useState<Record<string, Record<string, string>>>(() => Object.fromEntries(Object.entries(initial?.values ?? {}).map(([k, row]) => [k, Object.fromEntries(Object.entries(row).map(([f, v]) => [f, v === null ? "" : String(v).replace(".", ",")]))])));
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [status, setStatus] = useState(initial?.status ?? "IN_PROGRESS");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);
  const closed = status !== "IN_PROGRESS";
  const values: TnValues = {};
  let invalid = false;
  for (let i = 0; i < p.rows.length; i++) {
    const key = String(i + 1);
    values[key] = {};
    for (const f of p.rows[i].fields) {
      const v = raw[key]?.[f.key]?.trim() ?? "";
      if (!v) values[key][f.key] = null;
      else if (f.choices) values[key][f.key] = v;
      else {
        const n = Number(v.replace("−", "-").replace(",", "."));
        if (!Number.isFinite(n)) invalid = true;
        values[key][f.key] = Number.isFinite(n) ? n : null;
      }
    }
  }
  const completeRows = p.rows.filter((r, i) => !tnRowError(r, values[String(i + 1)], true)).length;
  const validation = tnValidate(p, values, true);
  const preview = closed ? (status === "COMPLETED" ? savedResult ?? (!invalid && !validation ? tnScore(p, values) : null) : null) : !invalid && !validation ? tnScore(p, values) : null;
  function save(intent: "draft" | "abort" | "complete") {
    setError("");
    if (invalid) { setError("Skriv gyldige tall. Bruk komma eller punktum som desimalskille."); return; }
    const err = tnValidate(p, values, intent === "complete");
    if (err) { setError(err); return; }
    startTransition(async () => {
      try {
        const response = await saveTnTest({ sessionId, protocolId: p.id, count: p.rows.length, revision, values, notes, intent });
        if (!response.ok) { setError(response.error); return; }
        setRevision(response.revision); setDirty(false);
        setStatus(intent === "complete" ? "COMPLETED" : intent === "abort" ? "ABORTED" : "IN_PROGRESS");
        setMessage(intent === "complete" ? "Resultatet er lagret." : intent === "abort" ? "Avsluttet ufullstendig. Registreringene er bevart uten testscore." : "Utkastet er lagret på kontoen din.");
      } catch { setError("Kunne ikke lagre. Registreringene er fortsatt i denne fanen. Prøv igjen."); }
    });
  }
  return <section style={{ color: TL.text }}>
    <h1>{p.name}</h1>
    <p>{closed ? status === "COMPLETED" ? "Fullført" : "Avsluttet ufullstendig" : `${completeRows} av ${p.rows.length} forsøk registrert`}</p>
    <details><summary>Kilde og registreringsregler</summary><p>{p.source} · {TN_VERSION}</p><p>Faste mål og rekkefølge følger valgt testvariant. Manglende verdi er forskjellig fra null. Nye resultater sammenlignes bare med samme versjon, variant og antall forsøk.</p></details>
    {p.blocked && <p role="note">{p.blocked}</p>}
    <fieldset disabled={pending || closed} style={{ border: 0, padding: 0, minWidth: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 16, marginBlock: 20 }}>
        {p.rows.map((row, i) => <fieldset key={i} style={{ border: `1px solid ${TL.hair}`, padding: 14, minWidth: 0, borderRadius: 12 }}>
          <legend>Forsøk {i + 1} · {row.label}</legend>
          {row.target !== undefined && <p>Mål: {String(row.target).replace(".", ",")} m</p>}
          {row.fields.map(f => <label key={f.key} style={{ display: "block", marginBottom: 12 }}>
            {f.label}{f.unit ? ` (${f.unit})` : ""}{f.optional ? " · valgfritt" : ""}
            {f.choices ? <select value={raw[String(i + 1)]?.[f.key] ?? ""} style={inputStyle} onChange={e => {
              setRaw(v => ({ ...v, [String(i + 1)]: { ...v[String(i + 1)], [f.key]: e.target.value } })); setDirty(true);
            }}><option value="">Velg</option>{f.choices.map(v => <option key={v}>{v}</option>)}</select>
              : <input type="text" inputMode={f.integer ? "numeric" : "decimal"} value={raw[String(i + 1)]?.[f.key] ?? ""} style={inputStyle} onChange={e => {
                setRaw(v => ({ ...v, [String(i + 1)]: { ...v[String(i + 1)], [f.key]: e.target.value } })); setDirty(true);
              }} />}
          </label>)}
        </fieldset>)}
      </div>
      <label>Notat · valgfritt<textarea maxLength={2000} value={notes} onChange={e => { setNotes(e.target.value); setDirty(true); }} style={{ ...inputStyle, minHeight: 88 }} /></label>
    </fieldset>
    {preview && <section aria-label="Resultat"><h2>{closed ? "Resultat" : "Resultat til kontroll"}</h2>{preview.metrics.map(m => <p key={m.label}><strong>{m.label}: {tnFormat(m)}</strong> · {m.lowerIsBetter ? "lavere er bedre" : "høyere er bedre"}</p>)}</section>}
    {error && <p role="alert">{error}</p>}
    <p role="status">{pending ? "Lagrer…" : dirty ? "Endringer er ikke lagret ennå." : message}</p>
    {!closed && <div style={{ display: "flex", gap: 12, flexWrap: "wrap", position: "sticky", bottom: 0, paddingBlock: 12, background: TL.scene }}>
      <button style={buttonStyle} disabled={pending} onClick={() => save("draft")}>Lagre utkast / pause</button>
      <button style={buttonStyle} disabled={pending || !!p.blocked} onClick={() => save("complete")}>Fullfør testen</button>
      <button style={buttonStyle} disabled={pending} onClick={() => save("abort")}>Avslutt ufullstendig</button>
    </div>}
    <Link href="/portal/tren/tester/team-norway">Til testoversikten</Link>
  </section>;
}
