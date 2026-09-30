"use client";

/**
 * AG-24 Drift i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-mer.jsx › AG23, fanene Logger, GDPR og Hjelp;
 * AG-24.jsx er utgått). Tegningen viser dem som lister med Sec/Row; her er de
 * fire egne adressene beholdt (/admin/audit-log, /feillogg, /gdpr, /hjelp) til
 * Oppsett (AG-23) eier fanene. Data og handlinger er uendret fra før.
 *
 * Rust: bare på bekreft-steget for en sletting (høyst én om gangen).
 */
import { useMemo, useState, type ReactNode } from "react";
import { CircleCheck, ClipboardList, Mail, Search, ShieldCheck, Trash2 } from "lucide-react";
import { Ikon, Knapp, KnappLenke, Meta, Sidehode, StatusPille, TomTilstand } from "@/components/precision/pa";
import "@/styles/precision-a5.css";
import "@/styles/precision-a24.css";

export type DriftSide = "logg" | "feillogg" | "gdpr" | "hjelp";

const SIDER: ReadonlyArray<{ id: DriftSide; label: string; href: string }> = [
  { id: "logg", label: "Logger", href: "/admin/audit-log" },
  { id: "feillogg", label: "Feillogg", href: "/admin/feillogg" },
  { id: "gdpr", label: "GDPR", href: "/admin/gdpr" },
  { id: "hjelp", label: "Hjelp", href: "/admin/hjelp" },
];

function Ramme({ side, tittel, sub, children }: { side: DriftSide; tittel: string; sub: string; children: ReactNode }) {
  return <div className="pa-side">
    <Sidehode kicker="Mer · Oppsett · Drift" title={tittel} sub={sub} />
    <nav className="pa-a24-nav" aria-label="Drift">
      {SIDER.map((s) => <KnappLenke key={s.id} href={s.href} size="sm" variant={s.id === side ? "secondary" : "ghost"}>{s.label}</KnappLenke>)}
    </nav>
    {children}
  </div>;
}

function Sec({ k, meta, children }: { k: string; meta?: string; children: ReactNode }) {
  return <section aria-label={k} className="pa-card pa-a24-sec">
    <div className="pa-a24-sec__hode"><span className="kicker">{k}</span>{meta != null && <Meta>{meta}</Meta>}</div>
    {children}
  </section>;
}

function Rad({ a, sub, b, children }: { a: ReactNode; sub?: string; b?: ReactNode; children?: ReactNode }) {
  return <div role="listitem" className="pa-a24-rad">
    <div className="pa-a24-rad__topp">
      <span className="pa-a24-rad__tekst"><span className="pa-a24-rad__a">{a}</span>{sub && <Meta>{sub}</Meta>}</span>
      {b != null && <span className="pa-a24-rad__b">{b}</span>}
    </div>
    {children}
  </div>;
}

function Tall({ rader }: { rader: ReadonlyArray<{ label: string; value: string }> }) {
  return <div className="pa-a5-stat-grid">
    {rader.map((r) => <div key={r.label} className="pa-a5-stat"><span className="pa-a5-stat__label">{r.label}</span><span className="pa-a5-stat__value">{r.value}</span></div>)}
  </div>;
}

/* ---------- Logger (audit-logg) ---------- */
export type AuditKind = "auth" | "api" | "data" | "security";
export type AuditStatus = "ok" | "warn" | "danger";
export type AuditHendelse = { id: string; time: string; kind: AuditKind; actor: string; action: string; status: AuditStatus };
export type AuditData = { events: AuditHendelse[]; total: number; mistenkelige: number };

const KIND_NAVN: Record<AuditKind, string> = { auth: "Innlogging", api: "Integrasjon", data: "Data", security: "Sikkerhet" };
const STATUS_NAVN: Record<AuditStatus, string> = { ok: "OK", warn: "Varsel", danger: "Feil" };

export function AG24Logger({ data }: { data: AuditData }) {
  return <Ramme side="logg" tittel="Logger" sub="Hvem som gjorde hva i AgencyOS. De siste 50 hendelsene, nyeste øverst.">
    <Tall rader={[{ label: "Hendelser vist", value: `${data.events.length} av ${data.total}` }, { label: "Mistenkelig · 7 d", value: String(data.mistenkelige) }]} />
    <Sec k="Hendelser" meta={data.events.length ? `${data.total} TOTALT` : undefined}>
      {data.events.length === 0
        ? <TomTilstand icon={ClipboardList} title="Ingen hendelser" text="Endringer i systemet dukker opp her." />
        : <div role="list">{data.events.map((e) => <Rad key={e.id} a={e.action} sub={`${e.time} · ${e.actor} · ${KIND_NAVN[e.kind]}`.toUpperCase()} b={<StatusPille tone={e.status === "ok" ? "ok" : "warn"}>{STATUS_NAVN[e.status]}</StatusPille>} />)}</div>}
    </Sec>
  </Ramme>;
}

/* ---------- Feillogg ---------- */
export type FeilSeverity = "fatal" | "error" | "warn" | "info";
export type FeilRad = { id: string; tid: string; kontekst: string; melding: string; stack: string | null; severity: FeilSeverity };
export type FeilData = { feil: FeilRad[]; total: number; sisteDogn: number; kontekster: number };

const SEV_NAVN: Record<FeilSeverity, string> = { fatal: "Kritisk", error: "Feil", warn: "Varsel", info: "Info" };

export function AG24Feillogg({ data }: { data: FeilData }) {
  return <Ramme side="feillogg" tittel="Feillogg" sub="Feil fra produksjon med stack trace. De siste 50, nyeste øverst.">
    <Tall rader={[{ label: "Feil vist", value: `${data.feil.length} av ${data.total}` }, { label: "Kritisk · 24 t", value: String(data.sisteDogn) }, { label: "Kontekster", value: String(data.kontekster) }]} />
    <Sec k="Feil" meta={data.feil.length ? `${data.total} TOTALT` : undefined}>
      {data.feil.length === 0
        ? <TomTilstand icon={CircleCheck} title="Ingen feil registrert" text="Nye feil fra produksjon dukker opp her." />
        : <div role="list">{data.feil.map((f) => <Rad key={f.id} a={f.kontekst} sub={f.tid.toUpperCase()} b={<StatusPille tone={f.severity === "info" ? "neutral" : "warn"}>{SEV_NAVN[f.severity]}</StatusPille>}>
          <p className="pa-a24-rad__melding">{f.melding}</p>
          {f.stack && <details className="pa-a24-stack"><summary>Vis stack trace</summary><pre>{f.stack}</pre></details>}
        </Rad>)}</div>}
    </Sec>
  </Ramme>;
}

/* ---------- GDPR ---------- */
export type GdprRad = { id: string; type: string; alder: number; forsinket: boolean; bedtAv: string; gjelder: string };
export type GdprData = { rader: GdprRad[] };
type Handling = (formData: FormData) => Promise<void>;

function GdprRadVisning({ r, utfor, avvis, startBekreft }: { r: GdprRad; utfor: Handling; avvis: Handling; startBekreft?: boolean }) {
  const [bekreft, setBekreft] = useState(!!startBekreft);
  const [tekst, setTekst] = useState("");
  return <Rad a={r.type === "DELETE" ? "Slettekrav" : "Innsynskrav"} sub={`${r.alder} DAGER GAMMEL${r.forsinket ? " · NÆR FRISTEN" : ""}`}
    b={<StatusPille tone={r.forsinket ? "warn" : "neutral"}>{r.forsinket ? "Haster" : "Åpen"}</StatusPille>}>
    <dl className="pa-a24-kv">
      <div><dt>Bedt av</dt><dd>{r.bedtAv}</dd></div>
      <div><dt>Gjelder</dt><dd>{r.gjelder}</dd></div>
    </dl>
    {bekreft
      ? <div className="pa-alert pa-alert--warn" role="alert"><div className="pa-a24-bekreft">
        <span>Slettingen anonymiserer brukeren og kan ikke angres. Skriv SLETT for å bekrefte.</span>
        <form action={utfor} className="pa-a24-bekreft__skjema">
          <input type="hidden" name="id" value={r.id} />
          <input type="text" className="pa-a24-bekreft__felt" aria-label="Skriv SLETT for å bekrefte" autoComplete="off" value={tekst} onChange={(e) => setTekst(e.target.value)} />
          <div className="pa-a24-handlinger">
            <Knapp type="submit" variant="signal" icon={Trash2} disabled={tekst.trim().toUpperCase() !== "SLETT"}>Bekreft sletting</Knapp>
            <Knapp variant="ghost" onClick={() => { setBekreft(false); setTekst(""); }}>Avbryt</Knapp>
          </div>
        </form></div></div>
      : <div className="pa-a24-handlinger">
        {r.type === "DELETE" && <Knapp variant="secondary" icon={Trash2} onClick={() => setBekreft(true)}>Utfør sletting</Knapp>}
        <form action={avvis}><input type="hidden" name="id" value={r.id} /><Knapp type="submit" variant="ghost">Avvis</Knapp></form>
      </div>}
  </Rad>;
}

export function AG24Gdpr({ data, utforSletteforesporsel, avvisForesporsel, startBekreftId }: { data: GdprData; utforSletteforesporsel: Handling; avvisForesporsel: Handling; startBekreftId?: string }) {
  return <Ramme side="gdpr" tittel="GDPR" sub="Uløste innsyns- og slettekrav. Svar innen 30 dager (art. 12 nr. 3).">
    <Sec k="Forespørsler" meta={data.rader.length ? `${data.rader.length} ÅPNE` : "INGEN ÅPNE"}>
      {data.rader.length === 0
        ? <TomTilstand icon={ShieldCheck} title="Ingen uløste forespørsler" text="Nye innsyns- og slettekrav lander her." />
        : <div role="list">{data.rader.map((r) => <GdprRadVisning key={r.id} r={r} utfor={utforSletteforesporsel} avvis={avvisForesporsel} startBekreft={r.id === startBekreftId} />)}</div>}
    </Sec>
  </Ramme>;
}

/* ---------- Hjelp ---------- */
export type HjelpArtikkel = { id: string; tittel: string; kategori: string; lesetidMin: number; utdrag: string };

export const HJELP_ARTIKLER: readonly HjelpArtikkel[] = [
  { id: "logg-runde-golfbox", tittel: "Hvordan logger jeg en runde fra GolfBox?", kategori: "Trening", lesetidMin: 3, utdrag: "Eksporter scorekort som CSV fra GolfBox, last opp i PlayerHQ og runden registreres automatisk på spilleren." },
  { id: "pyramide-fokus", tittel: "Hva er pyramide-fokus?", kategori: "Trening", lesetidMin: 5, utdrag: "Pyramide-fokus er AK Golf sin treningsmodell — bredt fundament av basistreninger, smalere topp med konkurransesimulering." },
  { id: "bytt-coach", tittel: "Slik bytter du coach", kategori: "Coaching", lesetidMin: 2, utdrag: "Be om bytte fra profilsiden. Nåværende coach får varsel, ny coach matcher etter tilgjengelighet og sertifisering." },
  { id: "live-session", tittel: "Slik bruker du Live Session", kategori: "Coaching", lesetidMin: 6, utdrag: "Live Session lar coach og spiller dele Trackman-data i sanntid. Krever Pro-abonnement og oppdatert mobilapp." },
];

export function AG24Hjelp({ artikler = HJELP_ARTIKLER }: { artikler?: readonly HjelpArtikkel[] }) {
  const [sok, setSok] = useState("");
  const term = sok.trim().toLowerCase();
  const treff = useMemo(() => term.length < 2 ? artikler : artikler.filter((a) => `${a.tittel} ${a.utdrag} ${a.kategori}`.toLowerCase().includes(term)), [term, artikler]);
  return <Ramme side="hjelp" tittel="Hjelp" sub="Korte guider for AgencyOS. Innholdet vedlikeholdes manuelt.">
    <label className="pa-a24-sok">
      <span className="pa-sr">Søk i hjelp</span>
      <Ikon icon={Search} size={18} />
      <input type="search" className="pa-a24-sok__felt" value={sok} onChange={(e) => setSok(e.target.value)} placeholder="Søk i hjelp" />
    </label>
    <Sec k="Artikler" meta={term.length >= 2 ? `${treff.length} TREFF` : `${artikler.length} ARTIKLER`}>
      {treff.length === 0
        ? <TomTilstand icon={Search} title="Ingen treff" text={`Ingen treff på «${sok.trim()}». Prøv et annet ord eller skriv til support.`} />
        : <div role="list">{treff.map((a) => <Rad key={a.id} a={a.tittel} sub={`${a.kategori} · ${a.lesetidMin} min`.toUpperCase()}><p className="pa-a24-rad__melding">{a.utdrag}</p></Rad>)}</div>}
    </Sec>
    <Sec k="Support" meta="AK GOLF HQ">
      <div role="list"><Rad a="Kontakt support" sub="SVAR PÅ E-POST" b={<KnappLenke href="mailto:support@akgolf.no" variant="secondary" size="sm" icon={Mail}>support@akgolf.no</KnappLenke>} /></div>
    </Sec>
  </Ramme>;
}
