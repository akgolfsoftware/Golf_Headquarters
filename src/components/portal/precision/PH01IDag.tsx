"use client";

/**
 * PH-01 I dag — Precision Athletics, runde 20 (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-01.jsx, etag 1790586884788672).
 *
 * Mobil først: dagens økter øverst som like store kort, neste først, «Start» med
 * ett trykk. Under: dagsform · agenda · neste fysiske økt · neste turnering ·
 * treningstid per akse mot plan · fullførte økter mot plan. Pop-up bare for
 * melding fra coach eller endring i planen.
 *
 * Bevisste avvik fra tegningen:
 *   - «Oppgaver fra coach» i agendaen vises ikke: appen har ingen oppgaver til spillere.
 *   - Fireukerssjekken vises ikke: den finnes ikke i koden ennå.
 *   - Økter som venter på spillerens godkjenning vises som egne kort med Godkjenn/Avvis.
 *     Tegningen legger forslag i innboksen bak bjella, som ikke er portert ennå.
 *   - Dagsform-kvitteringen sier «LAGRET», ikke «DELT MED COACH»: coachens visning
 *     av dagsform er ikke bygget ennå.
 *   - Neste fysiske økt viser sett × reps og kilo, ikke RIR: fysisk plan lagrer ikke RIR per rad.
 */
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarRange, Check, CircleAlert, Layers, List, ListChecks, Play, Plus, RotateCw, X } from "lucide-react";
import { AkseMerke, FeilTilstand, Ikon, Knapp, KnappLenke, Meta, Sidehode, StatusPille, Tall, Tidslinje, TomTilstand, type Akse, type TidslinjePunkt } from "@/components/precision/pa";
import { AKSE_NAVN } from "@/components/precision/pa";
import { formaterTall } from "@/lib/format-tall";
import { lagreDagsform } from "@/app/portal/dagsform-actions";
import { resolvePlayerApproval } from "@/lib/workbench/wb-actions";

const FORM = ["Tung", "Slapp", "Ok", "God", "Topp"] as const;

export type PH01Okt = {
  id: string; tid: string; slutt: string; tittel: string; akse: Akse; sted: string | null; min: number;
  antallOvelser: number; fokus: string | null; status: "Planlagt" | "Pågår" | "Gjennomført";
  href: string;
};
export type PH01Godkjenning = { id: string; tittel: string; tid: string; min: number; akse: Akse; sted: string | null; fraGruppe: boolean };
export type PH01Fys = { tittel: string; meta: string; rader: [string, string, string][]; href: string };
export type PH01Turn = { dager: number; tittel: string; sted: string | null; meta: string; href: string };
export type PH01Trening = { uke: number; akser: [Akse, number | null, number][]; kilde: string; planKilde: string };
export type PH01Fullfort = {
  uke: number; gjennomfort: number; totalt: number; igjen: number; hoppetOver: number;
  rekke: number; rekkeKilde: string; total: number; totalKilde: string;
  milepaeler: { antall: number; naadd: string | null }[];
};
export type PH01Popup = { id: string; kind: string; title: string; body: string | null; tid: string; href: string };
export type PH01Props = {
  tilstand: "data" | "tom" | "feil";
  kicker: string; tittel: string; sub: string; tomTekst: string; feilKode: string;
  okter: PH01Okt[]; nesteId: string | null; godkjenninger: PH01Godkjenning[];
  dagsform: number | null; agenda: TidslinjePunkt[];
  fys: PH01Fys | null; turn: PH01Turn | null; trening: PH01Trening | null; fullfort: PH01Fullfort | null;
  popup: PH01Popup | null;
  children?: React.ReactNode;
};

const stripe = (a: Akse) => `inset 4px 0 0 var(--axis-${a})`;
const muted = { margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" } as const;
const hairTop = "1px solid var(--border-hairline)";
const t = (n: number | null, d = 1) => formaterTall(n, d, true);

function Hode({ k, meta }: { k: string; meta?: string }) {
  return <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}><span className="kicker" style={{ flex: "1 1 auto" }}>{k}</span>{meta != null && <Meta>{meta}</Meta>}</div>;
}
function Seksjon({ label, akse, children }: { label: string; akse?: Akse; children: React.ReactNode }) {
  return <section aria-label={label} className="pa-card" style={{ padding: akse ? "16px 16px 16px 20px" : 16, gap: 12, minWidth: 0, boxShadow: akse ? stripe(akse) : undefined }}>{children}</section>;
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

function OktKort({ s, neste }: { s: PH01Okt; neste: boolean }) {
  const ferdig = s.status === "Gjennomført";
  return <article aria-label={`${s.tid} ${s.tittel}`} className="pa-card" style={{ padding: "16px 16px 16px 20px", gap: 12, boxShadow: stripe(s.akse), minWidth: 0, minHeight: 212, display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <Tall style={{ font: "600 21px/1 var(--font-mono)" }}>{s.tid}</Tall><Meta>–{s.slutt}</Meta>
      <span style={{ marginLeft: "auto", display: "inline-flex", gap: 8, alignItems: "center" }}>{neste && <Meta style={{ color: "var(--text-primary)" }}>NESTE</Meta>}<StatusPille tone={ferdig ? "ok" : "neutral"}>{s.status}</StatusPille></span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <span style={{ font: "600 17px/1.3 var(--font-sans)", color: ferdig ? "var(--text-secondary)" : "var(--text-primary)", textWrap: "pretty" }}>{s.tittel}</span>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><AkseMerke axis={s.akse} /><Meta>{[s.sted?.toUpperCase(), `${s.min} MIN`, `${s.antallOvelser} ØVELSER`].filter(Boolean).join(" · ")}</Meta></div>
      {s.fokus && <Meta>{s.fokus.toUpperCase()}</Meta>}
    </div>
    <span style={{ flex: 1 }} />
    {ferdig ? <KnappLenke href={s.href} variant="secondary" size="xl" fullWidth icon={List} iconName="list">Se økta</KnappLenke>
      : <KnappLenke href={s.href} variant={neste ? "primary" : "secondary"} size="xl" fullWidth icon={Play} iconName="play">{s.status === "Pågår" ? "Fortsett" : "Start"}</KnappLenke>}
  </article>;
}

function GodkjenningKort({ g, onSvar }: { g: PH01Godkjenning; onSvar: (id: string, ok: boolean, feil?: string) => void }) {
  const [pending, start] = useTransition();
  const svar = (decision: "ACCEPTED" | "REJECTED") => start(async () => {
    try {
      const res = await resolvePlayerApproval({ sessionId: g.id, decision });
      onSvar(g.id, res.ok, res.ok ? undefined : res.error);
    } catch { onSvar(g.id, false, "Svaret ble ikke bekreftet. Prøv igjen."); }
  });
  return <article aria-label={`Forslag: ${g.tittel}`} aria-busy={pending} className="pa-card" style={{ padding: "16px 16px 16px 20px", gap: 12, boxShadow: stripe(g.akse), minWidth: 0, minHeight: 212, display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <Tall style={{ font: "600 21px/1 var(--font-mono)" }}>{g.tid}</Tall>
      <span style={{ marginLeft: "auto" }}><StatusPille tone="warn">Venter på deg</StatusPille></span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
      <span style={{ font: "600 17px/1.3 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{g.tittel}</span>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><AkseMerke axis={g.akse} /><Meta>{[g.sted?.toUpperCase(), `${g.min} MIN`].filter(Boolean).join(" · ")}</Meta></div>
      <Meta>{g.fraGruppe ? "FORSLAG FRA GRUPPEN" : "FORSLAG FRA COACH"} · AVVIS SKJULER DET FRA PLANEN</Meta>
    </div>
    <span style={{ flex: 1 }} />
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Knapp variant="primary" icon={Check} loading={pending} loadingText="Sender svar …" onClick={() => svar("ACCEPTED")}>Godkjenn</Knapp>
      <Knapp variant="ghost" disabled={pending} onClick={() => svar("REJECTED")}>Avvis</Knapp>
    </div>
  </article>;
}

function Dagsform({ start, tom, toast }: { start: number | null; tom: boolean; toast: (t: string, m: string) => void }) {
  const [f, setF] = useState<number | null>(tom ? null : start == null ? null : start - 1);
  const [pending, begin] = useTransition();
  const velg = (i: number) => {
    const forrige = f;
    setF(i);
    begin(async () => {
      const res = await lagreDagsform({ verdi: i + 1 });
      if (res.ok) toast("Dagsform registrert", `${i + 1} · ${FORM[i]!.toUpperCase()} · LAGRET`);
      else { setF(forrige); toast(res.feil, "IKKE LAGRET"); }
    });
  };
  return <Seksjon label="Dagsform">
    <Hode k="Dagsform" meta={f == null ? "IKKE REGISTRERT" : `${f + 1} / 5 · ${FORM[f]!.toUpperCase()}`} />
    <div role="group" aria-label="Dagsform" style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 6 }}>
      {FORM.map((x, i) => <button key={x} type="button" className="ph01-form" disabled={pending} aria-pressed={i === f} aria-label={`${i + 1} ${x}`} onClick={() => velg(i)}>
        <span style={{ font: "600 15px/1 var(--font-mono)" }}>{i + 1}</span>
        <span style={{ font: "500 10px/1 var(--font-sans)", opacity: .8, overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{x}</span>
      </button>)}
    </div>
  </Seksjon>;
}

function Agenda({ items, tom }: { items: TidslinjePunkt[]; tom: boolean }) {
  const synlige = tom ? [] : items;
  return <Seksjon label="Agenda i dag">
    <Hode k="Agenda i dag" meta={tom ? "—" : `${synlige.length} HENDELSER`} />
    {synlige.length ? <Tidslinje items={synlige} dense /> : <p style={muted}>Ingenting planlagt i dag.</p>}
  </Seksjon>;
}

function NesteFys({ fys }: { fys: PH01Fys | null }) {
  if (!fys) return <Seksjon label="Neste fysiske økt"><Hode k="Neste fysiske økt" meta="—" /><p style={muted}>Ingen fysisk plan ennå. Fysiske økter kommer med treningsplanen.</p></Seksjon>;
  return <Seksjon label="Neste fysiske økt" akse="fys">
    <Hode k="Neste fysiske økt" />
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><span style={{ font: "600 15px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{fys.tittel}</span><Meta>{fys.meta}</Meta></div>
    {fys.rader.length > 0 && <div role="list">{fys.rader.map(([n, q, r], i) => <div role="listitem" key={`${n}-${i}`} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto auto", gap: 12, alignItems: "center", minHeight: 44, borderTop: hairTop }}>
      <span style={{ font: "400 14px/1.3 var(--font-sans)", color: "var(--text-primary)", minWidth: 0 }}>{n}</span><Tall style={{ font: "var(--type-num-s)" }}>{q}</Tall><Meta>{r}</Meta>
    </div>)}</div>}
    <div><KnappLenke href={fys.href} variant="secondary" icon={ArrowRight} iconName="arrow-right">Registrer sett</KnappLenke></div>
  </Seksjon>;
}

function NesteTurn({ turn }: { turn: PH01Turn | null }) {
  if (!turn) return <Seksjon label="Neste turnering"><Hode k="Neste turnering" meta="—" /><p style={muted}>Ingen turnering i planen.</p><div><KnappLenke href="/portal/tren/turneringer" variant="ghost" icon={Plus} iconName="plus">Legg til turnering</KnappLenke></div></Seksjon>;
  return <Seksjon label="Neste turnering" akse="turn">
    <Hode k="Neste turnering" />
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}><span style={{ font: "600 40px/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>{turn.dager}</span><span style={{ font: "500 15px/1 var(--font-sans)", color: "var(--text-secondary)" }}>{turn.dager === 1 ? "dag igjen" : "dager igjen"}</span></div>
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><span style={{ font: "600 15px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>{[turn.tittel, turn.sted].filter(Boolean).join(" · ")}</span><Meta>{turn.meta}</Meta></div>
    <div><KnappLenke href={turn.href} variant="secondary" icon={ArrowRight} iconName="arrow-right">Se forberedelser</KnappLenke></div>
  </Seksjon>;
}

function Treningstid({ tr, uke }: { tr: PH01Trening | null; uke: number }) {
  if (!tr) return <Seksjon label="Treningstid denne uka"><Hode k={`Treningstid uke ${uke}`} meta="— AV — T" /><p style={muted}>Uten treningsplan er det ingen fordeling å sammenligne med. Velg en plan, så ser du tid per akse mot det planen sier.</p><div><KnappLenke href="/portal/planlegge" variant="secondary" icon={ListChecks} iconName="list-checks">Velg treningsplan</KnappLenke></div></Seksjon>;
  const gjort = tr.akser.reduce((a, [, h]) => a + (h ?? 0), 0), plan = tr.akser.reduce((a, [, , g]) => a + g, 0);
  const rader = tr.akser.map(([a, h, g]) => ({ a, h, g, sh: h == null || gjort === 0 ? null : Math.round(h / gjort * 100), ps: plan === 0 ? 0 : Math.round(g / plan * 100) }));
  const verst = rader.filter((r) => r.sh != null).sort((x, y) => Math.abs(y.sh! - y.ps) - Math.abs(x.sh! - x.ps))[0];
  const maks = Math.max(...rader.map((r) => Math.max(r.g, r.h ?? 0)), 0.1) * 1.1;
  return <Seksjon label="Treningstid denne uka">
    <Hode k={`Treningstid uke ${tr.uke}`} meta={`${t(gjort)} AV ${formaterTall(plan, 0)} T`} />
    {verst && <p style={{ margin: 0, font: "500 15px/1.4 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>Du trener {verst.sh} % {AKSE_NAVN[verst.a]}, planen sier {verst.ps} %.</p>}
    <div role="list" style={{ display: "flex", flexDirection: "column" }}>
      {rader.map((r) => <div role="listitem" key={r.a} aria-label={`${AKSE_NAVN[r.a]} ${t(r.h)} av ${t(r.g)} timer`} style={{ display: "grid", gridTemplateColumns: "64px minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 52, borderTop: hairTop }}>
        <span><AkseMerke axis={r.a} size="sm" /></span>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
          <div style={{ position: "relative", height: 8, background: "var(--surface-sunken)" }}><div style={{ height: "100%", width: `${(r.h ?? 0) / maks * 100}%`, background: "var(--primary)" }} /><span aria-hidden style={{ position: "absolute", top: -4, bottom: -4, width: 2, left: `calc(${r.g / maks * 100}% - 1px)`, background: "var(--text-muted)" }} /></div>
          <Meta>{r.sh == null ? "—" : `${r.sh} %`} · PLAN {r.ps} %</Meta>
        </div>
        <Tall style={{ font: "var(--type-num-s)", textAlign: "right" }}>{t(r.h)} / {t(r.g)} t</Tall>
      </div>)}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 2, borderTop: hairTop, paddingTop: 8 }}><Meta>STREK = TIMER GJENNOMFØRT · MERKE = PLAN</Meta><Meta>{tr.kilde}</Meta><Meta>{tr.planKilde}</Meta></div>
  </Seksjon>;
}

function Fullfort({ f, uke }: { f: PH01Fullfort | null; uke: number }) {
  const pct = f && f.totalt > 0 ? Math.round(f.gjennomfort / f.totalt * 100) : null;
  return <Seksjon label="Fullførte økter mot plan">
    <Hode k={`Fullførte økter · uke ${f?.uke ?? uke}`} meta={pct == null ? "—" : `${pct} %`} />
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}><span style={{ font: "600 29px/1 var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>{f && f.totalt > 0 ? f.gjennomfort : "—"}</span><span style={{ font: "500 15px/1 var(--font-sans)", color: "var(--text-secondary)" }}>av {f && f.totalt > 0 ? f.totalt : "—"} økter</span></div>
    <div style={{ position: "relative", height: 8, background: "var(--surface-sunken)" }}><div style={{ height: "100%", width: `${pct ?? 0}%`, background: "var(--primary)" }} /><span aria-hidden style={{ position: "absolute", top: -4, bottom: -4, width: 2, left: "calc(70% - 1px)", background: "var(--text-muted)" }} /></div>
    <Meta>{!f || f.totalt === 0 ? "INGEN ØKTER I PLANEN DENNE UKA" : `MERKE = 70 % · ${f.igjen} IGJEN · ${f.hoppetOver} HOPPET OVER`}</Meta>
    <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 52, borderTop: hairTop, flexWrap: "wrap" }}><span style={{ flex: "1 1 160px", font: "400 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>Uker på rad over 70 %</span><Tall style={{ font: "var(--type-num-s)" }}>{f ? `${f.rekke} ${f.rekke === 1 ? "uke" : "uker"}` : "—"}</Tall><Meta style={{ flexBasis: "100%" }}>{f ? f.rekkeKilde : "—"}</Meta></div>
    <div style={{ borderTop: hairTop, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "baseline" }}><span style={{ flex: "1 1 auto", font: "400 14px/1.3 var(--font-sans)", color: "var(--text-primary)" }}>Milepæler</span><Meta>{f ? `${f.total} ØKTER TOTALT` : "—"}</Meta></div>
      <div role="list" style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8 }}>
        {(f?.milepaeler ?? [{ antall: 10, naadd: null }, { antall: 50, naadd: null }, { antall: 100, naadd: null }]).map((m) => { const naadd = f != null && f.total >= m.antall; return <div role="listitem" key={m.antall} style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, padding: "8px 0", borderTop: `2px solid ${naadd ? "var(--text-primary)" : "var(--border-hairline)"}` }}>
          <span style={{ display: "inline-flex", gap: 4, alignItems: "center", font: "600 17px/1 var(--font-mono)", color: naadd ? "var(--text-primary)" : "var(--text-muted)" }}>{m.antall}{naadd && <Ikon icon={Check} size={16} name="check" />}</span>
          <Meta>{!f ? "—" : naadd ? `NÅDD ${m.naadd ?? ""}`.trim() : `${m.antall - f.total} IGJEN`}</Meta>
        </div>; })}
      </div>
      <Meta>{f ? f.totalKilde : "—"}</Meta>
    </div>
  </Seksjon>;
}

const ingenAbonnement = () => () => {};

function Popup({ p, toast }: { p: PH01Popup; toast: (t: string, m: string) => void }) {
  const K = `phq-popup-${p.id}`;
  const [lukket, setLukket] = useState(false);
  // Sett i denne fanen før? sessionStorage leses bare i nettleseren; serveren tegner ingen pop-up.
  const sett = useSyncExternalStore(ingenAbonnement, () => { try { return sessionStorage.getItem(K) != null; } catch { return false; } }, () => true);
  const open = !lukket && !sett;
  const lukk = () => { try { sessionStorage.setItem(K, "1"); } catch { /* privat modus */ } setLukket(true); };
  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") lukk(); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  });
  if (!open) return null;
  return <div className="pa-scrim" onClick={lukk}>
    <div className="pa-dialog" role="dialog" aria-modal="true" aria-label={p.kind} style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
      <div className="pa-dialog__head"><div className="pa-dialog__title">{p.kind}</div><button type="button" className="pa-iconbtn" aria-label="Lukk" onClick={lukk}><Ikon icon={X} size={18} name="x" /></button></div>
      <div className="pa-dialog__body"><div style={{ display: "flex", flexDirection: "column", gap: 8 }}><Meta>{p.tid}</Meta><span style={{ font: "600 17px/1.3 var(--font-sans)", color: "var(--text-primary)", textWrap: "pretty" }}>{p.title}</span>{p.body && <p style={muted}>{p.body}</p>}</div></div>
      <div className="pa-dialog__foot"><div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", width: "100%" }}>
        <Knapp variant="secondary" onClick={() => { lukk(); toast("Ligger i varslene", "FINNES BAK BJELLA"); }}>Ignorer</Knapp>
        <Link href={p.href} className="pa-btn pa-btn--primary" onClick={lukk}>Les</Link>
      </div></div>
    </div>
  </div>;
}

export function PH01IDag(p: PH01Props) {
  const router = useRouter();
  const { vis: toast, el: toastEl } = useToast();
  const [besvart, setBesvart] = useState<string[]>([]);
  const tom = p.tilstand === "tom";
  const godkj = p.godkjenninger.filter((g) => !besvart.includes(g.id));
  const onSvar = (id: string, ok: boolean, feil?: string) => {
    if (!ok) { toast(feil ?? "Svaret ble ikke lagret.", "PRØV IGJEN"); return; }
    setBesvart((l) => [...l, id]);
    router.refresh();
  };
  return <div className="pa-side">
    <Sidehode kicker={p.kicker} title={p.tittel} sub={p.sub} />
    {p.tilstand === "feil" ? <FeilTilstand icon={CircleAlert} title="Kunne ikke hente dagens plan" text="Tilkoblingen ble brutt. Ingenting er endret i planen din." code={p.feilKode}
      retry={<Knapp variant="secondary" icon={RotateCw} iconName="rotate-cw" onClick={() => router.refresh()}>Prøv igjen</Knapp>} /> : <>
      {p.popup && <Popup p={p.popup} toast={toast} />}
      <section aria-label="Dagens økter" style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
        {p.okter.length === 0 && godkj.length === 0
          ? <TomTilstand icon={CalendarRange} title="Ingen økt i dag" text={p.tomTekst} actions={<>
              <KnappLenke href="/portal/planlegge/workbench" variant="secondary" icon={Layers} iconName="layers">Bygg økter i Workbench</KnappLenke>
              <KnappLenke href="/portal/runde/logg" variant="ghost">Registrer runde</KnappLenke>
            </>} />
          : <div className="ph01-okter">
              {godkj.map((g) => <GodkjenningKort key={g.id} g={g} onSvar={onSvar} />)}
              {p.okter.map((s) => <OktKort key={s.id} s={s} neste={s.id === p.nesteId} />)}
            </div>}
      </section>
      <div className="ph01-to">
        <Dagsform start={p.dagsform} tom={tom} toast={toast} />
        <Agenda items={p.agenda} tom={tom} />
        <NesteFys fys={tom ? null : p.fys} />
        <NesteTurn turn={tom ? null : p.turn} />
        <Treningstid tr={tom ? null : p.trening} uke={p.fullfort?.uke ?? 0} />
        <Fullfort f={tom ? null : p.fullfort} uke={p.fullfort?.uke ?? 0} />
      </div>
    </>}
    {p.children}
    {toastEl}
  </div>;
}
