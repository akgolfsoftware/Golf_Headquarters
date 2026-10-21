"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveTnTestSomCoach } from "@/app/team-norway/tn-testforing-actions";
import { tnFormat, tnRowError, tnScore, tnValidate, type TnValues, type TnResult } from "@/lib/portal-tester/tn-scoring";
import { GATE_POENG_VALG } from "@/lib/portal-tester/tn-catalog";
import type { TnProtocol } from "@/lib/portal-tester/tn-catalog";
import { TnKnapp, TnKort, TnInput } from "./core";
import { TnSkraKort, TnSkraTopp } from "./tn-skra-topp";
import styles from "./tn-kontroller.module.css";
import { TN } from "@/lib/v2/team-norway";
import type { TnTestdagDeltakerDetalj } from "@/lib/domain/tn-arbeidsflate";

/**
 * Gate-test: hvert forsøk har ett påkrevd valg Godkjent/Bom (eldre protokollversjoner:
 * Ja/Nei). Gjelder Wedge Gate, Nærspill Gate, VISA Express o.l. Da føres testen med
 * to store knapper (vedtak 14.10: «Godkjent» og «Bom»). Verdien lagres slik
 * protokollen definerer den.
 */
type GateValg = { verdi: string; kort: string; tekst: string; tone: "ok" | "delvis" | "bom" };
type Gate = { key: string; valg: GateValg[]; poeng: Record<string, number> | null };
function gatefelt(p: TnProtocol): Gate | null {
  const per = p.rows.map((r): Gate | null => {
    const pakrevd = r.fields.filter((f) => !f.optional);
    const c = pakrevd.length === 1 ? pakrevd[0]?.choices : undefined;
    if (!c || !pakrevd[0]) return null;
    const key = pakrevd[0].key;
    // Poeng-gate (Wedge Gate, Nærspill Gate, VISA Express): 4 i sonen, 1 gjennom porten, 0 bom (Anders 20.10.2026).
    const poengValg = Object.keys(GATE_POENG_VALG);
    if (c.length === poengValg.length && poengValg.every((v) => c.includes(v))) {
      const poeng: Record<string, number> = { ...GATE_POENG_VALG };
      const valg = [...poengValg].sort((a, b) => (poeng[b] ?? 0) - (poeng[a] ?? 0)).map((v): GateValg => ({ verdi: v, kort: String(poeng[v]), tekst: `${poeng[v]} · ${v}`, tone: poeng[v] === 0 ? "bom" : poeng[v] === Math.max(...Object.values(poeng)) ? "ok" : "delvis" }));
      return { key, valg, poeng };
    }
    if (c.length !== 2) return null;
    if (c.includes("Godkjent") && c.includes("Bom")) return { key, valg: [{ verdi: "Godkjent", kort: "G", tekst: "Godkjent", tone: "ok" }, { verdi: "Bom", kort: "B", tekst: "Bom", tone: "bom" }], poeng: null };
    if (c.includes("Ja") && c.includes("Nei")) return { key, valg: [{ verdi: "Ja", kort: "J", tekst: "Ja", tone: "ok" }, { verdi: "Nei", kort: "N", tekst: "Nei", tone: "bom" }], poeng: null };
    return null;
  });
  const forste = per[0];
  return forste && per.every((g) => g && g.key === forste.key && g.valg.map((v) => v.verdi).join() === forste.valg.map((v) => v.verdi).join()) ? forste : null;
}

const GATE_TONE = {
  ok: { kant: TN.status.green, bak: TN.status.greenBg, tekst: TN.status.greenText },
  delvis: { kant: TN.navy600, bak: TN.navy50, tekst: TN.navy900 },
  bom: { kant: TN.status.red, bak: TN.status.redBg, tekst: TN.status.redText },
} as const;

/**
 * TN-03 — trenerførings-scorecard for ÉN deltaker i en testdag. Bevisst
 * separat fra PlayerHQs `TnScorecard` (portal) — ingen felles klientkode,
 * fordi autorisasjon/aktør er fundamentalt forskjellig (coach fører på
 * vegne av spiller, ikke spilleren selv).
 *
 * Fasit: docs/design-system/utkast-tn/spillere.html, skjerm Før resultat (pakke 3).
 * Gate-tester føres med to store knapper og en rad med forsøkene; andre
 * protokoller med feltene per forsøk. Hovedhandlingen («Før og neste» /
 * «Fullfør siste test») står RETT ETTER målefeltene — ikke nederst under
 * notat og resultat — slik at den er lett å nå selv med 25 forsøksrader.
 * Ingen fast/sticky bunnlinje: den ville ha dekket innhold på 390 px uten
 * samme `--ak-cookie-h`-mønster som resten av appen (gotchas.md), og er
 * utenfor denne avgrensede oppgaven å bygge. Funksjonsmodellen (props,
 * feltnavn, valideringsflyt, lagringsflyt) er urørt.
 * Avvik:
 *   - Protokoller som ikke er gate-tester føres fortsatt med feltene per forsøk.
 *   - Alle forsøk og valgfrie felt (som bomretning) ligger under en åpne-lenke i gate-modus.
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

  const gate = gatefelt(p);
  const nesteGate = gate ? p.rows.findIndex((_, i) => !raw[String(i + 1)]?.[gate.key]) : -1;
  const sisteGate = gate ? p.rows.reduce((siste, _, i) => (raw[String(i + 1)]?.[gate.key] ? i : siste), -1) : -1;
  const gatePoengSum = gate?.poeng ? p.rows.reduce((sum, _, i) => sum + (gate.poeng?.[raw[String(i + 1)]?.[gate.key] ?? ""] ?? 0), 0) : 0;
  const gatePoengMaks = gate?.poeng ? p.rows.length * Math.max(...Object.values(gate.poeng)) : 0;
  const settGate = (i: number, verdi: string) => {
    if (!gate || i < 0) return;
    setRaw((v) => ({ ...v, [String(i + 1)]: { ...v[String(i + 1)], [gate.key]: verdi } }));
  };

  const statusEtikett = deltaker.status === "PENDING" ? "I kø" : deltaker.status === "DONE" ? "Ført" : deltaker.status === "SKIPPED" ? "Hoppet over" : "Ikke møtt";

  return (
    <>
      <TnSkraTopp
        lav
        bilde="putting-green"
        etikett={`Testføring for ${deltaker.spillerNavn}`}
        overlinje={`${p.name} · ${deltaker.testDagTitle} · ${statusEtikett}`}
        tittel={deltaker.spillerNavn}
        ingress={gate && deltaker.status === "PENDING" ? `${gate.poeng ? "Trykk 4, 1 eller 0 etter hvert slag." : `Trykk ${gate.valg.map((v) => v.tekst).join(" eller ")} etter hvert slag.`} Testen teller bare når alle ${p.rows.length} er ført.` : undefined}
      />
      <TnSkraKort lav>
      {/* Også øverst — coachen skal ikke måtte skrolle forbi 25 forsøksfelt for å komme tilbake til køen. */}
      <Link href={`/team-norway/fellestesting?dag=${testDagId}`} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, alignSelf: "flex-start", color: TN.navy600, fontSize: 14, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: 4 }}>Tilbake til køen</Link>

      {deltaker.utkastFeil && <p role="alert" style={{ margin: 0, color: TN.status.redText, fontSize: TN.text.sm }}>{deltaker.utkastFeil}</p>}

      {ferdig && deltaker.status !== "DONE" ? (
        <TnKort>
          <p style={{ margin: 0, color: TN.textSecondary, fontSize: TN.text.sm, lineHeight: TN.leading.normal }}>
            Denne deltakeren er markert «{deltaker.status === "SKIPPED" ? "hoppet over" : "ikke møtt"}». Sett tilbake til køen for å føre en test.
          </p>
        </TnKort>
      ) : (
        <>
          {gate ? (
            <TnKort style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontFamily: TN.font.mono, fontWeight: 500, fontSize: 30, lineHeight: 1.05, color: TN.navy900 }}>
                  {nesteGate === -1 ? `Alle ${p.rows.length} ført` : `Slag ${nesteGate + 1} av ${p.rows.length}`}
                </span>
                {gate.poeng ? <span style={{ fontFamily: TN.font.mono, fontWeight: 600, fontSize: 20, color: TN.navy900 }}>{gatePoengSum} / {gatePoengMaks} p</span> : null}
              </div>
              <div aria-label="Ført så langt" style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(p.rows.length, 10)}, minmax(0, 1fr))`, gap: 4 }}>
                {p.rows.map((_, i) => {
                  const v = raw[String(i + 1)]?.[gate.key];
                  const valgt = gate.valg.find((g) => g.verdi === v);
                  const stil = valgt
                    ? { background: GATE_TONE[valgt.tone].bak, color: GATE_TONE[valgt.tone].tekst }
                    : i === nesteGate
                      ? { border: `2px solid ${TN.navy900}`, background: TN.white, color: TN.navy900 }
                      : { background: TN.ink100, color: TN.ink700 };
                  return <span key={i} aria-label={`Slag ${i + 1}: ${valgt ? valgt.tekst : "ikke ført"}`} style={{ display: "grid", placeItems: "center", height: 40, borderRadius: 8, fontFamily: TN.font.mono, fontWeight: 600, fontSize: 13, ...stil }}>{valgt ? valgt.kort : i + 1}</span>;
                })}
              </div>
              {deltaker.status === "PENDING" && deltaker.kanSkrive ? (
                <>
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${gate.valg.length}, minmax(0, 1fr))`, gap: 8 }}>
                    {gate.valg.map((g) => (
                      <button key={g.verdi} type="button" disabled={felterDisabled || nesteGate === -1} onClick={() => settGate(nesteGate, g.verdi)} style={{ minHeight: 76, padding: "0 8px", border: `2px solid ${GATE_TONE[g.tone].kant}`, borderRadius: 14, background: GATE_TONE[g.tone].bak, color: GATE_TONE[g.tone].tekst, fontFamily: TN.font.body, fontSize: 20, fontWeight: 700, lineHeight: 1.15, cursor: "pointer", display: "grid", placeContent: "center", gap: 2 }}>
                        {gate.poeng ? <><span style={{ fontFamily: TN.font.mono, fontSize: 26, fontWeight: 600 }}>{g.kort}</span><span style={{ fontSize: 13, fontWeight: 600 }}>{g.verdi}</span></> : g.tekst}
                      </button>
                    ))}
                  </div>
                  <div><TnKnapp variant="tekst" disabled={felterDisabled || sisteGate === -1} onClick={() => settGate(sisteGate, "")}>Angre siste</TnKnapp></div>
                </>
              ) : null}
              <p style={{ margin: 0, fontSize: 12.5, color: TN.ink500 }}>Føres som «Kontrollert», fordi en trener fører. {gate.poeng ? "4 er gjennom porten og i sonen, 1 bare gjennom porten, 0 bom." : "G er Godkjent, B er Bom."} Testen teller først når alle {p.rows.length} slag er ført.</p>
            </TnKort>
          ) : null}
          <details open={!gate}>
            {gate ? <summary style={{ cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center", fontSize: 14, fontWeight: 700, color: TN.navy600 }}>Alle forsøk og valgfrie felt</summary> : null}
          <TnKort>
            <fieldset disabled={felterDisabled} style={{ border: 0, padding: 0, margin: 0, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: TN.text.sm, fontWeight: TN.weight.semibold, color: TN.navy900 }}>{ferdigAntall} av {p.rows.length} forsøk registrert</span>
                </div>
                <div style={{ height: 8, background: TN.navy100, overflow: "hidden" }} role="progressbar" aria-valuenow={fremdriftPct} aria-valuemin={0} aria-valuemax={100}>
                  <div style={{ width: `${fremdriftPct}%`, height: "100%", background: TN.navy900 }} />
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
          </details>

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
                  : "Du har innsyn som Assist Coach og kan ikke føre testen selv."}
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
              style={{ minHeight: 72, width: "100%", padding: 10, border: `1px solid ${TN.borderSubtle}`, borderRadius: TN.radius.md, background: TN.white, color: TN.navy900, fontSize: 16, fontFamily: TN.font.body, resize: "vertical" }}
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
          <Link href={`/team-norway/fellestesting/${deltaker.forrigePendingDeltakerId}`} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: TN.navy600, fontSize: 14, fontWeight: 700 }}>← Forrige i køen</Link>
        ) : <span />}
        <Link href={`/team-norway/fellestesting?dag=${testDagId}`} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: TN.navy600, fontSize: 14, fontWeight: 700 }}>Tilbake til køen</Link>
        {deltaker.nestePendingDeltakerId ? (
          <Link href={`/team-norway/fellestesting/${deltaker.nestePendingDeltakerId}`} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: TN.navy600, fontSize: 14, fontWeight: 700 }}>Neste i køen →</Link>
        ) : <span />}
      </nav>
      </TnSkraKort>
    </>
  );
}
