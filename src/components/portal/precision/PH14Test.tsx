/**
 * PH-14 Én test / Resultat i designløftet 20.10.2026 (godkjent av Anders samme dag).
 * Fasit: Claude Design-canvaset «PlayerHQ nøkkelskjermer» (https://claude.ai/artifact/XdsbBEHwJhdrD4YJMMpdK1),
 * «Resultat · mobil 390» og «PC 1280». Stil: playerhq-ny-statsdybde.css og playerhq-ny-tester.css (§Resultat).
 *
 * Avvik:
 *   - «Be coach kontrollere» er ikke med: appen har ingen forespørsel om kontroll. «Del med coach» ligger i lagret-meldingen.
 *   - «Prioritert · 2 av 2» står ikke i resultatet: tellingen over alle varianter av testen hentes bare i oversikten.
 *   - «Per slagtype» viser PEI (lavere er best) med best og svakest merket; poeng av 15 per slagtype lagres ikke.
 *   - Over tid har stiplet rekordlinje når retningen er kjent og testen er tatt minst to ganger.
 *   - Eldre avvik, fra 14.10:
 *   - Grafen viser testens hovedtall over tid. Utkastets bryter mellom Poeng og PEI krever to lagrede serier;
 *     for 8-ball står PEI per slagkategori under, fra siste måling.
 *   - «Per slagtype» viser PEI per kategori (Chip, Wedge, Lobb, Bunker) slik resultatet lagrer det.
 *     Poeng av 15 per slagtype og PGA Tour-snittet lagres ikke, og vises ikke.
 *   - «Slik telles poengene» viser testens regel og protokoll fra basen. Poengskalaen for 8-ball eies av
 *     tn-catalog og pei (annen økt), så skalaen tegnes ikke her.
 *   - Nivå mot neste kategori og landslagsnivå står som «—» (A–K-nivåtall og Team Norway-tall mangler).
 *   - Dagens «Øvelser å vurdere», «Hva kan ha påvirket resultatet?», lagret-melding og siste forsøk (gate) er beholdt.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-14.
 * Ingen "use client": rendres på serveren.
 */
import Link from "next/link";
import { Check, ChevronLeft, X } from "lucide-react";
import { type SdAkse } from "./PHStatsDybdeFelles";
import { ResultatKontekst } from "@/components/tester/ResultatKontekst";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-statsdybde.css";
import "@/styles/playerhq-ny-tester.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke4-skra.css";

export type PH14Maaling = {
  id: string;
  /** «28. sep.» */
  dato: string;
  verdi: number;
  vis: string;
  /** Navnet på coachen som førte testen, «» når spilleren førte selv. */
  fortAv: string | null;
};

export type PH14TestData = {
  navn: string;
  akse: SdAkse;
  omraade: string;
  /** Eldste først. */
  maalinger: PH14Maaling[];
  /** null når retningen er ukjent: da vises ingen «beste» eller rekord. */
  lavereErBedre: boolean | null;
  endring: string | null;
  snitt: string | null;
  beste: string | null;
  regel: string;
  beskrivelse: string | null;
  protokoll: { label: string; antall: number; maal: string | null }[];
  perSlagtype: { navn: string; vis: string }[];
  sisteForsok: { nr: number; ok: boolean | null; side: "V" | "H" | null }[];
  sperret: string | null;
  startHref: string;
  lagret: boolean;
  talentHref: string | null;
  forslag: { id: string; navn: string; beskrivelse: string; begrunnelse: string; kanLeggesTil: boolean }[];
};

const fortTekst = (m: PH14Maaling) => (m.fortAv ? `Kontrollert av ${m.fortAv}` : "Egenført");

export function PH14Test({ data }: { data: PH14TestData }) {
  const m = data.maalinger;
  const siste = m[m.length - 1] ?? null;
  const rekord = siste && m.length >= 2 && data.lavereErBedre != null
    && m.slice(0, -1).every((x) => (data.lavereErBedre ? siste.verdi < x.verdi : siste.verdi > x.verdi));

  return (
    <div className="phn phn-skra">
    <SkraTopp
      lav
      etikett="Test"
      bilde="/images/playerhq/stats-topp.jpg" bildePosisjon="50% 50%"
      overlinje={data.lagret ? "Alle slag registrert · lagret" : `Stats · Tester · ${data.omraade}`}
      tittel={data.navn}
      ingress={siste ? [siste.dato, fortTekst(siste)].join(" · ") : undefined}
      handling={<span className="skra-topp-rad"><span className="skra-tilbake"><Link className="phn-res-tilbake" href="/portal/tren/tester"><ChevronLeft className="phn-ikon" aria-hidden />Stats · Tester</Link></span><Link className="phn-knapp pri skra-topp-knapp" href="/portal/tren/tester">Ferdig</Link></span>}
    />
    <SkraFlyt lav>

      {siste && (
        <dl className="phn-res-tall phn-inn">
          <div><dt>Siste måling</dt><dd><b>{siste.vis}</b><small>{data.endring ?? (rekord ? "Personlig rekord" : "Første måling")}</small></dd></div>
          <div><dt>Beste</dt><dd><b>{data.beste ?? "—"}</b><small>{rekord ? "Ny rekord" : "Rekorden din"}</small></dd></div>
          <div><dt>Snitt, {m.length} {m.length === 1 ? "måling" : "målinger"}</dt><dd><b>{data.snitt ?? "—"}</b><small>{data.lavereErBedre == null ? "Retning ikke satt" : data.lavereErBedre ? "Lavere er bedre" : "Høyere er bedre"}</small></dd></div>
          <div><dt>Nivå</dt><dd><b>—</b><small>A–K ikke vedtatt</small></dd></div>
        </dl>
      )}

      {data.lagret && (
        <div className="phn-lagret" role="status">
          <b>Resultatet er lagret.</b>
          <span>Det telles i målingene under. Coachen ser det i stallen.</span>
          <span className="phn-knapper">
            <Link href="/portal/coach/melding">Del med coach</Link>
            {data.talentHref && <Link href={data.talentHref}>Se utviklingen i talentprofilen</Link>}
          </span>
        </div>
      )}

      <div className="phn-to-kol">
        <div className="phn-kol">
          {!siste && (
            <section className="phn-kort dempet">
              <h2>Ingen målinger ennå</h2>
              <p className="phn-forklar">Første måling blir referansen din. Protokollen står under.</p>
            </section>
          )}

          {m.length > 0 && (
            <section className="phn-kort">
              <div className="phn-sek-topp"><h2>Over tid</h2><span className="phn-kilde">{m.length} {m.length === 1 ? "måling" : "målinger"}</span></div>
              <Graf maalinger={m.slice(-8)} rekord={data.lavereErBedre == null || m.length < 2 ? null : (data.lavereErBedre ? Math.min(...m.map((x) => x.verdi)) : Math.max(...m.map((x) => x.verdi)))} />
              <p className="phn-kilde">{data.lavereErBedre == null ? "Retningen er ikke satt for denne testen." : data.lavereErBedre ? "Lavere er bedre." : "Høyere er bedre."}</p>
              <div className="phn-nokkel">
                <div><b>{data.snitt ?? "—"}</b><span>Snitt, {m.length} {m.length === 1 ? "måling" : "målinger"}</span></div>
                <div><b>{data.beste ?? "—"}</b><span>Beste måling</span></div>
                <div><b>{siste?.vis ?? "—"}</b><span>Siste, {siste?.dato ?? "—"}</span></div>
              </div>
              <p className="phn-kilde">Nivå mot neste kategori: — (referanse ikke satt, A–K-nivåtallene er ikke vedtatt)</p>
            </section>
          )}

          {data.perSlagtype.length > 0 && (
            <section className="phn-kort">
              <div className="phn-sek-topp"><h2>Per slagtype</h2><span className="phn-kilde">PEI · siste måling</span></div>
              <ul className="phn-skala-liste phn-res-slagtype">
                {(() => {
                  const tallAv = (v: string) => Number(v.replace(/[^0-9,.-]/g, "").replace(",", "."));
                  const verdier = data.perSlagtype.map((x) => tallAv(x.vis));
                  const maks = Math.max(...verdier, 0.0001), best = Math.min(...verdier), verst = Math.max(...verdier);
                  return data.perSlagtype.map((x, i) => (
                    <li key={x.navn} className="phn-skala-rad">
                      <span>{x.navn}{data.perSlagtype.length > 2 && verdier[i] === best && <em className="best">best</em>}{data.perSlagtype.length > 2 && verdier[i] === verst && <em className="svak">svakest</em>}</span>
                      <i aria-hidden><u className={`akse-${data.akse}`} style={{ width: `${Math.max(4, (verdier[i]! / maks) * 100)}%` }} /></i>
                      <b>{x.vis}</b>
                    </li>
                  ));
                })()}
              </ul>
              <p className="phn-kilde">PEI er avstanden fra hullet delt på slaglengden. Lavere er bedre.</p>
            </section>
          )}

          {data.sisteForsok.length > 0 && siste && (
            <section className="phn-kort">
              <div className="phn-sek-topp"><h2>Siste forsøk</h2><span className="phn-kilde">{siste.dato}</span></div>
              <div className="phn-matrise uten-hode">
                {data.sisteForsok.map((f) => (
                  <span key={f.nr} className={`phn-celle${f.ok == null ? "" : f.ok ? " godkjent" : " bom"}`} aria-label={`Slag ${f.nr}, ${f.ok == null ? "ikke ført" : f.ok ? "godkjent" : f.side ? `bom ${f.side === "V" ? "venstre" : "høyre"}` : "bom"}`}>
                    {f.ok == null ? f.nr : f.ok ? <Check className="phn-ikon" aria-hidden /> : <X className="phn-ikon" aria-hidden />}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="phn-kol">
          <section className="phn-kort">
            <div className="phn-sek-topp"><h2>Slik telles testen</h2></div>
            {data.beskrivelse && <p className="phn-forklar">{data.beskrivelse}</p>}
            {data.protokoll.length > 0 ? (
              <ol className="phn-protokoll">
                {data.protokoll.map((s) => <li key={s.label}><span>{s.label} × {s.antall}{s.maal ? ` · mål ${s.maal}` : ""}</span></li>)}
              </ol>
            ) : (
              <p className="phn-forklar">Testen har ingen stegvis protokoll i appen. Regelen under gjelder.</p>
            )}
            <p className="phn-kilde">Regel: {data.regel}</p>
          </section>

          {m.length > 0 && (
            <section className="phn-kort">
              <div className="phn-sek-topp"><h2>Målinger</h2></div>
              <div>
                {[...m].reverse().map((x) => (
                  <div key={x.id} className="phn-maaling">
                    <div><strong>{x.dato}{rekord && x === siste && <span className="phn-pr-merke">Rekord</span>}</strong><small>{fortTekst(x)}</small></div>
                    <span className="phn-tv">{x.vis}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <Link href="/portal/meg/deling" className="phn-res-deling">
            <span><b>Coach ser resultatet</b><small>Trenere i WANG og Team Norway ser det bare når du har delt.</small></span>
            <span>Deling</span>
          </Link>

          <div className="phn-niva">
            <span className="phn-undertittel">Landslagsnivå for klassen</span>
            <b>—</b>
            <span className="phn-forklar">Vises for spillere i en Team Norway-gruppe når Team Norway har sendt tallene.</span>
          </div>

          {data.sperret ? (
            <p className="phn-sd-varsel" role="note">{data.sperret}</p>
          ) : null}
          <Link className="phn-knapp pri stor" href={data.startHref}>{m.length ? "Ta testen" : "Ta første måling"}</Link>
        </div>
      </div>

      {siste && (
        <div className="phn-to-kol">
          <section className="phn-kort">
            <div className="phn-sek-topp"><h2>Øvelser å vurdere</h2></div>
            <p className="phn-forklar">Forslag etter et registrert resultat, ikke en diagnose eller en endring i planen. Coachen velger videre trening.</p>
            {data.forslag.length ? (
              <ul className="phn-forslag">
                {data.forslag.map((f) => (
                  <li key={f.id}><b>{f.navn}</b><span>{f.beskrivelse}</span><small>{f.kanLeggesTil ? "Fasiliteten er bekreftet. " : ""}{f.begrunnelse}</small></li>
                ))}
              </ul>
            ) : <p className="phn-forklar">Ingen godkjent øvelse er koblet til dette testområdet ennå.</p>}
          </section>
          <section className="phn-kort"><ResultatKontekst /></section>
        </div>
      )}
    </SkraFlyt>
    </div>
  );
}

/** Hovedtallet over tid som fylt linje, i blått som i utkastet. */
function Graf({ maalinger, rekord }: { maalinger: PH14Maaling[]; rekord: number | null }) {
  const v = [...maalinger.map((x) => x.verdi), ...(rekord != null ? [rekord] : [])];
  const lo = Math.min(...v), hi = Math.max(...v), pad = (hi - lo) * 0.15 || Math.abs(hi) * 0.1 || 1;
  const min = lo - pad, max = hi + pad;
  const n = maalinger.length;
  const xs = maalinger.map((_, i) => (n === 1 ? 170 : 36 + i * (268 / (n - 1))));
  const y = (t: number) => Math.round((128 - (t - min) / (max - min) * 108) * 10) / 10;
  const pts = maalinger.map((x, i) => `${Math.round(xs[i]! * 10) / 10},${y(x.verdi)}`);
  const sisteX = xs[n - 1]!, forsteX = xs[0]!;
  return (
    <svg className="phn-graf" viewBox="0 0 320 150" role="img" aria-label={`Målinger: ${maalinger.map((x) => `${x.dato} ${x.vis}`).join(", ")}`}>
      <line x1="28" x2="312" y1="128" y2="128" stroke="var(--phn-sand-300)" />
      <line x1="28" x2="312" y1="20" y2="20" stroke="var(--phn-sand-300)" />
      {rekord != null && <line x1="28" x2="312" y1={y(rekord)} y2={y(rekord)} stroke="var(--phn-g600)" strokeDasharray="4 4" />}
      {n > 1 && <path d={`M${pts.join(" L")} L${sisteX},128 L${forsteX},128 Z`} fill="var(--phn-slag)" opacity=".18" />}
      {n > 1 && <path className="phn-tegn" d={`M${pts.join(" L")}`} fill="none" stroke="var(--phn-slag)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />}
      {maalinger.map((x, i) => <circle key={x.id} cx={xs[i]} cy={y(x.verdi)} r={i === n - 1 ? 5.5 : 4} fill="var(--phn-slag)" />)}
      <text x={sisteX} y={Math.max(12, y(maalinger[n - 1]!.verdi) - 10)} textAnchor={n === 1 ? "middle" : "end"} className="gt" style={{ fill: "var(--phn-slag-ink)", fontWeight: 600 }}>{maalinger[n - 1]!.vis}</text>
      {maalinger.map((x, i) => (n <= 4 || i === 0 || i === n - 1) && (
        <text key={`d${x.id}`} x={xs[i]} y={145} textAnchor={n === 1 ? "middle" : i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="gt">{x.dato}</text>
      ))}
    </svg>
  );
}
