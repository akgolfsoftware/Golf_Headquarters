"use client";

/**
 * PH-RD-06 Rask score (etterregistrering) — nytt design (pakke 5, godkjent av Anders 14.10.2026, utkast 2 med farge).
 * Fasit: docs/design-system/utkast-playerhq/runder.html, skjerm «rask». Stil: playerhq-ny-runder.css.
 * Lagres med logRoundManual. Bare brutto score.
 *
 * Avvik:
 *   - Bane og dato velges på skjermen (tegningen har dem fra oppsettet). Tee og type runde er tatt ut: logRoundManual lagrer dem ikke.
 *   - Par og lengde per hull hentes fra banens hull (hentBaneHull). Mangler banen hulldata, velger du par selv per hull
 *     og lengden vises ikke. Den faste hull-lista (STANDARD_18_HOLES) brukes ikke lenger: den var gjettet.
 *   - Ni hull kan være første eller siste ni (som før). «Total» er bare for 18 hull, som i tegningen.
 *   - «Kilde» for SG fra en annen app er tatt ut: runden lagrer ikke hvilken app tallene kom fra, bare at de er ført for hånd.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-RD-06.
 */

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, Check } from "lucide-react";
import { logRoundManual } from "@/app/portal/mal/runder/ny/actions";
import { hentBaneHull } from "@/app/portal/(legacy)/mal/runder/logg/actions";
import type { Ph0809Data } from "@/lib/portal-runder/load-ph08-09";
import { hullNumre, lesSgTekst, raskSum, stegScore, tilHullDetaljer, type RaskHull } from "@/lib/portal-runder/rask-score";
import { formaterFortegn } from "@/lib/format-tall";
import { Tilbake, tilParTekst } from "./PHRunderFelles";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-runder.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";

type Valg = "18" | "ut" | "inn";
type Fort = Omit<RaskHull, "nr" | "lengde">;
type BaneHull = { holeNumber: number; par: number | null; lengdeMeter: number | null };

const SG_FELT = [
  { key: "sgOtt", navn: "Utslag (OTT)" },
  { key: "sgApp", navn: "Innspill (APP)" },
  { key: "sgArg", navn: "Nærspill (ARG)" },
  { key: "sgPutt", navn: "Putting (PUTT)" },
] as const;
type SgKey = (typeof SG_FELT)[number]["key"] | "sgTotal";

const iDag = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
const tomFort = (): Fort => ({ par: null, score: null, putter: null, fairway: null, gir: null });

export interface PH09RegistrerRundeProps {
  data: Ph0809Data;
  /** Hvor «Tilbake» går. */
  tilbakeHref?: string;
  /** true på fullskjermsruta uten PlayerHQ-skall (ingen fanelinje nederst). */
  fullskjerm?: boolean;
}

export function PH09RegistrerRunde({ data, tilbakeHref = "/portal/mal/runder/ny", fullskjerm = false }: PH09RegistrerRundeProps) {
  const rot = fullskjerm ? "phn phr-fullskjerm" : "phn";
  const router = useRouter();
  const [lagrer, startLagring] = useTransition();
  const [baneId, setBaneId] = useState(data.baner[0]?.id ?? "");
  const [dato, setDato] = useState(iDag);
  const [valg, setValg] = useState<Valg>("18");
  const [modus, setModus] = useState<"hull" | "total">("hull");
  const [total, setTotal] = useState<number | null>(null);
  const [fort, setFort] = useState<Record<number, Fort>>({});
  const [baneHull, setBaneHull] = useState<{ id: string; hull: BaneHull[] } | null>(null);
  const [sg, setSg] = useState<Record<SgKey, string>>({ sgOtt: "", sgApp: "", sgArg: "", sgPutt: "", sgTotal: "" });
  const [feil, setFeil] = useState<string | null>(null);
  const [requestId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    if (!baneId) return;
    let aktiv = true;
    hentBaneHull(baneId)
      .then((h) => { if (aktiv) setBaneHull({ id: baneId, hull: Array.isArray(h) ? h : [] }); })
      .catch(() => { if (aktiv) setBaneHull({ id: baneId, hull: [] }); });
    return () => { aktiv = false; };
  }, [baneId]);

  const bane = data.baner.find((b) => b.id === baneId) ?? null;
  const hullLaster = baneHull?.id !== baneId;
  const hull: RaskHull[] = useMemo(() => hullNumre(valg).map((nr) => {
    const fra = baneHull?.id === baneId ? baneHull.hull.find((h) => h.holeNumber === nr) : undefined;
    const f = fort[nr] ?? tomFort();
    return { nr, lengde: fra?.lengdeMeter ?? null, ...f, par: fra?.par ?? f.par };
  }), [valg, baneHull, baneId, fort]);

  const sum = raskSum(hull);
  const totalModus = modus === "total" && valg === "18";

  const endre = (nr: number, endring: Partial<Fort>) =>
    setFort((f) => ({ ...f, [nr]: { ...(f[nr] ?? tomFort()), ...endring } }));

  // SG-kontroll: alle fire og totalen, eller ingenting.
  const sgTall = Object.fromEntries((Object.keys(sg) as SgKey[]).map((k) => [k, lesSgTekst(sg[k])])) as Record<SgKey, number | null | undefined>;
  const sgUgyldig = Object.values(sgTall).some((v) => v === undefined);
  const sgFylt = Object.values(sgTall).filter((v) => v != null).length;
  const sgDelsum = SG_FELT.reduce((s, f) => s + (sgTall[f.key] ?? 0), 0);
  const sgStemmer = sgFylt === 5 && Math.abs(sgDelsum - (sgTall.sgTotal ?? 0)) < 0.05;
  const sgOk = !sgUgyldig && (sgFylt === 0 || sgStemmer);

  const lagre = () => {
    setFeil(null);
    if (!bane) { setFeil("Velg bane først."); return; }
    if (!sgOk) { setFeil("Strokes Gained: fyll inn alle fire kategoriene og totalen, eller la hele seksjonen stå tom."); return; }
    const detaljer = totalModus ? null : tilHullDetaljer(hull);
    if (!totalModus && !detaljer) {
      setFeil(`Før alle ${hull.length} hull først. ${hull.length - sum.ført} mangler.`);
      return;
    }
    if (totalModus && total == null) { setFeil("Før brutto score for runden."); return; }
    const score = totalModus ? (total as number) : sum.brutto;
    startLagring(async () => {
      try {
        await logRoundManual({
          requestId,
          courseId: bane.id,
          playedAt: dato,
          score,
          ...(detaljer ? { hullDetaljer: detaljer } : {}),
          ...(sgFylt ? { sgTotal: sgTall.sgTotal, sgOtt: sgTall.sgOtt, sgApp: sgTall.sgApp, sgArg: sgTall.sgArg, sgPutt: sgTall.sgPutt } : {}),
        });
        router.push("/portal/mal/runder");
      } catch (err: unknown) {
        console.error("Kunne ikke lagre runden:", err);
        setFeil(err instanceof Error ? err.message : "Runden kunne ikke lagres. Prøv igjen.");
      }
    });
  };

  if (data.feil || data.baner.length === 0) {
    return (
      <div className={rot}>
        <Tilbake href={tilbakeHref} tekst="Velg nivå" />
        <div className="phr-topp"><div className="phn-dato">Rask score</div><h1 className="phn-tittel">Før scoren</h1></div>
        <section className="phn-kort phr-kort-dempet" role={data.feil ? "alert" : undefined}>
          <h2 className="phr-undertittel">{data.feil ? "Banene kunne ikke hentes" : "Ingen baner å velge"}</h2>
          <p className="phn-forklar">{data.feil ? "Ingenting er lagret. Prøv igjen om litt." : "Det finnes ingen baner i AK Golf ennå, så runden kan ikke lagres. Si fra til coachen din."}</p>
          {data.feil && <div className="phn-knapper"><Link className="phn-knapp sek" href="/portal/runde/logg">Prøv igjen</Link></div>}
        </section>
      </div>
    );
  }

  return (
    <div className={`${rot} phn-skra`}>
    <SkraTopp
      lav
      etikett="Før scoren"
      bilde="/images/playerhq/spill-bane.jpg" bildePosisjon="50% 50%"
      overlinje={`Rask score${bane ? ` · ${bane.navn}` : ""}`}
      tittel="Før scoren"
      handling={<span className="skra-tilbake"><Tilbake href={tilbakeHref} tekst="Velg nivå" /></span>}
    />
    <SkraFlyt lav>

      <div className="phr-grid phr-smal">
        <section className="phr-fylt" aria-label="Brutto score">
          <div className="phn-hoved">
            <strong>{totalModus ? (total ?? "—") : sum.ført ? sum.brutto : "—"}</strong>
            <span className="phn-trend">
              {totalModus ? (total != null && bane ? tilParTekst(total - bane.par) : "Ingen score ført") : sum.ført ? `${tilParTekst(sum.brutto - sum.par)} etter ${sum.ført} hull` : "Ingen hull ført"}
            </span>
          </div>
          <p className="phn-kilde">{totalModus ? "18 hull · brutto · ført som total" : `${sum.ført} av ${hull.length} hull · brutto`}</p>
        </section>

        <section className="phn-seksjon" aria-label="Runden">
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12 }}>
            <label className="phn-felt">Bane
              <select value={baneId} onChange={(e) => setBaneId(e.target.value)}>
                {data.baner.map((b) => <option key={b.id} value={b.id}>{b.navn}</option>)}
              </select>
            </label>
            <label className="phn-felt">Dato
              <input type="date" value={dato} max={iDag()} onChange={(e) => setDato(e.target.value)} />
            </label>
          </div>
          <div className="phr-felt">
            <span className="phr-etikett">Antall hull</span>
            <div className="phn-valg phr-valg" role="group" aria-label="Antall hull">
              <button type="button" aria-pressed={valg !== "18"} onClick={() => { setValg("ut"); setModus("hull"); }}>9</button>
              <button type="button" aria-pressed={valg === "18"} onClick={() => setValg("18")}>18</button>
            </div>
          </div>
          {valg !== "18" ? (
            <div className="phr-felt">
              <span className="phr-etikett">Hvilke ni</span>
              <div className="phn-valg phr-valg" role="group" aria-label="Hvilke ni">
                <button type="button" aria-pressed={valg === "ut"} onClick={() => setValg("ut")}>Hull 1–9</button>
                <button type="button" aria-pressed={valg === "inn"} onClick={() => setValg("inn")}>Hull 10–18</button>
              </div>
              <p className="phn-kilde">Ni hull føres hull for hull. De teller ikke i snittscoren.</p>
            </div>
          ) : (
            <div className="phr-felt">
              <span className="phr-etikett">Føring</span>
              <div className="phn-valg phr-valg" role="group" aria-label="Føring">
                <button type="button" aria-pressed={modus === "total"} onClick={() => setModus("total")}>Total</button>
                <button type="button" aria-pressed={modus === "hull"} onClick={() => setModus("hull")}>Hull for hull</button>
              </div>
            </div>
          )}
        </section>

        {totalModus ? (
          <section className="phn-seksjon" aria-label="Total">
            <div className="phr-hullrad">
              <span><b>Brutto score</b><span>Hele runden</span></span>
              <div className="phr-trinn">
                <button type="button" aria-label="Ett slag færre" onClick={() => setTotal((t) => Math.max(50, (t ?? (bane?.par ?? 72)) - 1))}>−</button>
                <output className={total == null ? "tom" : ""}>{total ?? "—"}</output>
                <button type="button" aria-label="Ett slag til" onClick={() => setTotal((t) => (t == null ? (bane?.par ?? 72) : Math.min(200, t + 1)))}>+</button>
              </div>
            </div>
          </section>
        ) : (
          <section className="phn-seksjon" aria-label="Hull" aria-busy={hullLaster}>
            {hullLaster && <p className="phn-kilde" role="status">Henter par og lengde for banen …</p>}
            <div className="phr-hullrader">
              {hull.map((h) => {
                const harBanePar = baneHull?.id === baneId && baneHull.hull.some((b) => b.holeNumber === h.nr && b.par != null);
                return (
                  <div className="phr-hullrad" key={h.nr}>
                    <span><b>Hull {h.nr}</b><span>{h.par != null ? `Par ${h.par}` : "Velg par"}{h.lengde != null ? ` · ${h.lengde} m` : ""}</span></span>
                    <div className="phr-trinn">
                      <button type="button" disabled={h.par == null} aria-label={`Hull ${h.nr}, ett slag færre`} onClick={() => endre(h.nr, { score: stegScore(h, -1) })}>−</button>
                      <output className={h.score == null ? "tom" : ""}>{h.score ?? "—"}</output>
                      <button type="button" disabled={h.par == null} aria-label={`Hull ${h.nr}, ett slag til`} onClick={() => endre(h.nr, { score: stegScore(h, 1) })}>+</button>
                    </div>
                    {!harBanePar && (
                      <div className="phn-valg phr-valg" role="group" aria-label={`Par hull ${h.nr}`} style={{ gridColumn: "1 / -1" }}>
                        {[3, 4, 5].map((p) => <button key={p} type="button" aria-pressed={h.par === p} onClick={() => endre(h.nr, { par: p })}>Par {p}</button>)}
                      </div>
                    )}
                    <div className="phr-ekstra">
                      <label>Putter
                        <select aria-label={`Putter hull ${h.nr}`} value={h.putter ?? ""} onChange={(e) => endre(h.nr, { putter: e.target.value === "" ? null : Number(e.target.value) })}>
                          <option value="">—</option>{[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </label>
                      {h.par !== 3 && (
                        <label>Fairway
                          <select aria-label={`Fairway hull ${h.nr}`} value={h.fairway ?? ""} onChange={(e) => endre(h.nr, { fairway: (e.target.value || null) as Fort["fairway"] })}>
                            <option value="">—</option><option value="ja">Ja</option><option value="venstre">Venstre</option><option value="hoyre">Høyre</option>
                          </select>
                        </label>
                      )}
                      <label>GIR
                        <select aria-label={`GIR hull ${h.nr}`} value={h.gir == null ? "" : h.gir ? "ja" : "nei"} onChange={(e) => endre(h.nr, { gir: e.target.value === "" ? null : e.target.value === "ja" })}>
                          <option value="">—</option><option value="ja">Ja</option><option value="nei">Nei</option>
                        </select>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <details className="phn-kort phr-kort">
          <summary className="phr-undertittel" style={{ minHeight: 44, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, cursor: "pointer" }}>
            Strokes Gained fra en annen app <span className="phn-kilde">Valgfritt</span>
          </summary>
          <div className="phr-grid" style={{ gap: 16, marginTop: 12 }}>
            <p className="phn-forklar">Har appen din regnet ut SG for runden, kan du føre tallene her. De merkes som ført for hånd.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
              {[...SG_FELT, { key: "sgTotal", navn: "Total" } as const].map((f) => (
                <label className="phn-felt" key={f.key}>{f.navn}
                  <input inputMode="decimal" value={sg[f.key]} placeholder="—" onChange={(e) => setSg((s) => ({ ...s, [f.key]: e.target.value }))} />
                </label>
              ))}
            </div>
            {sgFylt > 0 && (
              <div className={`phr-sjekk ${sgStemmer && !sgUgyldig ? "ok" : "vent"}`}>
                {sgStemmer && !sgUgyldig ? <Check className="phn-ikon" aria-hidden /> : <CircleAlert className="phn-ikon" aria-hidden />}
                <span>{sgUgyldig ? "Skriv tallene som −0,8 eller +0,3." : sgFylt < 5 ? "Fyll inn alle fire kategoriene og totalen, eller la hele seksjonen stå tom."
                  : sgStemmer ? `Summen stemmer: ${formaterFortegn(sgDelsum, 1)}.` : `Kategoriene blir ${formaterFortegn(sgDelsum, 1)}, men totalen er ${formaterFortegn(sgTall.sgTotal, 1)}. De må være like.`}</span>
              </div>
            )}
          </div>
        </details>

        <section className="phn-kort phr-kort-dempet">
          <span className="phr-kvalitet"><span className="phr-prikker" aria-hidden><i className="paa" /><i /><i /></span>Datakvalitet: lav</span>
          <p className="phn-forklar">Rask score gir snittscore og kategori. Runden får ikke Strokes Gained fra appen, med mindre du fører SG over.</p>
        </section>

        <div className="phn-meldinger" aria-live="polite">{feil && <p className="phr-melding" role="alert">{feil}</p>}</div>
        <div className="phr-festet"><button type="button" className="phn-knapp pri phr-knapp-stor" disabled={lagrer} onClick={lagre}>{lagrer ? "Lagrer …" : "Lagre runden"}</button></div>
      </div>
    </SkraFlyt>
    </div>
  );
}
