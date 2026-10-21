"use client";

/**
 * PH-13 Øvelsesbank i nytt design (pakke 4, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/ovelser.html, skjerm «bank». Stil: playerhq-ny-ovelser.css.
 *
 * Pyramiden velges først (vedtak 28.09), så treningsområdet. Det store tallet er antall øvelser som
 * passer filteret. Øvelsene er fylte kort i aksefargen med bilde. Trykk åpner øvelsen.
 *
 * Avvik:
 *   - Filteret «Måleutstyr» (med eller uten TrackMan) er ikke med: øvelsene har ikke måleutstyr i basen.
 *     Treningsmiljø og press viser bare valg som finnes i banken.
 *   - Caddie-forslaget sammenligner ikke med neste kategori og viser ikke antall runder: SG-gapet gir
 *     bare kategori og snitt. Uten SG-tall eller uten øvelse i området vises ikke forslaget.
 *   - Caddie-utkastene (godta eller forkast) fra forrige versjon er tatt ut. De ble aldri lagret.
 *   - «Ny egen øvelse» lagrer akse, treningsområde og navn. Resten av de åtte trinnene fylles i Workbench.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-13.
 *   - Coachens bank i AgencyOS (`coach`, beslutning 16.10.2026) viser samme side for coachens tilgang. Kortene
 *     åpner Øvelser i Plan-hub (AG-14), der coachen endrer og lager øvelser; «Ny egen øvelse», Caddie og
 *     break-tabellen (spillerens sider) er ikke med.
 */
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import { formaterFortegn } from "@/lib/format-tall";
import {
  OV_AKSE_KODE, OV_PYRAMIDE, TOMT_FILTER, antallPerAkse, filterAktivt, omraadeValgFor, omraaderFor, passer, verdierI,
  type OvAkse, type OvFilter, type OvelseVisning,
} from "@/lib/portal-drills/ovelser-visning";
import { opprettEgenOvelse } from "@/app/portal/drills/actions";
import { SkraFlyt, SkraHelt, SkraKort, SkraTom, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-ovelser.css";
import "@/styles/playerhq-ny-ovelser-skra.css";

export type PH13Caddie = { ovelseId: string; omraade: string; sg: number };
export type PH13BankProps = {
  ovelser: OvelseVisning[];
  caddie: PH13Caddie | null;
  /** Skjermprøven: åpne «Ny egen øvelse» ved første visning. */
  startMedNy?: boolean;
  /** Coachens bank i AgencyOS (/admin/ovelser): kortene åpner Plan-hub, ingen spillerhandlinger. */
  coach?: boolean;
};

const COACH_OVELSE_HREF = "/admin/plan?fane=ovelser";

export function OvelseKort({ o, href = `/portal/drills/${o.id}` }: { o: OvelseVisning; href?: string }) {
  const info = [o.min != null ? `${o.min} min` : null, o.mengde, o.miljo[0] ?? null].filter(Boolean) as string[];
  return (
    <Link className={`phn-ov-kort ${o.akse}`} href={href}>
      {/* eslint-disable-next-line @next/next/no-img-element -- statisk bilde fra public, ingen tekst oppå */}
      <img src={o.bilde.src} alt="" width={168} height={168} loading="lazy" style={{ objectPosition: o.bilde.posisjon }} />
      <span className="phn-ov-kort-tekst">
        <span className="phn-ov-akse-tekst">{OV_AKSE_KODE[o.akse]}{o.omraade ? ` · ${o.omraade.toUpperCase()}` : ""}</span>
        <span className="phn-ov-navn">{o.navn}{o.egen && <span className="phn-lys-merke">Egen</span>}</span>
        <span className="phn-ov-kort-info">{info.length ? info.map((t) => <span key={t}>{t}</span>) : <span>—</span>}</span>
      </span>
    </Link>
  );
}

function Chips({ valg, verdi, onVelg, navn }: { valg: string[]; verdi: string | null; onVelg: (v: string | null) => void; navn: string }) {
  return (
    <div className="phn-ov-chips" role="group" aria-label={navn}>
      {valg.map((v) => <button key={v} type="button" aria-pressed={verdi === v} onClick={() => onVelg(verdi === v ? null : v)}>{v}</button>)}
    </div>
  );
}

export function PH13DrillBank({ ovelser, caddie, startMedNy, coach = false }: PH13BankProps) {
  const [f, setF] = useState<OvFilter>(TOMT_FILTER);
  const [ny, setNy] = useState(!!startMedNy);
  const [melding, setMelding] = useState<string | null>(null);

  const treff = useMemo(() => ovelser.filter((o) => passer(o, f)), [ovelser, f]);
  const perAkse = useMemo(() => antallPerAkse(ovelser), [ovelser]);
  const aktivt = filterAktivt(f);
  const omraader = f.akse ? omraaderFor(ovelser, f.akse) : [];
  const miljoValg = useMemo(() => verdierI(ovelser, "miljo"), [ovelser]);
  const pressValg = useMemo(() => verdierI(ovelser, "press"), [ovelser]);
  const caddieOvelse = caddie ? ovelser.find((o) => o.id === caddie.ovelseId) ?? null : null;
  const listeTittel = f.omraade ?? (f.akse ? `${OV_AKSE_KODE[f.akse]}-øvelser` : "Alle øvelser");
  const visBreak = !coach && (!f.akse || f.akse === "slag" || f.akse === "tek");

  const velgAkse = (a: OvAkse) => setF((x) => ({ ...x, akse: x.akse === a ? null : a, omraade: null }));

  const topp = (
    <SkraTopp
      lav
      etikett="Øvelsesbank"
      bilde="/images/playerhq/slag-putting.jpg" bildePosisjon="50% 60%"
      overlinje={coach ? "Workbench · øvelsesbank" : "Plan · øvelsesbank"}
      tittel="Øvelsesbank"
      ingress={`${treff.length} ${aktivt ? (treff.length === 1 ? "øvelse passer" : "øvelser passer") : "øvelser i banken"}`}
    />
  );

  const arkOgMelding = (
    <>
      {melding && <p className="phn-ov-status" role="status">{melding}</p>}
      {ny && <NyOvelseArk onLukk={() => setNy(false)} onLagret={(navn) => { setNy(false); setMelding(`${navn} er lagret. Den ligger først i banken.`); }} />}
    </>
  );

  if (ovelser.length === 0) {
    return (
      <div className="phn phn-skra phn-ov-skra">
        {topp}
        <SkraFlyt lav>
          <SkraKort tittel="Ingen øvelser ennå">
            {coach
              ? <SkraTom handling={<Link className="phn-knapp pri" href={COACH_OVELSE_HREF}>Til Plan-hub</Link>}>
                  Lag øvelser i Plan-hub eller med pluss i Workbench.
                </SkraTom>
              : <SkraTom handling={<button type="button" className="phn-knapp pri" onClick={() => setNy(true)}><Plus className="phn-ikon" aria-hidden />Ny egen øvelse</button>}>
                  Lag din første øvelse, eller be coachen dele sine.
                </SkraTom>}
          </SkraKort>
          {arkOgMelding}
        </SkraFlyt>
      </div>
    );
  }

  return (
    <div className="phn phn-skra phn-ov-skra">
      {topp}
      <SkraFlyt lav className="skra-idag skra-ovelser">
        <div className="skra-kol skra-v">
          <div className="skra-plass" style={{ order: 3 }}>
            <SkraKort tittel={listeTittel} meta={aktivt ? undefined : String(treff.length)} etikett="Øvelser">
              {aktivt && <button type="button" className="phn-ov-lenke" onClick={() => setF(TOMT_FILTER)}>Nullstill filter</button>}
              {treff.length > 0
                ? <div className="phn-ov-liste">{treff.map((o) => <OvelseKort key={o.id} o={o} href={coach ? COACH_OVELSE_HREF : undefined} />)}</div>
                : <SkraTom>{coach ? "Ingen øvelser passer filteret. Ta bort et filter." : "Ingen øvelser passer filteret. Ta bort et filter, eller lag en egen øvelse."}</SkraTom>}
            </SkraKort>
          </div>
          {visBreak && (
            <div className="skra-plass" style={{ order: 4 }}>
              <Link className="phn-rad-lenke" href="/portal/drills/break-tabell">
                <span><span className="phn-ov-akse-tekst" style={{ color: "var(--phn-slag-ink)" }}>PUTTING</span><b>Break-tabell</b><span className="phn-kilde">Hvor mye du sikter utenfor hullet, etter avstand og helling</span></span>
                <ChevronRight className="phn-ikon" aria-hidden />
              </Link>
            </div>
          )}
        </div>
        <div className="skra-kol skra-h">
          {caddie && caddieOvelse && !aktivt && (
            <div className="skra-plass" style={{ order: 1 }}>
              <SkraHelt
                etikett="Caddie foreslår"
                overlinje={`Caddie foreslår · ${caddie.omraade}`}
                tid={formaterFortegn(caddie.sg, 1)} tidEtter="slag per runde"
                tittel={caddieOvelse.navn}
                meta={`Svakeste område i Strokes Gained. Trener ${caddieOvelse.omraade ? caddieOvelse.omraade.toLowerCase() : "dette området"}.`}
                handlinger={[{ tekst: "Se øvelsen", href: `/portal/drills/${caddieOvelse.id}` }]}
              />
            </div>
          )}
          <div className="skra-plass" style={{ order: 2 }}>
            <SkraKort tittel="Finn øvelse" etikett="Filter">
              <div className="phn-ov-filterkol">
                <label className="phn-felt">Søk<input type="search" value={f.sok} placeholder="Navn eller treningsområde" onChange={(e) => setF((x) => ({ ...x, sok: e.target.value }))} /></label>
                <section className="phn-seksjon" aria-label="Pyramiden">
                  <div className="phn-sek-topp"><h2>1 Velg i pyramiden</h2></div>
                  <div className="phn-ov-pyramide">
                    {OV_PYRAMIDE.map((a) => <button key={a} type="button" data-akse={a} aria-pressed={f.akse === a} onClick={() => velgAkse(a)}>{OV_AKSE_KODE[a]} <b>{perAkse[a]}</b></button>)}
                  </div>
                </section>
                {f.akse && (
                  <section className="phn-seksjon" aria-label="Treningsområde">
                    <div className="phn-sek-topp"><h2>2 Treningsområde</h2></div>
                    {omraader.length > 0
                      ? <div className="phn-ov-chips" role="group" aria-label="Treningsområde">
                          <button type="button" aria-pressed={!f.omraade} onClick={() => setF((x) => ({ ...x, omraade: null }))}>Alle</button>
                          {omraader.map((o) => <button key={o} type="button" aria-pressed={f.omraade === o} onClick={() => setF((x) => ({ ...x, omraade: o }))}>{o}</button>)}
                        </div>
                      : <p className="phn-kilde">Øvelsene i {OV_AKSE_KODE[f.akse]} har ikke treningsområde ennå.</p>}
                  </section>
                )}
                {(miljoValg.length > 0 || pressValg.length > 0) && (
                  <details className="phn-ov-flere">
                    <summary>Flere filter <ChevronDown className="phn-ikon" aria-hidden /></summary>
                    <div className="phn-ov-innmat">
                      {miljoValg.length > 0 && <div className="phn-felt"><span>Treningsmiljø</span><Chips navn="Treningsmiljø" valg={miljoValg} verdi={f.miljo} onVelg={(v) => setF((x) => ({ ...x, miljo: v }))} /></div>}
                      {pressValg.length > 0 && <div className="phn-felt"><span>Press</span><Chips navn="Press" valg={pressValg} verdi={f.press} onVelg={(v) => setF((x) => ({ ...x, press: v }))} /></div>}
                    </div>
                  </details>
                )}
                {coach
                  ? <Link className="phn-knapp sek" href={COACH_OVELSE_HREF}>Lag og endre øvelser i Plan-hub</Link>
                  : <button type="button" className="phn-knapp sek" onClick={() => setNy(true)}><Plus className="phn-ikon" aria-hidden />Ny egen øvelse</button>}
              </div>
            </SkraKort>
          </div>
        </div>
        {arkOgMelding}
      </SkraFlyt>
    </div>
  );
}

const AKSE_VALG: readonly OvAkse[] = ["fys", "tek", "slag", "spill", "turn"];

function NyOvelseArk({ onLukk, onLagret }: { onLukk: () => void; onLagret: (navn: string) => void }) {
  const router = useRouter();
  const ark = useRef<HTMLDialogElement>(null);
  const [akse, setAkse] = useState<OvAkse>("slag");
  const [omraade, setOmraade] = useState<string>(omraadeValgFor("slag")[0]?.kode ?? "");
  const [navn, setNavn] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [lagrer, start] = useTransition();
  useEffect(() => { ark.current?.showModal(); }, []);

  const byttAkse = (a: OvAkse) => { setAkse(a); setOmraade(omraadeValgFor(a)[0]?.kode ?? ""); };
  const lagre = () => {
    if (!navn.trim()) { setFeil("Skriv et navn på øvelsen."); return; }
    start(async () => {
      setFeil(null);
      const r = await opprettEgenOvelse({ akse, omraade, navn: navn.trim() });
      if (!r.ok) { setFeil(r.error); return; }
      onLagret(navn.trim());
      router.refresh();
    });
  };

  return (
    <dialog ref={ark} className="phn-ark" aria-label="Ny egen øvelse" onClose={onLukk} onClick={(e) => { if (e.target === ark.current) ark.current?.close(); }}>
      <div className="phn-ark-kropp">
        <div className="phn-ark-topp">
          <h2>Ny egen øvelse</h2>
          <button type="button" className="phn-lukk" aria-label="Lukk" onClick={() => ark.current?.close()}><X className="phn-ikon" aria-hidden /></button>
        </div>
        {feil && <p className="phn-melding" role="alert">{feil}</p>}
        <div className="phn-felt"><span>Pyramide</span>
          <div className="phn-ov-chips" role="group" aria-label="Pyramide">
            {AKSE_VALG.map((a) => <button key={a} type="button" aria-pressed={akse === a} onClick={() => byttAkse(a)}>{OV_AKSE_KODE[a]}</button>)}
          </div>
        </div>
        <label className="phn-felt">Treningsområde
          <select value={omraade} onChange={(e) => setOmraade(e.target.value)}>
            {omraadeValgFor(akse).map((o) => <option key={o.kode} value={o.kode}>{o.navn}</option>)}
          </select>
        </label>
        <label className="phn-felt">Navn<input type="text" value={navn} maxLength={120} placeholder="F.eks. Chip til tre mål" onChange={(e) => setNavn(e.target.value)} /></label>
        <p className="phn-kilde">Resten av de åtte trinnene fyller du i Workbench. Øvelsen er bare din og coachens.</p>
        <button type="button" className="phn-knapp pri phn-ov-knapp-stor" disabled={lagrer} onClick={lagre}>{lagrer ? "Lagrer …" : "Lagre øvelsen"}</button>
      </div>
    </dialog>
  );
}
