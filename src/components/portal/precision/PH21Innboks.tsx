"use client";

/**
 * PH-21 Innboks — Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-21.jsx, etag 1790588257095792).
 *
 * Seks faner som ekte ruter: Meldinger (/portal/coach), Spørsmål, Tilbakemelding,
 * Videoer, Planer, Ønsket økt. Hver rute laster sine egne data og rendrer ramma
 * med sin fane; ramma er delt.
 *
 * Bevisste avvik fra tegningen (appen har ikke funksjonen eller dataene):
 *   - Meldinger: én tråd (nyeste), ingen vedlagt-økt-linje og ingen «Anders svarer
 *     vanligvis samme dag»-tekst (ingen svartid i dataene).
 *   - Tilbakemelding: listen viser coachens skrevne tilbakemeldinger per økt
 *     (lenker til detaljen). Spillerens dagsform-skjema (Tung–Topp) finnes ikke
 *     i appen og er ikke bygd.
 *   - Videoer: kort med tittel, coach, dato og varighet; åpner eksisterende avspilling
 *     via lenke. Ingen «sett/ny»-status: SessionVideo har ingen sett-kolonne.
 *   - Planer: spilleren kan ikke godta/avvise en plan (ingen slik status i basen).
 *     Viser Aktiv / Fullført / Pause med fremdrift.
 *   - Ønsket økt: dato-felt i stedet for fire dagspiller, og områdene er
 *     FYS · TEK · SLAG · SPILL · TURN (det sendOnskeligOkt tar imot).
 */
import { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CalendarRange, CircleAlert, MessageSquare, Send, Sparkles, Video, ClipboardList } from "lucide-react";
import { Knapp, KnappLenke, Meta, StatusPille, TomTilstand, FeilTilstand, LasterTilstand } from "@/components/precision/pa";
import { FanerLenker, Skjemafelt, Tekstfelt, TekstOmrade } from "@/components/precision/pa-a4";
import { Side, SideHode, Kolonner, Stabel } from "@/components/precision/pa-a4";
import { Valgpille } from "@/components/precision/pa-innboks";
import "@/styles/precision-ph21.css";

export type PH21Fane = "msg" | "q" | "fb" | "vid" | "plan" | "onske";
export type PH21Tilstand = "data" | "tom" | "laster" | "feil";

const FANER: ReadonlyArray<{ verdi: PH21Fane; navn: string; href: string }> = [
  { verdi: "msg", navn: "Meldinger", href: "/portal/coach" },
  { verdi: "q", navn: "Spørsmål", href: "/portal/coach/sporsmal/ny" },
  { verdi: "fb", navn: "Tilbakemelding", href: "/portal/coach/tilbakemelding" },
  { verdi: "vid", navn: "Videoer", href: "/portal/coach/videoer" },
  { verdi: "plan", navn: "Planer", href: "/portal/coach/plans" },
  { verdi: "onske", navn: "Ønsket økt", href: "/portal/onskeligokt" },
];

/* ---------- Ramme ---------- */

export function PH21Ramme({ aktiv, coachNavn, tilstand = "data", children }: {
  aktiv: PH21Fane;
  coachNavn: string | null;
  tilstand?: PH21Tilstand;
  children?: ReactNode;
}) {
  return <Side max={1200}>
    <SideHode
      kicker={`Innboks · ${coachNavn ?? "Coach"}`}
      title="Innboks"
      sub="Meldinger, spørsmål, videoer og planer samlet."
      actions={<KnappLenke variant="secondary" icon={Sparkles} iconName="sparkles" href="/portal/coach/ai">Spør Caddie</KnappLenke>}
    />
    {tilstand === "laster" ? <LasterTilstand text="Henter samtalen …" />
      : tilstand === "feil" ? <FeilTilstand icon={CircleAlert} title="Meldingene kunne ikke hentes" text="Det du skriver er ikke sendt. Prøv igjen om litt." code="FEIL 503 · MELDINGER" retry={<KnappLenke variant="secondary" href="/portal/coach">Prøv igjen</KnappLenke>} />
        : <>
          <FanerLenker faner={FANER.map((f) => ({ href: f.href, navn: f.navn, aktiv: f.verdi === aktiv }))} />
          {children}
        </>}
  </Side>;
}

/* ---------- Meldinger ---------- */

export type PH21Boble = { id: string; meg: boolean; tekst: string; tid: string };

function Boble({ m, coach }: { m: PH21Boble; coach: string }) {
  return <div className={`ph21-boble${m.meg ? " ph21-boble--meg" : ""}`}>
    <div className="ph21-boble__tekst">{m.tekst}</div>
    <Meta>{m.meg ? "DU" : coach.toUpperCase()} · {m.tid}</Meta>
  </div>;
}

export function PH21Meldinger({ coachId, coachNavn, meldinger, send, kanSende }: {
  coachId: string | null;
  coachNavn: string;
  meldinger: PH21Boble[];
  send: (input: { coachId: string; body: string }) => Promise<void>;
  kanSende: boolean;
}) {
  const [txt, setTxt] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();
  const kan = kanSende && !!coachId && txt.trim().length > 0 && !venter;
  const sendNa = () => {
    if (!kan || !coachId) return;
    setFeil(null);
    start(async () => {
      try { await send({ coachId, body: txt.trim() }); setTxt(""); }
      catch { setFeil("Meldingen ble ikke sendt. Prøv igjen."); }
    });
  };
  return <div className="pa-card ph21-trad">
    <div className="ph21-trad__liste">
      {meldinger.length
        ? meldinger.map((m) => <Boble key={m.id} m={m} coach={coachNavn} />)
        : <TomTilstand icon={MessageSquare} title="Ingen meldinger ennå" text={`Skriv til ${coachNavn} om plan, økter eller turneringer. Svar kommer her.`} />}
    </div>
    <form className="ph21-trad__skriv" onSubmit={(e) => { e.preventDefault(); sendNa(); }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <label className="pa-sr" htmlFor="ph21-melding">Melding til {coachNavn}</label>
        <input id="ph21-melding" className="a4-input" value={txt} onChange={(e) => setTxt(e.target.value)} placeholder={`Skriv til ${coachNavn}`} disabled={!kanSende} maxLength={4000} />
      </div>
      <Knapp type="submit" icon={Send} iconName="send" disabled={!kan} loading={venter} loadingText="Sender …">Send</Knapp>
    </form>
    {feil && <p role="alert" className="ph21-feil">{feil}</p>}
  </div>;
}

/* ---------- Spørsmål ---------- */

export type PH21Sporsmal = { id: string; tittel: string; besvart: boolean; tid: string };

export function PH21SporsmalFane({ mine, sendt, still }: {
  mine: PH21Sporsmal[];
  sendt: boolean;
  still: (input: { title: string; body: string }) => Promise<void>;
}) {
  const [tittel, setTittel] = useState("");
  const [tekst, setTekst] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();
  const kan = tittel.trim().length > 0 && tekst.trim().length > 0 && !venter;
  return <Kolonner mal="minmax(0,1fr)" gap={16}>
    <div className="ph21-to">
      <div className="pa-card ph21-kort">
        <span className="kicker">Still et spørsmål</span>
        {sendt && <StatusPille tone="ok">Spørsmålet er sendt</StatusPille>}
        <Skjemafelt label="Tema" required><Tekstfelt value={tittel} onChange={setTittel} placeholder="Hvordan varmer jeg opp før tidlig start?" /></Skjemafelt>
        <Skjemafelt label="Spørsmål" hint="Ett spørsmål om gangen. Coachen svarer skriftlig eller i neste time." required>
          <TekstOmrade value={tekst} onChange={setTekst} placeholder="Skriv spørsmålet ditt" />
        </Skjemafelt>
        {feil && <p role="alert" className="ph21-feil">{feil}</p>}
        <div><Knapp icon={Send} iconName="send" disabled={!kan} loading={venter} loadingText="Sender …" onClick={() => {
          setFeil(null);
          start(async () => { try { await still({ title: tittel.trim(), body: tekst.trim() }); } catch { setFeil("Spørsmålet ble ikke sendt. Prøv igjen."); } });
        }}>Send spørsmål</Knapp></div>
      </div>
      <div className="pa-card ph21-kort">
        <span className="kicker">Dine spørsmål</span>
        {mine.length ? mine.map((q, i) => <div key={q.id} className="ph21-rad" data-first={i === 0 || undefined}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "baseline" }}>
            <span className="ph21-rad__tittel">{q.tittel}</span>
            <StatusPille tone={q.besvart ? "ok" : "neutral"}>{q.besvart ? "Besvart" : "Venter på svar"}</StatusPille>
          </div>
          <Meta>{q.tid}</Meta>
        </div>) : <p className="ph21-tom">Ingen spørsmål ennå.</p>}
      </div>
    </div>
  </Kolonner>;
}

/* ---------- Tilbakemelding ---------- */

export type PH21Tilbakemelding = { oktId: string; tittel: string; dato: string; snippet: string };

export function PH21Tilbakemeldinger({ liste }: { liste: PH21Tilbakemelding[] }) {
  if (!liste.length) return <TomTilstand icon={ClipboardList} title="Ingen tilbakemeldinger ennå" text="De dukker opp her når coachen din skriver en etter en økt." />;
  return <div className="pa-card ph21-kort">
    <span className="kicker">Tilbakemeldinger · {liste.length}</span>
    {liste.map((t, i) => <Link key={t.oktId} href={`/portal/coach/tilbakemelding/${t.oktId}`} className="ph21-rad ph21-rad--lenke" data-first={i === 0 || undefined}>
      <span className="ph21-rad__tittel">{t.tittel}</span>
      <span className="ph21-rad__sub">{t.snippet || "—"}</span>
      <Meta>{t.dato}</Meta>
    </Link>)}
  </div>;
}

/* ---------- Videoer ---------- */

export type PH21Video = { id: string; tittel: string; coach: string; dato: string; varighet: string; bilde: string | null };

export function PH21Videoer({ videoer, hentUrl }: { videoer: PH21Video[]; hentUrl: (id: string) => Promise<string> }) {
  const [aapner, setAapner] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  if (!videoer.length) return <TomTilstand icon={Video} title="Ingen videoer fra coachen" text="Videoer fra timene dine dukker opp her." />;
  const spill = async (id: string) => {
    setFeil(null); setAapner(id);
    try { window.open(await hentUrl(id), "_blank", "noopener,noreferrer"); }
    catch { setFeil("Videoen kunne ikke åpnes. Prøv igjen."); }
    finally { setAapner(null); }
  };
  return <Stabel gap={12}>
    {feil && <p role="alert" className="ph21-feil">{feil}</p>}
    <div className="ph21-videoer">{videoer.map((v) => <button key={v.id} type="button" onClick={() => spill(v.id)} disabled={aapner === v.id} className="pa-card pa-card--interactive ph21-video">
      <div className="ph21-video__bilde" style={v.bilde ? { backgroundImage: `url(${v.bilde})` } : undefined}>
        <span className="ph21-video__len">{v.varighet}</span>
      </div>
      <div className="ph21-video__tekst">
        <span className="ph21-rad__tittel">{v.tittel}</span>
        <Meta>{v.coach.toUpperCase()} · {v.dato}{aapner === v.id ? " · ÅPNER …" : ""}</Meta>
      </div>
    </button>)}</div>
  </Stabel>;
}

/* ---------- Planer ---------- */

export type PH21Plan = { id: string; navn: string; periode: string; fullfort: number; total: number; status: "Aktiv" | "Fullført" | "Pause" };

export function PH21Planer({ planer }: { planer: PH21Plan[] }) {
  if (!planer.length) return <TomTilstand icon={CalendarRange} title="Ingen planer fra coachen" text="Når coachen sender en plan, ligger den her." />;
  return <Stabel>{planer.map((p) => <div key={p.id} className="pa-card ph21-kort">
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <span className="ph21-rad__tittel" style={{ flex: "1 1 200px" }}>{p.navn}</span>
      <StatusPille tone={p.status === "Aktiv" ? "ok" : "neutral"}>{p.status}</StatusPille>
    </div>
    <Meta>{p.total ? `${p.fullfort} AV ${p.total} ØKTER` : "—"} · {p.periode}</Meta>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><KnappLenke variant="secondary" href="/portal/planlegge">Se i Plan</KnappLenke></div>
  </div>)}</Stabel>;
}

/* ---------- Ønsket økt ---------- */

const OMRADER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

export function PH21Onske({ coachNavn, coachId, iDag, send }: {
  coachNavn: string;
  coachId: string | null;
  iDag: string;
  send: (input: { preferredAt?: string; pyramidArea: string; notes: string; coachId?: string }) => Promise<unknown>;
}) {
  const [dato, setDato] = useState(iDag);
  const [omrade, setOmrade] = useState<string>("SLAG");
  const [tekst, setTekst] = useState("");
  const [sendt, setSendt] = useState(false);
  const [feil, setFeil] = useState<string | null>(null);
  const [venter, start] = useTransition();
  return <div className="pa-card ph21-kort" style={{ maxWidth: 640, gap: 16 }}>
    <span className="kicker">Ønsket økt</span>
    <p className="ph21-tom" style={{ margin: 0 }}>Be om en økt eller et tema. {coachNavn} legger den inn i planen hvis det passer.</p>
    <Skjemafelt label="Dag"><input className="a4-input" type="date" min={iDag} value={dato} onChange={(e) => setDato(e.target.value)} aria-label="Dag" /></Skjemafelt>
    <Skjemafelt label="Område"><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{OMRADER.map((a) => <Valgpille key={a} valgt={omrade === a} onClick={() => setOmrade(a)}>{a}</Valgpille>)}</div></Skjemafelt>
    <Skjemafelt label="Hva vil du jobbe med?" required><Tekstfelt value={tekst} onChange={setTekst} placeholder="Lengdekontroll 50–70 m før klubbmesterskapet" /></Skjemafelt>
    {feil && <p role="alert" className="ph21-feil">{feil}</p>}
    {sendt
      ? <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><StatusPille tone="ok">Sendt</StatusPille><Meta>{dato} · {omrade} · VENTER PÅ {coachNavn.toUpperCase()}</Meta></div>
      : <div><Knapp icon={Send} iconName="send" disabled={!tekst.trim()} loading={venter} loadingText="Sender …" onClick={() => {
        setFeil(null);
        start(async () => {
          try { await send({ preferredAt: dato ? `${dato}T16:00:00` : undefined, pyramidArea: omrade, notes: tekst.trim(), coachId: coachId ?? undefined }); setSendt(true); }
          catch { setFeil("Kunne ikke sende. Prøv igjen."); }
        });
      }}>Send ønske</Knapp></div>}
  </div>;
}

/* ---------- Varsler (bjella, /portal/varsler) ---------- */

export type PH21VarselKategori = "coach" | "timer" | "foring" | "tester" | "betaling" | "annet";
export type PH21Varsel = { id: string; kategori: PH21VarselKategori; tittel: string; tekst: string | null; tid: string; ulest: boolean; lenke: string | null; gruppe: "I dag" | "Denne uka" | "Tidligere" };
const KATEGORI_NAVN: Record<PH21VarselKategori, string> = { coach: "Coach", timer: "Timer", foring: "Føring", tester: "Tester", betaling: "Betaling", annet: "Annet" };

export function PH21Varsler({ varsler, lesVarsel, lesAlle, tilstand = "data" }: {
  varsler: PH21Varsel[];
  lesVarsel: (ids: string[]) => Promise<void>;
  lesAlle: () => Promise<void>;
  tilstand?: PH21Tilstand;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<PH21VarselKategori | "alle">("alle");
  const [venter, start] = useTransition();
  const uleste = varsler.filter((v) => v.ulest).length;
  const synlige = varsler.filter((v) => filter === "alle" || v.kategori === filter);
  const apne = (v: PH21Varsel) => start(async () => {
    if (v.ulest) await lesVarsel([v.id]);
    if (v.lenke) router.push(v.lenke); else router.refresh();
  });
  return <Side max={720}>
    <SideHode kicker="Innboks" title="Varsler" sub={uleste ? `${uleste} uleste` : "Alt er lest."}
      actions={uleste > 0 ? <Knapp variant="secondary" loading={venter} loadingText="Markerer …" onClick={() => start(async () => { await lesAlle(); router.refresh(); })}>Marker alle som lest</Knapp> : undefined} />
    {tilstand === "laster" ? <LasterTilstand text="Henter varsler …" />
      : tilstand === "feil" ? <FeilTilstand icon={CircleAlert} title="Varslene kunne ikke hentes" text="Prøv igjen om litt." code="FEIL 503 · VARSLER" retry={<KnappLenke variant="secondary" href="/portal/varsler">Prøv igjen</KnappLenke>} />
        : !varsler.length ? <TomTilstand icon={Bell} title="Ingen varsler" text="Nye varsler om økter, timer og tester dukker opp her." />
          : <>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Valgpille valgt={filter === "alle"} onClick={() => setFilter("alle")}>Alle</Valgpille>
              {(Object.keys(KATEGORI_NAVN) as PH21VarselKategori[]).filter((k) => varsler.some((v) => v.kategori === k)).map((k) => <Valgpille key={k} valgt={filter === k} onClick={() => setFilter(k)}>{KATEGORI_NAVN[k]}</Valgpille>)}
            </div>
            {(["I dag", "Denne uka", "Tidligere"] as const).map((g) => {
              const rader = synlige.filter((v) => v.gruppe === g);
              if (!rader.length) return null;
              return <div key={g} className="pa-card ph21-kort" style={{ padding: "12px 16px" }}>
                <span className="kicker">{g}</span>
                {rader.map((v, i) => <button key={v.id} type="button" className="ph21-rad ph21-varsel" data-first={i === 0 || undefined} onClick={() => apne(v)} disabled={venter}>
                  <span style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                    <span className="ph21-rad__tittel" style={{ fontWeight: v.ulest ? 600 : 400 }}>{v.tittel}</span>
                    {v.ulest && <StatusPille tone="signal">Ny</StatusPille>}
                  </span>
                  {v.tekst && <span className="ph21-rad__sub">{v.tekst}</span>}
                  <Meta>{KATEGORI_NAVN[v.kategori].toUpperCase()} · {v.tid.toUpperCase()}</Meta>
                </button>)}
              </div>;
            })}
          </>}
  </Side>;
}
