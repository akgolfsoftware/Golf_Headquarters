"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveTnTestSomCoach } from "@/app/team-norway/tn-testforing-actions";
import { tnFormat, tnRowError, tnScore, tnValidate, type TnValues, type TnResult } from "@/lib/portal-tester/tn-scoring";
import type { TnProtocol } from "@/lib/portal-tester/tn-catalog";
import { TnKnapp, TnKort, TnPille, TnInput } from "./core";
import styles from "./tn-kontroller.module.css";
import { TN } from "@/lib/v2/team-norway";
import type { TnTestdagDeltakerDetalj } from "@/lib/domain/tn-arbeidsflate";

/**
 * TN-03 — trenerførings-scorecard for ÉN deltaker i en testdag. Bevisst
 * separat fra PlayerHQs `TnScorecard` (portal) — ingen felles klientkode,
 * fordi autorisasjon/aktør er fundamentalt forskjellig (coach fører på
 * vegne av spiller, ikke spilleren selv).
 *
 * Visuelt mot Claw 13.09 (designsystem/team-norway/templates/tn-fellestesting):
 * spilleren fremheves i et kort med rød identitetsstrek («denne utøveren»,
 * TN.red600 — tillatt her, jf. regelen i team-norway.ts), fremdrift vises
 * både som tekst og en tynn linje, og hovedhandlingen («Før og neste» /
 * «Fullfør siste test») står RETT ETTER målefeltene — ikke nederst under
 * notat og resultat — slik at den er lett å nå selv med 25 forsøksrader.
 * Ingen fast/sticky bunnlinje: den ville ha dekket innhold på 390 px uten
 * samme `--ak-cookie-h`-mønster som resten av appen (gotchas.md), og er
 * utenfor denne avgrensede oppgaven å bygge. Funksjonsmodellen (props,
 * feltnavn, valideringsflyt, lagringsflyt) er urørt.
 */
export function TnTestdagScorecard({ deltaker, protocol: p, testDagId }: { deltaker: TnTestdagDeltakerDetalj; protocol: TnProtocol; testDagId: string }) {
  const router = useRouter();
  const ferdig = deltaker.status === "DONE" || deltaker.status === "SKIPPED" || deltaker.status === "ABSENT";
  const [raw, setRaw] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(
      Object.entries(deltaker.eksisterendeUtkast?.values ?? {}).map(([k, row]) => [
        k,
        Object.fromEntries(Object.entries(row).map(([f, v]) => [f, v === null ? "" : String(v).replace(".", ",")])),
      ]),
    ),
  );
  const [notes, setNotes] = useState(deltaker.eksisterendeUtkast?.notes ?? "");
  const [revision, setRevision] = useState(deltaker.eksisterendeUtkast?.revision ?? 0);
  const [feil, setFeil] = useState("");
  const [melding, setMelding] = useState("");
  const [venter, start] = useTransition();

  const felterDisabled = venter || deltaker.status === "DONE" || !deltaker.kanSkrive;
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
  const ferdigAntall = p.rows.filter((r, i) => !tnRowError(r, values[String(i + 1)], true)).length;
  const fremdriftPct = p.rows.length === 0 ? 0 : Math.round((ferdigAntall / p.rows.length) * 100);
  const validering = tnValidate(p, values, true);
  const forhandsvisning: TnResult | null = !ferdig && !invalid && !validering ? tnScore(p, values) : null;

  function lagre(intent: "draft" | "abort" | "complete") {
    setFeil("");
    if (invalid) { setFeil("Skriv gyldige tall. Bruk komma eller punktum som desimalskille."); return; }
    const err = tnValidate(p, values, intent === "complete");
    if (err) { setFeil(err); return; }
    start(async () => {
      try {
        const svar = await saveTnTestSomCoach({ testDayParticipantId: deltaker.id, revision, values, notes, intent });
        if (!svar.ok) { setFeil(svar.error); return; }
        if (intent === "abort") {
          // Serveren nuller sessionId ved abort — et NYTT forsøk begynner på
          // revision 0, ikke `svar.revision` (som er den AVBRUTTE øktens
          // siste tall). Nullstiller også klientens felt/notat med vilje.
          setRaw({});
          setNotes("");
          setRevision(0);
          setMelding("Avsluttet ufullstendig. Nytt forsøk starter tomt.");
          router.refresh();
          return;
        }
        setRevision(svar.revision);
        if (intent === "complete") {
          // «Før og neste» i ett trykk: gå rett til neste PENDING i køen,
          // eller tilbake til testdagen når dette var den siste.
          router.push(deltaker.nestePendingDeltakerId ? `/team-norway/fellestesting/${deltaker.nestePendingDeltakerId}` : `/team-norway/fellestesting?dag=${testDagId}`);
          return;
        }
        setMelding("Utkastet er lagret.");
        router.refresh();
      } catch {
        setFeil("Kunne ikke lagre (nettverksfeil). Registreringene er fortsatt i dette vinduet — prøv igjen.");
      }
    });
  }

  const statusPilleTone = deltaker.status === "DONE" ? "green" : deltaker.status === "PENDING" ? "amber" : "nøytral";
  const statusEtikett = deltaker.status === "PENDING" ? "I kø" : deltaker.status === "DONE" ? "Ført" : deltaker.status === "SKIPPED" ? "Hoppet over" : "Ikke møtt";

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 18, color: TN.navy900, fontFamily: TN.font.body }}>
      {/* Også øverst — coachen skal ikke måtte skrolle forbi 25 forsøksfelt for å komme tilbake til køen. */}
      <Link href={`/team-norway/fellestesting?dag=${testDagId}`} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, alignSelf: "flex-start", color: TN.navy700, fontSize: TN.text.sm, fontWeight: TN.weight.semibold }}>Tilbake til køen</Link>
      <TnKort padding={0} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 12, padding: "16px 18px" }}>
          <span aria-hidden="true" style={{ width: 4, alignSelf: "stretch", borderRadius: TN.radius.full, background: TN.red600, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontFamily: TN.font.display, fontSize: TN.text.h2, letterSpacing: TN.tracking.heading, color: TN.navy900 }}>{deltaker.spillerNavn}</h1>
              <TnPille tone={statusPilleTone}>{statusEtikett}</TnPille>
            </div>
            <p style={{ margin: 0, fontFamily: TN.font.mono, fontSize: TN.text.micro, letterSpacing: TN.tracking.eyebrow, textTransform: "uppercase", color: TN.textSecondary }}>
              {p.name} · {deltaker.testDagTitle}
            </p>
          </div>
        </div>
      </TnKort>

      {deltaker.utkastFeil && <p role="alert" style={{ margin: 0, color: TN.status.redText, fontSize: TN.text.sm }}>{deltaker.utkastFeil}</p>}

      {ferdig && deltaker.status !== "DONE" ? (
        <TnKort>
          <p style={{ margin: 0, color: TN.textSecondary, fontSize: TN.text.sm, lineHeight: TN.leading.normal }}>
            Denne deltakeren er markert «{deltaker.status === "SKIPPED" ? "hoppet over" : "ikke møtt"}». Sett tilbake til køen for å føre en test.
          </p>
        </TnKort>
      ) : (
        <>
          <TnKort>
            <fieldset disabled={felterDisabled} style={{ border: 0, padding: 0, margin: 0, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900 }}>{ferdigAntall} av {p.rows.length} forsøk registrert</span>
                </div>
                <div style={{ height: 6, borderRadius: TN.radius.full, background: TN.ink100, overflow: "hidden" }} role="progressbar" aria-valuenow={fremdriftPct} aria-valuemin={0} aria-valuemax={100}>
                  <div style={{ width: `${fremdriftPct}%`, height: "100%", background: TN.navy600, borderRadius: TN.radius.full }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 10 }}>
                {p.rows.map((row, i) => (
                  <fieldset key={i} style={{ border: `1px solid ${TN.borderSubtle}`, borderRadius: TN.radius.md, padding: 12, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                    <legend style={{ fontFamily: TN.font.mono, fontSize: TN.text.micro, letterSpacing: TN.tracking.eyebrow, textTransform: "uppercase", color: TN.textSecondary, padding: 0 }}>
                      {/* row.label har allerede «Forsøk N · …» for protokoller som nummererer selv (f.eks. putt-1-3m) — unngå Forsøk 1 · Forsøk 1 · 1 m. */}
                      {row.label.startsWith("Forsøk ") ? row.label : `Forsøk ${i + 1} · ${row.label}`}
                    </legend>
                    {row.fields.map((f) => (
                      f.choices ? (
                        <div key={f.key} className={styles.felt}>
                          <label htmlFor={`${deltaker.id}-${i + 1}-${f.key}`} className={styles.etikett}>{f.label}</label>
                          <div className={styles.feltramme} data-disabled={felterDisabled || undefined}>
                            <select
                              id={`${deltaker.id}-${i + 1}-${f.key}`}
                              value={raw[String(i + 1)]?.[f.key] ?? ""}
                              disabled={felterDisabled}
                              className={styles.input}
                              onChange={(e) => setRaw((v) => ({ ...v, [String(i + 1)]: { ...v[String(i + 1)], [f.key]: e.target.value } }))}
                            >
                              <option value="">Velg</option>
                              {f.choices.map((c) => <option key={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>
                      ) : (
                        <TnInput
                          key={f.key}
                          id={`${deltaker.id}-${i + 1}-${f.key}`}
                          label={f.label}
                          suffix={f.unit}
                          disabled={felterDisabled}
                          inputMode={f.integer ? "numeric" : "decimal"}
                          value={raw[String(i + 1)]?.[f.key] ?? ""}
                          onChange={(verdi) => setRaw((v) => ({ ...v, [String(i + 1)]: { ...v[String(i + 1)], [f.key]: verdi } }))}
                        />
                      )
                    ))}
                  </fieldset>
                ))}
              </div>
            </fieldset>
          </TnKort>

          {deltaker.status === "PENDING" && deltaker.kanSkrive && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <TnKnapp variant="primaer" size="lg" fullBredde disabled={venter} onClick={() => lagre("complete")}>
                {deltaker.nestePendingDeltakerId ? "Før og neste" : "Fullfør siste test"}
              </TnKnapp>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <TnKnapp variant="sekundaer" disabled={venter} onClick={() => lagre("draft")}>Lagre utkast / pause</TnKnapp>
                <TnKnapp variant="tekst" disabled={venter} onClick={() => lagre("abort")}>Avslutt ufullstendig</TnKnapp>
              </div>
            </div>
          )}
          {deltaker.status === "PENDING" && !deltaker.kanSkrive && (
            <p style={{ margin: 0, color: TN.textSecondary, fontSize: TN.text.sm }}>
              {deltaker.testDagStatus !== "ACTIVE"
                ? "Denne testdagen er ikke aktiv og tar ikke imot nye registreringer."
                : deltaker.utkastFeil
                  ? "Utkastet kan ikke føres videre — se feilmeldingen over."
                  : "Du har innsyn som hjelpetrener og kan ikke føre testen selv."}
            </p>
          )}

          {feil && <p role="alert" style={{ margin: 0, color: TN.status.redText, fontSize: TN.text.sm }}>{feil}</p>}
          <p role="status" style={{ margin: 0, color: TN.textSecondary, fontSize: TN.text.sm }}>{venter ? "Lagrer …" : melding}</p>

          <label style={{ display: "block", fontSize: TN.text.sm }}>
            <span style={{ display: "block", fontWeight: TN.weight.semibold, marginBottom: 7 }}>Notat · valgfritt</span>
            <textarea
              maxLength={2000}
              value={notes}
              disabled={felterDisabled}
              onChange={(e) => setNotes(e.target.value)}
              style={{ minHeight: 72, width: "100%", padding: 10, border: `1px solid ${TN.borderSubtle}`, borderRadius: TN.radius.sm, background: TN.white, color: TN.navy900, fontSize: 16, fontFamily: TN.font.body, resize: "vertical" }}
            />
          </label>
        </>
      )}

      {(forhandsvisning || (deltaker.status === "DONE" && deltaker.scoreTekst)) && (
        <section aria-label="Resultat">
          <TnKort style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <h2 style={{ margin: 0, fontSize: TN.text.h3 }}>Resultat</h2>
            {forhandsvisning
              ? forhandsvisning.metrics.map((m) => <p key={m.label} style={{ margin: 0, fontSize: TN.text.sm }}><strong>{m.label}: {tnFormat(m)}</strong></p>)
              : <p style={{ margin: 0, fontFamily: TN.font.mono }}>{deltaker.scoreTekst}</p>}
          </TnKort>
        </section>
      )}

      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", borderTop: `1px solid ${TN.borderSubtle}`, paddingTop: 14 }}>
        {deltaker.forrigePendingDeltakerId ? (
          <Link href={`/team-norway/fellestesting/${deltaker.forrigePendingDeltakerId}`} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: TN.navy700, fontSize: TN.text.sm, fontWeight: TN.weight.semibold }}>← Forrige i køen</Link>
        ) : <span />}
        <Link href={`/team-norway/fellestesting?dag=${testDagId}`} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: TN.navy700, fontSize: TN.text.sm, fontWeight: TN.weight.semibold }}>Tilbake til køen</Link>
        {deltaker.nestePendingDeltakerId ? (
          <Link href={`/team-norway/fellestesting/${deltaker.nestePendingDeltakerId}`} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: TN.navy700, fontSize: TN.text.sm, fontWeight: TN.weight.semibold }}>Neste i køen →</Link>
        ) : <span />}
      </nav>
    </section>
  );
}
