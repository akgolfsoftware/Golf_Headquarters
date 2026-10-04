"use client";

/** Claude Design 7d7c2994 · testbatteri-komplett, export 2026-10-02 (40db63ff).
 * One attempt at a time; real account storage replaces prototype simulation. */
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Knapp, Sidehode, StatusPille } from "@/components/precision/pa";
import { tnVersion, type TnProtocol } from "@/lib/portal-tester/tn-catalog";
import { tnFormat, tnRowError, tnScore, tnValidate, type TnResult } from "@/lib/portal-tester/tn-scoring";
import { tnReadRaw } from "@/lib/portal-tester/tn-draft";
import { useTnDraft, type TnInitial } from "@/lib/portal-tester/use-tn-draft";
import type { TnSaveInput } from "@/lib/portal-tester/tn-session";
import { saveTnTest } from "./actions";
import "./scorecard.css";

export function TnScorecard({ protocol: p, initial, savedResult, localSessionId, testDayParticipantId }: {
  protocol: TnProtocol; savedResult?: TnResult; initial?: TnInitial; localSessionId?: string; testDayParticipantId?: string;
}) {
  const save = useCallback((input: TnSaveInput) => saveTnTest({ ...input, ...(testDayParticipantId ? { testDayParticipantId } : {}) }), [testDayParticipantId]);
  const draft = useTnDraft(p, initial, save, localSessionId);
  const [attempt, setAttempt] = useState(0);
  const [screen, setScreen] = useState<"auto" | "attempt" | "summary">("auto");
  const [night, setNight] = useState(false);
  const [photo, setPhoto] = useState<{ id: string; url: string; attempt: number } | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoMessage, setPhotoMessage] = useState("");
  const closed = draft.status !== "IN_PROGRESS";
  const summary = screen === "summary" || screen === "auto" && closed;
  const { values, error: rawError } = tnReadRaw(p, draft.raw);
  const completeRows = p.rows.filter((r, i) => !tnRowError(r, values[String(i + 1)], true)).length;
  const validation = rawError ?? tnValidate(p, values, true);
  const preview = closed ? (draft.status === "COMPLETED" ? savedResult ?? (!validation ? tnScore(p, values) : null) : null) : !validation ? tnScore(p, values) : null;
  const row = p.rows[attempt];
  const visiblePhoto = photo?.attempt === attempt ? photo : null;
  useEffect(() => {
    let active = true;
    if ((!draft.ready && draft.status !== "COMPLETED") || draft.revision < 1) return;
    void fetch(`/api/portal/tester/test-photo?sessionId=${encodeURIComponent(draft.sessionId)}&attempt=${attempt + 1}`, { cache: "no-store" })
      .then(async response => response.ok ? response.json() as Promise<{ id: string; url: string }> : null)
      .then(value => { if (active && value) setPhoto({ ...value, attempt }); })
      .catch(() => { if (active) setPhotoMessage("Bildet kunne ikke hentes akkurat nå."); });
    return () => { active = false; };
  }, [draft.ready, draft.revision, draft.sessionId, draft.status, attempt]);
  function field(key: string, value: string) {
    const next = { ...draft.raw, [String(attempt + 1)]: { ...draft.raw[String(attempt + 1)], [key]: value } };
    draft.edit(next, draft.notes);
  }
  function download() {
    const blob = new Blob([JSON.stringify({ test: p.id, version: tnVersion(p), raw: draft.raw, notes: draft.notes }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a");
    link.href = url; link.download = `testutkast-${p.id}.json`; link.click(); URL.revokeObjectURL(url);
  }
  async function uploadPhoto(file?: File) {
    if (!file) return;
    setPhotoBusy(true); setPhotoMessage("Lagrer bildet privat…");
    try {
      const form = new FormData(); form.set("file", file); form.set("sessionId", draft.sessionId); form.set("attempt", String(attempt + 1));
      const response = await fetch("/api/portal/tester/test-photo", { method: "POST", body: form });
      const result = await response.json() as { id?: string; url?: string; error?: string };
      if (!response.ok || !result.id || !result.url) throw new Error(result.error ?? "Bildet kunne ikke lagres.");
      setPhoto({ id: result.id, url: result.url, attempt }); setPhotoMessage("Bildet er lagret privat til dette forsøket.");
    } catch (error) { setPhotoMessage(error instanceof Error ? error.message : "Bildet kunne ikke lagres."); }
    finally { setPhotoBusy(false); }
  }
  async function deletePhoto() {
    setPhotoBusy(true); setPhotoMessage("Sletter bildet…");
    try {
      const response = await fetch("/api/portal/tester/test-photo", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId: draft.sessionId, attempt: attempt + 1 }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Bildet kunne ikke slettes.");
      setPhoto(null); setPhotoMessage("Bildet er slettet.");
    } catch (error) { setPhotoMessage(error instanceof Error ? error.message : "Bildet kunne ikke slettes."); }
    finally { setPhotoBusy(false); }
  }
  return <section className="pa-root tb-scorecard" data-theme={night ? "night" : "light"} aria-label="Scorekort">
    <div className="tb-topline"><Link href="/portal/tren/tester/team-norway">Til testoversikten</Link><Knapp variant="ghost" aria-pressed={night} onClick={() => setNight(!night)}>{night ? "Lyst tema" : "Nattema"}</Knapp></div>
    <Sidehode kicker="Testbatteri · Team Norway" title={p.name} sub={closed ? draft.status === "COMPLETED" ? "Gjennomført" : "Avsluttet ufullstendig" : `${completeRows} av ${p.rows.length} forsøk registrert`} />
    <div className="tb-status"><StatusPille>{closed ? draft.status === "COMPLETED" ? "Gjennomført" : "Ufullstendig" : "Egenført"}</StatusPille><span role="status" aria-live="polite">{closed && !draft.ready ? "Registreringene er lagret på kontoen." : draft.message}</span></div>
    {p.blocked && <p className="tb-notice" role="note">{p.blocked} Råverdier kan lagres som utkast.</p>}
    {draft.error && <div className="tb-notice" role="alert"><p>{draft.error}</p>{draft.blocked ? <><p>Behold registreringene her før du åpner den nyeste versjonen.</p><Knapp variant="secondary" onClick={download}>Last ned registreringene her</Knapp> <a href={`?session=${draft.sessionId}`}>Åpne lagret versjon</a></> : <Knapp variant="secondary" onClick={() => void draft.flush()}>Prøv lagring igjen</Knapp>}</div>}
    <div className="tb-grid">
      <section className="tb-pane tb-current" aria-label={summary ? "Oppsummering" : "Aktuelt forsøk"}>
        {summary ? <>
          <h2>{closed ? "Resultat" : "Kontroller registreringene"}</h2>
          {preview ? <div aria-label="Resultat">{preview.metrics.map(m => <p key={m.label}><span>{m.label}</span><strong className="tb-result">{tnFormat(m)}</strong><small>{m.lowerIsBetter ? "Lavere er bedre" : "Høyere er bedre"}</small></p>)}</div> : <p>{completeRows} av {p.rows.length} forsøk er registrert. {closed ? "Ingen testscore for en ufullstendig test." : "En testscore beregnes når alle nødvendige felt er fylt ut."}</p>}
          {!closed && validation && <p>{validation}</p>}
          <label className="tb-field">Notat · valgfritt<textarea disabled={closed || draft.blocked || !draft.ready || draft.closing} maxLength={2000} value={draft.notes} onChange={e => draft.edit(draft.raw, e.target.value)} /></label>
          {!closed && <div className="tb-actions"><Knapp disabled={!draft.ready || draft.sending || draft.closing || draft.blocked || !!validation || !!p.blocked} onClick={() => void draft.flush("complete")}>Fullfør testen</Knapp><Knapp variant="secondary" onClick={() => setScreen("attempt")}>Tilbake til forsøkene</Knapp></div>}
        </> : <>
          <div className="tb-attempt-title"><h2>Forsøk {attempt + 1} av {p.rows.length}</h2><span>{row.label}</span></div>
          {row.target !== undefined && <p className="tb-target">Mål <strong>{String(row.target).replace(".", ",")} m</strong></p>}
          <progress aria-label="Registrerte forsøk" value={completeRows} max={p.rows.length} />
          <fieldset disabled={closed || !draft.ready || draft.blocked || draft.closing} className="tb-fields"><legend className="pa-sr">Registrer forsøk {attempt + 1}</legend>
            {row.fields.map(f => f.choices ? <fieldset key={f.key} className="tb-choice"><legend>{f.label}{f.optional ? " · valgfritt" : ""}</legend><div>{f.choices.map(v => <button type="button" key={v} aria-pressed={draft.raw[String(attempt + 1)]?.[f.key] === v} onClick={() => field(f.key, draft.raw[String(attempt + 1)]?.[f.key] === v ? "" : v)}>{v}</button>)}</div></fieldset> : <label key={f.key} className="tb-field">{f.label}{f.unit ? ` (${f.unit})` : ""}{f.optional ? " · valgfritt" : ""}<input type="text" autoComplete="off" inputMode={f.integer ? "numeric" : "decimal"} maxLength={200} value={draft.raw[String(attempt + 1)]?.[f.key] ?? ""} onChange={e => field(f.key, e.target.value)} /></label>)}
          </fieldset>
          <section className="tb-photo" aria-label="Valgfritt bilde">
            <h3>Bilde · valgfritt</h3>
            <p>Ta bilde av ballen eller resultatet. Unngå personer. Bildet lagres privat og deles ikke automatisk med grupper.</p>
            {visiblePhoto && <figure><Image src={visiblePhoto.url} width={1600} height={1200} unoptimized alt={`Privat bilde til forsøk ${attempt + 1}`} /><figcaption>Kun tilgjengelig for deg.</figcaption></figure>}
            {!visiblePhoto && <label className="tb-photo-pick">Legg til bilde<input type="file" accept="image/jpeg,image/png,image/webp" disabled={photoBusy || draft.revision < 1 || !draft.ready} onChange={e => { void uploadPhoto(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }} /></label>}
            {visiblePhoto && <Knapp variant="secondary" disabled={photoBusy} onClick={() => void deletePhoto()}>Slett bilde</Knapp>}
            <p role="status" aria-live="polite">{draft.revision < 1 ? "Lagre målingen først for å knytte et bilde til forsøket." : photoMessage}</p>
          </section>
          <div className="tb-actions tb-navigation"><Knapp variant="secondary" disabled={attempt === 0} onClick={() => setAttempt(attempt - 1)}>Forrige</Knapp>{attempt < p.rows.length - 1 ? <Knapp onClick={() => setAttempt(attempt + 1)}>Neste forsøk</Knapp> : <Knapp onClick={() => setScreen("summary")}>Oppsummering</Knapp>}</div>
        </>}
      </section>
      <section className="tb-pane"><h2>Forsøksoversikt</h2><p>{closed ? "Trykk på et forsøk for å se registreringen." : "Trykk på et forsøk for å se eller rette registreringen."}</p><ol className="tb-attempts">{p.rows.map((r, i) => {
        const done = !tnRowError(r, values[String(i + 1)], true);
        const text = r.fields.map(f => draft.raw[String(i + 1)]?.[f.key]).filter(Boolean).join(" · ");
        return <li key={i}><button type="button" aria-current={!summary && i === attempt ? "step" : undefined} onClick={() => { setAttempt(i); setScreen("attempt"); }} aria-label={`Forsøk ${i + 1}, ${done ? "registrert" : text ? "ufullstendig" : "ikke registrert"}`}><b>{i + 1}</b><span>{text || "Ikke registrert"}<small>{r.label} · {done ? "Registrert" : text ? "Ufullstendig" : "Venter"}</small></span></button></li>;
      })}</ol>{!closed && <Knapp variant="secondary" onClick={() => setScreen("summary")}>Se oppsummering</Knapp>}</section>
    </div>
    <details className="tb-pane"><summary>Kilde og registreringsregler</summary><p>{p.source} · {tnVersion(p)}</p><p>Faste mål og rekkefølge følger valgt testvariant. Manglende verdi er forskjellig fra null. Resultater sammenlignes bare med samme versjon, variant og antall forsøk.</p><p>Utkast på denne enheten slettes ved utlogging eller bytte av konto, og ryddes ved neste åpning etter sju dager uten endringer. Vent på «lagret på kontoen» før du logger ut.</p></details>
    {!closed && <details className="tb-pane"><summary>Pause eller avslutt ufullstendig</summary><p>Du kan gå tilbake til utkastet fra testoversikten. Avslutter du ufullstendig, beholdes registreringene uten testscore.</p><div className="tb-actions"><Knapp variant="secondary" disabled={!draft.ready || draft.sending || draft.closing || draft.blocked} onClick={() => void draft.flush()}>Lagre nå</Knapp><Knapp variant="secondary" disabled={!draft.ready || draft.sending || draft.closing || draft.blocked} onClick={() => void draft.flush("abort")}>Avslutt ufullstendig</Knapp></div></details>}
  </section>;
}
