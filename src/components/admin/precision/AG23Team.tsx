"use client";

/**
 * AG-23 Team i Precision Athletics: Inviter coach (AG-mer.jsx, Inviter coach-
 * arket) og Eksterne lesere (AG-23.jsx, fane Ekstern trener — eldre tegning,
 * ingen egen fasit). Handlingene inviterCoach, opprettEksternLeser og
 * trekkEksternLeser er uendret, med samme validering og tilgangsporter.
 * Tegningens rolle-valg (Head coach / Assistant coach) er IKKE bygget: den
 * nye tilgangsregelen krever Anders sitt ja. Ekstra tilganger vises som før.
 * Team-fanen (AG23TeamOversikt): lagliste og roller fra eksisterende brukere.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, UserPlus, Users, RefreshCw, UserX } from "lucide-react";
import { Knapp, KnappLenke, LasterTilstand, FeilTilstand, TomTilstand, Meta, StatusPille } from "@/components/precision/pa";
import { Avkrysning } from "@/components/precision/pa-planhub";
import { Felt, Kort, KortHode, InlineVarsel, Tabell, Ark, type Kolonne } from "@/components/precision/pa-a5";
import { AG23Hode, TekstFeltStor } from "./AG23Hode";
import type { Capability } from "@/lib/auth/cbac";
import { inviterCoach } from "@/app/admin/(legacy)/team/actions";
import { opprettEksternLeser, trekkEksternLeser } from "@/app/admin/(legacy)/team/ekstern-leser-actions";
import { DELING_SCOPES, type DelingScope } from "@/lib/deling/samtykke-regler";
import "@/styles/precision-a5.css";

export type AG23TeamTilstand = "data" | "laster" | "feil";

export type EkstraTilgang = { id: Capability; label: string };

const Avkryssing = Avkrysning;

function Tilstander({ tilstand, tekst, children }: { tilstand: AG23TeamTilstand; tekst: string; children: React.ReactNode }) {
  if (tilstand === "laster") return <LasterTilstand text={tekst} />;
  if (tilstand === "feil") return <FeilTilstand icon={Users} title="Siden kunne ikke hentes" text="Ingenting er endret. Prøv igjen." code="TEAM · FEIL" retry={<Knapp variant="secondary" icon={RefreshCw} iconName="refresh-cw" onClick={() => window.location.reload()}>Prøv igjen</Knapp>} />;
  return <>{children}</>;
}

/* ---------- Inviter coach ---------- */
function InviterSkjema({ kanTildeleTilganger, tilganger, onFerdig, onAvbryt }: {
  kanTildeleTilganger: boolean; tilganger: readonly EkstraTilgang[]; onFerdig: () => void; onAvbryt?: () => void;
}) {
  const [pending, start] = useTransition();
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [valgte, setValgte] = useState<Capability[]>([]);
  const [feil, setFeil] = useState<string | null>(null);
  const [feltFeil, setFeltFeil] = useState<Record<string, string>>({});
  const [ok, setOk] = useState<string | null>(null);

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setFeil(null); setFeltFeil({}); setOk(null);
    start(async () => {
      const res = await inviterCoach(epost.trim(), navn.trim(), kanTildeleTilganger && valgte.length > 0 ? valgte : undefined);
      if (!res.ok) { setFeil(res.error); setFeltFeil(res.fieldErrors ?? {}); return; }
      setOk(res.epostSendt ? "Coach invitert. Invitasjons-e-post er sendt." : "Coach opprettet. E-post ble ikke sendt (Resend ikke konfigurert).");
      setTimeout(onFerdig, 1500);
    });
  }

  return <form onSubmit={send} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <Felt label="Navn" error={feltFeil.name}><TekstFeltStor value={navn} onChange={(e) => setNavn(e.target.value)} placeholder="Fornavn Etternavn" /></Felt>
    <Felt label="E-post" error={feltFeil.email}><TekstFeltStor type="email" value={epost} onChange={(e) => setEpost(e.target.value)} placeholder="fornavn@akgolf.no" /></Felt>
    {kanTildeleTilganger && <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
      <legend className="kicker" style={{ padding: 0 }}>Ekstra tilganger</legend>
      <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>
        Standard trenertilgang (grupper, planer, tester, spillerdata, booking) følger med. Kryss av for det ekstra denne treneren skal ha.
      </p>
      {tilganger.map((t) => <Avkryssing key={t.id} label={t.label} checked={valgte.includes(t.id)}
        onChange={(on) => setValgte((p) => on ? [...new Set([...p, t.id])] : p.filter((c) => c !== t.id))} />)}
    </fieldset>}
    {feil && Object.keys(feltFeil).length === 0 && <InlineVarsel tone="warn">{feil}</InlineVarsel>}
    {ok && <InlineVarsel tone="ok">{ok}</InlineVarsel>}
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Knapp type="submit" icon={Send} iconName="send" loading={pending} loadingText="Sender …">Send invitasjon</Knapp>
      {onAvbryt ? <Knapp variant="ghost" onClick={onAvbryt}>Avbryt</Knapp> : <KnappLenke href="/admin/oppsett?fane=team" variant="ghost">Avbryt</KnappLenke>}
    </div>
  </form>;
}

export function AG23Inviter({ tilstand, kanTildeleTilganger, tilganger }: { tilstand: AG23TeamTilstand; kanTildeleTilganger: boolean; tilganger: readonly EkstraTilgang[] }) {
  const router = useRouter();
  return <div className="pa-side">
    <AG23Hode sted="team" kicker="Mer · Oppsett · Team" tittel="Inviter coach" sub="Coachen får en e-post med innloggingslink og kan logge inn med samme e-post." />
    <Tilstander tilstand={tilstand} tekst="Henter …">
      <Kort style={{ maxWidth: 560 }}>
        <InviterSkjema kanTildeleTilganger={kanTildeleTilganger} tilganger={tilganger} onFerdig={() => router.push("/admin/oppsett?fane=team")} />
      </Kort>
    </Tilstander>
  </div>;
}

/* ---------- Team og roller (fasit: fane Team) ---------- */
export type TeamRad = { id: string; navn: string; rolle: "ADMIN" | "COACH"; epost: string; aktiv: boolean };
const ROLLER: ReadonlyArray<readonly [string, string]> = [
  ["Administrator", "Alt: økonomi, brukere, fasiliteter, eksterne lesere og invitasjoner"],
  ["Coach", "Grupper, planer, tester, spillerdata og booking. Ekstra tilganger gis per coach ved invitasjon"],
];
const KickerHode = ({ k, meta }: { k: string; meta: string }) => <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
  <span className="kicker" style={{ flex: "1 1 auto" }}>{k}</span><Meta>{meta}</Meta>
</div>;
const rolleNavn = (r: TeamRad["rolle"]) => (r === "ADMIN" ? "Administrator" : "Coach");

export function AG23TeamOversikt({ tilstand, team, kanInvitere, kanTildeleTilganger, tilganger, kanEksterne }: {
  tilstand: AG23TeamTilstand; team: TeamRad[]; kanInvitere: boolean; kanTildeleTilganger: boolean; tilganger: readonly EkstraTilgang[]; kanEksterne: boolean;
}) {
  const router = useRouter();
  const [ark, setArk] = useState(false);
  return <div className="pa-side" style={{ maxWidth: 960 }}>
    <AG23Hode sted="team" kicker="Mer · Oppsett" tittel="Oppsett" />
    <Tilstander tilstand={tilstand} tekst="Henter teamet …">
      <Kort>
        <KickerHode k="Team" meta={team.length === 1 ? "BARE DEG" : `${team.length} COACHER`} />
        {team.length === 0
          ? <TomTilstand icon={Users} title="Ingen coacher" text="Inviter den første coachen." />
          : <div role="list">{team.map((t, i) => <div role="listitem" key={t.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", minHeight: 52, padding: "6px 0", borderTop: i ? "1px solid var(--border-hairline)" : "none", minWidth: 0 }}>
            <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span style={{ font: "500 14px/1.3 var(--font-sans)", overflowWrap: "anywhere" }}>{t.navn}</span>
              <Meta>{`${rolleNavn(t.rolle)} · ${t.epost}`.toUpperCase()}</Meta>
            </span>
            <StatusPille tone={t.aktiv ? "ok" : "neutral"}>{t.aktiv ? "Aktiv" : "Invitert"}</StatusPille>
          </div>)}</div>}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {kanInvitere && <Knapp size="sm" icon={UserPlus} iconName="user-plus" onClick={() => setArk(true)}>Inviter coach</Knapp>}
          {kanEksterne && <KnappLenke href="/admin/team/ekstern" variant="secondary" size="sm">Eksterne lesere</KnappLenke>}
        </div>
      </Kort>
      <Kort>
        <KickerHode k="Roller" meta="TO ROLLER" />
        <div role="list">{ROLLER.map(([r, t], i) => <div role="listitem" key={r} style={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 52, padding: "6px 0", borderTop: i ? "1px solid var(--border-hairline)" : "none", minWidth: 0 }}>
          <span style={{ font: "500 14px/1.3 var(--font-sans)" }}>{r}</span>
          <Meta>{t.toUpperCase()}</Meta>
        </div>)}</div>
      </Kort>
    </Tilstander>
    <Ark open={ark} onClose={() => setArk(false)} kicker="Team" tittel="Inviter coach">
      <InviterSkjema kanTildeleTilganger={kanTildeleTilganger} tilganger={tilganger} onAvbryt={() => setArk(false)} onFerdig={() => { setArk(false); router.refresh(); }} />
    </Ark>
  </div>;
}

/* ---------- Eksterne lesere ---------- */
const SCOPE_LABEL: Record<DelingScope, string> = { TEST_RESULTATER: "Testresultater", STATS: "Statistikk", KOMPLETT_PROFIL: "Komplett profil" };
export type EksternLeserRad = { id: string; navn: string; epost: string; grupper: string[] };

export function AG23Ekstern({ tilstand, grupper, lesere }: { tilstand: AG23TeamTilstand; grupper: { id: string; name: string }[]; lesere: EksternLeserRad[] }) {
  const [pending, start] = useTransition();
  const [navn, setNavn] = useState("");
  const [epost, setEpost] = useState("");
  const [valgteGrupper, setValgteGrupper] = useState<string[]>([]);
  const [valgteScopes, setValgteScopes] = useState<DelingScope[]>(["TEST_RESULTATER", "STATS"]);
  const [feil, setFeil] = useState<string | null>(null);
  const [feltFeil, setFeltFeil] = useState<Record<string, string>>({});
  const [ok, setOk] = useState<string | null>(null);
  const bytt = <T extends string>(l: T[], set: (v: T[]) => void, v: T, on: boolean) => set(on ? [...new Set([...l, v])] : l.filter((x) => x !== v));

  function opprett(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setFeil(null); setFeltFeil({}); setOk(null);
    start(async () => {
      const res = await opprettEksternLeser(epost.trim(), navn.trim(), valgteGrupper, valgteScopes);
      if (!res.ok) { setFeil(res.error); setFeltFeil(res.fieldErrors ?? {}); return; }
      setOk(res.epostSendt ? "Ekstern leser opprettet. Invitasjons-e-post er sendt." : "Ekstern leser opprettet. E-post ble ikke sendt (Resend ikke konfigurert).");
      setNavn(""); setEpost(""); setValgteGrupper([]);
    });
  }
  const [trekkes, setTrekkes] = useState<EksternLeserRad | null>(null);
  function trekk(id: string) {
    if (pending) return;
    setFeil(null); setOk(null);
    start(async () => {
      const res = await trekkEksternLeser(id);
      setTrekkes(null);
      if (!res.ok) { setFeil(res.error); return; }
      setOk("Tilgangen er trukket.");
    });
  }

  const kolonner: Kolonne<EksternLeserRad>[] = [
    { key: "navn", label: "Navn", render: (r) => r.navn },
    { key: "epost", label: "E-post", render: (r) => r.epost },
    { key: "grupper", label: "Grupper", render: (r) => r.grupper.join(", ") || "—" },
    { key: "trekk", label: "Tilgang", align: "right", render: (r) => <Knapp size="sm" variant="secondary" disabled={pending} onClick={() => setTrekkes(r)}>Trekk tilgang</Knapp> },
  ];

  return <div className="pa-side">
    <AG23Hode sted="team" kicker="Mer · Oppsett · Team" tittel="Eksterne lesere"
      sub="Team Norway- og WANG-ansvarlige med egen innlogging. De ser bare testresultater og statistikk for spillere som har samtykket til deling, aldri treningsplaner." />
    <Tilstander tilstand={tilstand} tekst="Henter eksterne lesere …">
      <div className="pa-a5-grid pa-a5-grid--2">
        <Kort>
          <KortHode tittel="Ny ekstern leser" />
          <form onSubmit={opprett} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Felt label="Navn" error={feltFeil.name}><TekstFeltStor value={navn} onChange={(e) => setNavn(e.target.value)} placeholder="Fornavn Etternavn" /></Felt>
            <Felt label="E-post" error={feltFeil.email}><TekstFeltStor type="email" value={epost} onChange={(e) => setEpost(e.target.value)} placeholder="ansvarlig@forbund.no" /></Felt>
            <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
              <legend className="kicker" style={{ padding: 0 }}>Grupper</legend>
              {feltFeil.groupIds && <InlineVarsel tone="warn">{feltFeil.groupIds}</InlineVarsel>}
              {grupper.length === 0 && <Meta>INGEN GRUPPER</Meta>}
              {grupper.map((g) => <Avkryssing key={g.id} label={g.name} checked={valgteGrupper.includes(g.id)} onChange={(on) => bytt(valgteGrupper, setValgteGrupper, g.id, on)} />)}
            </fieldset>
            <fieldset style={{ border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
              <legend className="kicker" style={{ padding: 0 }}>Innsyn</legend>
              {feltFeil.scopes && <InlineVarsel tone="warn">{feltFeil.scopes}</InlineVarsel>}
              {DELING_SCOPES.map((s) => <Avkryssing key={s} label={SCOPE_LABEL[s]} checked={valgteScopes.includes(s)} onChange={(on) => bytt(valgteScopes, setValgteScopes, s, on)} />)}
            </fieldset>
            {feil && <InlineVarsel tone="warn">{feil}</InlineVarsel>}
            {ok && <InlineVarsel tone="ok">{ok}</InlineVarsel>}
            <div><Knapp type="submit" icon={UserPlus} iconName="user-plus" loading={pending} loadingText="Oppretter …">Opprett ekstern leser</Knapp></div>
          </form>
        </Kort>
        <div className="pa-a5-stack">
          {lesere.length === 0
            ? <TomTilstand icon={Users} title="Ingen aktive eksterne lesere" text="Opprett en leser i skjemaet for å gi innsyn i samtykkede spillere." />
            : <Tabell caption="Aktive eksterne lesere" columns={kolonner} rows={lesere} />}
        </div>
      </div>
    </Tilstander>
    <Ark open={trekkes !== null} onClose={() => setTrekkes(null)} kicker="Eksterne lesere" tittel={`Trekke tilgangen for ${trekkes?.navn ?? ""}?`}
      footer={<><Knapp variant="signal" icon={UserX} iconName="user-x" loading={pending} loadingText="Trekker …" onClick={() => trekkes && trekk(trekkes.id)}>Trekk tilgang</Knapp><Knapp variant="ghost" onClick={() => setTrekkes(null)}>Behold</Knapp></>}>
      <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)", textWrap: "pretty" }}>Personen mister innsyn i testresultater og statistikk med en gang. Du kan opprette en ny tilgang senere.</p>
    </Ark>
  </div>;
}
