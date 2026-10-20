"use client";

/**
 * Testdag og trenerføring i WANG (designløftet 20.10.2026, canvas «WANG nøkkelskjermer», Tester-rada:
 * Planlegg testdag og Registrering). Lagringen er de felles handlingene fra AgencyOS: planleggTestdag
 * lager arrangementet med én stasjon per test, og saveTnTestSomCoach lagrer slagene. Serveren bestemmer
 * elev, protokoll og antall slag. Det treneren fører, er kontrollert med en gang.
 *
 * Treneren fører bare Teknikk og PEI (trenerKanFore). Putt 1–3 m, 9 hull lengde og Fysisk fører eleven
 * selv i PlayerHQ, og treneren kontrollerer dem under Til kontroll.
 */
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { planleggTestdag } from "@/app/admin/tester/testdag-actions";
import { saveTnTestSomCoach } from "@/app/team-norway/tn-testforing-actions";
import type { RegistreringData, StasjonsTest } from "@/lib/admin/tester/testdag-data";
import { BATTERI_DELER } from "@/lib/portal-tester/testbatteri";
import { GATE_POENG_IDS, GATE_POENG_VALG } from "@/lib/portal-tester/tn-catalog";
import { tnFormat, tnScore, tnValidate, type TnValues } from "@/lib/portal-tester/tn-scoring";
import type { WangDeltakerStatus, WangTestdagRad, WangTestdagVisning } from "@/app/team-wang/_data/wang-testdag-data";
import { WangTilbake, WangTopp } from "./wang-felles";
import { WangTomTilstand } from "./WangIkkeKoblet";

const STATUS: Record<WangDeltakerStatus, string> = { PENDING: "Venter", DONE: "Lagret", SKIPPED: "Hoppet over", ABSENT: "Ikke møtt" };
const TESTDAG = "/team-wang/coach/tester/testdag";

// ---------------------------------------------------------------------------
// Planlegg testdag
// ---------------------------------------------------------------------------

export function WangTestdagPlanlegg({
  gruppeId,
  gruppeNavn,
  antallElever,
  tester,
  idag,
  testdager,
}: {
  gruppeId: string;
  gruppeNavn: string;
  /** Elever i gruppa som deler testene med WANG. */
  antallElever: number;
  tester: StasjonsTest[];
  /** «YYYY-MM-DD» i Oslo-tid, laveste dato som kan velges. */
  idag: string;
  testdager: WangTestdagRad[];
}) {
  const router = useRouter();
  const [dato, setDato] = useState("");
  const [klokke, setKlokke] = useState("08:00");
  const [sted, setSted] = useState("");
  const [valgt, setValgt] = useState<ReadonlySet<string>>(new Set());
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();
  const perDel = useMemo(
    () => BATTERI_DELER.map((del) => ({ del, tester: tester.filter((t) => t.del === del) })).filter((x) => x.tester.length),
    [tester],
  );
  const bytt = (id: string) => setValgt((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });
  const klar = !!dato && !!klokke && valgt.size > 0;
  const send = () => start(async () => {
    setFeil(null);
    const r = await planleggTestdag({ gruppeId, start: `${dato}T${klokke}`, sted: sted.trim() || undefined, protokoller: [...valgt] });
    if (!r.ok) { setFeil(r.error); return; }
    router.push(`${TESTDAG}/${r.eventId}`);
  });

  return (
    <>
      <WangTilbake href="/team-wang/coach?omraade=tester" tekst="Tester" />
      <WangTopp dato={`${gruppeNavn} · Teknikk og PEI`} tittel="Planlegg testdag" />

      <div className="wg-td-to">
        <section className="wg-kort wg-td-skjema" aria-label="Testdagen">
          <div className="wg-td-rad">
            <label className="wg-lbl">Dato<input className="wg-field" type="date" min={idag} value={dato} onChange={(e) => setDato(e.target.value)} /></label>
            <label className="wg-lbl">Start<input className="wg-field" type="time" step={900} value={klokke} onChange={(e) => setKlokke(e.target.value)} /></label>
          </div>
          <label className="wg-lbl">Sted<input className="wg-field" type="text" maxLength={120} placeholder="For eksempel Mulligan" value={sted} onChange={(e) => setSted(e.target.value)} /></label>
          <fieldset className="wg-td-tester">
            <legend>Testene</legend>
            <p className="wg-hjelp">
              Du fører Teknikk- og PEI-testene. Putt 1–3 m, 9 hull lengde og de fysiske testene fører eleven selv i PlayerHQ,
              og du kontrollerer dem under Til kontroll.
            </p>
            {perDel.map(({ del, tester: liste }) => (
              <div key={del} className="wg-td-del">
                <b className={`wg-td-delnavn wg-td-${del.toLowerCase()}`}><i aria-hidden />{del}</b>
                {liste.map((t) => (
                  <label key={t.protokollId} className="wg-td-valg">
                    <input type="checkbox" checked={valgt.has(t.protokollId)} onChange={() => bytt(t.protokollId)} />
                    <span>{t.navn}</span>
                    <span className="wg-kilde">{t.slag} slag</span>
                  </label>
                ))}
              </div>
            ))}
          </fieldset>
        </section>

        <aside className="wg-kort wg-td-sum" aria-label="Oppsummering">
          <span className="wg-td-meta">
            {dato ? new Intl.DateTimeFormat("nb-NO", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${dato}T00:00:00Z`)) : "Dato ikke valgt"}
            {sted.trim() ? ` · ${sted.trim()}` : ""}
          </span>
          <strong className="wg-td-klokke">{klokke || "—"}</strong>
          <span>{antallElever} {antallElever === 1 ? "elev deler" : "elever deler"} testene · {valgt.size} {valgt.size === 1 ? "stasjon" : "stasjoner"}</span>
          <span className="wg-kilde">Hver test blir én stasjon. Du fører resultatene elev for elev. Ingen e-post eller varsel sendes.</span>
          {feil ? <p className="wg-td-feil" role="alert">{feil}</p> : null}
          <button type="button" className="wg-btn wg-btn-primary" disabled={!klar || venter} onClick={send}>
            {venter ? "Legger inn …" : "Legg inn testdagen"}
          </button>
        </aside>
      </div>

      <section id="testdager" className="wg-seksjon" aria-label="Testdager">
        <div className="wg-sek-topp"><h2>Testdager</h2><span className="wg-kilde">{testdager.length} siste</span></div>
        {testdager.length === 0 ? (
          <WangTomTilstand tittel="Ingen testdager ennå" tekst="Testdager du legger inn, står her med stasjonene." />
        ) : (
          <div className="wg-kort">
            {testdager.map((t) => (
              <Link key={t.id} href={`${TESTDAG}/${t.id}`} className="wg-td-linje">
                <span><b>{t.dato}</b><span className="wg-kilde">{[t.klokke, t.sted, `${t.stasjoner} ${t.stasjoner === 1 ? "stasjon" : "stasjoner"}`].filter(Boolean).join(" · ")}</span></span>
                <span className={`wg-pille ${t.aktiv ? "wg-pille-ok" : ""}`}><i />{t.aktiv ? "Åpen" : "Avsluttet"}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Én testdag: stasjonene og elevene
// ---------------------------------------------------------------------------

export function WangTestdagVis({ d }: { d: WangTestdagVisning }) {
  return (
    <>
      <WangTilbake href={TESTDAG} tekst="Testdager" />
      <WangTopp dato={[d.klokke, d.sted].filter(Boolean).join(" · ")} tittel={`Testdag ${d.dato}`} />
      {d.skjulte > 0 ? (
        <p className="wg-kilde">{d.skjulte} {d.skjulte === 1 ? "elev deler" : "elever deler"} ikke testene med WANG og vises ikke.</p>
      ) : null}
      {d.stasjoner.map((s) => {
        const lagret = s.deltakere.filter((x) => x.status === "DONE").length;
        return (
          <section key={s.id} className="wg-seksjon" aria-label={s.navn}>
            <div className="wg-sek-topp"><h2>{s.navn}</h2><span className="wg-kilde">{lagret} av {s.deltakere.length} lagret</span></div>
            {s.deltakere.length === 0 ? (
              <WangTomTilstand tittel="Ingen elever å føre" tekst="Ingen på stasjonen deler testene med WANG." />
            ) : (
              <div className="wg-kort">
                {s.deltakere.map((x) => (
                  <Link key={x.id} href={`/team-wang/coach/tester/registrer/${x.id}`} className="wg-td-linje">
                    <span><b>{x.elev}</b><span className="wg-kilde">{x.resultat ?? STATUS[x.status]}</span></span>
                    <span className={`wg-pille ${x.status === "DONE" ? "wg-pille-ok" : ""}`}><i />{STATUS[x.status]}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Registrer: én elev på én stasjon
// ---------------------------------------------------------------------------

export function WangRegistrer({ d }: { d: RegistreringData }) {
  const router = useRouter();
  const p = d.protokoll;
  const [values, setValues] = useState<TnValues>(d.utkast?.values ?? {});
  const [revision, setRevision] = useState(d.utkast?.revision ?? 0);
  const [notes, setNotes] = useState(d.utkast?.notes ?? "");
  const [feil, setFeil] = useState<string | null>(null);
  const [melding, setMelding] = useState<string | null>(null);
  const [venter, start] = useTransition();
  const laast = d.status !== "PENDING" || !d.testdag.aktiv;
  const tilbake = d.testdag.eventId ? `${TESTDAG}/${d.testdag.eventId}` : TESTDAG;

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
    if (komplett) {
      try { return tnFormat(tnScore(p, values).metrics[0]); } catch { return null; }
    }
    if ((GATE_POENG_IDS as readonly string[]).includes(p.id)) {
      const sum = p.rows.reduce((a, _, i) => a + (GATE_POENG_VALG[values[String(i + 1)]?.ok as keyof typeof GATE_POENG_VALG] ?? 0), 0);
      return `${sum} / ${4 * p.rows.length} p så langt`;
    }
    return null;
  }, [komplett, p, values]);

  const lagre = (intent: "draft" | "complete") => start(async () => {
    setFeil(null);
    setMelding(null);
    const r = await saveTnTestSomCoach({ testDayParticipantId: d.deltakerId, revision, values, notes, intent });
    if (!r.ok) { setFeil(r.error); return; }
    setRevision(r.revision);
    if (intent === "draft") { setMelding("Utkastet er lagret."); return; }
    router.push(d.nesteId ? `/team-wang/coach/tester/registrer/${d.nesteId}` : tilbake);
    router.refresh();
  });

  return (
    <>
      <WangTilbake href={tilbake} tekst="Testdagen" />
      <WangTopp dato={`Teknikk og PEI · ${d.testdag.tittel}`} tittel={p.name}>
        <span className="wg-pille wg-pille-ok"><i />Kontrollert · du fører</span>
      </WangTopp>

      <div className="wg-td-to">
        <section className="wg-kort wg-td-skjema" aria-label="Slagene">
          <div className="wg-sek-topp"><h2>{d.spiller}</h2><span className="wg-kilde">{fort} / {p.rows.length} slag ført</span></div>
          {resultat ? <p className="wg-td-resultat">{resultat}</p> : null}
          {d.resultat && laast ? <p className="wg-td-resultat">Lagret: {d.resultat}</p> : null}
          <ol className="wg-td-slag">
            {p.rows.map((rad, i) => (
              <li key={i}>
                <span className="wg-td-nr">{i + 1}</span>
                <span className="wg-td-tekst">{rad.label}</span>
                <span className="wg-td-felter">
                  {rad.fields.map((f) => f.choices ? (
                    <span key={f.key} role="group" aria-label={`Slag ${i + 1}: ${f.label}`} className="wg-td-knapper">
                      {f.choices.map((c) => (
                        <button
                          key={c}
                          type="button"
                          disabled={laast}
                          aria-pressed={values[String(i + 1)]?.[f.key] === c}
                          onClick={() => sett(i, f.key, values[String(i + 1)]?.[f.key] === c ? null : c)}
                        >
                          {c}
                        </button>
                      ))}
                    </span>
                  ) : (
                    <label key={f.key} className="wg-lbl wg-td-tall">
                      {f.label}{f.unit ? ` (${f.unit})` : ""}
                      <input
                        className="wg-field"
                        type="text"
                        inputMode="decimal"
                        disabled={laast}
                        value={values[String(i + 1)]?.[f.key] ?? ""}
                        onChange={(e) => {
                          const t = e.target.value.replace(",", ".");
                          sett(i, f.key, t === "" ? null : Number.isFinite(Number(t)) ? Number(t) : null);
                        }}
                      />
                    </label>
                  ))}
                </span>
              </li>
            ))}
          </ol>
          <label className="wg-lbl">
            Notat (valgfritt)
            <textarea className="wg-field" rows={2} maxLength={2000} disabled={laast} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
          {feil ? <p className="wg-td-feil" role="alert">{feil}</p> : null}
          {melding ? <p className="wg-kilde" role="status">{melding}</p> : null}
          {!laast ? (
            <div className="wg-knapper">
              <button type="button" className="wg-btn wg-btn-primary" disabled={venter || !komplett} onClick={() => lagre("complete")}>
                {venter ? "Lagrer …" : d.nesteId ? "Lagre og ta neste elev" : "Lagre"}
              </button>
              <button type="button" className="wg-btn wg-btn-secondary" disabled={venter} onClick={() => lagre("draft")}>Lagre utkast</button>
            </div>
          ) : (
            <p className="wg-kilde">{!d.testdag.aktiv ? "Testdagen er avsluttet." : `Status: ${STATUS[d.status]}.`}</p>
          )}
        </section>

        <aside className="wg-kort wg-td-sum" aria-label="Elever på stasjonen">
          <span className="wg-td-meta">Elever på stasjonen</span>
          {d.andre.map((x) => (
            <Link
              key={x.id}
              href={`/team-wang/coach/tester/registrer/${x.id}`}
              aria-current={x.id === d.deltakerId ? "true" : undefined}
              className="wg-td-linje"
            >
              <b>{x.spiller}</b>
              <span className="wg-kilde">{STATUS[x.status as WangDeltakerStatus] ?? x.status}</span>
            </Link>
          ))}
        </aside>
      </div>
    </>
  );
}
