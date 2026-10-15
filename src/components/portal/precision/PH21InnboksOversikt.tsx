"use client";

/**
 * PH-21 Innboks bak bjella — nytt design (pakke 7 Kommunikasjon, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, mal «innboks».
 * Stil: src/styles/playerhq-ny.css og src/styles/playerhq-ny-kommunikasjon.css.
 *
 * Samler forslag (trener i WANG/Team Norway, coachens økter og planer), siste melding fra coach og
 * varslene. Samme handlinger som før: svarPaTrenerforslag, resolvePlayerApproval, respondPH21PlanAction
 * og markNotificationsRead (åpning av varsel markerer det lest og følger lenken).
 *
 * Avvik:
 *   - Caddie-forslag ligger ikke i Innboks: Caddie lagrer ikke forslag i dag, de lever bare i samtalen.
 *   - Kortet «Anders byttet teknisk oppgave … Angre» er ikke med: appen har ingen logg over coachens
 *     direkte endringer, og ingen angrefunksjon.
 *   - «Meldinger» teller meldinger coachen har sendt etter din siste. Appen har ikke lest-status på meldinger.
 *   - Tidspunkt for coachens Workbench-forslag vises som «—»: økta lagrer ikke når forslaget ble sendt.
 *   - Øktkortene i forslag har ikke bilde.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-21.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  ArrowRight, Bell, CalendarCheck, ChevronRight, CreditCard, Activity, MessageCircle, RefreshCw, Trophy,
} from "lucide-react";
import { svarPaTrenerforslag } from "@/lib/workbench/trenerforslag";
import { resolvePlayerApproval } from "@/lib/workbench/wb-actions";
import { respondPH21PlanAction } from "@/lib/portal-coach/ph21-actions";
import { markNotificationsRead } from "@/app/portal/(legacy)/varsler/actions";
import { tellInnboks, type InnboksForslag, type InnboksOkt, type InnboksVarsel, type PH21InnboksData } from "@/lib/portal/ph21-innboks";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-kommunikasjon.css";

type Filter = "alle" | "forslag" | "melding" | "varsel";
const FILTER: { id: Filter; navn: string }[] = [
  { id: "alle", navn: "Alle" }, { id: "forslag", navn: "Forslag" }, { id: "melding", navn: "Meldinger" }, { id: "varsel", navn: "Varsler" },
];
const AKSE_KLASSE: Record<string, string> = { FYS: "fys", TEK: "tek", SLAG: "slag", SPILL: "spill", TURN: "turn" };

function VarselIkon({ type }: { type: string }) {
  const Ikon = type === "booking" ? CalendarCheck : type === "melding" ? MessageCircle : type === "turnering" ? Trophy
    : type === "betaling" || type === "faktura" || type === "credit" ? CreditCard : type === "plan" || type === "runde" || type === "trackman" ? Activity : Bell;
  return <span className={`phn-k-ikonboks${type === "booking" ? " ok" : ""}`} aria-hidden><Ikon className="phn-ikon" /></span>;
}

function MiniOkt({ okt, gammel = false }: { okt: InnboksOkt; gammel?: boolean }) {
  return <div className={`phn-okt phn-k-mini ${okt.akse ? AKSE_KLASSE[okt.akse] : ""}${gammel ? " gml" : ""}`}>
    <div className="phn-okt-tekst">
      <span className="phn-k-okt-tid">{okt.tid}</span>
      <span className="phn-navn">{okt.navn}</span>
      {okt.info && <span className="phn-k-okt-info">{okt.info}</span>}
    </div>
  </div>;
}

export function PH21InnboksOversikt({ data, tilstand = "data" }: { data: PH21InnboksData; tilstand?: "data" | "feil" }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("alle");
  const [svar, setSvar] = useState<Record<string, "ok" | "avvist">>({});
  const [lest, setLest] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const laas = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const varsler = data.varsler.map((v) => (lest.includes(v.id) ? { ...v, ulest: false } : v));
  const ventende = data.forslag.filter((f) => !svar[f.id]);
  const antall = tellInnboks({ ...data, forslag: ventende, varsler });
  const vis = (t: Filter) => filter === "alle" || filter === t;
  const tom = !data.forslag.length && !data.melding && !data.varsler.length;
  const synlige = (vis("forslag") ? data.forslag.length : 0) + (vis("melding") && data.melding ? 1 : 0) + (vis("varsel") ? data.varsler.length : 0);

  function visToast(t: string) {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3600);
  }

  function besvar(f: InnboksForslag, godta: boolean) {
    if (laas.current) return;
    laas.current = true; setFeil(null);
    startTransition(async () => {
      try {
        let ok = true; let grunn: string | undefined;
        if (f.kilde === "trener") {
          const r = await svarPaTrenerforslag({ actionId: f.id, beslutning: godta ? "ACCEPTED" : "REJECTED" });
          ok = r.ok; grunn = r.ok ? undefined : r.feil;
        } else if (f.kilde === "coach") {
          const r = await resolvePlayerApproval({ sessionId: f.id, decision: godta ? "ACCEPTED" : "REJECTED" });
          ok = r.ok; grunn = r.ok ? undefined : r.error;
        } else {
          const r = await respondPH21PlanAction(f.id, godta ? "Godtatt" : "Avvist");
          ok = r.ok; grunn = r.error;
        }
        if (!ok) { setFeil(grunn ?? "Svaret ble ikke lagret. Prøv igjen."); return; }
        setSvar((s) => ({ ...s, [f.id]: godta ? "ok" : "avvist" }));
        visToast(godta
          ? f.kilde === "trener" ? "Endringen er lagt inn i planen. Treneren får beskjed." : "Endringen er lagt inn i planen."
          : f.kilde === "trener" ? "Forslaget er avvist. Planen er uendret." : "Forslaget er avvist. Planen er uendret.");
        router.refresh();
      } catch {
        setFeil("Svaret ble ikke bekreftet. Planen er uendret. Prøv igjen.");
      } finally { laas.current = false; }
    });
  }

  function apne(v: InnboksVarsel) {
    startTransition(async () => {
      if (v.ulest) { await markNotificationsRead([v.id]); setLest((l) => [...l, v.id]); }
      if (v.link) router.push(v.link);
      else router.refresh();
    });
  }

  const hode = <div className="phn-k-topp">
    <div>
      <div className="phn-dato">Innboks · forslag, meldinger og varsler</div>
      <h1 className="phn-tittel">Innboks</h1>
    </div>
  </div>;

  if (tilstand === "feil") {
    return <div className="phn">{hode}
      <section className="phn-kort" role="alert">
        <h2 className="phn-k-undertittel">Fikk ikke hentet innboksen</h2>
        <p className="phn-forklar">Sjekk nettet og prøv igjen. Ingen forslag er besvart.</p>
        <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={() => router.refresh()}><RefreshCw className="phn-ikon" aria-hidden />Prøv igjen</button></div>
      </section>
    </div>;
  }

  const hvem = <aside>
    <div className="phn-kort phn-k-dempet">
      <b className="phn-k-undertittel">Hvem kan gjøre hva</b>
      <p className="phn-forklar">AK-coachen din kan endre planen direkte.</p>
      <p className="phn-forklar">WANG- og Team Norway-trenere ser det du har delt, og sender forslag. Ingenting endres før du godtar.</p>
      <p className="phn-forklar">Caddie foreslår. Du godkjenner selv.</p>
    </div>
    {data.harCoach && <Link href="/portal/coach?ny=1" className="phn-knapp pri phn-k-stor">Ny melding</Link>}
  </aside>;

  return <div className="phn">
    {hode}
    <div className="phn-k-innboks-grid">
      <div className="phn-k-saker">
        <div className="phn-kort">
          <div className="phn-hoved"><strong>{antall.venter}</strong><span className="phn-forklar">{antall.venter === 1 ? "sak venter på deg" : "saker venter på deg"}</span></div>
          <div className="phn-k-oversikt-rad">
            <span>Forslag<b>{antall.forslag}</b></span>
            <span>Meldinger<b>{antall.meldinger}</b></span>
            <span>Varsler<b>{antall.varsler}</b></span>
          </div>
        </div>
        {tom ? <div className="phn-kort">
          <b className="phn-k-undertittel">Ingen saker</b>
          <p className="phn-forklar">Forslag fra coach og trener, meldinger og varsler kommer hit.</p>
        </div> : <>
          <div className="phn-k-chips" role="group" aria-label="Vis">
            {FILTER.map((f) => <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>{f.navn}</button>)}
          </div>
          {feil && <p className="phn-k-feil" role="alert">{feil}</p>}

          {vis("forslag") && data.forslag.length > 0 && <div className="phn-k-dag-merke">Forslag</div>}
          {vis("forslag") && data.forslag.map((f) => {
            const besvart = svar[f.id];
            return <article key={`${f.kilde}-${f.id}`} className={`phn-k-sak${besvart ? "" : " ny"}`} aria-busy={pending || undefined}>
              <div className="phn-k-sak-topp">
                <span className={`phn-k-avatar${f.kilde === "trener" ? f.org === "WANG" ? " wang" : " tn" : ""}`} aria-hidden>
                  {f.kilde === "trener" ? (f.org === "WANG" ? "W" : "TN") : f.fra.split(" ").slice(0, 2).map((d) => d[0]).join("").toUpperCase()}
                </span>
                <span><b>{f.tittel}</b><span className="phn-k-fra">{f.fra}</span></span>
                <time>{f.tid}</time>
              </div>
              {f.kilde === "trener" && (f.for || f.etter) && (f.for && f.etter
                ? <div className="phn-k-fra-til"><MiniOkt okt={f.for} gammel /><ArrowRight className="phn-ikon phn-k-pil" aria-label="blir" /><MiniOkt okt={f.etter} /></div>
                : <MiniOkt okt={(f.etter ?? f.for)!} gammel={!f.etter} />)}
              {f.kilde === "trener" && f.linjer.length > 0 && <ul className="phn-k-liste" aria-label="Etter godkjenning">{f.linjer.map((l) => <li key={l}>{l}</li>)}</ul>}
              {f.kilde === "trener" && f.tekst && <p className="phn-k-sitat">«{f.tekst}»</p>}
              {f.kilde === "coach" && <MiniOkt okt={f.etter} />}
              {f.kilde === "plan" && <p className="phn-k-sitat">{f.tekst}</p>}
              {!besvart && <p className="phn-k-konsekvens"><RefreshCw className="phn-ikon" aria-hidden /><span>Planen endres først når du godtar.</span></p>}
              {besvart ? <div className="phn-k-status-linje"><span className={`phn-pille ${besvart === "ok" ? "ok" : "noy"}`}>{besvart === "ok" ? "Godtatt" : "Avvist"}</span></div>
                : <div className="phn-knapper">
                  <button type="button" className="phn-knapp pri" disabled={pending} onClick={() => besvar(f, true)}>Godta</button>
                  <button type="button" className="phn-knapp sek" disabled={pending} onClick={() => besvar(f, false)}>Avvis</button>
                  {f.kilde === "plan" && <Link href="/portal/planlegge" className="phn-knapp sek">Se i Plan</Link>}
                </div>}
            </article>;
          })}

          {vis("melding") && data.melding && <>
            <div className="phn-k-dag-merke">Meldinger</div>
            <Link href="/portal/coach" className="phn-k-varsel-rad">
              <span className="phn-k-avatar" aria-hidden>{data.melding.fra.split(" ").slice(0, 2).map((d) => d[0]).join("").toUpperCase()}</span>
              <span><b>{data.melding.fra}</b><span className="phn-k-kilde">«{data.melding.tekst}»</span></span>
              <span className="phn-k-hoyre"><time>{data.melding.tid}</time>{data.melding.nye > 0 && <span className="phn-k-ulest" aria-label={`${data.melding.nye} nye`} />}</span>
            </Link>
          </>}

          {vis("varsel") && data.varsler.length > 0 && <div className="phn-k-dag-merke">Varsler</div>}
          {vis("varsel") && varsler.map((v) => <button key={v.id} type="button" className="phn-k-varsel-rad" disabled={pending} onClick={() => apne(v)} data-ulest={v.ulest || undefined}>
            <VarselIkon type={v.type} />
            <span><b>{v.tittel}</b>{v.tekst && <span className="phn-k-kilde">{v.tekst}</span>}</span>
            <span className="phn-k-hoyre"><time>{v.tid}</time>{v.ulest ? <span className="phn-k-ulest" aria-label="Ulest" /> : v.link ? <ChevronRight className="phn-ikon" aria-hidden /> : null}</span>
          </button>)}
          {synlige === 0 && <p className="phn-k-kildetekst">Ingen saker her.</p>}
        </>}
      </div>
      {hvem}
    </div>
    {toast && <div className="phn-k-toast" role="status">{toast}</div>}
  </div>;
}
