/**
 * PH-14 Én test i nytt design (pakke 6, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, malen «test». Stil: playerhq-ny-statsdybde.css.
 *
 * Avvik:
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
import { Check, X } from "lucide-react";
import { TmTilbake } from "./PH17TmFelles";
import { SD_AKSE_KODE, type SdAkse } from "./PHStatsDybdeFelles";
import { ResultatKontekst } from "@/components/tester/ResultatKontekst";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-stats.css";
import "@/styles/playerhq-ny-statsdybde.css";

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
    <div className="phn">
      <TmTilbake href="/portal/tren/tester" tekst="Tester" />
      <div className="phn-topp">
        <div className="phn-dato">Stats · Tester · {data.omraade}</div>
        <h1 className="phn-tittel">{data.navn}</h1>
      </div>

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
          {siste ? (
            <div className={`phn-fylt ${data.akse}`}>
              <span className="phn-akse-tekst">{SD_AKSE_KODE[data.akse]} · SISTE MÅLING</span>
              <div className="phn-rad">
                <span className="phn-stor">{siste.vis}</span>
                {data.endring && <span className="phn-trend">{data.endring}</span>}
              </div>
              <p>{[rekord ? "Personlig rekord" : null, siste.dato, fortTekst(siste)].filter(Boolean).join(" · ")}</p>
            </div>
          ) : (
            <section className="phn-kort dempet">
              <h2>Ingen målinger ennå</h2>
              <p className="phn-forklar">Første måling blir referansen din. Protokollen står under.</p>
            </section>
          )}

          {m.length > 0 && (
            <section className="phn-kort">
              <div className="phn-sek-topp"><h2>Over tid</h2><span className="phn-kilde">{m.length} {m.length === 1 ? "måling" : "målinger"}</span></div>
              <Graf maalinger={m.slice(-8)} />
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
              <ul className="phn-skala-liste">
                {data.perSlagtype.map((s) => <li key={s.navn} className="phn-skala-rad"><span>{s.navn}</span><b>{s.vis}</b></li>)}
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
    </div>
  );
}

/** Hovedtallet over tid som fylt linje, i blått som i utkastet. */
function Graf({ maalinger }: { maalinger: PH14Maaling[] }) {
  const v = maalinger.map((x) => x.verdi);
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
