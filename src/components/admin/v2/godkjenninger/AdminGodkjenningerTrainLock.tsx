"use client";

/**
 * AgencyOS Godkjenninger — Train-lock (T3, 26.08.2026).
 *
 * Fasit: designsystem/train-lock/AG-10 Godkjenning Merge.dc.html (mobil) +
 * AG-10b Godkjenning Merge 3 skall.dc.html (iPad/Mac master–detalj).
 * Erstatter AdminGodkjenningerV2 (Paper T.*) på denne ruten. Samme
 * datakontrakt (AdminGodkjenningerV2Data/Row) og SAMME server actions —
 * dette er en designport, ikke en funksjonsendring.
 *
 * A2 (16.08.2026, beslutninger.md §PP-A): master–detalj på desktop. Fasitens
 * AG-10b viser en smal kø-kolonne (250–300px) + full diff til høyre — bredere
 * enn den generelle 380px-inspektørpanel-normen, fordi før/etter-diffen
 * trenger plass. Avvik dokumentert i docs/natt/T3-DONE.md.
 *
 * Copy-avvik fra AdminGodkjenningerV2 (bevisst, jf. fasit): agent-kildens
 * primærhandling heter «Merge» (fasitens ord for å ta et Caddie/agent-utkast
 * inn i planen), ikke «Godkjenn». Handlingen er uendret (acceptPlanAction).
 * Caddie («Send») og forespørsel («Legg i kalenderen») er ikke «merger» og
 * beholder sine egne ord.
 *
 * Tokens: KUN TL — se CLAUDE.md invariant 2. Én hvit primær-CTA per skjerm
 * (Merge på valgt/første kø-kort); resten er dim/opacity 0.55.
 */

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MasterDetalj, useInspektorSynlig } from "@/components/v2/inspektorpanel";
import { Icon } from "@/components/v2/icon";
import { TL } from "@/lib/v2/train-lock";
import { handlingstypeLabel } from "@/lib/labels/handlingstyper";
import { acceptPlanAction, rejectPlanAction } from "@/lib/agents/actions";
import { avvisProaktivtForslag, godkjennCaddieDraft } from "@/app/admin/agencyos/caddie/dashbord/actions";
import { avslaaForespørsel, markerSomPlanlagt } from "@/app/admin/(legacy)/foresporsler/actions";
import { batchApproveLowRisk } from "@/app/admin/(legacy)/approvals/actions";
import { toast } from "sonner";
import { delUkesdigestAction } from "@/app/admin/godkjenninger/del-digest-action";
import { TlCaps, TlInspektorBlokk, TlInspektorKpi, TlInspektorLinje, TlInspektorpanel } from "./tl-inspektor";
import type { AdminGodkjenningerV2Data, AdminGodkjenningV2Row, AdminUkesrapportKort } from "../AdminGodkjenningerV2";

export type { AdminGodkjenningerV2Data, AdminGodkjenningV2Row, AdminUkesrapportKort };

type FilterKey = "alle" | "agent" | "caddie" | "forespørsel" | "rapport";

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

const PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const oppdater = () => setMatch(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, [query]);
  return match;
}

/** Knappe-matrise (DESIGN-SYSTEM.md §6): primær = hvit fyll, sekundær = dim, fare = hairline-ring danger-tekst. */
function knappStil(fyll: "primaer" | "sekundaer" | "fare", full?: boolean): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    padding: "0 20px",
    borderRadius: TL.radius.pill,
    fontSize: TL.storrelse.kropp,
    fontWeight: TL.vekt.kropp,
    cursor: "pointer",
    whiteSpace: "nowrap",
    textDecoration: "none",
    border: "none",
    flex: full ? "1 1 45%" : undefined,
  };
  if (fyll === "primaer") return { ...base, background: TL.fill, color: TL.onFill, fontWeight: TL.vekt.cta };
  if (fyll === "fare") return { ...base, background: "transparent", color: TL.danger, boxShadow: `inset 0 0 0 1px ${TL.hair}` };
  return { ...base, background: TL.dim, color: TL.text };
}

function MergeLavRisikoKnapp({ count, full }: { count: number; full?: boolean }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  if (count === 0) return null;
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => start(async () => { await batchApproveLowRisk(); router.refresh(); })}
      className={PRESS}
      style={{ ...knappStil("sekundaer", full), opacity: busy ? 0.55 : 1 }}
    >
      {busy ? "Merger …" : `Merge ${pl(count, "lavrisiko", "lavrisiko")} samlet`}
    </button>
  );
}

/**
 * Handlingsraden per sak — settet avhenger av kilden (agent/caddie/forespørsel).
 * `fremhevet` styrer om raden er den ENE hvite primæren på skjermen (DESIGN-
 * SYSTEM.md §6: «én hvit primær per skjerm») — ikke-fremhevede kø-kort får
 * samme handling i dim-stil (fasit: AG-03, resten av kø-kortene har dim Merge).
 */
function SakHandlinger({ row, mobile, fremhevet }: { row: AdminGodkjenningV2Row; mobile: boolean; fremhevet: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [avvisModus, setAvvisModus] = useState(false);
  const [avvisGrunn, setAvvisGrunn] = useState("");
  const kilde = row.kilde ?? "agent";

  const kjor = (fn: () => Promise<unknown>) => start(async () => { await fn(); router.refresh(); });

  const avvisFelt = avvisModus ? (
    <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center", width: "100%" }}>
      <input
        type="text"
        value={avvisGrunn}
        onChange={(e) => setAvvisGrunn(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") kjor(() => rejectPlanAction(row.id, avvisGrunn.trim() || undefined)); }}
        placeholder="Hvorfor avvises forslaget? (valgfritt)"
        maxLength={500}
        autoFocus
        style={{
          flex: 1,
          minWidth: 0,
          borderRadius: TL.radius.field,
          background: TL.dock,
          boxShadow: `inset 0 0 0 1px ${TL.hair}`,
          padding: "10px 14px",
          fontSize: 13,
          color: TL.text,
          border: "none",
        }}
      />
      <button type="button" className={PRESS} disabled={pending} onClick={() => kjor(() => rejectPlanAction(row.id, avvisGrunn.trim() || undefined))} style={knappStil("fare")}>
        Avvis
      </button>
      <button type="button" className={PRESS} disabled={pending} onClick={() => { setAvvisModus(false); setAvvisGrunn(""); }} style={knappStil("sekundaer")}>
        Angre
      </button>
    </div>
  ) : null;

  const hovedFyll: "primaer" | "sekundaer" = fremhevet ? "primaer" : "sekundaer";
  const knapper: { key: string; label: string; fyll: "primaer" | "sekundaer" | "fare"; onClick?: () => void; href?: string }[] =
    kilde === "agent"
      ? [
          { key: "merge", label: "Merge", fyll: hovedFyll, onClick: () => kjor(() => acceptPlanAction(row.id)) },
          ...(avvisModus ? [] : [{ key: "avvis", label: "Avvis", fyll: "fare" as const, onClick: () => setAvvisModus(true) }]),
        ]
      : kilde === "caddie"
        ? [
            { key: "send", label: "Send", fyll: hovedFyll, onClick: () => kjor(() => godkjennCaddieDraft(row.id)) },
            { key: "apne", label: "Åpne i Caddie", fyll: "sekundaer", href: row.eksternHref ?? "/admin/agencyos/caddie/dashbord" },
            { key: "forkast", label: "Forkast", fyll: "fare", onClick: () => kjor(() => avvisProaktivtForslag(row.id)) },
          ]
        : [
            { key: "kalender", label: "Legg i kalenderen", fyll: hovedFyll, onClick: () => kjor(() => markerSomPlanlagt(row.id)) },
            { key: "tid", label: "Foreslå annen tid", fyll: "sekundaer", href: row.eksternHref ?? "/admin/foresporsler" },
            { key: "kanikke", label: "Kan ikke", fyll: "fare", onClick: () => kjor(() => avslaaForespørsel(row.id)) },
          ];

  return (
    <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 14, opacity: pending ? 0.5 : 1 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {knapper.map((k) =>
          k.href ? (
            <Link key={k.key} href={k.href} className={PRESS} style={knappStil(k.fyll, mobile)}>
              {k.label}
            </Link>
          ) : (
            <button key={k.key} type="button" className={PRESS} disabled={pending} onClick={k.onClick} style={knappStil(k.fyll, mobile)}>
              {k.label}
            </button>
          ),
        )}
      </div>
      {avvisFelt}
    </div>
  );
}

function RapportKort({ rapport }: { rapport: AdminUkesrapportKort }) {
  return (
    <article style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "18px 20px", boxShadow: `inset 3px 0 0 ${TL.viz.target}` }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>Ukesrapport · uke {rapport.ukenummer}</span>
        <TlCaps size={10}>agent · leses, ikke godkjennes</TlCaps>
        <span style={{ marginLeft: "auto", fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{rapport.when}</span>
      </div>

      <h3 style={{ margin: "10px 0 0", fontSize: 15, fontWeight: 600, color: TL.text }}>Uke {rapport.ukenummer} oppsummert — hele stallen</h3>
      <p style={{ margin: "6px 0 0", fontSize: 13, color: TL.mute, lineHeight: 1.55 }}>
        Rapportagenten leser plan, logg, runder og tester — den skriver aldri noe selv. Alt under er telt, ikke vurdert.
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 14 }}>
        {rapport.tall.map((t) => (
          <div key={t.key} style={{ minWidth: 120 }}>
            <TlCaps size={9}>{t.key}</TlCaps>
            <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 15, fontWeight: 600, color: TL.text, fontVariantNumeric: "tabular-nums" }}>{t.verdi}</span>
            <span style={{ display: "block", fontSize: 11, color: TL.mute }}>{t.nevner}</span>
          </div>
        ))}
      </div>

      {rapport.hvorfor.length > 0 && (
        <details style={{ marginTop: 14 }}>
          <summary style={{ cursor: "pointer", fontSize: 13, color: TL.mute }}>Hvorfor?</summary>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 12.5, color: TL.mute, lineHeight: 1.6 }}>
            {rapport.hvorfor.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </details>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        <DelDigestKnapp />
      </div>
    </article>
  );
}

function DelDigestKnapp() {
  const [sender, setSender] = useState(false);
  return (
    <button
      type="button"
      className={PRESS}
      disabled={sender}
      onClick={async () => {
        setSender(true);
        try {
          const res = await delUkesdigestAction();
          if (res.ok) toast.success(res.melding);
          else toast.error(res.melding);
        } catch {
          toast.error("Kunne ikke dele digesten. Prøv igjen.");
        } finally {
          setSender(false);
        }
      }}
      style={{ ...knappStil("sekundaer"), opacity: sender ? 0.6 : 1, cursor: sender ? "wait" : "pointer" }}
    >
      {sender ? "Deler …" : "Del digest med spillere og foresatte"}
    </button>
  );
}

function Merke({ tone, children }: { tone: "warn" | "mute"; children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: tone === "warn" ? TL.warn : TL.mute,
        boxShadow: `inset 0 0 0 1px ${tone === "warn" ? TL.warnHair : TL.hair}`,
        borderRadius: 999,
        padding: "3px 8px",
      }}
    >
      {children}
    </span>
  );
}

function SakKort({
  row,
  markert,
  mobile,
  kanVelges,
  onVelg,
}: {
  row: AdminGodkjenningV2Row;
  markert: boolean;
  mobile: boolean;
  kanVelges: boolean;
  onVelg: (id: string) => void;
}) {
  const kilde = row.kilde ?? "agent";
  const kildeLabel = kilde === "caddie" ? "caddie-utkast" : kilde === "forespørsel" ? "forespørsel" : "agent";
  return (
    <article
      aria-current={markert ? "true" : undefined}
      onClick={kanVelges ? () => onVelg(row.id) : undefined}
      style={{
        background: TL.elev,
        borderRadius: TL.radius.card,
        padding: mobile ? "16px 18px" : "18px 20px",
        boxShadow: markert ? `inset 0 0 0 1px ${TL.hair}` : undefined,
        opacity: markert ? 1 : 0.55,
        cursor: kanVelges ? "pointer" : undefined,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>{row.who}</span>
        {row.urgent && <Merke tone="warn">Haster</Merke>}
        {row.lowRisk && <Merke tone="mute">Lavrisiko</Merke>}
        <TlCaps size={10}>{kildeLabel}</TlCaps>
        <span style={{ marginLeft: "auto", fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{row.when}</span>
      </div>

      <h3 style={{ margin: "8px 0 0", fontSize: 15, fontWeight: 600, color: TL.text }}>{row.title}</h3>
      {row.detail && <p style={{ margin: "4px 0 0", fontSize: 13, lineHeight: 1.45, color: TL.mute }}>{row.detail}</p>}
      <div style={{ fontSize: 11, color: TL.mute, marginTop: 6 }}>{handlingstypeLabel(row.actionType)}</div>

      {row.diffPreview && (
        <div style={{ margin: "12px 0 0", padding: "12px 16px", background: TL.dock, borderRadius: 14 }}>
          <TlCaps size={9}>Dette endres</TlCaps>
          <span style={{ display: "block", marginTop: 4, fontFamily: TL.font.mono, fontSize: 12, color: TL.text, overflowWrap: "anywhere" }}>{row.diffPreview}</span>
        </div>
      )}

      {row.hvorfor && (
        <details onClick={(e) => e.stopPropagation()} style={{ marginTop: 10 }}>
          <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: TL.mute }}>Hvorfor?</summary>
          <p style={{ margin: "6px 0 0", fontSize: 12.5, lineHeight: 1.55, color: TL.mute }}>{row.hvorfor}</p>
        </details>
      )}

      <SakHandlinger row={row} mobile={mobile} fremhevet={markert} />
    </article>
  );
}

/** Sak-inspektøren (A2) — valgt sak i kø-panelet. Ingen valgt → «Køen i tall». */
function SakInspektor({ row }: { row: AdminGodkjenningV2Row }) {
  const kilde = row.kilde ?? "agent";
  const kildeLabel = kilde === "caddie" ? "caddie-utkast" : kilde === "forespørsel" ? "forespørsel" : "agent";
  return (
    <TlInspektorpanel
      tittel={row.who}
      ariaLabel={`Valgt sak: ${row.who}`}
      tag={row.urgent ? <Merke tone="warn">Haster</Merke> : row.lowRisk ? <Merke tone="mute">Lavrisiko</Merke> : undefined}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <TlCaps size={10}>{kildeLabel}</TlCaps>
        <span style={{ marginLeft: "auto", fontSize: 12, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{row.when}</span>
      </div>

      <div>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: TL.text }}>{row.title}</h3>
        {row.detail && <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.5, color: TL.mute }}>{row.detail}</p>}
        <div style={{ fontSize: 11, color: TL.mute, marginTop: 6 }}>{handlingstypeLabel(row.actionType)}</div>
      </div>

      {row.diffPreview && (
        <div style={{ padding: "12px 16px", background: TL.dock, borderRadius: 14 }}>
          <TlCaps size={9}>Dette endres</TlCaps>
          <span style={{ display: "block", marginTop: 4, fontFamily: TL.font.mono, fontSize: 12, color: TL.text, overflowWrap: "anywhere" }}>{row.diffPreview}</span>
        </div>
      )}

      {row.hvorfor && (
        <TlInspektorBlokk label="Hvorfor?">
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: TL.mute }}>{row.hvorfor}</p>
        </TlInspektorBlokk>
      )}

      <SakHandlinger row={row} mobile={false} fremhevet />
    </TlInspektorpanel>
  );
}

function KøenITall({ data }: { data: AdminGodkjenningerV2Data }) {
  const totalt = data.totalt ?? data.rows.length;
  const kilder = data.kilder ?? { agent: 0, caddie: 0, forespørsel: 0 };
  return (
    <TlInspektorpanel
      tittel="Køen i tall"
      ariaLabel="Køens tall"
      fot={data.lowRiskCount > 0 ? <MergeLavRisikoKnapp count={data.lowRiskCount} full /> : undefined}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <TlInspektorKpi label="Venter" verdi={String(totalt)} sub={`${kilder.agent} agent · ${kilder.caddie} caddie · ${kilder.forespørsel} fsp`} />
        <TlInspektorKpi label="Lavrisiko" verdi={String(data.lowRiskCount)} sub="kan merges samlet" />
        <TlInspektorKpi label="Eldste" verdi={data.eldste?.dagerLabel ?? "—"} sub={data.eldste?.who ?? "Ingen i kø"} />
        <TlInspektorKpi label="Merget 7 dg" verdi={String(data.godkjent7Dager ?? 0)} sub={`${data.avvist7Dager ?? 0} avvist`} />
      </div>

      <div style={{ background: TL.dock, borderRadius: 14, padding: 14 }}>
        <TlCaps size={9}>Slik leses køen</TlCaps>
        <p style={{ margin: "8px 0 0", fontSize: 12, lineHeight: 1.55, color: TL.mute }}>
          Hvert forslag viser hva som faktisk endres før du sier ja. Har et forslag ingen «Dette endres»-linje, er
          det ingen planendring — da er det en melding eller en forespørsel.
        </p>
      </div>

      <TlInspektorBlokk label="Kilder">
        <TlInspektorLinje label="Agent (PlanAction)" verdi={String(kilder.agent)} />
        <TlInspektorLinje label="Caddie-utkast" verdi={String(kilder.caddie)} />
        <TlInspektorLinje label="Økt-forespørsel" verdi={String(kilder.forespørsel)} />
        <Link href="/admin/innboks" style={{ textDecoration: "none" }}>
          <TlInspektorLinje label="E-postutkast" verdi="innboks" />
        </Link>
      </TlInspektorBlokk>
    </TlInspektorpanel>
  );
}

export function AdminGodkjenningerTrainLock({ data }: { data: AdminGodkjenningerV2Data }) {
  const mobile = useMediaQuery("(max-width: 767px)");
  const visPanel = useInspektorSynlig();
  const [filter, setFilter] = useState<FilterKey>("alle");
  const [valgtId, setValgtId] = useState<string | null>(null);

  const kilder = data.kilder ?? { agent: 0, caddie: 0, forespørsel: 0 };
  const totalt = data.totalt ?? data.rows.length;

  const filtrert = useMemo(
    () => (filter === "alle" ? data.rows : data.rows.filter((r) => (r.kilde ?? "agent") === filter)),
    [data.rows, filter],
  );

  const rapport = data.ukesrapport ?? null;

  const filtre: { k: FilterKey; n: string; antall: number }[] = [
    { k: "alle", n: "Alle", antall: data.rows.length + (rapport ? 1 : 0) },
    { k: "agent", n: "Agent", antall: kilder.agent },
    { k: "caddie", n: "Caddie-utkast", antall: kilder.caddie },
    { k: "forespørsel", n: "Økt-forespørsler", antall: kilder.forespørsel },
    ...(rapport ? [{ k: "rapport" as FilterKey, n: "Rapport", antall: 1 }] : []),
  ];

  const visRapport = rapport != null && (filter === "alle" || filter === "rapport");
  const valgtSak = valgtId ? (data.rows.find((r) => r.id === valgtId) ?? null) : null;

  return (
    <MasterDetalj panel={valgtSak ? <SakInspektor row={valgtSak} /> : <KøenITall data={data} />}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
        <div>
          <TlCaps>Academy</TlCaps>
          <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, letterSpacing: "-0.01em", color: TL.text }}>Godkjenninger</h1>
        </div>

        <div role="group" aria-label="Kilder" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {filtre.map((f) => {
            const aktiv = f.k === filter;
            return (
              <button
                key={f.k}
                type="button"
                aria-pressed={aktiv}
                onClick={() => setFilter(f.k)}
                className={PRESS}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  height: 40,
                  padding: "0 16px",
                  borderRadius: TL.radius.pill,
                  background: aktiv ? TL.fill : TL.dim,
                  color: aktiv ? TL.onFill : TL.text,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  border: "none",
                }}
              >
                <span>{f.n}</span>
                <span style={{ fontVariantNumeric: "tabular-nums", opacity: 0.75 }}>{f.antall}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontFamily: TL.font.mono, fontSize: 22, fontWeight: 600, color: TL.text, fontVariantNumeric: "tabular-nums" }}>{totalt}</span>
          <TlCaps size={10}>venter på deg</TlCaps>
          {data.lowRiskCount > 0 && (
            <div style={{ marginLeft: mobile ? undefined : "auto", width: mobile ? "100%" : undefined }}>
              <MergeLavRisikoKnapp count={data.lowRiskCount} full={mobile} />
            </div>
          )}
        </div>

        {visRapport && <RapportKort rapport={rapport!} />}

        {filtrert.length === 0 && !visRapport ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center", padding: "40px 24px", background: TL.elev, borderRadius: TL.radius.card }}>
            <Icon name="check-circle" size={20} style={{ color: TL.mute }} />
            <h3 style={{ margin: "6px 0 0", fontSize: 15, fontWeight: 600, color: TL.text }}>
              {data.rows.length === 0 ? "Køen er tom" : "Ingen saker i dette filteret"}
            </h3>
            <p style={{ margin: 0, maxWidth: "44ch", fontSize: 13, color: TL.mute, lineHeight: 1.55 }}>
              {data.rows.length === 0
                ? "Ingenting venter på godkjenning akkurat nå. Agentene sender nye forslag når det kommer inn nye runder, tester eller signaler fra spillerne dine."
                : "Bytt filter for å se resten av køen."}
            </p>
            {data.rows.length === 0 && (
              <Link href="/admin/spillere" className={PRESS} style={{ ...knappStil("sekundaer"), marginTop: 6 }}>
                Gå til stallen
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtrert.map((r, i) => (
              <SakKort
                key={r.id}
                row={r}
                markert={valgtSak ? r.id === valgtSak.id : i === 0}
                mobile={mobile}
                kanVelges={visPanel}
                onVelg={(id) => setValgtId((cur) => (cur === id ? null : id))}
              />
            ))}
          </div>
        )}

        {(data.lostSjekkpunkter?.length ?? 0) > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: TL.text }}>Løst nylig</h2>
              <span style={{ fontSize: 12, color: TL.mute }}>{pl(data.lostSjekkpunkter!.length, "sjekkpunkt", "sjekkpunkter")}</span>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: TL.mute }}>Merget forslag med sjekkpunkt — de kommer tilbake hit når fristen er nådd.</p>
            <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "4px 18px" }}>
              {data.lostSjekkpunkter!.map((l, i) => (
                <div
                  key={l.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "12px 0",
                    borderTop: i === 0 ? undefined : `1px solid ${TL.hair}`,
                    fontSize: 13,
                    color: TL.text,
                  }}
                >
                  <span style={{ minWidth: 0 }}>{l.who} · {l.sjekkpunkt}</span>
                  <span style={{ flex: "none", fontSize: 12, color: TL.mute }}>{l.when}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MasterDetalj>
  );
}
