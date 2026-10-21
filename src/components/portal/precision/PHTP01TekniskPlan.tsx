"use client";

/**
 * PH-TP-01 Teknisk plan (spiller) i nytt design (pakke 4, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/ovelser.html, skjermene «tp» og «tputkast».
 * Stil: playerhq-ny-ovelser.css. Teknisk plan er TEK hele veien.
 *
 * Planen åpner med hovedfokus og ett stort tall. Oppgavene viser læringssteget spilleren er på,
 * hovedmiljøet og rep-mål per steg (vedtak 27.09). «Registrer repetisjoner» skriver til
 * PositionTaskLog via logReps, med læringssteg (bare fullsving), miljø og kommentar til coachen.
 * Er planen et utkast, vises utkastvisningen: spilleren leser, men registrerer ikke.
 *
 * Avvik:
 *   - Det store tallet er andelen slag innenfor målvinduet bare når hovedoppgaven har en rullerende
 *     treffprotokoll. Ellers viser det repetisjoner gjort av rep-målet. «Fra … ved start» vises ikke:
 *     treffandelen ved start lagres ikke.
 *   - Kvalitetssjekk, milepæler og «Før og nå» er ikke med: de finnes ikke i datamodellen ennå
 *     (tilleggene D1 og D2). Kvalitetssjekken skal bare vises, aldri sperre.
 *   - Publiseringsdato og coachens sitat per oppgave vises ikke: de lagres ikke.
 *   - «Legg til video» i registreringen er ikke med: logReps tar ikke imot video.
 *   - Prioritet er rekkefølgen oppgavene har i planen.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-TP-01.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, CircleDot, Pencil, X } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { logReps } from "@/app/portal/tren/teknisk-plan/actions";
import { formaterTall } from "@/lib/format-tall";
import { OKT_BILDER } from "@/lib/portal/okt-bilde";
import { TP_POSISJONER, dato, type TpOppgave, type TpPlan, type TpTmRad } from "@/lib/teknisk-plan/tp-visning";
import {
  BELASTNING_KODER, BELASTNING_LABEL, MOTORIKK_KODER, MOTORIKK_LABEL, type BelastningKode, type MotorikkKode,
} from "@/lib/domain/ak-formel-v2";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-ovelser.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke9-skra.css";

export type PHTP01Props = {
  /** null = spilleren har ingen teknisk plan. */
  plan: TpPlan | null;
  uleste: number;
  /** Neste planlagte økt, eller Workbench når ingen finnes. */
  okt: { href: string; label: string };
  /** Åpner registreringsarket ved første visning (skjermprøven). */
  startMedArk?: boolean;
};

const MELDING_HREF = "/portal/coach/melding/ny";
const REP_FELT: Record<MotorikkKode, "dry" | "lav" | "full"> = { UTEN_BALL: "dry", LAV_HAST: "lav", AUTO: "full" };
const stegKode = (navn: string | null): MotorikkKode | null => MOTORIKK_KODER.find((k) => MOTORIKK_LABEL[k] === navn) ?? null;

function Hode({ plan }: { plan: TpPlan | null }) {
  return (
    <SkraTopp
      lav
      etikett="Teknisk plan"
      bilde="/images/playerhq/tek-video.jpg" bildePosisjon="50% 50%"
      overlinje="Plan · teknisk plan"
      tittel="Teknisk plan"
      ingress={plan ? `${plan.navn}. Fra ${plan.coach ?? "coachen din"}.` : "Coachen din lager planen sammen med deg."}
    />
  );
}

export function PHTP01TekniskPlan({ plan, uleste, okt, startMedArk }: PHTP01Props) {
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      {!plan
        ? <div className="phn phn-skra">
            <Hode plan={null} />
            <SkraFlyt lav>
              <section className="phn-kort" style={{ background: "var(--phn-sand-100)" }}>
                <b className="phn-ov-under">Ingen teknisk plan ennå</b>
                <p className="phn-forklar">Coachen din lager planen sammen med deg. Spør når dere skal starte.</p>
                <div className="phn-knapper"><Link className="phn-knapp pri" href={MELDING_HREF}>Skriv til coachen</Link></div>
              </section>
            </SkraFlyt>
          </div>
        : plan.status === "Utkast"
          ? <Utkast plan={plan} />
          : <Aktiv plan={plan} okt={okt} startMedArk={startMedArk} />}
    </PlayerHQSkall>
  );
}

function Utkast({ plan }: { plan: TpPlan }) {
  const coach = plan.coach ?? "coachen";
  const p = [...new Set(plan.oppgaver.map((o) => o.hovedP))];
  return (
    <div className="phn phn-skra">
      <Hode plan={plan} />
      <SkraFlyt lav>
      <div className="phn-ov-smal phn-seksjon" style={{ gap: 32 }}>
        <div className="phn-ov-utkast">
          <Pencil className="phn-ikon" aria-hidden />
          <span><b className="phn-ov-under">Utkast fra {coach}</b><span className="phn-forklar" style={{ display: "block" }}>{coach} jobber med planen. Du kan lese den nå. Du kan starte økter og registrere når planen er publisert.</span></span>
        </div>
        <section className="phn-seksjon" aria-label="Oppgaver i utkastet">
          <div className="phn-sek-topp"><h2>Oppgaver</h2>{p.length > 0 && <span className="phn-kilde">{plan.oppgaver.length} på {p.join(" og ")}</span>}</div>
          {plan.oppgaver.length === 0
            ? <p className="phn-forklar">Utkastet har ingen oppgaver ennå.</p>
            : plan.oppgaver.map((o, i) => (
                <div key={o.id} className="phn-ov-oppg">
                  <div className="phn-ov-oppg-topp"><div><span className="phn-ov-akse-tekst phn-ov-tek">PRIORITET {i + 1} · {o.pNummer}</span><h3>{o.tittel}</h3></div></div>
                  <p className="phn-forklar">Start: {[o.stegNaa, o.miljoNaa].filter(Boolean).join(", ") || "—"}.</p>
                </div>
              ))}
        </section>
        <div className="phn-knapper"><Link className="phn-knapp sek" href={MELDING_HREF}>Skriv til {coach}</Link></div>
      </div>
      </SkraFlyt>
    </div>
  );
}

function Aktiv({ plan, okt, startMedArk }: { plan: TpPlan; okt: PHTP01Props["okt"]; startMedArk?: boolean }) {
  const hoved = plan.oppgaver.find((o) => plan.hovedfokus.includes(o.hovedP)) ?? plan.oppgaver[0] ?? null;
  const [valgtP, setValgtP] = useState(hoved?.hovedP ?? "P1.0");
  const [ark, setArk] = useState(!!startMedArk && plan.oppgaver.length > 0);
  const [kvittering, setKvittering] = useState<string | null>(null);
  const perP = useMemo(() => {
    const m = new Map<string, TpOppgave[]>();
    for (const o of plan.oppgaver) m.set(o.hovedP, [...(m.get(o.hovedP) ?? []), o]);
    return m;
  }, [plan.oppgaver]);
  const tmRader = plan.oppgaver.flatMap((o) => o.tm.map((r) => ({ r, o })));
  const iP = perP.get(valgtP) ?? [];
  const siste = hoved?.protokoll?.siste ?? null;

  return (
    <div className="phn phn-skra">
      <Hode plan={plan} />
      <SkraFlyt lav>
      {kvittering && <p className="phn-ov-status" role="status"><Check className="phn-ikon" aria-hidden /><span>{kvittering}</span></p>}
      <div className="phn-ov-tphelt">
        {/* eslint-disable-next-line @next/next/no-img-element -- statisk bilde fra public, ingen tekst oppå */}
        <img src={OKT_BILDER.tek.src} alt="" width={1400} height={933} />
        <div className="phn-ov-tphelt-tekst">
          <span className="phn-ov-akse-merke">TEK · HOVEDFOKUS</span>
          <span className="phn-ov-navn">{hoved ? `${hoved.tittel} i ${hoved.pNummer} ${hoved.posisjonNavn}` : "Ingen oppgaver ennå"}</span>
          {siste
            ? <div className="phn-ov-stort"><strong>{Math.round((siste.treff / siste.antall) * 100)}</strong><span>% av siste {siste.antall} slag<br />innenfor målvinduet</span></div>
            : <div className="phn-ov-stort"><strong>{formaterTall(plan.gjort, 0)}</strong><span>repetisjoner<br />av {plan.maal > 0 ? formaterTall(plan.maal, 0) : "—"} i planen</span></div>}
          <div className="phn-ov-info"><span>{plan.oppgaver.length} {plan.oppgaver.length === 1 ? "oppgave" : "oppgaver"}</span><span>Sist registrert {plan.sistRegistrert}</span></div>
        </div>
      </div>
      <div className="phn-knapper">
        <Link className="phn-knapp pri" style={{ flex: 1 }} href={okt.href}>{okt.label}</Link>
        <button type="button" className="phn-knapp sek" style={{ flex: 1 }} disabled={plan.oppgaver.length === 0} onClick={() => setArk(true)}>Registrer repetisjoner</button>
      </div>

      <div className="phn-ov-tpgrid">
        <div>
          {tmRader.length > 0 && (
            <section className="phn-seksjon" aria-label="Fra og til">
              <div className="phn-sek-topp"><h2>Fra og til</h2><span className="phn-kilde">TrackMan</span></div>
              <div className="phn-kort phn-ov-fratil">{tmRader.map(({ r, o }) => <FraTil key={r.id} r={r} oppgave={o.tittel} />)}</div>
            </section>
          )}
          <section className="phn-seksjon" aria-label="Oppgaver">
            <div className="phn-sek-topp"><h2>Oppgaver fra {plan.coach ?? "coachen"}</h2><span className="phn-kilde">{plan.oppgaver.length} i planen</span></div>
            {plan.oppgaver.length === 0
              ? <p className="phn-forklar">Planen har ingen oppgaver ennå.</p>
              : plan.oppgaver.map((o, i) => <Oppgave key={o.id} o={o} nr={i + 1} />)}
          </section>
        </div>
        <div>
          <section className="phn-seksjon" aria-label="Svingen">
            <div className="phn-sek-topp"><h2>Svingen P1.0–P10.0</h2></div>
            <div className="phn-ov-plinje" role="group" aria-label="Posisjon">
              {TP_POSISJONER.map((p) => {
                const n = perP.get(p.pNummer)?.length ?? 0;
                return <button key={p.pNummer} type="button" aria-pressed={valgtP === p.pNummer} onClick={() => setValgtP(p.pNummer)}><i>{p.pNummer}</i><span>{p.navn}</span>{n > 0 && <em>{n} {n === 1 ? "oppgave" : "oppgaver"}</em>}</button>;
              })}
            </div>
            <div className="phn-ov-ppanel">
              <b className="phn-ov-under">{valgtP} {TP_POSISJONER.find((p) => p.pNummer === valgtP)?.navn ?? ""}</b>
              {iP.length === 0
                ? <p className="phn-forklar">Ingen oppgave her i denne planen.</p>
                : <>
                    <p className="phn-forklar">{iP.map((o) => o.tittel).join(" · ")}</p>
                    {iP.some((o) => o.tm.length > 0)
                      ? <dl className="phn-ov-tmtall">{iP.flatMap((o) => o.tm).map((r) => <div key={r.id}><dt>{r.navn}</dt><dd>{tmTall(r, r.naa)}</dd></div>)}</dl>
                      : <p className="phn-kilde">Ingen TrackMan-mål på denne posisjonen.</p>}
                  </>}
            </div>
          </section>
          <section className="phn-seksjon" aria-label="Siste registreringer">
            <div className="phn-sek-topp"><h2>Siste registreringer</h2></div>
            {plan.logg.length === 0
              ? <p className="phn-forklar">Ingen registreringer ennå.</p>
              : <div className="phn-ov-reglist">{plan.logg.slice(0, 6).map((l) => (
                  <div key={l.id}>
                    <b>{l.oppgave}{l.steg ? ` · ${l.steg}` : ""}</b><span className="v">{l.reps} rep</span>
                    <span>{[l.dato, l.kilde, l.miljo, l.kommentar ? `«${l.kommentar}»` : null].filter(Boolean).join(" · ")}</span>
                  </div>
                ))}</div>}
          </section>
        </div>
      </div>
      {ark && <RegistrerArk plan={plan} start={hoved} onLukk={() => setArk(false)} onLagret={(t) => { setArk(false); setKvittering(t); }} />}
      </SkraFlyt>
    </div>
  );
}

function tmTall(r: TpTmRad, v: number | null): string {
  return v == null ? "—" : `${formaterTall(v, r.desimaler, true)}${r.enhet === "°" ? "°" : r.enhet ? ` ${r.enhet}` : ""}`;
}

function maalTekst(r: TpTmRad): string {
  if (r.fra == null && r.til == null) return "—";
  if (r.fra == null) return `under ${tmTall(r, r.til)}`;
  if (r.til == null) return `over ${tmTall(r, r.fra)}`;
  if (r.fra === r.til) return tmTall(r, r.fra);
  return `${tmTall(r, Math.min(r.fra, r.til))} til ${tmTall(r, Math.max(r.fra, r.til))}`;
}

function Skala({ r }: { r: TpTmRad }) {
  const tall = [r.utgangspunkt, r.naa, r.fra, r.til].filter((v): v is number => v != null);
  if (tall.length < 2 || (r.fra == null && r.til == null)) return null;
  const lo = Math.min(...tall), hi = Math.max(...tall), pad = (hi - lo || 1) * 0.15;
  const x = (v: number) => 8 + ((v - (lo - pad)) / (hi - lo + 2 * pad)) * 304;
  const a = r.fra != null ? x(r.til != null ? Math.min(r.fra, r.til) : r.fra) : 8;
  const b = r.til != null ? x(r.fra != null ? Math.max(r.fra, r.til) : r.til) : 312;
  return (
    <svg className="phn-ov-skala" viewBox="0 0 320 36" role="img" aria-label={`${r.navn}: start ${tmTall(r, r.utgangspunkt)}, nå ${tmTall(r, r.naa)}, mål ${maalTekst(r)}`}>
      <line x1="8" y1="18" x2="312" y2="18" stroke="var(--phn-sand-300)" strokeWidth="2" />
      <rect x={Math.min(a, b)} y="8" width={Math.max(4, Math.abs(b - a))} height="20" rx="4" fill="var(--phn-amber-50)" stroke="var(--phn-tek-ink)" strokeWidth="1.5" />
      {r.utgangspunkt != null && r.naa != null && <line x1={x(r.utgangspunkt)} y1="18" x2={x(r.naa)} y2="18" stroke="var(--phn-tek-ink)" strokeWidth="3" />}
      {r.utgangspunkt != null && <circle cx={x(r.utgangspunkt)} cy="18" r="6" fill="var(--phn-hvit)" stroke="var(--phn-tek-ink)" strokeWidth="2" />}
      {r.naa != null && <circle cx={x(r.naa)} cy="18" r="7" fill="var(--phn-tek-ink)" />}
    </svg>
  );
}

function FraTil({ r, oppgave }: { r: TpTmRad; oppgave: string }) {
  const pille = r.fra == null && r.til == null
    ? <span className="phn-pille noy">Mål ikke satt</span>
    : r.innenfor == null ? <span className="phn-pille noy">Ikke målt</span>
    : r.innenfor ? <span className="phn-pille ok">Innenfor</span> : <span className="phn-pille vent">På vei</span>;
  return (
    <div className="phn-ov-ftrad">
      <div className="phn-ov-fttopp"><b>{r.navn}</b>{pille}</div>
      <Skala r={r} />
      <dl className="phn-ov-fttall">
        <div><dt>Start</dt><dd>{tmTall(r, r.utgangspunkt)}</dd></div>
        <div><dt>Nå</dt><dd>{tmTall(r, r.naa)}</dd></div>
        <div><dt>Mål</dt><dd>{maalTekst(r)}</dd></div>
      </dl>
      <p className="phn-kilde">{oppgave}, {r.klubb}. Start {r.utgangspunktDato}. Nå er sist målt {r.sistMaalt}.</p>
    </div>
  );
}

function Oppgave({ o, nr }: { o: TpOppgave; nr: number }) {
  const her = [o.stegNaa, o.miljoNaa].filter(Boolean).join(", ");
  return (
    <div className="phn-ov-oppg">
      <div className="phn-ov-oppg-topp">
        <div><span className="phn-ov-akse-tekst phn-ov-tek">PRIORITET {nr} · {o.pNummer}</span><h3>{o.tittel}</h3></div>
        <span className="phn-pille noy">{o.status}</span>
      </div>
      <p className="phn-forklar">{her ? <>Du er på <b>{her}</b>.</> : "Læringssteg er ikke satt."}{o.fokus !== "—" ? ` Teknisk fokus: ${o.fokus}.` : ""}</p>
      <div className="phn-ov-reprader">
        {o.steg.map((s) => {
          const erHer = o.familie === "FULLSVING" && s.navn === o.stegNaa;
          const pst = s.maal ? Math.min(100, Math.round((s.gjort / s.maal) * 100)) : 0;
          return (
            <div key={s.navn} className={`phn-ov-reprad${erHer ? " her" : ""}`}>
              <span>{s.navn}{erHer && <span className="phn-ov-her">Her nå</span>}</span>
              <span className="v">{s.gjort} av {s.maal ?? "—"}</span>
              <span className="phn-ov-spor"><span style={{ width: `${pst}%` }} /></span>
            </div>
          );
        })}
      </div>
      <p className="phn-kilde">{o.kilde}</p>
    </div>
  );
}

function RegistrerArk({ plan, start, onLukk, onLagret }: { plan: TpPlan; start: TpOppgave | null; onLukk: () => void; onLagret: (tekst: string) => void }) {
  const router = useRouter();
  const ark = useRef<HTMLDialogElement>(null);
  const [oppgaveId, setOppgaveId] = useState(start?.id ?? plan.oppgaver[0]?.id ?? "");
  const oppgave = plan.oppgaver.find((o) => o.id === oppgaveId) ?? null;
  const [steg, setSteg] = useState<MotorikkKode>(stegKode(start?.stegNaa ?? null) ?? "LAV_HAST");
  const [miljo, setMiljo] = useState<BelastningKode | null>(null);
  const [antall, setAntall] = useState(0);
  const [kommentar, setKommentar] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [lagrer, run] = useTransition();
  useEffect(() => { ark.current?.showModal(); }, []);

  const velgOppgave = (o: TpOppgave) => { setOppgaveId(o.id); setSteg(stegKode(o.stegNaa ?? null) ?? "LAV_HAST"); };
  const lagre = () => {
    if (!oppgave) return;
    if (antall <= 0) { setFeil("Legg inn minst én repetisjon."); return; }
    const fullsving = oppgave.familie === "FULLSVING";
    run(async () => {
      try {
        await logReps(oppgave.id, { [fullsving ? REP_FELT[steg] : "full"]: antall }, { belastning: miljo, kommentar });
        onLagret(`${antall} repetisjoner er registrert ${dato(new Date()).slice(0, 5)} på ${oppgave.tittel}${fullsving ? `, ${MOTORIKK_LABEL[steg]}` : ""}.${kommentar.trim() ? " Kommentaren er sendt til coachen." : ""}`);
        router.refresh();
      } catch {
        setFeil("Repetisjonene ble ikke registrert. Prøv igjen.");
      }
    });
  };

  return (
    <dialog ref={ark} className="phn-ark" aria-label="Registrer repetisjoner" onClose={onLukk} onClick={(e) => { if (e.target === ark.current) ark.current?.close(); }}>
      <div className="phn-ark-kropp">
        <div className="phn-ark-topp">
          <h2>Registrer repetisjoner</h2>
          <button type="button" className="phn-lukk" aria-label="Lukk" onClick={() => ark.current?.close()}><X className="phn-ikon" aria-hidden /></button>
        </div>
        {feil && <p className="phn-melding" role="alert">{feil}</p>}
        <div className="phn-felt"><span>Oppgave</span>
          <div className="phn-valg" role="group" aria-label="Oppgave">{plan.oppgaver.map((o) => <button key={o.id} type="button" aria-pressed={o.id === oppgaveId} onClick={() => velgOppgave(o)}>{o.tittel}</button>)}</div>
        </div>
        {oppgave?.familie === "FULLSVING" && (
          <div className="phn-felt"><span>Læringssteg</span>
            <div className="phn-valg" role="group" aria-label="Læringssteg">{MOTORIKK_KODER.map((m) => <button key={m} type="button" aria-pressed={steg === m} onClick={() => setSteg(m)}>{MOTORIKK_LABEL[m]}</button>)}</div>
          </div>
        )}
        <div className="phn-felt"><span>Miljø</span>
          <div className="phn-valg" role="group" aria-label="Miljø">{BELASTNING_KODER.map((b) => <button key={b} type="button" aria-pressed={miljo === b} onClick={() => setMiljo(miljo === b ? null : b)}>{BELASTNING_LABEL[b]}</button>)}</div>
        </div>
        <div className="phn-ov-teller">
          <strong aria-live="polite">{antall}</strong><span className="sub">repetisjoner</span>
          <div className="phn-ov-trinn">
            {[-1, 1, 10, 25].map((d) => <button key={d} type="button" aria-label={d < 0 ? "Minus 1" : `Pluss ${d}`} onClick={() => setAntall((n) => Math.min(500, Math.max(0, n + d)))}>{d < 0 ? "−1" : `+${d}`}</button>)}
          </div>
        </div>
        <label className="phn-felt">Kommentar til coachen<textarea rows={2} value={kommentar} maxLength={1000} placeholder="Hva kjente du?" onChange={(e) => setKommentar(e.target.value)} /></label>
        <p className="phn-kilde"><CircleDot className="phn-ikon" aria-hidden style={{ width: 14, height: 14, verticalAlign: -2 }} /> Kilde: manuelt, {dato(new Date())}.</p>
        <button type="button" className="phn-knapp pri phn-ov-knapp-stor" disabled={lagrer || !oppgave} onClick={lagre}>{lagrer ? "Lagrer …" : "Lagre"}</button>
      </div>
    </dialog>
  );
}
