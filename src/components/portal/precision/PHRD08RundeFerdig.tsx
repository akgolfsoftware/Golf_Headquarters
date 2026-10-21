/**
 * PH-RD-08 Runde gjennomført — nytt design (pakke 5, godkjent av Anders 14.10.2026, utkast 2 med farge).
 * Fasit: docs/design-system/utkast-playerhq/runder.html, skjerm «ferdig». Stil: playerhq-ny-runder.css.
 * Siden viser en lagret runde: brutto score, Strokes Gained, Tiger 5 og scorekortet.
 *
 * Avvik:
 *   - «Lagre runden» finnes ikke: runden er lagret når siden åpnes. Notatet vises når det finnes, men kan ikke endres her
 *     (ingen handling for å endre notat på en lagret runde).
 *   - «Planen din oppdateres» viser ikke et konkret forslag: forslaget lages av agentene etter lagring og kommer i Innboks.
 *   - SG sammenlignes med referansen runden ble regnet mot, ikke med «Kategori B» (kategorien er ikke lagret på runden).
 *   - Tiger 5: «Bom på enkel up and down» vises som «—» til det er vedtatt hva «enkel» betyr. «Bogey fra innenfor 130 m»
 *     krever slag ført slag for slag.
 *   - PH-RD-09 Rediger er ikke tegnet om: «Rediger hull for hull», «Slag for slag» og manuell SG bruker dagens skjemaer.
 *     Sletting av en runde finnes ikke i appen.
 *   - «Fullfør slag-kjeden» går til slag for slag (/slag); den gamle /fullfor-adressen sendte tilbake hit.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-RD-08.
 */
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { ManuellSgRedigering } from "@/components/portal/runde-ny/manuell-sg-redigering";
import { SG_DETALJGRUPPER, type ManuellSgVerdier } from "@/lib/portal-runder/manuell-sg";
import { RUNDE_DATAQUALITY_META, RUNDE_SG_KILDE, RUNDE_STATUS_META, type RundeRegistreringStatus } from "@/lib/runde-logg/kontrakt";
import type { Tiger5Regel } from "@/lib/portal-runder/tiger5-runde";
import { UpGameImportModal } from "@/app/portal/mal/runder/[id]/upgame-import-modal";
import { ResultatKontekst } from "@/components/tester/ResultatKontekst";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { SG_NAVN, Scorekort, SgListe, Tilbake, sgEn, tilParTekst } from "./PHRunderFelles";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-runder.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";

export type PHRD08Hull = { nr: number; par: number; score: number; putter?: number | null };
export type PHRD08Data = {
  id: string;
  nettoppLagret: boolean;
  baneNavn: string;
  /** «dd.mm.åååå», Oslo-tid. */
  datoKort: string;
  score: number;
  /** Sum av par for spilte hull. */
  par: number;
  sgTotal: number | null;
  sgKategorier: ReadonlyArray<{ akse: "OTT" | "APP" | "ARG" | "PUTT"; sg: number }>;
  sgSource: string | null;
  registrering: RundeRegistreringStatus;
  manuellSg?: ManuellSgVerdier;
  granulaerSg: Partial<ManuellSgVerdier>;
  hull: PHRD08Hull[];
  erEier: boolean;
  visKjedeStatus: boolean;
  antallKomplette: number;
  antallHullMedScore: number;
  putter: { totalt: number; hull: number } | null;
  fairway: { treff: number; av: number } | null;
  gir: { treff: number; av: number } | null;
  /** null når ingen slag er ført (ingen kilde for straff). */
  straff: number | null;
  ut: { score: number; par: number } | null;
  inn: { score: number; par: number } | null;
  /** Turnering eller trening; null når typen ikke er satt. */
  art?: "turnering" | "trening" | null;
  notat?: string | null;
  tiger5?: Tiger5Regel[];
};

/** Fortegn og én desimal: «+0,4», «−0,8», «0,0», «—». */
export function sg1(v: number | null): string {
  return sgEn(v);
}
export function tilPar(d: number): string {
  return tilParTekst(d);
}

function sgKildeTekst(d: PHRD08Data): string {
  if (d.sgSource === RUNDE_SG_KILDE.BEREGNET) return "Regnet fra slagene dine";
  if (d.sgSource === RUNDE_SG_KILDE.MANUAL) return "Ført for hånd";
  if (d.sgSource === RUNDE_SG_KILDE.ESTIMERT) return "Estimert fra score";
  return "Ikke registrert";
}

function Tiger5({ regler }: { regler: Tiger5Regel[] }) {
  const kjente = regler.filter((r) => r.antall != null);
  const sum = kjente.reduce((s, r) => s + (r.antall ?? 0), 0);
  return (
    <section className="phn-kort phr-kort">
      <div className="phn-sek-topp"><h2>Tiger 5</h2><span className="phn-kilde">{kjente.length ? `${sum} bortkastede slag` : "—"}</span></div>
      <div className="phr-tiger">
        {regler.map((r) => (
          <div key={r.navn}>
            <span><b>{r.navn}</b><span>{r.antall == null ? "Mangler data" : r.hull.length ? `Hull ${r.hull.join(", ")}` : "Ingen"}</span></span>
            <span className={`v${r.antall == null ? "" : r.antall === 0 ? " null" : " feil"}`}>{r.antall ?? "—"}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PHRD08RundeFerdig({ data: d, uleste = 0 }: { data: PHRD08Data; uleste?: number }) {
  const status = RUNDE_STATUS_META[d.registrering.status];
  const kvalitet = RUNDE_DATAQUALITY_META[d.registrering.dataQuality];
  const harHull = d.hull.length > 0;
  const harDetalj = SG_DETALJGRUPPER.some((g) => g.fields.some((f) => d.granulaerSg[f.key] != null));
  const artTekst = d.art === "turnering" ? "TURNERING" : d.art === "trening" ? "TRENINGSRUNDE" : "RUNDE";
  const sgRader = d.sgKategorier.map((k) => ({ navn: SG_NAVN[k.akse], kode: k.akse, v: k.sg }));
  const tiger5 = d.tiger5 ?? [];

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <div className="phn phn-skra">
      <SkraTopp
        lav
        etikett="Runde"
        bilde="/images/playerhq/spill-bane.jpg" bildePosisjon="50% 50%"
        overlinje={`Runde gjennomført · ${d.datoKort}`}
        tittel={d.baneNavn}
        handling={<span className="skra-topp-rad"><span className="skra-tilbake"><Tilbake href="/portal/mal/runder" tekst="Runder" /></span>{d.erEier && harHull && <Link className="phn-knapp pri skra-topp-knapp" href={`/portal/mal/runder/${d.id}/hull`}>Rediger</Link>}</span>}
      />
      <SkraFlyt lav>
        {d.nettoppLagret && d.erEier && (
          <div className="phr-sjekk ok" role="status">
            <span><b>Runden er lagret.</b> {d.sgSource === RUNDE_SG_KILDE.MANUAL ? "SG-tallene dine er lagret." : d.sgTotal != null ? "Strokes Gained er klar." : "Før slag for slag for å få Strokes Gained."}</span>
          </div>
        )}
        {d.visKjedeStatus && (
          <div className="phr-sjekk vent">
            <span>SG venter på slagene: {d.antallKomplette} av {d.antallHullMedScore} hull er komplette.{" "}
              {d.erEier && <Link href={`/portal/mal/runder/${d.id}/slag`} style={{ color: "inherit" }}>Før slagene</Link>}</span>
          </div>
        )}

        <div className="phr-grid phr-to">
          <div>
            <section className="phr-helt" aria-label="Brutto score">
              {/* eslint-disable-next-line @next/next/no-img-element -- dekorbilde fra public */}
              <img src="/images/playerhq/spill-bane.jpg" alt="" width={640} height={264} />
              <div className="t">
                <span className="phr-akse-merke">SPILL · {artTekst}</span>
                <div className="phr-stort">
                  <strong>{d.score}</strong>
                  <span>{harHull ? tilParTekst(d.score - d.par) : "—"}</span>
                  <span className="phn-trend">{status.label}</span>
                </div>
                <div className="phr-info">
                  <span>Brutto{harHull ? ` · par ${d.par}` : ""}</span>
                  <span>{kvalitet.label}{harHull ? ` · ${d.antallHullMedScore} hull` : ""}</span>
                </div>
              </div>
            </section>
            <div className="phr-fakta">
              <div><b>{d.putter ? d.putter.totalt : "—"}</b><span>putter</span></div>
              <div><b>{d.fairway ? <>{d.fairway.treff}<small>av {d.fairway.av}</small></> : "—"}</b><span>fairway</span></div>
              <div><b>{d.gir ? <>{d.gir.treff}<small>av {d.gir.av}</small></> : "—"}</b><span>GIR</span></div>
            </div>
            <section className="phn-kort phr-kort">
              <div className="phn-sek-topp"><h2>Strokes Gained</h2>{d.sgSource === RUNDE_SG_KILDE.ESTIMERT ? <span className="phr-estimat">Estimat</span> : <span className="phn-kilde">{sgKildeTekst(d)}</span>}</div>
              <div className="phn-hoved"><strong>{sg1(d.sgTotal)}</strong><span className="phn-forklar">slag totalt</span></div>
              {sgRader.length > 0
                ? <SgListe rader={sgRader} />
                : <p className="phn-forklar">Ingen SG per kategori. Før slag for slag, eller legg inn tallene fra en annen app.</p>}
              <p className="phn-kilde">Én runde gir ingen konklusjon. Stats bruker snittet av mange runder. Straff: {d.straff ?? "—"}.</p>
            </section>
            {harHull && <Tiger5 regler={tiger5} />}
          </div>
          <div>
            {d.erEier && (
              <section className="phr-oppdat">
                <div className="phr-oppdat-topp"><span className="phr-oppdat-ikon"><RefreshCw className="phn-ikon" aria-hidden /></span>Planen din oppdateres</div>
                <p className="phn-forklar">Runden går inn i snittscoren og Strokes Gained i Stats. Ser Caddie at noe bør endres i planen, kommer forslaget i Innboks.</p>
                <p className="phn-kilde">Du godkjenner selv.</p>
              </section>
            )}
            <section className="phn-kort phr-kort">
              <div className="phn-sek-topp"><h2>Scorekort</h2><span className="phn-kilde">{kvalitet.label} · {d.datoKort}</span></div>
              {harHull
                ? <Scorekort hull={d.hull.map((h) => ({ nr: h.nr, par: h.par, score: h.score, putter: h.putter ?? null }))} />
                : <>
                  <p className="phn-forklar">Bare totalscore er lagret for denne runden.</p>
                  {d.erEier && <div className="phn-knapper"><Link className="phn-knapp sek" href={`/portal/mal/runder/${d.id}/hull`}>Legg til hull for hull</Link></div>}
                </>}
            </section>
            {d.notat && (
              <section className="phn-kort phr-kort">
                <h2>Notat</h2>
                <p className="phn-forklar">{d.notat}</p>
                <p className="phn-kilde">Coachen ser notatet.</p>
              </section>
            )}
            {d.erEier && d.manuellSg && (
              <section className="phn-kort phr-kort">
                <h2>Strokes Gained fra en annen app</h2>
                <ManuellSgRedigering roundId={d.id} verdier={d.manuellSg} kilde={d.sgSource} />
              </section>
            )}
            {harDetalj && (
              <section className="phn-kort phr-kort">
                <h2>SG i detalj</h2>
                <div className="phr-forhand">
                  {SG_DETALJGRUPPER.flatMap((g) => g.fields.map((f) => (
                    <div key={f.key}><span><b>{f.label}</b><span>{g.label}</span></span><span className="v">{sg1(d.granulaerSg[f.key] ?? null)}</span></div>
                  )))}
                </div>
              </section>
            )}
            <section className="phn-kort phr-kort"><ResultatKontekst /></section>
            <div className="phn-knapper">
              {d.erEier && harHull && <>
                <Link className="phn-knapp sek" href={`/portal/mal/runder/${d.id}/slag`}>Slag for slag</Link>
                <UpGameImportModal roundId={d.id} />
              </>}
              {d.erEier
                ? <Link className="phn-knapp sek" href={`/portal/statistikk/runder/${d.id}/del`}>Del runde</Link>
                : <Link className="phn-knapp sek" href="/portal/coach/melding">Del med coach</Link>}
              {d.erEier && <Link className="phn-knapp pri" href="/portal/analysere">Se Stats</Link>}
            </div>
          </div>
        </div>
      </SkraFlyt>
      </div>
    </PlayerHQSkall>
  );
}
