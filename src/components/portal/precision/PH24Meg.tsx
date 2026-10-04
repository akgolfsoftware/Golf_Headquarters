/**
 * PH-24 Meg — Precision Athletics (Claude Design 7d7c2994,
 * ui_kits/playerhq/screens/PH-24.jsx, etag 1790579224067585, runde 23).
 *
 * Tolv seksjoner i tegningens rekkefølge: profil · fasiliteter · bookinger ·
 * abonnement · foreldre · deling · helse og fravær · utstyr · min coach ·
 * venner og utfordringer · hjelp · innstillinger.
 *
 * Bevisste avvik fra tegningen:
 *   - Tegningens ark (rediger fasilitet, inviter forelder, registrer fravær) er
 *     lenker til eksisterende flater, som fortsatt eier skjemaene og handlingene.
 *   - «Min coach» viser coach, program og startdato. Videoer og tilbakemeldinger
 *     finnes ikke som egen datakilde her: de nås via Innboks og Plan.
 *   - «Deling» viser ikke navn på trenere: dagens samtykkemodell har ikke en
 *     samlet liste, så seksjonen lenker til delingssiden.
 *   - Kategori (A–K) og KPI-tall som ikke er målt vises som «—», aldri gjettet.
 *   - Talentradar vises aldri her.
 */
import type { ReactNode } from "react";
import { ArrowRight, CalendarPlus, CircleAlert, Eye, Lock, Pencil, Plus, Settings, Trophy, UserPlus, ExternalLink, LifeBuoy } from "lucide-react";
import { Meta, Tall, StatusPille, KnappLenke, FeilTilstand, Ikon } from "@/components/precision/pa";
import { Side, SideHode, Nokkelverdi } from "@/components/precision/pa-a4";
import "@/styles/precision-a24.css";

type Tone = "neutral" | "ok" | "warn" | "signal" | "live";
export type PH24Rad = { id: string; tittel: string; status?: { tekst: string; tone: Tone } | null; meta?: string | null };

export type PH24Props = {
  tilstand: "data" | "feil";
  ukjentKode?: string;
  profil: { navn: string; alder: number | null; klubb: string | null; fodt: string | null; hcp: string | null; golfId: string | null; epost: string | null; telefon: string | null };
  fasiliteter: { id: string; navn: string }[];
  bookinger: PH24Rad[];
  klipp: { igjen: number; totalt: number; fornyes: string | null } | null;
  abo: { plan: string; fornyes: string | null; pris: string | null };
  foreldre: PH24Rad[];
  helse: { samtykke: boolean; sovnSnitt: string | null; skadeNa: boolean; fravaer: PH24Rad[] };
  utstyr: { kode: string; spec: string; carry: string | null }[];
  utstyrMalt: string | null;
  coach: { navn: string; program: string; siden: string } | null;
  venner: number;
  utfordringer: PH24Rad[];
  hrefs: { profil: string; fasiliteter: string; book: string; bookinger: string; abo: string; foreldre: string; deling: string; fravaer: string; helse: string; utstyr: string; utfordringer: string; venner: string; hjelp: string; innstillinger: string; mal: string; personvern: string };
};

function Sek({ n, k, meta, children }: { n: number; k: string; meta?: ReactNode; children: ReactNode }) {
  return <section aria-label={k} className="pa-card" style={{ padding: 16, gap: 12, minWidth: 0, display: "flex", flexDirection: "column" }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
      <span style={{ font: "600 11px/1 var(--font-mono)", color: "var(--text-muted)" }}>{String(n).padStart(2, "0")}</span>
      <span className="kicker" style={{ flex: "1 1 auto" }}>{k}</span>
      {meta != null && <Meta>{meta}</Meta>}
    </div>
    {children}
  </section>;
}
const Dempet = ({ children }: { children: ReactNode }) => <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>{children}</p>;
const Knapper = ({ children }: { children: ReactNode }) => <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{children}</div>;
function Rader({ rader }: { rader: PH24Rad[] }) {
  return <div role="list">{rader.map((r) => <div role="listitem" key={r.id} className="ph24-rad">
    <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <span style={{ font: "500 14px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{r.tittel}</span>
      {r.meta && <Meta>{r.meta}</Meta>}
    </span>
    {r.status && <StatusPille tone={r.status.tone}>{r.status.tekst}</StatusPille>}
  </div>)}</div>;
}

export function PH24Meg(p: PH24Props) {
  const h = p.hrefs;
  const innhold = (() => {
    const s: ReactNode[] = [
      <Sek key="p" n={1} k="Profil">
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <span style={{ font: "600 17px/1.3 var(--font-sans)", color: "var(--text-primary)", overflowWrap: "anywhere" }}>{p.profil.navn}</span>
          <Meta>{[p.profil.alder != null ? `${p.profil.alder} ÅR` : null, p.profil.klubb?.toUpperCase() ?? null].filter(Boolean).join(" · ") || "—"}</Meta>
        </div>
        <Nokkelverdi items={[["Født", p.profil.fodt, { mono: true }], ["HCP", p.profil.hcp, { mono: true }], ["Hjemmeklubb", p.profil.klubb], ["Golf-ID", p.profil.golfId, { mono: true }], ["E-post", p.profil.epost], ["Telefon", p.profil.telefon, { mono: true }]]} />
        <Knapper><KnappLenke href={h.profil} variant="secondary" size="sm" icon={Pencil} iconName="pencil">Rediger profil</KnappLenke><KnappLenke href={h.mal} variant="ghost" size="sm" iconRight={ArrowRight}>Målsetninger</KnappLenke></Knapper>
      </Sek>,
      <Sek key="f" n={2} k="Fasiliteter" meta={p.fasiliteter.length ? `${p.fasiliteter.length} STEDER` : "INGEN"}>
        {p.fasiliteter.length ? <Rader rader={p.fasiliteter.map((f) => ({ id: f.id, tittel: f.navn }))} /> : <Dempet>Legg inn stedene du trener. Da vet planen hva du kan trene hvor.</Dempet>}
        <div><KnappLenke href={h.fasiliteter} variant="secondary" size="sm" icon={Plus} iconName="plus">{p.fasiliteter.length ? "Endre fasiliteter" : "Legg til fasilitet"}</KnappLenke></div>
      </Sek>,
      <Sek key="b" n={3} k="Bookinger" meta={p.klipp ? `${p.klipp.igjen} AV ${p.klipp.totalt} KLIPP${p.klipp.fornyes ? ` · FORNYES ${p.klipp.fornyes}` : ""}` : "—"}>
        {p.bookinger.length ? <Rader rader={p.bookinger} /> : <Dempet>Ingen kommende bookinger.</Dempet>}
        <Knapper><KnappLenke href={h.book} variant="secondary" size="sm" icon={CalendarPlus} iconName="calendar-plus">Book time</KnappLenke><KnappLenke href={h.bookinger} variant="ghost" size="sm" iconRight={ArrowRight}>Alle bookinger</KnappLenke></Knapper>
      </Sek>,
      <Sek key="a" n={4} k="Abonnement og betalingskort" meta={p.abo.fornyes ? `FORNYES ${p.abo.fornyes}` : undefined}>
        <Nokkelverdi items={[["Abonnement", p.abo.plan + (p.abo.pris ? ` · ${p.abo.pris}` : "")], ["Betalingskort", "Hos Stripe"]]} />
        <Knapper><KnappLenke href={h.abo} variant="secondary" size="sm" icon={ExternalLink} iconName="external-link">Bytt kort og se kvitteringer</KnappLenke></Knapper>
      </Sek>,
      <Sek key="fo" n={5} k="Foreldre" meta={p.foreldre.length ? `${p.foreldre.length} FORELDRE` : "INGEN"}>
        {p.foreldre.length ? <Rader rader={p.foreldre} /> : <Dempet>Ingen foreldre er koblet til.</Dempet>}
        <Knapper><KnappLenke href={h.foreldre} variant="secondary" size="sm" icon={UserPlus} iconName="user-plus">Inviter forelder</KnappLenke><KnappLenke href={h.foreldre} variant="ghost" size="sm" icon={Eye} iconName="eye">Se tilgang</KnappLenke></Knapper>
      </Sek>,
      <Sek key="d" n={6} k="Deling">
        <Dempet>Styr hvilke trenere og grupper som ser hva. Trenere med tilgang ser også helse og meldinger.</Dempet>
        <div><KnappLenke href={h.deling} variant="secondary" size="sm" iconRight={ArrowRight}>Åpne deling</KnappLenke></div>
      </Sek>,
      <Sek key="h" n={7} k="Helse og fravær" meta={<span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Ikon icon={Lock} size={12} name="lock" />FORELDRE SER IKKE DETTE</span>}>
        {p.helse.samtykke ? <>
          <Nokkelverdi items={[["Skader nå", p.helse.skadeNa ? "Ja" : "Ingen"], ["Søvn snitt", p.helse.sovnSnitt, { mono: true }]]} />
          {p.helse.fravaer.length ? <Rader rader={p.helse.fravaer} /> : <Dempet>Ingen fravær registrert.</Dempet>}
        </> : <Dempet>Helse-loggen er avslått. Søvn, puls og skader er sensitive opplysninger, så vi lagrer dem ikke før du sier ja. Treningen går som før.</Dempet>}
        <Knapper>
          {p.helse.samtykke
            ? <KnappLenke href={h.fravaer} variant="secondary" size="sm" icon={Plus} iconName="plus">Registrer fravær</KnappLenke>
            : <KnappLenke href={h.personvern} variant="secondary" size="sm" iconRight={ArrowRight}>Slå på helse-loggen</KnappLenke>}
          <KnappLenke href={h.helse} variant="ghost" size="sm" iconRight={ArrowRight}>Åpne helse</KnappLenke>
        </Knapper>
        <Meta>FRAVÆR MARKERES SOM OPPTATT I PLAN · COACHENE MED TILGANG SER DET</Meta>
      </Sek>,
      <Sek key="u" n={8} k="Utstyr" meta={p.utstyr.length ? (p.utstyrMalt ? `CARRY TRACKMAN ${p.utstyrMalt}` : `${p.utstyr.length} POSTER`) : "—"}>
        {p.utstyr.length ? <div role="list" className="ph24-bag">{p.utstyr.map((k) => <div role="listitem" key={k.kode} style={{ display: "grid", gridTemplateColumns: "32px minmax(0,1fr) auto", gap: 8, alignItems: "center", minHeight: 32, borderTop: "1px solid var(--border-hairline)" }}>
          <span style={{ font: "600 13px/1 var(--font-mono)", color: "var(--text-primary)" }}>{k.kode}</span>
          <span style={{ font: "400 12px/1.3 var(--font-sans)", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.spec}</span>
          {k.carry && <Tall style={{ font: "var(--type-num-s)" }}>{k.carry}</Tall>}
        </div>)}</div> : <Dempet>Bagen er ikke registrert.</Dempet>}
        <div><KnappLenke href={h.utstyr} variant="ghost" size="sm" icon={Pencil} iconName="pencil">Endre bag</KnappLenke></div>
      </Sek>,
      <Sek key="c" n={9} k="Min coach" meta={p.coach ? `SIDEN ${p.coach.siden}` : "—"}>
        {p.coach ? <Nokkelverdi items={[["Coach", p.coach.navn], ["Program", p.coach.program]]} /> : <Dempet>Ingen coach ennå. Book en privattime for å komme i gang.</Dempet>}
        <Meta>MELDINGER LIGGER I INNBOKSEN BAK BJELLA</Meta>
      </Sek>,
      <Sek key="v" n={10} k="Venner og utfordringer" meta={`${p.venner} VENNER`}>
        {p.utfordringer.length ? <Rader rader={p.utfordringer} /> : <Dempet>Ingen aktive utfordringer.</Dempet>}
        <Knapper><KnappLenke href={h.utfordringer} variant="secondary" size="sm" icon={Trophy} iconName="trophy">Utfordringer</KnappLenke><KnappLenke href={h.venner} variant="ghost" size="sm" icon={UserPlus} iconName="user-plus">Venner</KnappLenke></Knapper>
      </Sek>,
      <Sek key="hj" n={11} k="Hjelp">
        <div><KnappLenke href={h.hjelp} variant="secondary" size="sm" icon={LifeBuoy} iconName="life-buoy">Hjelp og kontakt</KnappLenke></div>
      </Sek>,
      <Sek key="i" n={12} k="Innstillinger">
        <Dempet>Varsler, samtykker, sikkerhet og sletting av konto.</Dempet>
        <div><KnappLenke href={h.innstillinger} variant="secondary" size="sm" icon={Settings} iconName="settings" iconRight={ArrowRight}>Åpne innstillinger</KnappLenke></div>
      </Sek>,
    ];
    const half = Math.ceil(s.length / 2);
    return <div className="ph24-kol"><div>{s.slice(0, half)}</div><div>{s.slice(half)}</div></div>;
  })();

  return <Side max={1280}>
    <SideHode kicker="Meg" title="Meg" />
    {p.tilstand === "feil"
      ? <FeilTilstand icon={CircleAlert} title="Profilen kunne ikke hentes" text="Ingenting er endret. Prøv igjen." code={p.ukjentKode ?? "FEIL · PROFIL"} />
      : innhold}
  </Side>;
}
