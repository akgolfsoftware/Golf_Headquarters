"use client";

/**
 * AG-24 Drift i Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/agencyos/screens/AG-mer.jsx › AG23, fanene Logger, GDPR og Hjelp;
 * AG-24.jsx er utgått). Tegningen viser dem som faner i Oppsett; her er de
 * fire egne adressene beholdt (/admin/audit-log, /feillogg, /gdpr, /hjelp) til
 * Oppsett (AG-23) eier fanene. Fanelinjen er den samme som i tegningen, og de
 * tre adminfanene vises bare for ADMIN (Hjelp er åpen for COACH).
 * Data og handlinger er uendret fra før.
 */
import Link from "next/link";
import { CircleCheck, ClipboardList, ShieldCheck, Trash2 } from "lucide-react";
import { Knapp, Meta, Sidehode, StatusPille, TomTilstand } from "@/components/precision/pa";
import { useErAdmin } from "@/components/v2/rolle";
import type { ReactNode } from "react";
import "@/styles/precision-a24.css";

export type DriftSide = "logg" | "feillogg" | "gdpr" | "hjelp";

type Fane = { id: DriftSide | "profil" | "team" | "mark"; label: string; href: string; kunAdmin: boolean };

/** Rekkefølgen følger tegningen (Profil · Team og invitasjoner · GDPR · Logger · Markedsføring · Hjelp); Feillogg er egen fane i appen. */
const FANER: readonly Fane[] = [
  { id: "profil", label: "Profil", href: "/admin/oppsett?fane=akademi", kunAdmin: true },
  { id: "team", label: "Team og invitasjoner", href: "/admin/team", kunAdmin: true },
  { id: "gdpr", label: "GDPR", href: "/admin/gdpr", kunAdmin: true },
  { id: "logg", label: "Logger", href: "/admin/audit-log", kunAdmin: true },
  { id: "feillogg", label: "Feillogg", href: "/admin/feillogg", kunAdmin: true },
  { id: "mark", label: "Markedsføring", href: "/admin/marketing", kunAdmin: true },
  { id: "hjelp", label: "Hjelp", href: "/admin/hjelp", kunAdmin: false },
];

function Ramme({ side, children }: { side: DriftSide; children: ReactNode }) {
  const erAdmin = useErAdmin();
  return <div className="pa-side pa-a24-side">
    <Sidehode kicker="Mer · Oppsett" title="Oppsett" />
    <div role="tablist" aria-label="Oppsett" className="pa-a24-nav">
      {FANER.filter((f) => erAdmin || !f.kunAdmin).map((f) => {
        const valgt = f.id === side;
        return <Link key={f.id} href={f.href} role="tab" aria-selected={valgt} aria-current={valgt ? "page" : undefined} className="pa-choice">{f.label}</Link>;
      })}
    </div>
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

/* ---------- Logger (audit-logg) ---------- */
export type AuditKind = "auth" | "api" | "data" | "security";
export type AuditStatus = "ok" | "warn" | "danger";
export type AuditHendelse = { id: string; time: string; kind: AuditKind; actor: string; action: string; status: AuditStatus };
export type AuditData = { events: AuditHendelse[]; total: number };

const KIND_NAVN: Record<AuditKind, string> = { auth: "Innlogging", api: "Integrasjon", data: "Data", security: "Sikkerhet" };
const STATUS_NAVN: Record<AuditStatus, string> = { ok: "OK", warn: "Varsel", danger: "Feil" };

export function AG24Logger({ data }: { data: AuditData }) {
  return <Ramme side="logg">
    <Sec k="Logger" meta={data.events.length ? `SISTE ${data.events.length} AV ${data.total}` : undefined}>
      {data.events.length === 0
        ? <TomTilstand icon={ClipboardList} title="Ingen hendelser" text="Endringer i systemet dukker opp her." />
        : <div role="list">{data.events.map((e) => <Rad key={e.id} a={e.action} sub={`${e.time} · ${e.actor} · ${KIND_NAVN[e.kind]}`.toUpperCase()} b={<StatusPille tone={e.status === "ok" ? "ok" : "warn"}>{STATUS_NAVN[e.status]}</StatusPille>} />)}</div>}
    </Sec>
  </Ramme>;
}

/* ---------- Feillogg ---------- */
export type FeilSeverity = "fatal" | "error" | "warn" | "info";
export type FeilRad = { id: string; tid: string; kontekst: string; melding: string; stack: string | null; severity: FeilSeverity };
export type FeilData = { feil: FeilRad[]; total: number };

const SEV_NAVN: Record<FeilSeverity, string> = { fatal: "Kritisk", error: "Feil", warn: "Varsel", info: "Info" };

export function AG24Feillogg({ data }: { data: FeilData }) {
  return <Ramme side="feillogg">
    <Sec k="Feillogg" meta={data.feil.length ? `SISTE ${data.feil.length} AV ${data.total}` : undefined}>
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

export function AG24Gdpr({ data, utforSletteforesporsel, avvisForesporsel }: { data: GdprData; utforSletteforesporsel: Handling; avvisForesporsel: Handling }) {
  return <Ramme side="gdpr">
    <Sec k="GDPR" meta="SVAR INNEN 30 DAGER">
      {data.rader.length === 0
        ? <TomTilstand icon={ShieldCheck} title="Ingen uløste forespørsler" text="Nye innsyns- og slettekrav lander her." />
        : <div role="list">{data.rader.map((r) => <Rad key={r.id} a={r.type === "DELETE" ? "Slettekrav" : "Innsynskrav"} sub={`${r.alder} DAGER GAMMEL${r.forsinket ? " · NÆR FRISTEN" : ""}`}
          b={<StatusPille tone={r.forsinket ? "warn" : "neutral"}>{r.forsinket ? "Haster" : "Åpen"}</StatusPille>}>
          <dl className="pa-a24-kv">
            <div><dt>Bedt av</dt><dd>{r.bedtAv}</dd></div>
            <div><dt>Gjelder</dt><dd>{r.gjelder}</dd></div>
          </dl>
          <div className="pa-a24-handlinger">
            {r.type === "DELETE" && <form action={utforSletteforesporsel}><input type="hidden" name="id" value={r.id} /><Knapp type="submit" variant="secondary" icon={Trash2}>Utfør sletting</Knapp></form>}
            <form action={avvisForesporsel}><input type="hidden" name="id" value={r.id} /><Knapp type="submit" variant="ghost">Avvis</Knapp></form>
          </div>
        </Rad>)}</div>}
    </Sec>
  </Ramme>;
}

/* ---------- Hjelp ---------- */
export const HJELP_ARTIKLER: ReadonlyArray<{ tittel: string; lesetid: string }> = [
  { tittel: "Kom i gang som assistant coach", lesetid: "5 MIN" },
  { tittel: "Slik fungerer gruppeplanen", lesetid: "3 MIN" },
  { tittel: "Tripletex-eksport steg for steg", lesetid: "4 MIN" },
];
/** Tegningen sier post@akgolf.no; koden har alltid brukt support@akgolf.no. Avklares med Anders. */
export const SUPPORT_EPOST = "support@akgolf.no";

export function AG24Hjelp() {
  return <Ramme side="hjelp">
    <Sec k="Hjelp" meta="AK GOLF HQ">
      <div role="list">
        {HJELP_ARTIKLER.map((a) => <Rad key={a.tittel} a={a.tittel} b={a.lesetid} />)}
        <Rad a="Kontakt support" b={<a className="pa-a24-mail" href={`mailto:${SUPPORT_EPOST}`}>{SUPPORT_EPOST}</a>} />
      </div>
    </Sec>
  </Ramme>;
}
