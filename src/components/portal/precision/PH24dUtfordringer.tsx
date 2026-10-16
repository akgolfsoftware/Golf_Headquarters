"use client";

/**
 * PH-24d Meg › Utfordringer (liste, detalj, ny) — Precision Athletics
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-24d-utfordringer.jsx,
 * etag 1790714118636595).
 *
 * Regler (beslutninger.md §Utfordringer skal leve): deltakere velges fra venner
 * og gruppa, aldri delt lenke. Scoren har retning, låst av øvelsen når den er
 * valgt. «Opprett utfordring» er rust. «Avslutt utfordring» er grafitt i kort
 * med rustkant, bekreftknappen i dialogen er rust. Heter «Avsluttet», ikke
 * «Fullført». Manglende plassering vises som «—». Utfordringer teller ikke som
 * trening.
 *
 * Bevisste avvik fra tegningen:
 *   - «Invitasjoner» og «Invitert»-status vises ikke: appen har ingen
 *     invitasjonstilstand. Valgte deltakere legges rett inn som deltakere, og
 *     `bliMed` finnes for den som åpner en utfordring uten å være med.
 *   - Teksten i «Bli med»-kortet lover ikke at bare valgte kan bli med, fordi
 *     koden i dag ikke sjekker det (se PR-beskrivelsen).
 */
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, ChevronRight, Flag, Lock, Plus, RotateCw, Trophy, Users } from "lucide-react";
import { FeilTilstand, Ikon, Knapp, KnappLenke, Meta, StatusPille, TomTilstand } from "@/components/precision/pa";
import { Dialogboks, Side, Skjemafelt, Stabel, TekstOmrade } from "@/components/precision/pa-a4";
import { Avatar, Valgpille } from "@/components/precision/pa-innboks";
import { formaterTall } from "@/lib/format-tall";
import "@/styles/precision-a4.css";

/* ---------- Datakontrakt ---------- */

export type PH24dTilstand = "data" | "tom" | "laster" | "feil";

export type PH24dKort = {
  id: string; navn: string; antall: number; avsluttet: boolean;
  /** «30.09» eller null. */
  slutter: string | null;
  /** Plassering som tekst, «—» når ingen score. */
  minPlass: string;
};
export type PH24dListeProps = { tilstand: PH24dTilstand; aktive: PH24dKort[]; avsluttede: PH24dKort[] };

export type PH24dDeltaker = { id: string; navn: string; erMeg: boolean; rank: number | null; score: number | null; notes: string | null };
export type PH24dDetaljData = {
  id: string; navn: string; beskrivelse: string | null; eierNavn: string; ovelseNavn: string | null;
  avsluttet: boolean; start: string | null; slutt: string | null;
  erEier: boolean; erDeltaker: boolean; higherIsBetter: boolean;
  minScore: number | null; minNotes: string | null; deltakere: PH24dDeltaker[];
};
export type PH24dDetaljActions = {
  bliMed: () => Promise<void>;
  avslutt: () => Promise<void>;
  registrerScore: (score: number, notes: string | null) => Promise<void>;
};

export type PH24dValg = { id: string; navn: string; kilde: "Venn" | "Gruppe"; detaljer: string };
export type PH24dOvelse = { id: string; navn: string; higherIsBetter: boolean | null };
export type PH24dNyProps = {
  tilstand: PH24dTilstand; deltakere: PH24dValg[]; ovelser: PH24dOvelse[];
  opprett: (input: { name: string; description: string | null; drillId: string | null; startAt: string | null; endAt: string | null; higherIsBetter: boolean; deltakerIds: string[] }) => Promise<unknown>;
};

/* ---------- Felles ---------- */

const muted = { margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" } as const;
const tallTekst = (n: number) => formaterTall(n, n % 1 ? 1 : 0, true);
const dirTxt = (hoy: boolean) => (hoy ? "Høyest score vinner" : "Lavest score vinner");

function Sek({ k, meta, label, rust, children }: { k: string; meta?: string; label?: string; rust?: boolean; children: React.ReactNode }) {
  return <section aria-label={label ?? k} className="pa-card" style={{ padding: 16, gap: 12, minWidth: 0, borderLeft: rust ? "3px solid var(--signal-ink)" : undefined }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}><span className="kicker" style={{ flex: "1 1 auto", overflowWrap: "anywhere" }}>{k}</span>{meta != null && <Meta>{meta}</Meta>}</div>
    {children}
  </section>;
}

function useToast() {
  const [x, setX] = useState<{ t: string; m: string; k: number } | null>(null);
  useEffect(() => { if (!x) return; const h = setTimeout(() => setX(null), 2600); return () => clearTimeout(h); }, [x]);
  const vis = (t: string, m: string) => setX({ t, m, k: Date.now() });
  const el = x && <div style={{ position: "fixed", top: 16, left: 16, right: 16, display: "flex", justifyContent: "center", zIndex: 200, pointerEvents: "none" }}>
    <div key={x.k} role="status" className="pa-toast" style={{ pointerEvents: "auto", maxWidth: "100%" }}><span>{x.t}</span><span className="pa-toast__meta">{x.m}</span></div>
  </div>;
  return { vis, el };
}

function Hode({ kicker, tittel, sub, tilbake }: { kicker: string; tittel: string; sub: string; tilbake: { href: string; tekst: string } }) {
  return <div className="pa-pagehead">
    <div className="pa-pagehead__row">
      <div className="pa-pagehead__text">
        <span className="kicker pa-pagehead__kicker">{kicker}</span>
        <h1 className="pa-pagehead__title" style={{ overflowWrap: "anywhere" }}>{tittel}</h1>
        <p className="pa-pagehead__sub">{sub}</p>
      </div>
      <div className="pa-pagehead__actions"><KnappLenke href={tilbake.href} variant="secondary" icon={ArrowLeft} iconName="arrow-left">{tilbake.tekst}</KnappLenke></div>
    </div>
  </div>;
}

function Vakt({ tilstand, laster, feil, children }: { tilstand: PH24dTilstand; laster: string; feil: { title: string; text: string; code: string }; children: React.ReactNode }) {
  if (tilstand === "laster") return <div className="pa-state pa-state--loading" role="status" aria-live="polite"><span className="pa-state__mono">{laster}</span></div>;
  if (tilstand === "feil") return <FeilTilstand icon={RotateCw} title={feil.title} text={feil.text} code={feil.code} />;
  return <>{children}</>;
}

/* ---------- Liste ---------- */

function KortRad({ u }: { u: PH24dKort }) {
  return <Link href={`/portal/utfordringer/${u.id}`} role="listitem" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 64, padding: "10px 0", borderTop: "1px solid var(--border-hairline)", textDecoration: "none", color: "inherit" }}>
    <span style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <span style={{ font: "600 15px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{u.navn}</span>
      <Meta style={{ overflowWrap: "anywhere" }}>{u.antall} {u.antall === 1 ? "DELTAKER" : "DELTAKERE"} · {u.avsluttet ? "AVSLUTTET" : u.slutter ? `SLUTTER ${u.slutter}` : "INGEN SLUTTDATO"} · DIN PLASSERING {u.minPlass}</Meta>
    </span>
    <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <StatusPille tone={u.avsluttet ? "neutral" : "ok"}>{u.avsluttet ? "Avsluttet" : "Aktiv"}</StatusPille>
      <Ikon icon={ChevronRight} size={16} name="chevron-right" />
    </span>
  </Link>;
}

function Gruppe({ k, arr }: { k: string; arr: PH24dKort[] }) {
  return <Sek k={k} meta={arr.length ? `${arr.length} ${arr.length === 1 ? "UTFORDRING" : "UTFORDRINGER"}` : "INGEN"}>
    {arr.length ? <div role="list" style={{ marginTop: -12 }}>{arr.map((u) => <KortRad key={u.id} u={u} />)}</div> : <p style={muted}>Ingen.</p>}
  </Sek>;
}

export function PH24dListe({ tilstand, aktive, avsluttede }: PH24dListeProps) {
  const tom = tilstand === "data" && aktive.length === 0 && avsluttede.length === 0;
  return <Side max={880}>
    <div className="pa-pagehead">
      <div className="pa-pagehead__row">
        <div className="pa-pagehead__text">
          <span className="kicker pa-pagehead__kicker">Meg · Utfordringer</span>
          <h1 className="pa-pagehead__title">Utfordringer</h1>
          <p className="pa-pagehead__sub">Konkurranser mot vennene og gruppa. De teller ikke som trening.</p>
        </div>
        <div className="pa-pagehead__actions">
          <KnappLenke href="/portal/meg" variant="secondary" icon={ArrowLeft} iconName="arrow-left">Meg</KnappLenke>
          <KnappLenke href="/portal/utfordringer/ny" icon={Plus} iconName="plus">Ny utfordring</KnappLenke>
        </div>
      </div>
    </div>
    <Vakt tilstand={tilstand} laster="Henter utfordringene dine …" feil={{ title: "Utfordringene kunne ikke hentes", text: "Ingenting er endret. Prøv igjen.", code: "FEIL 503 · UTFORDRINGER" }}>
      {tom ? <TomTilstand icon={Trophy} title="Ingen utfordringer" text="Lag en utfordring og velg hvem fra vennene og gruppa som skal være med." /> : <Stabel>
        <Gruppe k="Aktive" arr={aktive} />
        <Gruppe k="Avsluttede" arr={avsluttede} />
        <Meta>UTFORDRINGER TELLER IKKE SOM TRENING · REGISTRERT SCORE LEVER BARE HER</Meta>
      </Stabel>}
    </Vakt>
  </Side>;
}

/* ---------- Detalj ---------- */

export function PH24dDetalj({ tilstand, data, actions }: { tilstand: PH24dTilstand; data: PH24dDetaljData | null; actions: PH24dDetaljActions }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [dlg, setDlg] = useState(false);
  const [val, setVal] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [bredde, setBredde] = useState(0);
  useEffect(() => {
    const les = () => setBredde(window.innerWidth);
    les(); window.addEventListener("resize", les);
    return () => window.removeEventListener("resize", les);
  }, []);

  const feilTekst = { title: "Utfordringen kunne ikke hentes", text: "Ingenting er endret. Prøv igjen.", code: "FEIL 503 · UTFORDRING" };
  if (!data) {
    return <Side max={1080}>
      <Hode kicker="Meg · Utfordringer" tittel="Utfordring" sub="—" tilbake={{ href: "/portal/utfordringer", tekst: "Utfordringer" }} />
      <Vakt tilstand={tilstand} laster="Henter utfordringen …" feil={feilTekst}><span /></Vakt>
    </Side>;
  }

  const d = data;
  const harScore = d.deltakere.some((p) => p.score != null);
  const sub = d.avsluttet ? `Avsluttet av ${d.erEier ? "deg" : d.eierNavn}${d.slutt ? ` ${d.slutt}` : ""}` : d.slutt ? `Slutter ${d.slutt}` : "Ingen sluttdato";
  const kjor = (fn: () => Promise<void>, ok?: [string, string]) => start(async () => {
    try { await fn(); if (ok) toast.vis(ok[0], ok[1]); router.refresh(); }
    catch (e) { setErr(e instanceof Error ? e.message : "Handlingen ble ikke fullført."); }
  });
  const lagre = () => {
    const n = Number(val.replace(",", "."));
    if (!val.trim() || !Number.isFinite(n) || n < 0) { setErr("Skriv scoren som et tall, for eksempel 16."); return; }
    setErr(null);
    kjor(async () => { await actions.registrerScore(n, note.trim() || null); setVal(""); setNote(""); }, ["Scoren er registrert", `${d.navn.toUpperCase()} · ${tallTekst(n)}`]);
  };

  const head = <Sek k={d.ovelseNavn ?? "Fri utfordring"} meta={[d.start, d.slutt].filter(Boolean).join(" – ") || "—"}>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <StatusPille tone={d.avsluttet ? "neutral" : "ok"}>{d.avsluttet ? "Avsluttet" : "Aktiv"}</StatusPille>
      <Meta>{dirTxt(d.higherIsBetter).toUpperCase()} · EIER {d.erEier ? "DU" : d.eierNavn.toUpperCase()}</Meta>
    </div>
    {d.beskrivelse ? <p style={{ margin: 0, font: "var(--type-body)", color: "var(--text-primary)", textWrap: "pretty", overflowWrap: "anywhere" }}>{d.beskrivelse}</p> : <p style={muted}>Ingen beskrivelse.</p>}
    <Meta>TELLER IKKE SOM TRENING · GÅR IKKE TIL PLAN, ANALYSE ELLER COACH</Meta>
  </Sek>;

  const liste = <Sek k="Resultatliste" meta={d.avsluttet ? "SLUTTRESULTAT" : `${d.deltakere.length} DELTAKERE`}>
    {!harScore && <TomTilstand icon={Trophy} title="Ingen score ennå" text="Plasseringene vises når første score er registrert." />}
    <div role="list">{d.deltakere.map((p, i) => <div role="listitem" key={p.id} style={{ display: "grid", gridTemplateColumns: "28px minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 52, borderTop: i ? "1px solid var(--border-hairline)" : "none", padding: "6px 0" }}>
      <span style={{ font: "600 15px/1 var(--font-mono)", color: p.rank == null ? "var(--text-faint)" : "var(--text-primary)" }}>{p.rank ?? "—"}</span>
      <span style={{ display: "flex", gap: 10, alignItems: "center", minWidth: 0 }}>
        <Avatar navn={p.navn} size={32} />
        <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span style={{ font: `${p.erMeg ? 600 : 500} 14px/1.3 var(--font-sans)`, color: "var(--text-primary)", overflowWrap: "anywhere" }}>{p.erMeg ? `${p.navn} (deg)` : p.navn}</span>
          {p.notes && <Meta style={{ overflowWrap: "anywhere", textTransform: "none", whiteSpace: "pre-wrap" }}>{p.notes}</Meta>}
        </span>
      </span>
      <span style={{ font: "600 17px/1 var(--font-mono)", color: p.score == null ? "var(--text-faint)" : "var(--text-primary)" }}>{p.score == null ? "—" : tallTekst(p.score)}</span>
    </div>)}</div>
  </Sek>;

  const bliMed = <Sek k="Bli med" meta="DU ER IKKE MED">
    <p style={{ margin: 0, font: "600 15px/1.4 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{d.eierNavn} har laget denne utfordringen.</p>
    <p style={muted}>Blir du med, ser de andre navnet og scoren din.</p>
    <div><Knapp size="lg" icon={Check} loading={pending} loadingText="Melder deg på …" onClick={() => kjor(actions.bliMed, ["Du er med", d.navn.toUpperCase()])}>Bli med</Knapp></div>
  </Sek>;

  const reg = <Sek k="Din score" meta={d.minScore != null ? `REGISTRERT ${tallTekst(d.minScore)}` : "IKKE REGISTRERT"}>
    <Skjemafelt label="Score" hint={dirTxt(d.higherIsBetter)} error={err ?? undefined}>
      <input className="a4-input a4-input--mono" aria-label="Score" inputMode="decimal" value={val} placeholder={d.minScore != null ? tallTekst(d.minScore) : "—"} onChange={(e) => { setVal(e.target.value); setErr(null); }} />
    </Skjemafelt>
    <Skjemafelt label="Notat (valgfritt)"><TekstOmrade value={note} onChange={setNote} placeholder={d.minNotes ?? "Hva gikk bra, hva ville du gjort annerledes?"} /></Skjemafelt>
    <div><Knapp icon={Check} loading={pending} onClick={lagre}>Registrer score</Knapp></div>
  </Sek>;

  const avs = <Sek k="Avslutt utfordring" rust>
    <p style={muted}>Resultatlisten låses og ingen kan registrere mer. Utfordringen heter da Avsluttet.</p>
    <div><Knapp icon={Flag} disabled={pending} onClick={() => setDlg(true)}>Avslutt utfordring</Knapp></div>
  </Sek>;

  const aktivDeltaker = !d.avsluttet && d.erDeltaker;
  const kanBliMed = !d.avsluttet && !d.erDeltaker;
  const to = bredde >= 900;

  return <Side max={1080}>
    <Hode kicker="Meg · Utfordringer" tittel={d.navn} sub={sub} tilbake={{ href: "/portal/utfordringer", tekst: "Utfordringer" }} />
    {toast.el}
    <Vakt tilstand={tilstand} laster="Henter utfordringen …" feil={feilTekst}>
      {to
        ? <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.1fr)", gap: 16, alignItems: "start" }}>
            <Stabel>{head}{aktivDeltaker && reg}{kanBliMed && bliMed}</Stabel>
            <Stabel>{liste}{d.erEier && !d.avsluttet && avs}</Stabel>
          </div>
        : <Stabel>{head}{kanBliMed && bliMed}{liste}{aktivDeltaker && reg}{d.erEier && !d.avsluttet && avs}</Stabel>}
    </Vakt>
    <Dialogboks open={dlg} title="Avslutte utfordringen?" onClose={() => setDlg(false)}
      footer={<><Knapp variant="secondary" onClick={() => setDlg(false)}>Fortsett</Knapp><Knapp variant="signal" onClick={() => { setDlg(false); kjor(actions.avslutt, ["Utfordringen er avsluttet", d.navn.toUpperCase()]); }}>Avslutt utfordring</Knapp></>}>
      Resultatlisten låses, og de {Math.max(d.deltakere.length - 1, 0)} andre får beskjed i appen. Ingen kan registrere mer score etterpå.
    </Dialogboks>
  </Side>;
}

/* ---------- Ny ---------- */

/** «dd.mm.åååå» → «åååå-mm-ddT12:00:00Z» (midt på dagen, så Oslo-datoen aldri glir). */
function tilIso(tekst: string): string | null | "feil" {
  const t = tekst.trim();
  if (!t) return null;
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(t);
  if (!m) return "feil";
  const [, dd, mm, yyyy] = m;
  const dato = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), 12));
  if (dato.getUTCMonth() !== Number(mm) - 1 || dato.getUTCDate() !== Number(dd)) return "feil";
  return dato.toISOString();
}

export function PH24dNy({ tilstand, deltakere, ovelser, opprett }: PH24dNyProps) {
  const [pending, start] = useTransition();
  const [navn, setNavn] = useState("");
  const [beskr, setBeskr] = useState("");
  const [ov, setOv] = useState("");
  const [hoy, setHoy] = useState(true);
  const [fra, setFra] = useState("");
  const [til, setTil] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [forsokt, setForsokt] = useState(false);
  const [serverFeil, setServerFeil] = useState<string | null>(null);

  const valgt = useMemo(() => ovelser.find((o) => o.id === ov) ?? null, [ov, ovelser]);
  const laast = valgt?.higherIsBetter != null;
  const effHoy = laast ? valgt!.higherIsBetter === true : hoy;
  const antall = sel.size;
  const navnFeil = forsokt && !navn.trim() ? "Gi utfordringen et navn." : undefined;
  const fraIso = tilIso(fra), tilIsoV = tilIso(til);
  const datoFeil = forsokt && (fraIso === "feil" || tilIsoV === "feil") ? "Skriv datoen som dd.mm.åååå." : undefined;
  const tog = (id: string) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const send = () => {
    setForsokt(true); setServerFeil(null);
    if (!navn.trim() || fraIso === "feil" || tilIsoV === "feil") return;
    start(async () => {
      try {
        await opprett({ name: navn.trim(), description: beskr.trim() || null, drillId: ov || null, startAt: fraIso, endAt: tilIsoV, higherIsBetter: effHoy, deltakerIds: [...sel] });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Utfordringen ble ikke opprettet.";
        if (msg.includes("NEXT_REDIRECT")) throw e;
        setServerFeil(msg);
      }
    });
  };

  const venner = deltakere.filter((x) => x.kilde === "Venn");
  const gruppe = deltakere.filter((x) => x.kilde === "Gruppe");
  const liste = (k: string, arr: PH24dValg[]) => arr.length > 0 && <div key={k} role="group" aria-label={k} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <Meta>{k.toUpperCase()}</Meta>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{arr.map((x) => <Valgpille key={x.id} valgt={sel.has(x.id)} onClick={() => tog(x.id)} style={{ minHeight: 44, maxWidth: "100%", whiteSpace: "normal", overflowWrap: "anywhere" }}>{x.navn}</Valgpille>)}</div>
  </div>;

  return <Side max={760}>
    <Hode kicker="Meg · Utfordringer" tittel="Ny utfordring" sub="Velg øvelse, hvem som er med og hvem som vinner." tilbake={{ href: "/portal/utfordringer", tekst: "Utfordringer" }} />
    <Vakt tilstand={tilstand} laster="Henter venner og grupper …" feil={{ title: "Vennene dine kunne ikke hentes", text: "Utfordringen er ikke opprettet. Prøv igjen.", code: "FEIL 503 · VENNER" }}>
      <Stabel>
        <Sek k="Utfordringen" meta="1 AV 2">
          <Skjemafelt label="Navn" error={navnFeil}><input className="a4-input" aria-label="Navn" value={navn} placeholder="Putting 3 fot · 20 putter" onChange={(e) => setNavn(e.target.value)} /></Skjemafelt>
          <Skjemafelt label="Beskrivelse (valgfritt)"><TekstOmrade value={beskr} onChange={setBeskr} placeholder="Hvordan skal øvelsen gjøres?" /></Skjemafelt>
          <Skjemafelt label="Øvelse (valgfritt)" hint="Uten øvelse er utfordringen fri">
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <select className="a4-input" aria-label="Øvelse" value={ov} onChange={(e) => setOv(e.target.value)} style={{ paddingRight: 36 }}>
                <option value="">Ingen øvelse</option>
                {ovelser.map((o) => <option key={o.id} value={o.id}>{o.navn}</option>)}
              </select>
              <span style={{ position: "absolute", right: 12, pointerEvents: "none", color: "var(--text-muted)", display: "flex" }}><Ikon icon={ChevronDown} size={16} name="chevron-down" /></span>
            </div>
          </Skjemafelt>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="pa-field__label" style={{ color: "var(--text-secondary)" }}>Hvem vinner</span>
            {laast
              ? <div style={{ display: "grid", gridTemplateColumns: "20px minmax(0,1fr)", gap: 8, padding: 12, borderRadius: 8, background: "var(--surface-sunken)" }}>
                  <span style={{ paddingTop: 2, color: "var(--text-secondary)" }}><Ikon icon={Lock} size={14} name="lock" /></span>
                  <span style={{ font: "var(--type-body-s)", color: "var(--text-primary)" }}>{dirTxt(effHoy)}. Retningen er låst av øvelsen.</span>
                </div>
              : <div className="pa-seg pa-seg--full pa-seg--lg" role="group" aria-label="Hvem vinner">
                  {([[true, "Høyest vinner"], [false, "Lavest vinner"]] as const).map(([v, l]) => <button key={l} type="button" className="pa-seg__opt" aria-pressed={hoy === v} onClick={() => setHoy(v)}>{l}</button>)}
                </div>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }}>
            <Skjemafelt label="Start (valgfritt)"><input className="a4-input a4-input--mono" aria-label="Start" value={fra} placeholder="dd.mm.åååå" onChange={(e) => setFra(e.target.value)} /></Skjemafelt>
            <Skjemafelt label="Slutt (valgfritt)" error={datoFeil}><input className="a4-input a4-input--mono" aria-label="Slutt" value={til} placeholder="dd.mm.åååå" onChange={(e) => setTil(e.target.value)} /></Skjemafelt>
          </div>
        </Sek>
        <Sek k="Hvem er med" meta={deltakere.length === 0 ? "INGEN Å VELGE" : `${antall} VALGT`}>
          {deltakere.length === 0
            ? <TomTilstand icon={Users} title="Ingen å velge ennå" text="Legg til venner eller bli med i en gruppe for å utfordre andre. Du kan lage utfordringen alene." />
            : <>{liste("Venner", venner)}{liste("Min gruppe", gruppe)}</>}
          <Meta>DE VALGTE FÅR VARSEL I APPEN · INGEN DELBAR LENKE · DU ER ALLTID MED</Meta>
        </Sek>
        {serverFeil && <FeilTilstand icon={RotateCw} title="Utfordringen ble ikke opprettet" text={serverFeil} />}
        <Knapp variant="signal" size="xl" fullWidth icon={Trophy} loading={pending} loadingText="Oppretter …" onClick={send}>Opprett utfordring{antall ? ` · ${antall} valgt` : ""}</Knapp>
        <Meta>UTFORDRINGER TELLER IKKE SOM TRENING</Meta>
      </Stabel>
    </Vakt>
  </Side>;
}

