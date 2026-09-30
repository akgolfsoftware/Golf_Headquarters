"use client";

/**
 * AG-19 Jarvis i Precision Athletics — porting av /admin/jarvis.
 * Tegning: designsystem 7d7c2994, ui_kits/agencyos/screens/AG-19.jsx.
 *
 * Fanene Kø · Prosjekter · Skills følger tegningen; Samtale er «Caddie ·
 * samtale». Runtimes finnes ikke i tegningen, men beholdes fra dagens kode
 * (avvik, se PR). Jarvis sender og endrer ingenting selv: alt som går ut til
 * et menneske ligger som utkast i godkjenn-køen til coachen har sagt ja.
 *
 * Bare ekte data. Det appen ikke har (helse på runtimes, kjøringssteg per
 * agent) vises ikke; det som mangler står som «—» eller er utelatt.
 */
import { useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, CircleAlert, ListChecks, MessageSquare, Play, Sparkles } from "lucide-react";
import { Sidehode, Knapp, KnappLenke, StatusPille, TomTilstand, Meta, Tall, FeilTilstand, LasterTilstand } from "@/components/precision/pa";
import { Kolonner, Stabel, Nokkelverdi } from "@/components/precision/pa-a4";
import { InlineVarsel, KortHode, Kort } from "@/components/precision/pa-a5";
import { AG19Samtale } from "@/components/admin/precision/AG19Samtale";
import { triggerAgentManually } from "@/app/admin/(legacy)/agents/actions";
import { jarvisHref, type JarvisFane, type JarvisFaneId } from "@/lib/admin/jarvis/faner";
import type { AgenticosCockpitData, AgenticosProjectsData } from "@/lib/agencyos/last-agenticos";
import type { AgenticosRuntime, AgenticosSkill } from "@/lib/agencyos/agenticos-ia";
import type { JarvisKjoring, JarvisSamtaleData } from "@/lib/admin/jarvis/last-jarvis";
import "@/styles/precision-a5.css";

export type AG19Tilstand = "data" | "tom" | "laster" | "feil";

export type AG19Props = {
  tilstand: AG19Tilstand;
  fane: JarvisFaneId;
  faner: readonly JarvisFane[];
  antall: Partial<Record<JarvisFaneId, number>>;
  cockpit: AgenticosCockpitData;
  kjoringer: readonly JarvisKjoring[];
  valgtKjoringId: string | null;
  prosjekter: AgenticosProjectsData;
  skills: readonly AgenticosSkill[];
  runtimes: readonly AgenticosRuntime[];
  kjoringerIdag: number;
  /** Null = samtalen er ikke tilgjengelig for denne rollen (bare administrator). */
  samtale: JarvisSamtaleData | null;
};

const kjoringHref = (id: string) => `/admin/jarvis?kjoring=${encodeURIComponent(id)}`;

function Faneverktoy({ faner, aktiv, antall }: { faner: readonly JarvisFane[]; aktiv: JarvisFaneId; antall: AG19Props["antall"] }) {
  return <nav className="pa-tabs" aria-label="Jarvis-faner">
    {faner.map((f) => {
      const n = f.id === "ko" ? antall[f.id] : undefined;
      return <Link key={f.id} href={jarvisHref(f.id)} aria-current={f.id === aktiv ? "page" : undefined} className="pa-tab" data-fanelenke="">
        {f.label}{n !== undefined && <span className="pa-tab__count">{n}</span>}
      </Link>;
    })}
  </nav>;
}

function KjorKnapp({ slug }: { slug: string }) {
  const router = useRouter();
  const [venter, start] = useTransition();
  return <Knapp icon={Play} iconName="play" loading={venter} loadingText="Kjører …" onClick={() => start(async () => {
    const res = await triggerAgentManually(slug);
    if (res.ok) toast.success(res.melding); else toast.error(res.melding);
    router.refresh();
  })}>Kjør</Knapp>;
}

function Tellekort({ tall, tekst, href, lenke }: { tall: number; tekst: string; href: string; lenke: string }) {
  return <div className="pa-card" style={{ padding: 16, gap: 8, minWidth: 0 }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0, flexWrap: "wrap" }}>
      <Tall style={{ font: "var(--type-num-l, var(--type-num))" }}>{tall}</Tall>
      <span style={{ font: "var(--type-body-s)", color: "var(--text-secondary)", minWidth: 0, flex: "1 1 120px" }}>{tekst}</span>
    </div>
    <div><KnappLenke variant="ghost" size="sm" href={href} iconRight={ArrowRight}>{lenke}</KnappLenke></div>
  </div>;
}

function NesteKort({ cockpit }: { cockpit: AgenticosCockpitData }) {
  const n = cockpit.neste;
  if (!n) return <Kort style={{ minWidth: 0 }}>
    <KortHode tittel="Ingen task klar" aside="NESTE" />
    <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>
      Agentene foreslår nye når det kommer data de kan jobbe med. Forslagene havner i godkjenn-køen.
    </p>
    <div><KnappLenke href="/admin/oppgaver" variant="secondary" icon={ListChecks} iconName="list-checks">Ny oppgave</KnappLenke></div>
  </Kort>;
  const godkjenn = n.kind === "godkjenn";
  return <Kort style={{ minWidth: 0 }}>
    <KortHode tittel={n.tittel} aside={godkjenn ? "NESTE · VENTER PÅ DEG" : "NESTE · KLAR"} />
    <Meta>{n.meta.toUpperCase()}</Meta>
    <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{n.beskrivelse}</p>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {godkjenn ? <>
        <KnappLenke href={`/admin/ko?fane=agentgodkjenn&sak=${n.id}`}>Se og godkjenn</KnappLenke>
      </> : <>
        {n.kanKjore && <KjorKnapp slug={n.slug} />}
        <KnappLenke variant={n.kanKjore ? "secondary" : "primary"} href={`/admin/agents/${n.slug}`}>Åpne agent</KnappLenke>
      </>}
    </div>
  </Kort>;
}

function KjoringRad({ k, valgt, forste }: { k: JarvisKjoring; valgt: boolean; forste: boolean }) {
  return <Link href={kjoringHref(k.id)} aria-current={valgt ? "true" : undefined} style={{
    display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "12px 16px", minHeight: 64, minWidth: 0, textDecoration: "none", color: "inherit",
    borderTop: forste ? "none" : "1px solid var(--border-hairline)",
    background: valgt ? "var(--surface-flat)" : "transparent",
    boxShadow: valgt ? "inset 2px 0 0 var(--border-ink)" : "none",
  }}>
    <span style={{ flex: "1 1 180px", minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={{ font: "500 14px/1.3 var(--font-sans)", overflowWrap: "anywhere" }}>{k.navn}</span>
      <Meta>{k.naar} · {k.varighet}</Meta>
    </span>
    <StatusPille tone={k.ok ? "ok" : "warn"}>{k.ok ? "Fullført" : "Feilet"}</StatusPille>
  </Link>;
}

function Kjoringsdetalj({ k, venterPaDeg }: { k: JarvisKjoring; venterPaDeg: number }) {
  return <Kort style={{ minWidth: 0 }}>
    <KortHode tittel="Kjøringsdetalj" aside={`${k.naar} · ${k.varighet}`} />
    <div style={{ font: "var(--type-title-s)", overflowWrap: "anywhere" }}>{k.navn}</div>
    {!k.ok && <InlineVarsel tone="warn" tittel="Kjøringen feilet.">{k.utdrag ?? "Ingen feilmelding lagret."}</InlineVarsel>}
    {k.ok && <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", overflowWrap: "anywhere", textWrap: "pretty" }}>
      {k.utdrag ?? "Fullført uten tekst lagret."}
    </p>}
    <Nokkelverdi items={[["Status", k.ok ? "Fullført" : "Feilet"], ["Varighet", k.varighet, { mono: true }], ["Startet", k.naar, { mono: true }]]} />
    <Meta>JARVIS SENDER OG ENDRER INGENTING SELV</Meta>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <KnappLenke variant="secondary" href={k.href} iconRight={ArrowRight}>Åpne agent</KnappLenke>
      {venterPaDeg > 0 && <KnappLenke variant="ghost" href="/admin/ko?fane=agentgodkjenn">Godkjenn-køen</KnappLenke>}
    </div>
  </Kort>;
}

function KoFane({ p }: { p: AG19Props }) {
  const { cockpit, kjoringer } = p;
  const valgt = kjoringer.find((k) => k.id === p.valgtKjoringId) ?? kjoringer[0] ?? null;
  return <Stabel gap={16}>
    {cockpit.feilende[0] && <InlineVarsel tone="warn" tittel={`${cockpit.feilende[0].navn} svarer ikke.`}>
      Siste kjøring feilet. Tidligere forslag står i godkjenn-køen, og ingenting er rørt uten deg.{" "}
      <Link href={cockpit.feilende[0].detaljHref} style={{ textDecoration: "underline", color: "inherit" }}>Åpne agent</Link>
    </InlineVarsel>}
    <NesteKort cockpit={cockpit} />
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", minWidth: 0 }}>
      <Tellekort tall={cockpit.venterPaDeg} tekst="venter på deg. Ingenting skrives før du sier ja" href="/admin/ko?fane=agentgodkjenn" lenke="Godkjenn-køen" />
      <Tellekort tall={cockpit.klarCount} tekst={cockpit.pagarCount > 0 ? `oppgaver klare i kø · ${cockpit.pagarCount} pågår` : "oppgaver klare i kø"} href="/admin/ko?fane=agentko" lenke="Åpne kø" />
      <Tellekort tall={cockpit.researchCount} tekst="nye signaler siste 7 dager. Bare lesing, ingen godkjenning" href="/admin/jarvis?fane=skills" lenke="Se hva agentene får lov til" />
    </div>
    <section aria-label="Siste kjøringer">
      <Stabel gap={8}>
        <KortHode tittel="Siste kjøringer" aside={cockpit.runtimeLinje.toUpperCase()} />
        {kjoringer.length === 0 ? <TomTilstand icon={Sparkles} title="Ingen kjøringer ennå" text="Agentene kjører etter sin egen plan. Du kan også starte en agent manuelt fra kortet over, eller spørre Caddie direkte." actions={<KnappLenke href={jarvisHref("samtale")} icon={MessageSquare} iconName="message-square">Åpne samtale</KnappLenke>} />
          : <Kolonner mal="repeat(auto-fit, minmax(min(100%, 340px), 1fr))" gap={16}>
            <div className="pa-card" style={{ padding: 0, overflow: "hidden", minWidth: 0 }}>
              {kjoringer.map((k, i) => <KjoringRad key={k.id} k={k} valgt={valgt?.id === k.id} forste={i === 0} />)}
            </div>
            {valgt && <Kjoringsdetalj k={valgt} venterPaDeg={cockpit.venterPaDeg} />}
          </Kolonner>}
      </Stabel>
    </section>
    <Meta>AGENTENE SKRIVER ALDRI DIREKTE TIL WORKBENCH. UKESFORSLAG KOMMER SOM UTKAST I GODKJENN-KØEN.</Meta>
  </Stabel>;
}

function ProsjekterFane({ data }: { data: AgenticosProjectsData }) {
  const n = data.grupper.reduce((s, g) => s + g.rader.length, 0);
  if (n === 0) return <TomTilstand icon={ListChecks} title="Ingen prosjekter ennå" text="Prosjekter grupperes på område når de lander fra workspace." actions={<KnappLenke href="/admin/oppgaver" variant="secondary">Åpne oppgaver</KnappLenke>} />;
  return <Stabel gap={20}>
    {data.grupper.map((g) => <section key={g.area} aria-label={g.label}>
      <Stabel gap={8}>
        <span className="kicker">{g.label}</span>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))", minWidth: 0 }}>
          {g.rader.map((r) => <div key={r.id} className="pa-card" style={{ padding: 16, gap: 6, minWidth: 0 }}>
            <span style={{ font: "600 15px/1.3 var(--font-sans)", overflowWrap: "anywhere" }}>{r.tittel}</span>
            <Meta>{r.meta.toUpperCase()}</Meta>
            <div><KnappLenke variant="ghost" size="sm" href={r.href} iconRight={ArrowRight}>Åpne i Oppgaver</KnappLenke></div>
          </div>)}
        </div>
      </Stabel>
    </section>)}
    {data.tomme && <Meta>{data.tomme.toUpperCase()}</Meta>}
  </Stabel>;
}

function SkillsFane({ skills }: { skills: readonly AgenticosSkill[] }) {
  return <Stabel gap={12}>
    <div className="pa-card" style={{ padding: "4px 16px", minWidth: 0 }}>
      {skills.map((s, i) => <div key={s.id} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", minHeight: 56, padding: "8px 0", borderTop: i ? "1px solid var(--border-hairline)" : "none", minWidth: 0 }}>
        <span style={{ flex: "1 1 220px", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ font: "600 14px/1.3 var(--font-sans)", overflowWrap: "anywhere" }}>{s.tittel}</span>
          <Meta>{s.meta.toUpperCase()}</Meta>
        </span>
        <StatusPille tone={s.paa ? "ok" : "neutral"}>{s.las ? "Av og låst" : s.paa ? "Aktiv" : "Av"}</StatusPille>
      </div>)}
    </div>
    <Meta>HVA AGENTENE FÅR LOV TIL. ALT ANNET ER STENGT. «PUBLISERE ØKTER» KAN IKKE SKRUS PÅ. OVERSIKT, INGEN BRYTERE LAGRER HER.</Meta>
  </Stabel>;
}

function RuntimesFane({ runtimes, kjoringerIdag }: { runtimes: readonly AgenticosRuntime[]; kjoringerIdag: number }) {
  const paa = runtimes.filter((r) => r.koblet).length;
  return <Stabel gap={16}>
    {paa === 0 && <InlineVarsel tone="warn" tittel="Ingen motor svarer akkurat nå.">
      {kjoringerIdag === 0 ? "Ingen oppgaver ligger i kø." : `${kjoringerIdag} kjøring${kjoringerIdag === 1 ? "" : "er"} i dag. Ingen er kjørt halvveis.`}
    </InlineVarsel>}
    <div className="pa-card" style={{ padding: "4px 16px", minWidth: 0 }}>
      {runtimes.map((r, i) => <div key={r.id} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", minHeight: 56, padding: "8px 0", borderTop: i ? "1px solid var(--border-hairline)" : "none", minWidth: 0 }}>
        <span style={{ flex: "1 1 220px", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ font: "600 14px/1.3 var(--font-sans)" }}>{r.navn}</span>
          <Meta>{r.kind} · {r.startRegel.toUpperCase()} · {r.meta.toUpperCase()}</Meta>
        </span>
        <StatusPille tone={r.koblet ? "ok" : "neutral"}>{r.koblet ? "Koblet" : "Av"}</StatusPille>
      </div>)}
    </div>
    <InlineVarsel tone="info" tittel="Ollama kjører på Mac Mini, ikke i denne appen.">
      Data forlater ikke maskinen når Ollama kjører. Modeller lastes og sjekkes på maskinen, ikke herfra.
    </InlineVarsel>
    <Meta>AV BETYR AT OPPGAVER TILDELT DEN BLIR STÅENDE SOM KLAR. INGENTING KJØRES OM. OVERSIKT, INGEN BRYTERE LAGRER HER.</Meta>
  </Stabel>;
}

function Innhold({ p }: { p: AG19Props }): ReactNode {
  switch (p.fane) {
    case "ko": return p.tilstand === "tom"
      ? <TomTilstand icon={Sparkles} title="Ingen kjøringer i dag" text="Agentene kjører etter sin egen plan. Du kan også spørre Caddie direkte." actions={<KnappLenke href={jarvisHref("samtale")} icon={MessageSquare} iconName="message-square">Åpne samtale</KnappLenke>} />
      : <KoFane p={p} />;
    case "prosjekter": return <ProsjekterFane data={p.prosjekter} />;
    case "skills": return <SkillsFane skills={p.skills} />;
    case "runtimes": return <RuntimesFane runtimes={p.runtimes} kjoringerIdag={p.kjoringerIdag} />;
    case "samtale": return p.samtale
      ? <AG19Samtale conversationId={p.samtale.conversationId} historikk={p.samtale.historikk} utkastVenter={p.samtale.utkastVenter} />
      : <InlineVarsel tone="info" tittel="Samtalen er for administrator.">Caddie kan lese og foreslå på tvers av hele stallen, og er derfor låst til administrator-rollen.</InlineVarsel>;
  }
}

export function AG19Jarvis(p: AG19Props) {
  return <div className="pa-side" style={{ maxWidth: 1200 }}>
    <Sidehode kicker="Caddie · Jarvis" title="Jarvis" sub="Jarvis og agentene forbereder alt. Ingenting går ut til et menneske før du har godkjent utkastet." />
    <Stabel gap={16}>
      <Faneverktoy faner={p.faner} aktiv={p.fane} antall={p.antall} />
      {p.tilstand === "laster" ? <LasterTilstand text="Henter agentkøen …" />
        : p.tilstand === "feil" ? <FeilTilstand icon={CircleAlert} title="Jarvis svarer ikke" text="Ingen utkast er sendt eller slettet. Prøv igjen om litt." code="FEIL 503 · AGENTER" />
        : <Innhold p={p} />}
    </Stabel>
  </div>;
}
