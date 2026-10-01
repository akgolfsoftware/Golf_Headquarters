"use client";

/**
 * AG-16a Gruppedetalj (medlemmer) og faste tider i Precision Athletics.
 * Tegning: Claude Design 7d7c2994, ui_kits/agencyos/screens/AG-mer.jsx (AG-16:
 * medlemmer, «Legg til spillere»-ark) og AG-16a.jsx (timeplan, tegnet 30.09).
 *
 * Datakontrakt og server actions er de samme som før (GruppeDetaljV2Data,
 * GruppeTimeplanV2Data, leggTilGruppemedlem, inviterSpillereTilGruppe,
 * fjernGruppemedlem, deleteGroup, opprettGruppeTrening, dupliserGruppeTime,
 * coachApplyTemplateToGroup). Bare uttrykket er nytt.
 *
 * Bare ekte data: det gruppen ikke har (HCP, plan, sted) vises som «—».
 */
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Copy, Layers, Mail, Plus, Trash2, UserMinus, UserPlus, CalendarDays } from "lucide-react";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Knapp, KnappLenke, Meta, StatusPille, TomTilstand } from "@/components/precision/pa";
import { Sokefelt, SegmentertValg, IkonKnapp } from "@/components/precision/pa-a2";
import { Ark, Dialogboks, Skjemafelt, Tekstfelt, TekstOmrade, Side, SideHode } from "@/components/precision/pa-a4";
import type { GruppeDetaljV2Data, MedlemRad } from "@/components/admin/v2/GruppeDetaljV2";
import type { GruppeTimeplanV2Data, TimeplanRad } from "@/components/admin/v2/GruppeTimeplanV2";
import { fjernGruppemedlem, inviterSpillereTilGruppe, leggTilGruppemedlem, opprettGruppeTrening, dupliserGruppeTime } from "@/app/admin/grupper/[id]/actions";
import { deleteGroup } from "@/app/admin/grupper/actions";
import { coachApplyTemplateToGroup } from "@/lib/workbench/apply-template-actions";
import { formaterTall } from "@/lib/format-tall";
import { osloLokalTilDato, datoTilOsloLokal } from "@/lib/admin/gruppe-tid";
import type { GruppemedlemRolle } from "@/lib/domain/grupper";
import "@/styles/precision-a4.css";
import "@/styles/precision-a5.css";
import "@/styles/precision-a16.css";

export type RullUtMal = { id: string; name: string; varighetUker: number; sessionCount: number };

/* ---------- Felles ---------- */

type FaneId = "medlemmer" | "workbench" | "arsplan" | "timeplan" | "skoledata";
function GruppeFaner({ groupId, aktiv }: { groupId: string; aktiv: FaneId }) {
  const b = `/admin/grupper/${groupId}`;
  const faner: ReadonlyArray<{ href: string; navn: string; id: FaneId }> = [
    { href: b, navn: "Medlemmer", id: "medlemmer" },
    { href: `${b}/workbench`, navn: "Workbench", id: "workbench" },
    { href: `${b}/arsplan`, navn: "Årsplan", id: "arsplan" },
    { href: `${b}/timeplan`, navn: "Timeplan", id: "timeplan" },
    { href: `${b}/arsplan/skoledata`, navn: "Skoledata", id: "skoledata" },
  ];
  return <nav aria-label="Gruppe" className="ag16-faner">
    {faner.map((f) => <Link key={f.id} href={f.href} className="pa-choice ag16-pille" aria-pressed={f.id === aktiv} aria-current={f.id === aktiv ? "page" : undefined}>{f.navn}</Link>)}
  </nav>;
}

function TilbakeTilGrupper() {
  return <div><KnappLenke variant="ghost" size="sm" icon={ArrowLeft} iconName="arrow-left" href="/admin/grupper">Grupper</KnappLenke></div>;
}

function Seksjon({ k, meta, children }: { k: string; meta?: string; children: ReactNode }) {
  return <section aria-label={k} className="pa-card" style={{ padding: 16, gap: 8, minWidth: 0 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
      <span className="kicker" style={{ flex: "1 1 auto", minWidth: 0 }}>{k}</span>
      {meta && <Meta>{meta}</Meta>}
    </div>
    {children}
  </section>;
}

const Dempet = ({ children }: { children: ReactNode }) => <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{children}</p>;

const DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "short", day: "numeric", month: "short" });
const KLOKKE = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" });
const UKEDAG = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "long" });
const dato = (iso: string) => DATO.format(new Date(iso));
const klokke = (iso: string) => KLOKKE.format(new Date(iso));

function fmtHcp(h: number | null): string {
  if (h == null) return "—";
  return h >= 0 ? formaterTall(h, 1, true) : `+${formaterTall(Math.abs(h), 1, true)}`;
}
const rolleTekst = (m: MedlemRad) => (m.erTrener ? "Coach" : m.erHjelpetrener ? "Assist Coach" : "Spiller");

/* ---------- Gruppedetalj (medlemmer) ---------- */

const ROLLER: readonly { id: GruppemedlemRolle; label: string; entall: string }[] = [
  { id: "PLAYER", label: "Spiller", entall: "spiller" },
  { id: "ASSISTANT", label: "Assist Coach", entall: "assist coach" },
  { id: "COACH", label: "Coach", entall: "coach" },
];
const ALLEREDE_MEDLEM = /allerede medlem/i;

function LeggTilArk({ data, onClose }: { data: GruppeDetaljV2Data; onClose: () => void }) {
  const router = useRouter();
  const [rolle, setRolle] = useState<GruppemedlemRolle>("PLAYER");
  const [sok, setSok] = useState("");
  const [valgt, setValgt] = useState<string | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [epost, setEpost] = useState("");
  const [invStatus, setInvStatus] = useState<string | null>(null);
  const [invFeil, setInvFeil] = useState<string[]>([]);
  const [invPending, startInv] = useTransition();

  const kandidater = rolle === "PLAYER" ? data.kandidater : data.trenerKandidater;
  const entall = ROLLER.find((r) => r.id === rolle)?.entall ?? "spiller";
  const treff = useMemo(() => {
    const q = sok.trim().toLowerCase();
    return q ? kandidater.filter((k) => k.name.toLowerCase().includes(q) || (k.homeClub ?? "").toLowerCase().includes(q)) : kandidater;
  }, [kandidater, sok]);

  const velgRolle = (r: GruppemedlemRolle) => { setRolle(r); setValgt(null); setFeil(null); };
  const lagre = () => {
    if (!valgt) { setFeil(`Velg en ${entall}.`); return; }
    setFeil(null);
    start(async () => {
      const res = await leggTilGruppemedlem(data.id, valgt, rolle);
      if (!res.ok) { setFeil(res.feil); return; }
      router.refresh();
      onClose();
    });
  };
  const inviter = () => {
    const eposter = epost.split(/[\s,;]+/).map((e) => e.trim()).filter(Boolean);
    if (eposter.length === 0) { setInvStatus(null); setInvFeil(["Oppgi minst én e-postadresse."]); return; }
    setInvStatus(null);
    setInvFeil([]);
    startInv(async () => {
      let res: Awaited<ReturnType<typeof inviterSpillereTilGruppe>>;
      try { res = await inviterSpillereTilGruppe(data.id, eposter); }
      catch { setInvFeil(["Kunne ikke nå serveren. Sjekk nettforbindelsen og prøv igjen."]); return; }
      if (!res.ok) { setInvFeil([res.feil]); return; }
      const deler: string[] = [];
      if (res.invitert.length > 0) deler.push(`${res.invitert.length} ${res.invitert.length === 1 ? "invitasjon" : "invitasjoner"} sendt`);
      if (res.opprettet.length > 0) deler.push(`${res.opprettet.length} ${res.opprettet.length === 1 ? "ny testprofil" : "nye testprofiler"} opprettet`);
      if (res.lagtTil.length > 0) deler.push(`${res.lagtTil.length} lagt til direkte`);
      setInvStatus(deler.length > 0 ? deler.join(" · ") : null);
      setInvFeil(res.feilet.map((f) => `${f.epost}: ${f.feil}`));
      const retrybare = res.feilet.filter((f) => !ALLEREDE_MEDLEM.test(f.feil));
      setEpost(retrybare.length === 0 ? "" : retrybare.map((f) => f.epost).join(", "));
      router.refresh();
    });
  };

  return <Ark open onClose={onClose} kicker="Grupper · søk i PlayerHQ" title="Legg til spillere"
    footer={<>
      <Knapp fullWidth icon={UserPlus} iconName="user-plus" disabled={pending || !valgt} loading={pending} loadingText="Legger til …" onClick={lagre}>Lagre</Knapp>
      <Knapp variant="ghost" fullWidth disabled={pending} onClick={onClose}>Avbryt</Knapp>
    </>}>
    <SegmentertValg label="Rolle i gruppen" value={rolle} options={ROLLER} onChange={velgRolle} />
    <Sokefelt label="Søk kandidater" value={sok} onChange={setSok} placeholder="Navn eller klubb" />
    {kandidater.length === 0 ? <Dempet>{rolle === "PLAYER" ? "Alle spillere er allerede medlem av gruppen." : "Alle coacher er allerede medlem av gruppen."}</Dempet>
      : treff.length === 0 ? <Dempet>Ingen kandidater passer søket.</Dempet>
      : <div role="radiogroup" aria-label="Kandidater" style={{ maxHeight: 320, overflowY: "auto" }}>
        {treff.map((k, i) => <button key={k.id} type="button" role="radio" aria-checked={valgt === k.id} onClick={() => setValgt(k.id)}
          style={{ all: "unset", boxSizing: "border-box", cursor: "pointer", width: "100%", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 52, borderTop: i ? "1px solid var(--border-hairline)" : "none" }}>
          <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
            <span style={{ font: `${valgt === k.id ? 600 : 500} 14px/1.3 var(--font-sans)`, color: "var(--text-primary)", overflowWrap: "anywhere" }}>{k.name}</span>
            <Meta>{`${k.homeClub ?? "Uten klubb"} · HCP ${fmtHcp(k.hcp)}`.toUpperCase()}</Meta>
          </span>
          {valgt === k.id && <StatusPille tone="ok">Valgt</StatusPille>}
        </button>)}
      </div>}
    {feil && <p role="alert" className="a4-feil">{feil}</p>}
    <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border-hairline)" }}>
      <Skjemafelt label="Eller inviter på e-post" hint="Nye e-poster får en gratis testprofil (testbatteri, stats og SG-registrering) og invitasjon på e-post.">
        <TekstOmrade value={epost} onChange={setEpost} placeholder="navn@klubb.no, navn2@klubb.no …" />
      </Skjemafelt>
      {invStatus && <Dempet>{invStatus}</Dempet>}
      {invFeil.length > 0 && <div role="alert" className="a4-feil">{invFeil.map((f) => <div key={f}>{f}</div>)}</div>}
      <div><Knapp variant="secondary" size="sm" icon={Mail} iconName="mail" disabled={invPending || epost.trim() === ""} loading={invPending} loadingText="Inviterer …" onClick={inviter}>Send invitasjon</Knapp></div>
    </div>
  </Ark>;
}

function RullUtArk({ data, maler, onClose }: { data: GruppeDetaljV2Data; maler: RullUtMal[]; onClose: () => void }) {
  const router = useRouter();
  const [malId, setMalId] = useState(maler[0]?.id ?? "");
  const [uker, setUker] = useState(maler[0]?.varighetUker ?? 4);
  const [startUke, setStartUke] = useState<"0" | "1">("1");
  const [kjorer, setKjorer] = useState(false);
  const [resultat, setResultat] = useState<string | null>(null);
  const [hoppet, setHoppet] = useState<string[]>([]);
  const [feil, setFeil] = useState<string | null>(null);
  const valgt = maler.find((m) => m.id === malId) ?? null;

  const kjor = async () => {
    if (!valgt || kjorer) return;
    setKjorer(true); setFeil(null); setResultat(null);
    const res = await coachApplyTemplateToGroup(data.id, valgt.id, { startWeekOffset: Number(startUke), uker });
    setKjorer(false);
    if (res.ok) {
      setResultat(`${res.okterOpprettet ?? 0} økter lagt inn for ${res.spillere ?? 0} spillere.`);
      setHoppet((res.hoppet ?? []).map((h) => h.grunn === "FEIL" ? `${h.navn} (uke +${h.uke} · feil)` : `${h.navn} (uke +${h.uke}${h.okt ? ` · ${h.okt}` : ""} · kolliderte)`));
      router.refresh();
    } else setFeil(res.error ?? "Utrullingen feilet.");
  };

  return <Ark open onClose={onClose} kicker={`Grupper · ${data.navn}`} title="Rull ut planmal til gruppa"
    footer={<>
      <Knapp fullWidth icon={Layers} iconName="layers" disabled={!valgt} loading={kjorer} loadingText="Ruller ut …" onClick={kjor}>{`Rull ut til ${data.antallMedlemmer} ${data.antallMedlemmer === 1 ? "spiller" : "spillere"}`}</Knapp>
      <Knapp variant="ghost" fullWidth onClick={onClose}>Lukk</Knapp>
    </>}>
    <Skjemafelt label="Planmal">
      <select className="a4-input" value={malId} disabled={kjorer} onChange={(e) => { setMalId(e.target.value); const m = maler.find((x) => x.id === e.target.value); if (m) setUker(m.varighetUker); }}>
        {maler.map((m) => <option key={m.id} value={m.id}>{`${m.name} · ${m.varighetUker} uker · ${m.sessionCount} økter`}</option>)}
      </select>
    </Skjemafelt>
    <Skjemafelt label="Antall uker" hint={valgt ? `Malen varer ${valgt.varighetUker} uker.` : undefined}>
      <input className="a4-input a4-input--mono" type="number" inputMode="numeric" min={1} max={valgt?.varighetUker ?? 8} value={uker} disabled={kjorer}
        onChange={(e) => setUker(Math.max(1, Math.min(valgt?.varighetUker ?? 8, Number(e.target.value) || 1)))} />
    </Skjemafelt>
    <SegmentertValg label="Start" value={startUke} options={[{ id: "0", label: "Denne uka" }, { id: "1", label: "Neste uke" }]} onChange={setStartUke} />
    <Meta>ØKTER SOM KOLLIDERER MED NOE SPILLEREN ALLEREDE HAR HOPPES OVER. INGENTING OVERSKRIVES.</Meta>
    {feil && <p role="alert" className="a4-feil">{feil}</p>}
    {resultat && <div role="status"><Dempet>{resultat}</Dempet>{hoppet.length > 0 && <Meta>{`HOPPET OVER: ${hoppet.join(" · ")}`.toUpperCase()}</Meta>}</div>}
  </Ark>;
}

export type AG16Tilstand = "data" | "tom";
export type AG16DetaljProps = {
  navn: string; data: GruppeDetaljV2Data; maler: RullUtMal[];
  /** Antall gjentakende (faste) tider i gruppas timeplan. */
  antallFaste: number;
  /** Bare eier (hovedcoach eller aktivt COACH-medlem) og ADMIN kan slette gruppen; deleteGroup håndhever det på serveren. */
  kanSlette: boolean;
};

const Rad = ({ a, sub, b, i }: { a: string; sub?: string | null; b?: ReactNode; i: number }) =>
  <div role="listitem" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 52, borderTop: i ? "1px solid var(--border-hairline)" : "none", padding: "6px 0", minWidth: 0 }}>
    <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{a}</span>
      {sub && <Meta>{sub}</Meta>}
    </span>
    {b != null && <span style={{ font: "600 13px/1.3 var(--font-mono)", color: "var(--text-primary)", textAlign: "right", display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" }}>{b}</span>}
  </div>;

export function AG16Gruppedetalj({ navn, data, maler, antallFaste, kanSlette }: AG16DetaljProps) {
  const router = useRouter();
  const [leggTil, setLeggTil] = useState(false);
  const [rullUt, setRullUt] = useState(false);
  const [slett, setSlett] = useState(false);
  const [fjern, setFjern] = useState<MedlemRad | null>(null);
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const bekreftFjern = () => {
    if (!fjern) return;
    const m = fjern;
    start(async () => {
      const res = await fjernGruppemedlem(data.id, m.userId);
      if (!res.ok) setFeil(res.feil); else setFeil(null);
      setFjern(null);
      router.refresh();
    });
  };
  const bekreftSlett = () => start(async () => {
    const res = await deleteGroup(data.id);
    if ("error" in res) { setFeil(res.error); setSlett(false); return; }
    router.push("/admin/grupper");
  });

  const antall = data.medlemmer.length;
  const medlemmer = <Seksjon k={`Medlemmer · ${data.navn}`} meta={`${antall} ${antall === 1 ? "SPILLER" : "SPILLERE"} · ${(data.coachNavn ?? "Ingen coach").toUpperCase()}`}>
    {data.trinnValg.length > 0 && <div role="group" aria-label="Trinn" className="ag16-faner">
      {["", ...data.trinnValg].map((t) => <Link key={t || "alle"} href={t ? `?trinn=${encodeURIComponent(t)}` : "?"} scroll={false} className="pa-choice ag16-pille" aria-pressed={(data.aktivtTrinn ?? "") === t}>{t || "Alle"}</Link>)}
    </div>}
    {antall === 0
      ? <Dempet>Ingen medlemmer ennå. Søk opp spillere med PlayerHQ og hak av gruppa.</Dempet>
      : <div role="list" className="ag16-medlemsliste">
        {data.medlemmer.map((m) => <div key={m.id} role="listitem" className="ag16-medlem">
          <Link href={`/admin/spillere/${m.userId}`} className="ag16-medlem__navn">
            {m.navn}
            {(m.erTrener || m.erHjelpetrener) && <Meta>{rolleTekst(m).toUpperCase()}</Meta>}
          </Link>
          <IkonKnapp icon={UserMinus} name="user-minus" aria-label={`Fjern ${m.navn} fra gruppen`} onClick={() => setFjern(m)} />
        </div>)}
      </div>}
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Knapp size="sm" icon={UserPlus} iconName="user-plus" onClick={() => setLeggTil(true)}>Legg til spillere</Knapp>
      {maler.length > 0 && <Knapp size="sm" variant="secondary" icon={Layers} iconName="layers" disabled={data.antallMedlemmer === 0} onClick={() => setRullUt(true)}>Rull ut planmal</Knapp>}
    </div>
  </Seksjon>;

  const plan = <Seksjon k="Timeplan og skoledata" meta="GRUPPEPLAN I WORKBENCH">
    <div role="list">
      <Rad i={0} a="Faste tider" b={antallFaste > 0 ? `${antallFaste} ukentlig` : "—"} />
      <Rad i={1} a="Skoledata" b="—" />
    </div>
    <div><KnappLenke variant="secondary" size="sm" iconRight={ArrowRight} href={`/admin/grupper/${data.id}/workbench`}>Åpne gruppeplanen i Workbench</KnappLenke></div>
  </Seksjon>;

  return <AgencyOSSkall navn={navn}>
    <Side>
      <TilbakeTilGrupper />
      <SideHode kicker="Mer · Grupper" title={data.navn} />
      <GruppeFaner groupId={data.id} aktiv="medlemmer" />
      {feil && <p role="alert" className="a4-feil">{feil}</p>}
      <div className="ag16-kolonner">
        <div className="pa-a5-stack">{medlemmer}</div>
        <div className="pa-a5-stack">
          {plan}
          {kanSlette && <div><Knapp variant="ghost" size="sm" icon={Trash2} iconName="trash-2" onClick={() => setSlett(true)}>Slett gruppe</Knapp></div>}
        </div>
      </div>
    </Side>

    {leggTil && <LeggTilArk data={data} onClose={() => setLeggTil(false)} />}
    {rullUt && <RullUtArk data={data} maler={maler} onClose={() => setRullUt(false)} />}
    <Dialogboks open={!!fjern} onClose={() => setFjern(null)} title={fjern ? `Fjerne ${fjern.navn} fra gruppen?` : ""}
      footer={<><Knapp variant="ghost" onClick={() => setFjern(null)}>Behold</Knapp><Knapp variant="signal" loading={pending} loadingText="Fjerner …" onClick={bekreftFjern}>Fjern fra gruppen</Knapp></>}>
      <Dempet>Spilleren mister tilgang til gruppens plan og samlinger. Selve spillerprofilen slettes ikke.</Dempet>
    </Dialogboks>
    <Dialogboks open={slett} onClose={() => setSlett(false)} title={`Slette «${data.navn}»?`}
      footer={<><Knapp variant="ghost" onClick={() => setSlett(false)}>Behold</Knapp><Knapp variant="signal" loading={pending} loadingText="Sletter …" onClick={bekreftSlett}>Slett gruppen</Knapp></>}>
      <Dempet>{data.antallMedlemmer > 0 || data.antallSamlinger > 0 ? `Gruppen har ${data.antallMedlemmer} medlemmer og ${data.antallSamlinger} planlagte samlinger. Alt fjernes samtidig. ` : ""}Dette kan ikke angres.</Dempet>
    </Dialogboks>
  </AgencyOSSkall>;
}

/* ---------- Timeplan og faste tider ---------- */

function varighet(startIso: string, endIso: string): string {
  const min = Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000);
  if (min <= 0) return "—";
  const t = Math.floor(min / 60);
  const m = min % 60;
  return t === 0 ? `${m} min` : m === 0 ? `${t} t` : `${t} t ${m} min`;
}
const storForbokstav = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const KORT_UKEDAG = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "short" });
const DAG_MND = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit" });
/** «LØR 03.10» som i tegningen (ukedag kort, dag og måned med to sifre). */
const kortDato = (iso: string) => {
  const d = new Date(iso);
  const del = (t: "day" | "month") => DAG_MND.formatToParts(d).find((p) => p.type === t)?.value.padStart(2, "0") ?? "—";
  return `${KORT_UKEDAG.format(d).replace(".", "")} ${del("day")}.${del("month")}`;
};

function TimeplanSeksjon({ k, meta, rader, fast, focusId, onDupliser }: { k: string; meta: string; rader: TimeplanRad[]; fast?: boolean; focusId: string | null; onDupliser: (r: TimeplanRad) => void }) {
  return <Seksjon k={k} meta={meta}>
    <div role="list">
      {rader.map((s, i) => <div key={s.id} id={`s-${s.id}`} role="listitem" data-fokus={s.id === focusId || undefined}
        style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 52, borderTop: i ? "1px solid var(--border-hairline)" : "none", padding: "6px 0", minWidth: 0, boxShadow: s.id === focusId ? "inset 3px 0 0 var(--text-primary)" : "none", paddingLeft: s.id === focusId ? 12 : 0 }}>
        <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{s.title}</span>
          <Meta>{`${fast ? storForbokstav(UKEDAG.format(new Date(s.startAt))) : kortDato(s.startAt)} · ${klokke(s.startAt).replace(":", ".")}–${klokke(s.endAt).replace(":", ".")} · ${varighet(s.startAt, s.endAt)}${s.location ? ` · ${s.location}` : ""}${fast && s.maxParticipants != null ? ` · maks ${s.maxParticipants}` : ""}`.toUpperCase()}</Meta>
          {s.description && <Dempet>{s.description}</Dempet>}
        </span>
        <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {fast && s.recurring && <StatusPille>{s.recurring === "WEEKLY" ? "Ukentlig" : s.recurring}</StatusPille>}
          <Knapp size="sm" variant="ghost" icon={Copy} iconName="copy" onClick={() => onDupliser(s)}>Dupliser</Knapp>
        </span>
      </div>)}
    </div>
  </Seksjon>;
}

function NyTreningArk({ groupId, navn, onClose }: { groupId: string; navn: string; onClose: () => void }) {
  const router = useRouter();
  const [tittel, setTittel] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [dag, setDag] = useState("");
  const [tid, setTid] = useState("");
  const [min, setMin] = useState("60");
  const [sted, setSted] = useState("");
  const [gjenta, setGjenta] = useState<"NONE" | "WEEKLY">("NONE");
  const [maks, setMaks] = useState("");
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const opprett = () => {
    const startAt = osloLokalTilDato(dag, tid);
    const varighetMin = parseInt(min, 10);
    if (!tittel.trim()) { setFeil("Tittel mangler."); return; }
    if (!startAt) { setFeil("Velg dato og klokkeslett."); return; }
    if (!Number.isFinite(varighetMin) || varighetMin <= 0) { setFeil("Varighet må være over 0 minutter."); return; }
    setFeil(null);
    start(async () => {
      const res = await opprettGruppeTrening(groupId, {
        title: tittel.trim(),
        description: beskrivelse.trim() || undefined,
        startAt,
        endAt: new Date(startAt.getTime() + varighetMin * 60000),
        location: sted.trim() || undefined,
        recurring: gjenta,
        maxParticipants: maks ? parseInt(maks, 10) || undefined : undefined,
      });
      if (!res.ok) { setFeil(res.feil); return; }
      router.refresh();
      onClose();
    });
  };

  return <Ark open onClose={onClose} kicker={`Timeplan · ${navn}`} title="Ny gruppetrening"
    footer={<>
      <Knapp fullWidth icon={Plus} iconName="plus" loading={pending} loadingText="Oppretter …" onClick={opprett}>Opprett</Knapp>
      <Knapp variant="ghost" fullWidth disabled={pending} onClick={onClose}>Avbryt</Knapp>
    </>}>
    <Skjemafelt label="Tittel" required><Tekstfelt value={tittel} onChange={setTittel} placeholder="Gruppetrening" /></Skjemafelt>
    <Skjemafelt label="Beskrivelse"><Tekstfelt value={beskrivelse} onChange={setBeskrivelse} /></Skjemafelt>
    <Skjemafelt label="Dato" required><input className="a4-input" type="date" value={dag} onChange={(e) => setDag(e.target.value)} /></Skjemafelt>
    <Skjemafelt label="Starter (Oslo-tid)" required><input className="a4-input" type="time" value={tid} onChange={(e) => setTid(e.target.value)} /></Skjemafelt>
    <Skjemafelt label="Varighet (min)"><Tekstfelt mono inputMode="numeric" value={min} onChange={setMin} /></Skjemafelt>
    <Skjemafelt label="Sted"><Tekstfelt value={sted} onChange={setSted} /></Skjemafelt>
    <SegmentertValg label="Gjentakelse" value={gjenta} options={[{ id: "NONE", label: "Engang" }, { id: "WEEKLY", label: "Ukentlig" }]} onChange={setGjenta} />
    <Skjemafelt label="Maks deltagere" hint="La stå tomt for ingen grense."><Tekstfelt mono inputMode="numeric" value={maks} onChange={setMaks} /></Skjemafelt>
    {feil && <p role="alert" className="a4-feil">{feil}</p>}
  </Ark>;
}

function DupliserArk({ groupId, rad, onClose }: { groupId: string; rad: TimeplanRad; onClose: () => void }) {
  const router = useRouter();
  const [ny, setNy] = useState(() => datoTilOsloLokal(new Date(new Date(rad.startAt).getTime() + 7 * 24 * 60 * 60 * 1000)));
  const [feil, setFeil] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const dupliser = () => {
    const startAt = osloLokalTilDato(ny);
    if (!startAt) { setFeil("Velg ny dato og klokkeslett."); return; }
    setFeil(null);
    start(async () => {
      const res = await dupliserGruppeTime(groupId, rad.id, startAt);
      if (!res.ok) { setFeil(res.feil); return; }
      router.refresh();
      onClose();
    });
  };
  return <Ark open onClose={onClose} kicker={`${dato(rad.startAt)} · ${klokke(rad.startAt)}`.toUpperCase()} title={`Dupliser ${rad.title}`}
    footer={<>
      <Knapp fullWidth icon={Copy} iconName="copy" loading={pending} loadingText="Dupliserer …" onClick={dupliser}>Dupliser</Knapp>
      <Knapp variant="ghost" fullWidth disabled={pending} onClick={onClose}>Avbryt</Knapp>
    </>}>
    <Skjemafelt label="Ny start (Oslo-tid)" hint="Varighet, sted og antall deltagere kopieres."><input className="a4-input" type="datetime-local" value={ny} onChange={(e) => setNy(e.target.value)} /></Skjemafelt>
    {feil && <p role="alert" className="a4-feil">{feil}</p>}
  </Ark>;
}

export type AG16TimeplanProps = { navn: string; data: GruppeTimeplanV2Data };

export function AG16Timeplan({ navn, data }: AG16TimeplanProps) {
  const [ny, setNy] = useState(false);
  const [dup, setDup] = useState<TimeplanRad | null>(null);
  const fokusRef = useRef(false);
  useEffect(() => {
    if (fokusRef.current || !data.focusId) return;
    fokusRef.current = true;
    document.getElementById(`s-${data.focusId}`)?.scrollIntoView({ block: "center" });
  }, [data.focusId]);

  return <AgencyOSSkall navn={navn}>
    <Side>
      <TilbakeTilGrupper />
      <SideHode kicker="Mer · Grupper · Timeplan" title={data.navn}
        actions={<Knapp icon={Plus} iconName="plus" onClick={() => setNy(true)}>Ny gruppetrening</Knapp>} />
      <GruppeFaner groupId={data.groupId} aktiv="timeplan" />
      <div className="ag16-kolonner">
        <div className="pa-a5-stack">
          {data.faste.length > 0
            ? <TimeplanSeksjon k="Faste tider" meta={`${data.faste.length} UKENTLIG`} rader={data.faste} fast focusId={data.focusId} onDupliser={setDup} />
            : <Seksjon k="Faste tider" meta="INGEN"><TomTilstand icon={CalendarDays} title="Ingen faste tider" text="Legg inn første gruppetrening. Ukentlige tider vises her." actions={<Knapp variant="secondary" icon={Plus} iconName="plus" onClick={() => setNy(true)}>Ny gruppetrening</Knapp>} /></Seksjon>}
          {data.kommende.length > 0
            ? <TimeplanSeksjon k="Kommende samlinger" meta={`${data.kommende.length} PLANLAGT`} rader={data.kommende} focusId={data.focusId} onDupliser={setDup} />
            : <Seksjon k="Kommende samlinger" meta="INGEN"><Dempet>Ingen enkeltsamlinger planlagt.</Dempet></Seksjon>}
        </div>
        <div className="pa-a5-stack">
          {data.tidligere.length > 0
            ? <TimeplanSeksjon k="Tidligere" meta={`${data.tidligere.length} GJENNOMFØRT`} rader={data.tidligere} focusId={data.focusId} onDupliser={setDup} />
            : <Seksjon k="Tidligere" meta="INGEN"><Dempet>Ingen tidligere samlinger.</Dempet></Seksjon>}
        </div>
      </div>
    </Side>
    {ny && <NyTreningArk groupId={data.groupId} navn={data.navn} onClose={() => setNy(false)} />}
    {dup && <DupliserArk groupId={data.groupId} rad={dup} onClose={() => setDup(null)} />}
  </AgencyOSSkall>;
}
