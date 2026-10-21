"use client";

/**
 * PlayerHQ · føring av én fysisk økt (/portal/planlegge/fysisk/okt/[oktId]) — nytt design, Live fysisk (PH-06).
 * Fasit: docs/design-system/utkast-playerhq/treningsokt.html, `fysisk()` og «Etter økten» for fysisk økt.
 * Alltid lyst tema (Anders 14.10). Styrke skrives «4 × 6 @ 90 kg · RIR 2» (vedtak 30.09).
 * Data: FysOkt fra spillerens fysiske program. Lagring: loggFysOkt / angreFysOktLogg (src/app/portal/fysisk/actions.ts).
 *
 * Avvik:
 *   - «Hvor tungt» 1–10 vises ikke: FysOkt har ikke noe felt for det, og nytt felt krever Anders' ja (gotchas §Database).
 *   - Ingen øktklokke og ingen dra-for-å-flytte: tiden lagres som programmets estimat, og rekkefølgen lagres ikke.
 *   - Kondisjon føres ikke per serie; den vises som planen og teller med når økta er gjennomført.
 */
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronLeft, Copy, Minus, Plus, RotateCcw } from "lucide-react";
import { gjortTekst, kgTekst, lesTall, tilLoggRader, type FysLoggRad, type FysOktFor, type FysSett, type FysStyrkeFor } from "@/lib/portal-plan/fysisk-okt";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-okt.css";
import { SkraFlyt, SkraTopp } from "@/components/precision/skra/Skra";
import "@/styles/playerhq-ny-idag.css";
import "@/styles/playerhq-ny-lister-skra.css";
import "@/styles/playerhq-ny-pakke9-skra.css";

type Svar = { ok: boolean; error?: string };
export type PHFysiskOktProps = {
  okt: FysOktFor;
  lagre: (input: { oktId: string; rader: FysLoggRad[] }) => Promise<Svar>;
  angre: (oktId: string) => Promise<Svar>;
};

type SettTxt = { reps: string; kg: string; rir: string; ok: boolean };
const tilTxt = (s: FysSett): SettTxt => ({ reps: s.reps == null ? "" : String(s.reps), kg: s.kg == null ? "" : kgTekst(s.kg), rir: s.rir == null ? "" : String(s.rir), ok: s.ok });
const fraTxt = (s: SettTxt): FysSett => ({ reps: lesTall(s.reps), kg: lesTall(s.kg), rir: lesTall(s.rir), ok: s.ok });

function Serier({ o, sett, onEndre }: { o: FysStyrkeFor; sett: SettTxt[]; onEndre: (s: SettTxt[]) => void }) {
  const sett1 = (i: number, d: Partial<SettTxt>) => onEndre(sett.map((s, j) => (j === i ? { ...s, ...d } : s)));
  const kopier = () => {
    let i = sett.findIndex((s) => !s.ok);
    if (i < 1) i = sett.length - 1;
    if (i > 0) sett1(i, { reps: sett[i - 1].reps, kg: sett[i - 1].kg, ...(o.medRir ? { rir: sett[i - 1].rir } : {}) });
  };
  return <div className="fys-serier">
    <div className={`settrad hode${o.medRir ? "" : " uten-rir"}`} aria-hidden><span /><span>REPS</span><span>KG</span>{o.medRir && <span>RIR</span>}<span /></div>
    {sett.map((s, i) => <div key={i} className={`settrad${o.medRir ? "" : " uten-rir"}`}>
      <span className="sn">{i + 1}</span>
      <input inputMode="numeric" aria-label={`Serie ${i + 1} reps`} value={s.reps} onChange={(e) => sett1(i, { reps: e.target.value })} />
      <input inputMode="decimal" aria-label={`Serie ${i + 1} kg`} placeholder="—" value={s.kg} onChange={(e) => sett1(i, { kg: e.target.value })} />
      {o.medRir && <input inputMode="numeric" aria-label={`Serie ${i + 1} RIR`} placeholder="RIR" value={s.rir} onChange={(e) => sett1(i, { rir: e.target.value })} />}
      <button type="button" className="ok" aria-pressed={s.ok} aria-label={`Serie ${i + 1} registrert`} onClick={() => sett1(i, { ok: !s.ok })}><Check size={20} aria-hidden /></button>
    </div>)}
    <div className="settvalg">
      <button type="button" aria-label="Færre serier" disabled={sett.length <= 1} onClick={() => onEndre(sett.slice(0, -1))}><Minus size={20} aria-hidden /></button>
      <b>Serier</b>
      <button type="button" aria-label="Flere serier" disabled={sett.length >= 30} onClick={() => { const l = sett[sett.length - 1]; onEndre([...sett, { reps: l.reps, kg: l.kg, rir: "", ok: false }]); }}><Plus size={20} aria-hidden /></button>
    </div>
    {sett.length > 1 && <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={kopier}><Copy size={18} aria-hidden />Samme som forrige serie</button></div>}
  </div>;
}

export function PHFysiskOkt({ okt, lagre, angre }: PHFysiskOktProps) {
  const router = useRouter();
  const [sett, setSett] = useState<SettTxt[][]>(() => okt.styrke.map((o) => o.sett.map(tilTxt)));
  const [apen, setApen] = useState<number | null>(okt.styrke.length ? 0 : null);
  const [ferdig, setFerdig] = useState<string | null>(okt.gjennomfort);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const styrke: FysStyrkeFor[] = okt.styrke.map((o, i) => ({ ...o, sett: sett[i].map(fraTxt) }));
  const alle = sett.reduce((n, s) => n + s.length, 0);
  const gjort = sett.reduce((n, s) => n + s.filter((x) => x.ok).length, 0);
  const tomOkt = okt.styrke.length === 0 && okt.kondisjon.length === 0;

  const kjor = (fn: () => Promise<Svar>, etter: () => void) => {
    setFeil(null);
    start(async () => {
      try {
        const r = await fn();
        if (!r.ok) { setFeil(r.error ?? "Ikke lagret. Prøv igjen."); return; }
        etter();
        router.refresh();
      } catch { setFeil("Ikke lagret. Sjekk nettet og prøv igjen."); }
    });
  };
  const avslutt = () => kjor(() => lagre({ oktId: okt.id, rader: tilLoggRader(styrke) }), () => setFerdig("i dag"));
  const angreGjort = () => kjor(() => angre(okt.id), () => setFerdig(null));

  return <div className="phn phn-okt phn-skra" data-od-id="playerhq-fys-okt">
    <SkraTopp
      lav
      etikett="Fysisk økt"
      bilde="/images/playerhq/fys-styrke.jpg" bildePosisjon="50% 50%"
      overlinje={<>{[ferdig ? "Etter økten" : "Fysisk økt", okt.under, okt.planNavn].join(" · ")}</>}
      tittel={<>{okt.navn}</>}
      handling={<span className="skra-topp-rad"><span className="skra-tilbake"><Link className="tilbake" href="/portal/planlegge/fysisk"><ChevronLeft size={18} aria-hidden />Fysisk program</Link></span></span>}
    />
    <SkraFlyt lav><div className="smal">

    {ferdig ? <>
      <section className="phn-kort" aria-label="Gjennomført">
        <div className="okt-rad"><span className="phn-dato">Gjennomført</span><span className="phn-pille ok"><Check size={14} aria-hidden />{ferdig === "i dag" ? "Lagret" : `Lagret ${ferdig}`}</span></div>
        <div className="phn-hoved"><strong>{okt.varighet ?? "—"}</strong></div>
        <span className="sub">{alle ? `${gjort} av ${alle} serier` : "Ingen styrkeøvelser"}</span>
      </section>
      {(styrke.length > 0 || okt.kondisjon.length > 0) && <section className="phn-kort" aria-label="Øvelser">
        <span className="phn-dato">Øvelser</span>
        <div>
          {styrke.map((o) => <div key={o.id} className={`resultat${o.sett.some((s) => s.ok) ? "" : " hoppet"}`}>
            <b>{o.navn}</b><span className="tall">{o.sett.filter((s) => s.ok).length} av {o.sett.length} serier</span>
            <span className="sub">{gjortTekst(o)}</span>
          </div>)}
          {okt.kondisjon.map((k) => <div key={k.id} className="resultat">
            <b>{k.navn}</b><span className="tall">{k.mengde}</span><span className="sub">Kondisjon · føres ikke per serie</span>
          </div>)}
        </div>
      </section>}
      {feil && <p className="phn-feil" role="alert">{feil}</p>}
      <div className="fys-handling">
        <Link href="/portal/planlegge/fysisk" className="phn-knapp pri stor">Til Fysisk program</Link>
        <div className="phn-knapper">
          {okt.styrke.length > 0 && <button type="button" className="phn-knapp sek" disabled={pending} onClick={() => setFerdig(null)}>Endre føringen</button>}
          <button type="button" className="phn-knapp sek" disabled={pending} onClick={angreGjort}><RotateCcw size={18} aria-hidden />{pending ? "Angrer …" : "Angre gjennomført"}</button>
        </div>
      </div>
    </> : <>
      {alle > 0 && <section className="phn-kort" aria-label="Serier">
        <div className="klokkerad">
          <span className="oktklokke">{gjort}<span>AV {alle} SERIER</span></span>
          {okt.varighet && <span className="phn-pille noy">{okt.varighet}</span>}
        </div>
        <div className="phn-stolpe-lys" aria-hidden><span className="akse-fys" style={{ width: `${(gjort / alle) * 100}%` }} /></div>
      </section>}

      {tomOkt && <div className="phn-kort dempet">
        <b className="undertittel">Økta har ingen øvelser ennå</b>
        <p className="phn-forklar">Be coachen legge inn øvelsene, eller marker økta som gjort.</p>
      </div>}

      {okt.styrke.length > 0 && <section className="phn-seksjon" aria-labelledby="fys-styrke">
        <div className="phn-sek-topp"><h2 id="fys-styrke">{okt.styrke.length === 1 ? "1 øvelse" : `${okt.styrke.length} øvelser`}</h2><span className="phn-kilde">Trykk for å åpne · hak av hver serie</span></div>
        <ol className="fys-liste">{styrke.map((o, i) => {
          const n = o.sett.filter((s) => s.ok).length, kl = n === o.sett.length;
          const er = apen === i;
          return <li key={o.id} className={`fys-ov${kl ? " gjort" : ""}`}>
            <button type="button" className="fys-ov-topp" aria-expanded={er} aria-controls={`fys-ov-${o.id}`} onClick={() => setApen(er ? null : i)}>
              <span className="nr">{kl ? <Check size={16} aria-hidden /> : i + 1}</span>
              <span className="tekst"><b>{o.navn}</b><span className="sub">{o.mengde} · {n} av {o.sett.length} serier</span></span>
              <ChevronDown size={20} aria-hidden className="pil" />
            </button>
            {er && <div id={`fys-ov-${o.id}`} className="fys-detalj">
              <div className="formel"><span className="fys-merke">FYS</span><span>Styrke</span>{o.hvile && <span>{o.hvile}</span>}</div>
              <Serier o={o} sett={sett[i]} onEndre={(s) => setSett((alt) => alt.map((x, j) => (j === i ? s : x)))} />
            </div>}
          </li>;
        })}</ol>
      </section>}

      {okt.kondisjon.length > 0 && <section className="phn-seksjon" aria-labelledby="fys-kond">
        <div className="phn-sek-topp"><h2 id="fys-kond">Kondisjon</h2><span className="phn-kilde">Pulssone S1–S5</span></div>
        <ul className="ovelser">{okt.kondisjon.map((k, i) => <li key={k.id} className="ovelse">
          <span className="nr">{okt.styrke.length + i + 1}</span>
          <span><b>{k.navn}</b><span className="sub">{k.pause ?? "Pause ikke satt"}</span></span>
          <span className="min">{k.mengde}</span>
        </li>)}</ul>
      </section>}

      {feil && <p className="phn-feil" role="alert">{feil}</p>}
      <div className="fys-handling">
        <button type="button" className="phn-knapp pri stor" disabled={pending} onClick={avslutt}>
          <Check size={20} aria-hidden />{pending ? "Lagrer …" : alle ? "Avslutt og lagre økten" : "Marker økta som gjort"}
        </button>
        {alle > 0 && gjort === 0 && <span className="sub">Ingen serier er hakt av. Øvelsene lagres som hoppet over.</span>}
      </div>
    </>}
  </div></SkraFlyt></div>;
}
