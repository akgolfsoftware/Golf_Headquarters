"use client";

/**
 * PH-15 og PH-15-TN: gjennomføring av Team Norway-tester i nytt design (pakke 6, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, malene «gate» (Wedge Gate), «hand» (Nærspill Gate)
 * og «tn8» (8-ball). Stil: playerhq-ny-statsdybde.css. Alltid lyst tema (§LIVE-ØKTENE ER ALLTID LYSE, 14.10).
 *
 * Avvik:
 *   - Feltene kommer fra protokollen i tn-catalog (eies av en annen økt). 8-ball føres i dag med carry og side
 *     og «I hull»; utkastet viser meter fra hullet. Skjermen viser feltene protokollen har, og bytter selv når
 *     protokollen endres. Poengskalaen tegnes ikke; poeng og PEI regnes av tn-scoring etter hvert slag.
 *   - «Forrige gang» og «Rekorden din» står ikke: siden henter ikke tidligere resultater for scorekortet.
 *   - PGA Tour-snitt per slagtype finnes ikke i basen og vises ikke.
 *   - Rutenettet (launch × carry) bygges av radnavnene i protokollen. Passer de ikke i et rutenett,
 *     vises slagene nummerert. Et ført slag kan rettes ved å trykke på det.
 *   - Dagens funksjoner er beholdt: lagring underveis (også uten nett), notat, bilde per slag, nedlasting ved
 *     lagringskonflikt og «Avbryt uten resultat». Nattema-bryteren er fjernet.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-15.
 */
import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Undo2, X } from "lucide-react";
import { TmTilbake } from "./PH17TmFelles";
import { tnVersion, type TnProtocol, type TnRow } from "@/lib/portal-tester/tn-catalog";
import { tnFormat, tnRowError, tnRowPreview, tnScore, tnValidate, type TnResult } from "@/lib/portal-tester/tn-scoring";
import { tnReadRaw, type TnRaw } from "@/lib/portal-tester/tn-draft";
import { useTnDraft, type TnInitial } from "@/lib/portal-tester/use-tn-draft";
import { tnDefinitionId } from "@/lib/portal-tester/tn-integration";
import type { TnSaveInput } from "@/lib/portal-tester/tn-session";
import { saveTnTest } from "@/app/portal/tren/tester/team-norway/actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-statsdybde.css";

export type PH15TnType = "gate" | "ball8";

/** Hvilken ny skjerm en Team Norway-protokoll får. null = det generelle scorekortet. */
export function ph15TnType(p: TnProtocol): PH15TnType | null {
  if (p.points8Ball && p.rows.every((r) => r.target !== undefined)) return "ball8";
  if (p.kind === "gate" && p.rows.every((r) => r.fields.length === 1 && r.fields[0]!.choices?.length === 2)) return "gate";
  return null;
}

type Props = {
  protocol: TnProtocol;
  initial?: TnInitial;
  savedResult?: TnResult;
  localSessionId?: string;
  testDayParticipantId?: string;
  /** Overskrift over testnavnet, f.eks. testdagens navn. */
  kontekst?: string;
  /** Innhold under testen, f.eks. øvelsesforslag etter et lagret resultat. */
  etter?: React.ReactNode;
};

const AKSE = (p: TnProtocol) => (p.points8Ball ? { k: "slag", t: "SLAG", o: "Golfslag" } : { k: "tek", t: "TEK", o: "Teknikk" });
const slagNavn = (label: string) => label.replace(/^([A-Za-zÆØÅæøå]+)(\d+)$/, "$1 $2 m");
const tall = (v: number, d = 1) => (Math.round(v * 10 ** d) / 10 ** d).toLocaleString("nb-NO", { minimumFractionDigits: d, maximumFractionDigits: d });

export function PH15TnTest(props: Props) {
  const { protocol: p, initial, savedResult, localSessionId, testDayParticipantId } = props;
  const save = useCallback((input: TnSaveInput) => saveTnTest({ ...input, ...(testDayParticipantId ? { testDayParticipantId } : {}) }), [testDayParticipantId]);
  const draft = useTnDraft(p, initial, save, localSessionId);
  const router = useRouter();
  const type = ph15TnType(p) ?? "gate";
  const akse = AKSE(p);
  const avbrytRef = useRef<HTMLDialogElement>(null);

  const closed = draft.status !== "IN_PROGRESS";
  const { values, error: rawError } = tnReadRaw(p, draft.raw);
  const ferdigRad = (i: number) => !tnRowError(p.rows[i]!, values[String(i + 1)] ?? {}, true);
  const neste = p.rows.findIndex((_, i) => !ferdigRad(i));
  const n = neste === -1 ? p.rows.length : neste;
  const antallFerdige = p.rows.filter((_, i) => ferdigRad(i)).length;
  const alle = antallFerdige === p.rows.length;
  const validering = rawError ?? tnValidate(p, values, true);
  const resultat = closed ? (draft.status === "COMPLETED" ? savedResult ?? (!validering ? tnScore(p, values) : null) : null) : !validering ? tnScore(p, values) : null;
  const laast = closed || !draft.ready || draft.blocked || draft.closing;

  function settRad(i: number, rad: Record<string, string> | null) {
    const next: TnRaw = { ...draft.raw };
    if (rad) next[String(i + 1)] = rad; else delete next[String(i + 1)];
    draft.edit(next, draft.notes);
  }
  const sisteFort = () => {
    for (let i = p.rows.length - 1; i >= 0; i--) if (draft.raw[String(i + 1)] && Object.values(draft.raw[String(i + 1)]!).some(Boolean)) return i;
    return -1;
  };

  async function avbryt() {
    avbrytRef.current?.close();
    await draft.flush("abort");
    router.push("/portal/tren/tester");
  }
  function lastNed() {
    const blob = new Blob([JSON.stringify({ test: p.id, version: tnVersion(p), raw: draft.raw, notes: draft.notes }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `testutkast-${p.id}.json`; a.click(); URL.revokeObjectURL(url);
  }

  const igjen = p.rows.length - antallFerdige;
  const foto = Math.min(n, p.rows.length - 1);

  return (
    <div className="phn">
      <TmTilbake href="/portal/tren/tester" tekst="Tester" />
      <div className="phn-topp">
        <div className="phn-dato">{props.kontekst ?? `Stats · Tester · ${akse.o}`}</div>
        <h1 className="phn-tittel">{p.name}</h1>
      </div>

      {p.blocked && <p className="phn-sd-varsel" role="note">{p.blocked} Slagene kan lagres som utkast.</p>}
      {draft.error && (
        <div className="phn-sd-varsel" role="alert">
          <p>{draft.error}</p>
          {draft.blocked ? (
            <div className="phn-knapper">
              <button type="button" className="phn-knapp sek" onClick={lastNed}>Last ned registreringene</button>
              <a className="phn-knapp sek" href={`?session=${draft.sessionId}`}>Åpne lagret versjon</a>
            </div>
          ) : <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={() => void draft.flush()}>Prøv lagring igjen</button></div>}
        </div>
      )}

      <div className="phn-motor">
        {type === "gate"
          ? <GateTopp p={p} godkjent={godkjenteAv(p, values)} igjen={igjen} closed={closed} resultat={resultat} />
          : <BallTopp p={p} values={values} n={antallFerdige} igjen={igjen} closed={closed} resultat={resultat} />}

        {!closed && (type === "gate"
          ? <GateInn p={p} n={n} laast={laast} alle={alle} raw={draft.raw} sett={settRad} angre={() => { const i = sisteFort(); if (i >= 0) settRad(i, null); }} kanAngre={sisteFort() >= 0} />
          : <BallInn key={n} p={p} n={n} laast={laast} alle={alle} raw={draft.raw} sett={settRad} angre={() => { const i = sisteFort(); if (i >= 0) settRad(i, null); }} kanAngre={sisteFort() >= 0} />)}

        {type === "gate"
          ? <GateRutenett p={p} n={closed ? -1 : n} raw={draft.raw} laast={laast} sett={settRad} />
          : <BallListe p={p} n={closed ? -1 : n} values={values} />}

        <div className="phn-lagre-felt full">
          <div className="phn-hvem">
            <span className="phn-pille noy">{closed ? (draft.status === "COMPLETED" ? "Lagret" : "Avbrutt") : "Egenført"}</span>
            <span className="phn-kilde" role="status" aria-live="polite">{closed && !draft.ready ? "Registreringene er lagret på kontoen." : draft.message}</span>
          </div>
          {!closed && (
            <>
              <label className="phn-felt">Notat · valgfritt
                <textarea rows={2} maxLength={2000} disabled={laast} value={draft.notes} onChange={(e) => draft.edit(draft.raw, e.target.value)} />
              </label>
              <button type="button" className="phn-knapp pri stor" disabled={!alle || !!validering || laast || draft.sending || !!p.blocked} onClick={() => void draft.flush("complete")}>
                Lagre resultat
              </button>
              <p className="phn-kilde">
                {alle && !validering && resultat
                  ? `Alle ${p.rows.length} slag er ført. Resultatet blir ${tnFormat(resultat.metrics[0]!)}${p.points8Ball ? `, ${resultat.metrics.filter((m) => m.label === "Totalt antall poeng").map(tnFormat).join("")}` : ""}.`
                  : alle && validering ? validering
                  : `Testen teller når alle ${p.rows.length} slag er registrert. ${antallFerdige} av ${p.rows.length} er ført.`}
              </p>
              <button type="button" className="phn-knapp sek" disabled={laast} onClick={() => avbrytRef.current?.showModal()} aria-haspopup="dialog">Avbryt testen</button>
            </>
          )}
          {closed && (
            <div className="phn-knapper">
              {draft.status === "COMPLETED" && <Link className="phn-knapp pri" href={`/portal/tren/tester/${tnDefinitionId(p)}?lagret=1`}>Se testen</Link>}
              <Link className="phn-knapp sek" href="/portal/tren/tester">Alle tester</Link>
            </div>
          )}
        </div>
      </div>

      {!closed && <Foto sessionId={draft.sessionId} forsok={foto} klar={draft.ready && draft.revision >= 1} revisjon={draft.revision} />}

      <details className="phn-kort dempet">
        <summary className="phn-etikett" style={{ cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center" }}>Kilde og registreringsregler</summary>
        <p className="phn-forklar">{p.source} · {tnVersion(p)}</p>
        <p className="phn-forklar">En test teller bare når alle slag er registrert. Resultater sammenlignes bare med samme utgave og antall slag. Utkast på denne enheten slettes ved utlogging, og ryddes etter sju dager uten endringer. Vent på «lagret på kontoen» før du logger ut.</p>
      </details>

      {props.etter}

      <dialog ref={avbrytRef} className="phn-sd-dialog" aria-labelledby="ph15-avbryt">
        <div className="phn-ark-kropp">
          <div className="phn-ark-topp">
            <h2 id="ph15-avbryt">Avbryte testen?</h2>
            <button type="button" className="phn-lukk" onClick={() => avbrytRef.current?.close()} aria-label="Lukk"><X className="phn-ikon" aria-hidden /></button>
          </div>
          <p className="phn-forklar">Slagene du har ført, blir ikke et resultat. En test teller bare når alle slag er registrert.</p>
          <div className="phn-knapper">
            <button type="button" className="phn-knapp rust" onClick={() => void avbryt()}>Avbryt uten resultat</button>
            <button type="button" className="phn-knapp sek" onClick={() => avbrytRef.current?.close()}>Fortsett testen</button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

/* ---------- Gate: godkjent eller bom ---------- */

function godkjentVerdi(r: TnRow) { return r.fields[0]!.choices![0]!; }
function bomVerdi(r: TnRow) { return r.fields[0]!.choices![1]!; }
function godkjenteAv(p: TnProtocol, values: ReturnType<typeof tnReadRaw>["values"]) {
  return p.rows.filter((r, i) => values[String(i + 1)]?.[r.fields[0]!.key] === godkjentVerdi(r)).length;
}

function GateTopp({ p, godkjent, igjen, closed, resultat }: { p: TnProtocol; godkjent: number; igjen: number; closed: boolean; resultat: TnResult | null }) {
  return (
    <div className="phn-fylt tek full">
      <span className="phn-akse-tekst">TEK · GODKJENT ELLER BOM</span>
      <div className="phn-rad">
        <span className="phn-stor">{closed && !resultat ? "—" : godkjent}<small>/ {p.rows.length} godkjent</small></span>
        <span className="phn-trend">{closed ? (resultat ? "Lagret" : "Ikke lagret") : igjen ? `${igjen} slag igjen` : "Alle slag ført"}</span>
      </div>
      <p>{p.rows[0]?.fields[0]?.label ?? "Godkjent eller bom"}.</p>
    </div>
  );
}

function GateInn({ p, n, laast, alle, raw, sett, angre, kanAngre }: {
  p: TnProtocol; n: number; laast: boolean; alle: boolean; raw: TnRaw;
  sett: (i: number, rad: Record<string, string> | null) => void; angre: () => void; kanAngre: boolean;
}) {
  const r = p.rows[n];
  const deler = r?.label.split(" · ") ?? [];
  const fort = (v: string) => { if (r) sett(n, { ...raw[String(n + 1)], [r.fields[0]!.key]: v }); };
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="phn-slag-naa" aria-live="polite">
        {alle || !r ? (
          <><span className="phn-nr">Ferdig</span><span className="phn-hva">Alle slag er ført<small>Lagre for å få resultatet i Stats.</small></span></>
        ) : (
          <><span className="phn-nr">Slag {n + 1} av {p.rows.length}</span><span className="phn-hva">{deler.length > 1 ? deler.slice(1).join(" · ") : r.label}{deler.length > 1 && <small>Launch {deler[0]!.toLowerCase()}</small>}</span></>
        )}
      </div>
      <div className="phn-tb">
        <button type="button" className="godkjent" disabled={laast || alle} onClick={() => r && fort(godkjentVerdi(r))}><Check className="phn-ikon" aria-hidden />Godkjent</button>
        <button type="button" className="bom" disabled={laast || alle} onClick={() => r && fort(bomVerdi(r))}><X className="phn-ikon" aria-hidden />Bom</button>
      </div>
      <button type="button" className="phn-angre" disabled={laast || !kanAngre} onClick={angre}><Undo2 className="phn-ikon" aria-hidden />Angre siste</button>
    </div>
  );
}

/** Radnavn «Lav · 2 m» gir rutenett launch × carry når de danner et fullt rutenett i rekkefølge. */
function rutenett(p: TnProtocol): { rader: string[]; kolonner: string[] } | null {
  const deler = p.rows.map((r) => r.label.split(" · "));
  if (deler.some((d) => d.length !== 2)) return null;
  const rader = [...new Set(deler.map((d) => d[0]!))], kolonner = [...new Set(deler.map((d) => d[1]!))];
  if (rader.length * kolonner.length !== p.rows.length) return null;
  const iRekkefolge = deler.every((d, i) => d[0] === rader[Math.floor(i / kolonner.length)] && d[1] === kolonner[i % kolonner.length]);
  return iRekkefolge ? { rader, kolonner } : null;
}

function GateRutenett({ p, n, raw, laast, sett }: { p: TnProtocol; n: number; raw: TnRaw; laast: boolean; sett: (i: number, rad: Record<string, string> | null) => void }) {
  const nett = rutenett(p);
  const celle = (i: number) => {
    const r = p.rows[i]!, key = r.fields[0]!.key, v = raw[String(i + 1)]?.[key];
    const ok = v === godkjentVerdi(r), bom = v === bomVerdi(r);
    const status = ok ? "godkjent" : bom ? "bom" : i === n ? "naa" : "";
    // Et ført slag kan rettes: trykk bytter mellom godkjent og bom.
    return (
      <button key={i} type="button" className={`phn-celle ${status}`} disabled={laast || !(ok || bom)}
        onClick={() => sett(i, { ...raw[String(i + 1)], [key]: ok ? bomVerdi(r) : godkjentVerdi(r) })}
        aria-label={`Slag ${i + 1}${ok ? ", godkjent. Trykk for å endre til bom" : bom ? ", bom. Trykk for å endre til godkjent" : i === n ? ", neste" : ""}`}>
        {ok ? <Check className="phn-ikon" aria-hidden /> : bom ? <X className="phn-ikon" aria-hidden /> : i + 1}
      </button>
    );
  };
  return (
    <section className="phn-kort">
      <div className="phn-sek-topp"><h2>{p.rows.length === 9 ? "Ni slag" : `${p.rows.length} slag`}</h2>{nett && <span className="phn-kilde">Launch × carry</span>}</div>
      {nett ? (
        <div className="phn-matrise">
          <span />
          {nett.kolonner.map((k) => <span key={k} className="h k">{k}</span>)}
          {nett.rader.flatMap((rad, ri) => [
            <span key={`h${rad}`} className="h">{rad.replace(/\s*\(.*\)$/, "")}</span>,
            ...nett.kolonner.map((_, ci) => celle(ri * nett.kolonner.length + ci)),
          ])}
        </div>
      ) : (
        <div className="phn-matrise uten-hode">{p.rows.map((_, i) => celle(i))}</div>
      )}
    </section>
  );
}

/* ---------- 8-ball: avstand fra hullet gir PEI og poeng ---------- */

type Values = ReturnType<typeof tnReadRaw>["values"];

function BallTopp({ p, values, n, igjen, closed, resultat }: { p: TnProtocol; values: Values; n: number; igjen: number; closed: boolean; resultat: TnResult | null }) {
  const pv = p.rows.map((_, i) => tnRowPreview(p, i, values[String(i + 1)])).filter((x): x is NonNullable<typeof x> => x != null);
  const poeng = pv.reduce((a, x) => a + (x.points ?? 0), 0);
  const pei = pv.length ? pv.reduce((a, x) => a + x.pei, 0) / pv.length : null;
  return (
    <div className="phn-fylt slag full">
      <span className="phn-akse-tekst">SLAG · AVSTAND FRA HULLET</span>
      <div className="phn-to-tall">
        <div><span className="phn-stor">{pv.length ? poeng : "—"}<small>p</small></span><span className="phn-tall-etikett">Poeng</span></div>
        <div><span className="phn-stor">{pei != null ? tall(pei * 100) : "—"}<small>%</small></span><span className="phn-tall-etikett">PEI, snitt</span></div>
      </div>
      <span className="phn-trend">{closed ? (resultat ? "Lagret" : "Ikke lagret") : igjen ? `${igjen} slag igjen` : "Alle slag ført"}</span>
      <p>{closed ? "" : `Etter ${n} av ${p.rows.length} slag.`}</p>
    </div>
  );
}

function BallInn({ p, n, laast, alle, raw, sett, angre, kanAngre }: {
  p: TnProtocol; n: number; laast: boolean; alle: boolean; raw: TnRaw;
  sett: (i: number, rad: Record<string, string> | null) => void; angre: () => void; kanAngre: boolean;
}) {
  const r = p.rows[n];
  const tallFelt = r ? r.fields.filter((f) => !f.choices) : [];
  const hullFelt = r?.fields.find((f) => f.key === "holed" && f.choices?.length);
  const [lokal, setLokal] = useState<Record<string, string>>(() => {
    const eks = raw[String(n + 1)] ?? {};
    return Object.fromEntries(tallFelt.map((f) => [f.key, eks[f.key] ?? ""]));
  });
  const [melding, setMelding] = useState("");
  const forsteFelt = useRef<HTMLInputElement>(null);
  useEffect(() => { if (!laast && !alle) forsteFelt.current?.focus({ preventScroll: true }); }, [laast, alle]);

  if (!r || alle) {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <div className="phn-slag-naa"><span className="phn-nr">Ferdig</span><span className="phn-hva">Alle slag er ført<small>Lagre for å få resultatet i Stats.</small></span></div>
        <button type="button" className="phn-angre" disabled={laast || !kanAngre} onClick={angre}><Undo2 className="phn-ikon" aria-hidden />Angre siste</button>
      </div>
    );
  }

  const tmpRaw: TnRaw = { ...raw, [String(n + 1)]: lokal };
  const { values: tmp, error: tallFeil } = tnReadRaw(p, tmpRaw);
  const rad = tmp[String(n + 1)] ?? {};
  const feil = tallFeil ?? tnRowError(r, rad, true);
  const fh = !feil ? tnRowPreview(p, n, rad) : null;
  const harTekst = Object.values(lokal).some((v) => v.trim());

  function registrer() {
    if (feil) { setMelding(tallFeil ?? feil); forsteFelt.current?.focus(); return; }
    sett(n, { ...lokal });
  }
  function iHull() {
    if (!hullFelt) return;
    sett(n, { ...Object.fromEntries(tallFelt.map((f) => [f.key, ""])), [hullFelt.key]: hullFelt.choices![0]! });
  }
  const gruppeStart = Math.floor(n / 3) * 3;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="phn-slag-naa" aria-live="polite">
        <span className="phn-nr">Slag {n + 1} av {p.rows.length}</span>
        <span className="phn-hva">{slagNavn(r.label)}<small>Ball {n - gruppeStart + 1} av 3 · slaglengde {String(r.target).replace(".", ",")} m</small></span>
      </div>
      <div className={tallFelt.length > 1 ? "phn-to-inn" : undefined}>
        {tallFelt.map((f, i) => (
          <label key={f.key} className="phn-felt stort-tall">{f.label}{f.unit ? ` (${f.unit})` : ""}
            <input ref={i === 0 ? forsteFelt : undefined} type="text" inputMode="decimal" autoComplete="off" maxLength={20} disabled={laast}
              value={lokal[f.key] ?? ""} placeholder={f.key === "result" ? "f.eks. 2,4" : undefined}
              onChange={(e) => { setMelding(""); setLokal({ ...lokal, [f.key]: e.target.value }); }}
              onKeyDown={(e) => { if (e.key === "Enter") registrer(); }} />
          </label>
        ))}
      </div>
      <span className="phn-hjelp">Komma eller punktum: 2,4 og 2.4 er det samme.</span>
      <p className="phn-forhand" aria-live="polite">
        {melding ? melding : fh
          ? <><b>{tall(fh.distance)} m</b> fra hullet · PEI <b>{tall(fh.pei * 100)} %</b>{fh.points !== undefined && <> · <b>{fh.points} poeng</b></>}</>
          : harTekst ? "Fyll ut alle feltene, så ser du PEI og poeng." : "Skriv inn slaget, så ser du PEI og poeng før du registrerer."}
      </p>
      <div className="phn-tb">
        <button type="button" className="registrer" disabled={laast} onClick={registrer}>Registrer</button>
        {hullFelt && <button type="button" className="godkjent" disabled={laast} onClick={iHull}>I hull</button>}
      </div>
      <button type="button" className="phn-angre" disabled={laast || !kanAngre} onClick={angre}><Undo2 className="phn-ikon" aria-hidden />Angre siste</button>
    </div>
  );
}

function BallListe({ p, n, values }: { p: TnProtocol; n: number; values: Values }) {
  const grupper: { navn: string; fra: number }[] = [];
  p.rows.forEach((r, i) => { if (!grupper.length || grupper[grupper.length - 1]!.navn !== r.label) grupper.push({ navn: r.label, fra: i }); });
  return (
    <section className="phn-kort">
      <div className="phn-sek-topp"><h2>Slagene</h2><span className="phn-kilde">Avstand · PEI · poeng</span></div>
      <div className="phn-slagliste">
        {grupper.map((g, gi) => {
          const til = grupper[gi + 1]?.fra ?? p.rows.length;
          const pv = Array.from({ length: til - g.fra }, (_, k) => tnRowPreview(p, g.fra + k, values[String(g.fra + k + 1)]));
          const ferdige = pv.filter((x): x is NonNullable<typeof x> => x != null);
          return (
            <div key={g.fra} className="phn-slaggruppe">
              <b className="phn-undertittel">{slagNavn(g.navn)}</b>
              <span className="phn-sg-sum">
                {ferdige.length ? <><b>{ferdige.reduce((a, x) => a + (x.points ?? 0), 0)} p</b><small>PEI {tall(ferdige.reduce((a, x) => a + x.pei, 0) / ferdige.length * 100)} %</small></> : <small>—</small>}
              </span>
              <span className="phn-ball-rader">
                {pv.map((x, k) => {
                  const i = g.fra + k, hull = x?.distance === 0;
                  return x ? (
                    <span key={i} className="phn-ball-rad" style={{ cursor: "default" }}>
                      <span className="phn-nr">Ball {k + 1}</span>
                      <span>{hull ? "I hull" : `${tall(x.distance)} m`}</span>
                      <span>PEI {tall(x.pei * 100)} %</span>
                      <span className={`phn-pg${hull ? " hull" : x.points ? "" : " null"}`}>{x.points ?? "—"} p</span>
                    </span>
                  ) : (
                    <span key={i} className={`phn-ball-rad tom${i === n ? " naa" : ""}`} style={{ cursor: "default" }}>
                      <span className="phn-nr">Ball {k + 1}</span><span>{i === n ? "Neste slag" : "—"}</span><span /><span />
                    </span>
                  );
                })}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Bilde per slag (som i dagens scorekort) ---------- */

function Foto({ sessionId, forsok, klar, revisjon }: { sessionId: string; forsok: number; klar: boolean; revisjon: number }) {
  const [foto, setFoto] = useState<{ url: string; forsok: number } | null>(null);
  const [opptatt, setOpptatt] = useState(false);
  const [melding, setMelding] = useState("");
  // Bildet hentes først når spilleren åpner delen.
  const [apen, setApen] = useState(false);
  useEffect(() => {
    let aktiv = true;
    if (!apen || !klar || revisjon < 1) return;
    void fetch(`/api/portal/tester/test-photo?sessionId=${encodeURIComponent(sessionId)}&attempt=${forsok + 1}`, { cache: "no-store" })
      .then(async (r) => (r.ok ? (r.json() as Promise<{ id: string; url: string }>) : null))
      .then((v) => { if (aktiv) setFoto(v ? { url: v.url, forsok } : null); })
      .catch(() => { if (aktiv) setMelding("Bildet kunne ikke hentes akkurat nå."); });
    return () => { aktiv = false; };
  }, [apen, sessionId, forsok, klar, revisjon]);
  async function last(fil?: File) {
    if (!fil) return;
    setOpptatt(true); setMelding("Lagrer bildet privat …");
    try {
      const form = new FormData(); form.set("file", fil); form.set("sessionId", sessionId); form.set("attempt", String(forsok + 1));
      const res = await fetch("/api/portal/tester/test-photo", { method: "POST", body: form });
      const r = await res.json() as { url?: string; error?: string };
      if (!res.ok || !r.url) throw new Error(r.error ?? "Bildet kunne ikke lagres.");
      setFoto({ url: r.url, forsok }); setMelding("Bildet er lagret privat til dette slaget.");
    } catch (e) { setMelding(e instanceof Error ? e.message : "Bildet kunne ikke lagres."); }
    finally { setOpptatt(false); }
  }
  async function slett() {
    setOpptatt(true); setMelding("Sletter bildet …");
    try {
      const res = await fetch("/api/portal/tester/test-photo", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, attempt: forsok + 1 }) });
      const r = await res.json() as { error?: string };
      if (!res.ok) throw new Error(r.error ?? "Bildet kunne ikke slettes.");
      setFoto(null); setMelding("Bildet er slettet.");
    } catch (e) { setMelding(e instanceof Error ? e.message : "Bildet kunne ikke slettes."); }
    finally { setOpptatt(false); }
  }
  const vis = foto?.forsok === forsok ? foto : null;
  return (
    <details className="phn-kort" onToggle={(e) => setApen(e.currentTarget.open)}>
      <summary className="phn-etikett" style={{ cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center" }}>Bilde til slag {forsok + 1} · valgfritt</summary>
      <p className="phn-forklar">Ta bilde av ballen eller resultatet. Unngå personer. Bildet lagres privat og deles ikke med grupper.</p>
      {vis && <Image src={vis.url} width={1600} height={1200} unoptimized alt={`Privat bilde til slag ${forsok + 1}`} style={{ width: "100%", height: "auto", borderRadius: 10 }} />}
      {vis
        ? <button type="button" className="phn-knapp sek" disabled={opptatt} onClick={() => void slett()}>Slett bilde</button>
        : <label className="phn-knapp sek" style={{ justifySelf: "start" }}>Legg til bilde<input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={opptatt || !klar || revisjon < 1} onChange={(e) => { void last(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }} /></label>}
      <p className="phn-kilde" role="status" aria-live="polite">{revisjon < 1 ? "Før ett slag først, så kan du knytte et bilde til det." : melding}</p>
    </details>
  );
}
