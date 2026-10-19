"use client";

/**
 * PH-21 Meldinger: samtalen med coachen — nytt design (pakke 7 Kommunikasjon, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, mal «traad».
 * Stil: src/styles/playerhq-ny.css og src/styles/playerhq-ny-kommunikasjon.css.
 *
 * Samme data og handlinger som før: melding, spørsmål, tilbakemelding på økt, videoer fra coach,
 * planer (godta/avvis) og ønsket økt. Rutene /portal/coach/* velger fane som før.
 *
 * Avvik:
 *   - Fanene Meldinger · Spørsmål · Tilbakemelding · Videoer · Planer · Ønsket økt står som brikker over
 *     samtalen, slik at alle funksjonene er med. Utkastet viser bare tråden.
 *   - Samtalelista har bare coachen din: appen har ingen meldingstråd med WANG-treneren.
 *   - «Ny melding» har typene Melding, Spørsmål, Tilbakemelding og Ønsket økt. Typen «Video» (be om
 *     tilbakemelding på svingen) er ikke med: appen har ingen slik forespørsel for spilleren.
 *   - Vedlegg (binders-knappen) er ikke med: meldinger kan ikke ha video eller bilde i dag.
 *   - Videoene fra coach har ikke avspilling her (som før); de vises som liste.
 *   - Ingen riggrad i tests/visual/skjerm-mapping.ts; målt med tests/visual/precision/maal.mjs PH-21-MELDINGER.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { ChevronLeft, RefreshCw, Send, Video, X } from "lucide-react";
import {
  type PH21Data,
  type PH21Tab,
  PH21_TABS,
  parsePH21Tab,
  computePH21TabCounts,
} from "@/lib/portal-coach/ph21-data";
import {
  sendPH21MeldingAction,
  sendPH21SporsmalAction,
  sendPH21TilbakemeldingAction,
  sendPH21OnskeAction,
  respondPH21PlanAction,
} from "@/lib/portal-coach/ph21-actions";
import "@/styles/playerhq-ny.css";
import "@/styles/playerhq-ny-kommunikasjon.css";

export type PH21InnboksProps = {
  data: PH21Data;
  initialTab?: PH21Tab;
  tilstand?: "data" | "tom" | "laster" | "feil";
  feilTekst?: string;
  /** Åpner «Ny melding» med en gang (lenken fra Innboks, /coach/melding/ny og /coach/sporsmal/ny). */
  apneNy?: boolean;
  /** Typen arket åpner med. */
  nyStartType?: "melding" | "sporsmal";
};

const DAGSFORM = [
  { r: 1, label: "Tung" }, { r: 2, label: "Slapp" }, { r: 3, label: "Ok" }, { r: 4, label: "God" }, { r: 5, label: "Topp" },
];
const OMRADER = ["Utslag", "Innspill", "Nærspill", "Putting", "Banespill"];
type NyType = "melding" | "sporsmal" | "fb" | "onske";
const NY_TYPER: { id: NyType; navn: string; tekst: string }[] = [
  { id: "melding", navn: "Melding", tekst: "Skriv fritt" },
  { id: "sporsmal", navn: "Spørsmål", tekst: "Om trening, plan eller test" },
  { id: "fb", navn: "Tilbakemelding", tekst: "Hvordan gikk en økt" },
  { id: "onske", navn: "Ønsket økt", tekst: "Be coachen om en økt" },
];

const dagFmt = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "short" });
const ddmmFmt = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit" });
/** De neste sju dagene som «Tor 08.10» (samme form som ønsket ble sendt med før). */
function nesteDager(fra: Date): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(fra.getTime() + i * 86_400_000);
    const dag = dagFmt.format(d).replace(".", "");
    return `${dag.charAt(0).toUpperCase()}${dag.slice(1)} ${ddmmFmt.format(d)}`;
  });
}
const initialer = (navn: string) => navn.split(" ").map((d) => d[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

export function PH21Innboks({ data, initialTab = "msg", tilstand = "data", feilTekst, apneNy = false, nyStartType = "melding" }: PH21InnboksProps) {
  const router = useRouter();
  const [tab, setTab] = useState<PH21Tab>(parsePH21Tab(initialTab));
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ark = useRef<HTMLDialogElement>(null);
  const bunn = useRef<HTMLDivElement>(null);

  const [msgTxt, setMsgTxt] = useState("");
  const [messages, setMessages] = useState(data.messages);
  const [qTxt, setQTxt] = useState("");
  const [questions, setQuestions] = useState(data.questions);
  const [fbSessionId, setFbSessionId] = useState(data.recentSessions[0]?.value || "");
  const [fbRating, setFbRating] = useState<number | null>(null);
  const [fbTxt, setFbTxt] = useState("");
  const [feedbackList, setFeedbackList] = useState(data.feedback);
  const videos = data.videos;
  const [plans, setPlans] = useState(data.plans);
  const [dager] = useState(() => nesteDager(new Date()));
  const [wDay, setWDay] = useState(dager[1] ?? dager[0]);
  const [wArea, setWArea] = useState("Innspill");
  const [wTxt, setWTxt] = useState("");
  const [wSent, setWSent] = useState(false);
  const [nyType, setNyType] = useState<NyType>(nyStartType);
  const [nyTxt, setNyTxt] = useState("");

  const counts = computePH21TabCounts({ plans, videos });
  const coachNavn = data.coach?.name ?? "coachen";
  const coachFornavn = data.coach?.name?.split(" ")[0] ?? "coachen";

  useEffect(() => { if (apneNy && data.coach && tilstand === "data") ark.current?.showModal(); }, [apneNy, data.coach, tilstand]);
  useEffect(() => { if (tab === "msg") bunn.current?.scrollIntoView({ block: "nearest" }); }, [messages.length, tab]);

  function visToast(t: string) {
    setToast(t);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3600);
  }

  function sendMelding(tekst: string, etter?: () => void) {
    if (!tekst.trim() || !data.coach?.id) return;
    const t = tekst.trim();
    setMessages((prev) => [...prev, { id: `temp-${Date.now()}`, role: "me", text: t, t: "Nå" }]);
    setFeil(null);
    startTransition(async () => {
      const res = await sendPH21MeldingAction(data.coach!.id, t);
      if (res.ok) { visToast("Sendt."); etter?.(); router.refresh(); }
      else setFeil(`Meldingen ble ikke sendt: ${res.error || "prøv igjen"}.`);
    });
  }

  function sendSporsmal(tekst: string, etter?: () => void) {
    if (!tekst.trim()) return;
    const t = tekst.trim();
    setQuestions((prev) => [{ id: `temp-q-${Date.now()}`, t, date: "I dag", status: "Venter på svar", answer: null }, ...prev]);
    setFeil(null);
    startTransition(async () => {
      const res = await sendPH21SporsmalAction(t);
      if (res.ok) { visToast("Spørsmålet er sendt. Svaret kommer i Innboks."); etter?.(); router.refresh(); }
      else setFeil(`Spørsmålet ble ikke sendt: ${res.error || "prøv igjen"}.`);
    });
  }

  function sendTilbakemelding() {
    if (!fbRating) return;
    const label = data.recentSessions.find((s) => s.value === fbSessionId)?.label || "Gjennomført økt";
    setFeedbackList((prev) => [{ id: `temp-fb-${Date.now()}`, session: label, from: "me", rating: fbRating, text: fbTxt.trim() || "—", t: "I dag" }, ...prev]);
    const r = fbRating; const t = fbTxt;
    setFbRating(null); setFbTxt(""); setFeil(null);
    startTransition(async () => {
      const res = await sendPH21TilbakemeldingAction(fbSessionId, r, t);
      if (res.ok) { visToast("Tilbakemeldingen er sendt."); router.refresh(); }
      else setFeil(`Tilbakemeldingen ble ikke sendt: ${res.error || "prøv igjen"}.`);
    });
  }

  function sendOnske() {
    if (!wTxt.trim()) return;
    setWSent(true); setFeil(null);
    startTransition(async () => {
      const res = await sendPH21OnskeAction({ day: wDay, area: wArea, text: wTxt.trim() });
      if (res.ok) { visToast(`Ønsket er sendt til ${coachFornavn}.`); router.refresh(); }
      else { setFeil(`Ønsket ble ikke sendt: ${res.error || "prøv igjen"}.`); setWSent(false); }
    });
  }

  function svarPlan(planId: string, status: "Godtatt" | "Avvist") {
    setPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, status } : p)));
    setFeil(null);
    startTransition(async () => {
      const res = await respondPH21PlanAction(planId, status);
      if (res.ok) { visToast(status === "Godtatt" ? "Planen er godtatt." : `Planen er avvist. ${coachFornavn} får beskjed.`); router.refresh(); }
      else { setFeil(`Planen ble ikke oppdatert: ${res.error || "prøv igjen"}.`); setPlans(data.plans); }
    });
  }

  function sendNy() {
    if (nyType === "melding") { sendMelding(nyTxt, () => setNyTxt("")); setTab("msg"); }
    else if (nyType === "sporsmal") { sendSporsmal(nyTxt, () => setNyTxt("")); setTab("q"); }
    else setTab(nyType === "fb" ? "fb" : "ønske");
    ark.current?.close();
  }

  const hode = <div className="phn-k-topp">
    <Link href="/portal/varsler" className="phn-k-tilbake"><ChevronLeft className="phn-ikon" aria-hidden />Innboks</Link>
    <div>
      <div className="phn-dato">Innboks · meldinger</div>
      <h1 className="phn-tittel">Meldinger</h1>
    </div>
  </div>;

  if (tilstand === "feil") {
    return <div className="phn">{hode}
      <section className="phn-kort" role="alert">
        <h2 className="phn-k-undertittel">Meldingene kunne ikke hentes</h2>
        <p className="phn-forklar">{feilTekst || "Sjekk nettet og prøv igjen. Ingenting er sendt."}</p>
        <div className="phn-knapper"><button type="button" className="phn-knapp sek" onClick={() => router.refresh()}><RefreshCw className="phn-ikon" aria-hidden />Prøv igjen</button></div>
      </section>
    </div>;
  }

  if (tilstand === "laster") {
    return <div className="phn" aria-busy="true">{hode}
      <span className="phn-skjelett" style={{ height: 64 }} />
      <span className="phn-skjelett" style={{ height: 240 }} />
      <p className="phn-kilde" role="status">Henter samtalen …</p>
    </div>;
  }

  if (!data.isCoached && tilstand !== "tom") {
    return <div className="phn">{hode}
      <section className="phn-kort">
        <b className="phn-k-undertittel">Coachen følger med her når du er med i AK Golf Academy</b>
        <p className="phn-forklar">Med en coaching-pakke eller plass i en AK-gruppe får du egen coach, ukeplaner laget for deg og direkte meldinger her.</p>
        <div className="phn-knapper">
          <Link href="/portal/booking/ny" className="phn-knapp pri">Book time</Link>
          <Link href="/portal/caddie" className="phn-knapp sek">Spør Caddie</Link>
        </div>
      </section>
    </div>;
  }

  const samtaler = <div className="phn-k-samtaler" aria-label="Samtaler">
    {data.coach && <button type="button" className="phn-k-samtale" aria-current={tab === "msg"} onClick={() => setTab("msg")}>
      <span className="phn-k-avatar" aria-hidden>{data.coach.initials || initialer(data.coach.name)}</span>
      <span><b>{data.coach.name}</b><span className="phn-k-siste">{messages.at(-1)?.text ?? "Ingen meldinger ennå"}</span></span>
      <time>{messages.at(-1)?.t ?? "—"}</time>
    </button>}
    {data.coach && <button type="button" className="phn-knapp sek" onClick={() => ark.current?.showModal()}>Ny melding</button>}
  </div>;

  return <div className="phn">
    {hode}
    <div className="phn-k-chips" role="group" aria-label="Vis">
      {PH21_TABS.map((t) => {
        const n = t.value === "plan" ? counts.plan : t.value === "vid" ? counts.vid : undefined;
        return <button key={t.value} type="button" aria-pressed={tab === t.value} onClick={() => setTab(t.value)}>
          {t.label}{n !== undefined && <b>{n}</b>}
        </button>;
      })}
    </div>
    {feil && <p className="phn-k-feil" role="alert">{feil}</p>}

    {tab === "msg" && <div className="phn-k-traad-grid">
      {samtaler}
      <section className="phn-k-traad" aria-label={`Samtale med ${coachNavn}`}>
        <div className="phn-k-traad-hode">
          <span className="phn-k-avatar" aria-hidden>{data.coach ? (data.coach.initials || initialer(data.coach.name)) : "—"}</span>
          <span><b>{data.coach?.name ?? "—"}</b><span className="phn-k-kilde">AK-coach</span></span>
        </div>
        <div className="phn-k-bobler" aria-live="polite">
          {messages.length === 0
            ? <p className="phn-forklar">Ingen meldinger ennå. Skriv til {coachFornavn} for å starte samtalen.</p>
            : messages.map((m) => <div key={m.id} className={`phn-k-boble${m.role === "me" ? " meg" : ""}`}>
              <span>{m.text}</span>
              {m.attach && <span className="phn-k-vedlegg">Økt · {m.attach}</span>}
              <time>{m.role === "me" ? "Du" : coachFornavn} · {m.t}</time>
            </div>)}
          <div ref={bunn} />
        </div>
        <form className="phn-k-skrivefelt" onSubmit={(e: FormEvent) => { e.preventDefault(); sendMelding(msgTxt, () => setMsgTxt("")); }}>
          <label className="phn-felt" style={{ gap: 0 }}>
            <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Melding til {coachNavn}</span>
            <textarea rows={1} value={msgTxt} placeholder={`Skriv til ${coachFornavn}`} onChange={(e) => setMsgTxt(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMelding(msgTxt, () => setMsgTxt("")); } }} />
          </label>
          <button type="submit" className="phn-k-ikonknapp pri" aria-label="Send" disabled={!msgTxt.trim() || isPending || !data.coach}><Send className="phn-ikon" aria-hidden /></button>
        </form>
      </section>
    </div>}

    {tab === "q" && <div className="phn-k-booking-grid">
      <div>
        <section className="phn-kort">
          <h2 className="phn-k-undertittel">Still et spørsmål</h2>
          <p className="phn-forklar">Ett spørsmål om gangen. {coachFornavn} svarer skriftlig eller i neste time.</p>
          <label className="phn-felt"><span>Spørsmål</span>
            <textarea rows={3} value={qTxt} onChange={(e) => setQTxt(e.target.value)} placeholder="Hvordan varmer jeg opp før tidlig start?" />
          </label>
          <div className="phn-knapper"><button type="button" className="phn-knapp pri" disabled={!qTxt.trim() || isPending} onClick={() => sendSporsmal(qTxt, () => setQTxt(""))}>Send spørsmål</button></div>
        </section>
      </div>
      <div>
        <section className="phn-kort">
          <h2 className="phn-k-undertittel">Dine spørsmål</h2>
          {questions.length === 0 ? <p className="phn-forklar">Ingen spørsmål ennå.</p> : <div className="phn-k-liste">
            {questions.map((q) => <div key={q.id}>
              <div className="phn-k-rad"><b>{q.t}</b><span className={`phn-pille ${q.status === "Besvart" ? "ok" : "vent"}`}>{q.status}</span></div>
              {q.answer && <p className="phn-forklar">{q.answer}</p>}
              <span className="phn-k-kildetekst">{q.date}</span>
            </div>)}
          </div>}
        </section>
      </div>
    </div>}

    {tab === "fb" && <div className="phn-k-booking-grid">
      <div>
        <section className="phn-kort">
          <h2 className="phn-k-undertittel">Tilbakemelding på økt</h2>
          {data.recentSessions.length > 0 ? <label className="phn-felt"><span>Økt</span>
            <select value={fbSessionId} onChange={(e) => setFbSessionId(e.target.value)}>
              {data.recentSessions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label> : <p className="phn-forklar">Ingen gjennomførte økter å gi tilbakemelding på ennå.</p>}
          <div className="phn-felt"><span>Hvordan gikk økta?</span>
            <div className="phn-k-skala" role="group" aria-label="Hvordan gikk økta">
              {DAGSFORM.map(({ r, label }) => <button key={r} type="button" aria-pressed={fbRating === r} onClick={() => setFbRating(r)}>{r}<small>{label}</small></button>)}
            </div>
          </div>
          <label className="phn-felt"><span>Kommentar (valgfritt)</span>
            <input type="text" value={fbTxt} onChange={(e) => setFbTxt(e.target.value)} placeholder="Hva satt, hva satt ikke" />
          </label>
          <div className="phn-knapper"><button type="button" className="phn-knapp pri" disabled={!fbRating || isPending || !fbSessionId} onClick={sendTilbakemelding}>Send tilbakemelding</button></div>
        </section>
      </div>
      <div>
        <section className="phn-kort">
          <h2 className="phn-k-undertittel">Tidligere</h2>
          {feedbackList.length === 0 ? <p className="phn-forklar">—</p> : <div className="phn-k-liste">
            {feedbackList.map((f) => <div key={f.id}>
              <b>{f.session}</b>
              <p className="phn-forklar">{f.text}</p>
              <span className="phn-k-kildetekst">{f.from === "me" ? `Du · dagsform ${f.rating} av 5` : coachNavn} · {f.t}</span>
            </div>)}
          </div>}
        </section>
      </div>
    </div>}

    {tab === "vid" && (videos.length === 0
      ? <section className="phn-kort"><b className="phn-k-undertittel">Ingen videoer fra {coachFornavn}</b><p className="phn-forklar">Videoer fra timene dine dukker opp her.</p></section>
      : <div className="phn-k-videoer">
        {videos.map((v) => <article key={v.id} className="phn-k-video">
          <div className="phn-k-video-bilde"><Video className="phn-ikon" aria-hidden /><span>{v.len}</span></div>
          <div>
            <b className="phn-k-undertittel">{v.title}</b>
            <span className="phn-k-kildetekst">{coachNavn} · {v.date}{v.seen ? " · sett" : " · ny"}</span>
          </div>
        </article>)}
      </div>)}

    {tab === "plan" && (plans.length === 0
      ? <section className="phn-kort"><b className="phn-k-undertittel">Ingen planer fra {coachFornavn}</b><p className="phn-forklar">Når coachen sender en ukeplan, godtar eller avviser du den her.</p></section>
      : <div className="phn-k-saker">
        {plans.map((p) => <article key={p.id} className={`phn-k-sak${p.status === "Venter på spiller" ? " ny" : ""}`}>
          <div className="phn-k-rad"><b className="phn-k-undertittel" style={{ fontSize: 16 }}>{p.title}</b>
            <span className={`phn-pille ${p.status === "Godtatt" ? "ok" : p.status === "Avvist" ? "noy" : "vent"}`}>{p.status}</span></div>
          <p className="phn-k-kildetekst">{p.sessions} økter · {p.hours} · sendt {p.sent}</p>
          {p.status === "Venter på spiller" && <div className="phn-knapper">
            <button type="button" className="phn-knapp pri" disabled={isPending} onClick={() => svarPlan(p.id, "Godtatt")}>Godta</button>
            <button type="button" className="phn-knapp sek" disabled={isPending} onClick={() => svarPlan(p.id, "Avvist")}>Avvis</button>
            <Link href="/portal/planlegge" className="phn-knapp sek">Se i Plan</Link>
          </div>}
        </article>)}
      </div>)}

    {tab === "ønske" && <section className="phn-kort" style={{ maxWidth: 640 }}>
      <h2 className="phn-k-undertittel">Ønsket økt</h2>
      <p className="phn-forklar">Be om en økt eller et tema. {coachFornavn} legger den inn i planen hvis det passer.</p>
      <div className="phn-felt"><span>Dag</span>
        <div className="phn-k-chips" role="group" aria-label="Dag">
          {dager.map((d) => <button key={d} type="button" aria-pressed={wDay === d} onClick={() => setWDay(d)}>{d}</button>)}
        </div>
      </div>
      <div className="phn-felt"><span>Område</span>
        <div className="phn-k-chips" role="group" aria-label="Område">
          {OMRADER.map((a) => <button key={a} type="button" aria-pressed={wArea === a} onClick={() => setWArea(a)}>{a}</button>)}
        </div>
      </div>
      <label className="phn-felt"><span>Hva vil du jobbe med?</span>
        <input type="text" value={wTxt} onChange={(e) => setWTxt(e.target.value)} placeholder="Lengdekontroll 50–70 m før klubbmesterskapet" />
      </label>
      {wSent ? <div className="phn-k-status-linje"><span className="phn-pille vent">Sendt</span><span className="phn-k-kildetekst">{wDay} · {wArea} · venter på {coachFornavn}</span></div>
        : <div className="phn-knapper"><button type="button" className="phn-knapp pri" disabled={!wTxt.trim() || isPending} onClick={sendOnske}>Send ønske om økt</button></div>}
    </section>}

    <dialog ref={ark} className="phn-ark" aria-labelledby="ph21-ny-tittel" onClick={(e) => { if (e.target === e.currentTarget) ark.current?.close(); }}>
      <div className="phn-ark-kropp">
        <div className="phn-ark-topp"><h2 id="ph21-ny-tittel">Ny melding</h2>
          <button type="button" className="phn-lukk" aria-label="Lukk" onClick={() => ark.current?.close()}><X className="phn-ikon" aria-hidden /></button></div>
        <div className="phn-felt"><span>Til</span><div className="phn-k-chips"><button type="button" aria-pressed="true">{coachNavn}</button></div></div>
        <div className="phn-k-typer" role="group" aria-label="Type">
          {NY_TYPER.map((t) => <button key={t.id} type="button" aria-pressed={nyType === t.id} onClick={() => setNyType(t.id)}><b>{t.navn}</b><span>{t.tekst}</span></button>)}
        </div>
        {(nyType === "melding" || nyType === "sporsmal") && <label className="phn-felt"><span>{nyType === "melding" ? "Melding" : "Spørsmål"}</span>
          <textarea rows={3} value={nyTxt} onChange={(e) => setNyTxt(e.target.value)} placeholder={nyType === "melding" ? "Hva vil du si?" : "Hva lurer du på?"} />
        </label>}
        {(nyType === "fb" || nyType === "onske") && <p className="phn-forklar">{nyType === "fb" ? "Du velger økta og gir den en karakter fra 1 til 5." : "Du velger dag og område, og skriver hva du vil jobbe med."}</p>}
        <button type="button" className="phn-knapp pri phn-k-stor" disabled={isPending || ((nyType === "melding" || nyType === "sporsmal") && !nyTxt.trim())} onClick={sendNy}>
          {nyType === "melding" || nyType === "sporsmal" ? "Send" : "Gå videre"}
        </button>
      </div>
    </dialog>
    {toast && <div className="phn-k-toast" role="status">{toast}</div>}
  </div>;
}
