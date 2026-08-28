"use client";
import { TL } from "@/lib/v2/train-lock";

/**
 * AgencyOS Godkjenninger — 1:1 port av
 * designsystem/paper/fase2/agencyos/agencyos-godkjenninger.html.
 *
 * Fasitens form: filterpiller PER KILDE (Alle/Agent/Caddie-utkast/
 * Økt-forespørsler) med reelle tellinger, «N VENTER PÅ DEG» + ghost
 * «Godkjenn N lavrisiko samlet», en tidsordnet, flat kø av saks-kort (ikke
 * gruppert per spiller), «Løst nylig», og en fast 380px høyrekolonne
 * («Køen i tall») på desktop ≥1024px. Tilstand-riggbaren i fasiten er
 * demo-chrome og er ikke bygget.
 *
 * A2 (16.08.2026): panelet er master–detalj — klikk på et saks-kort velger
 * saken inn i inspektørpanelet (SakInspektor, samme handlinger/server actions
 * som kortet); ingen valgt → fasitens «Køen i tall». Mobil uendret.
 *
 * Avvik fra fasiten (data-ærlighet, se sluttrapport):
 *  - «Utsett» finnes ikke — ingen server action for å utsette en PlanAction.
 *  - «Rediger utkast» (caddie) er slått sammen med «Åpne i Caddie» — det
 *    finnes ingen egen inline-redigeringsflate for et CaddieDraft.
 *  - «Foreslå annen tid» (forespørsel) lenker til /admin/foresporsler —
 *    ingen egen «foreslå tid»-handling finnes ennå.
 *  - «Hvorfor?» viser én sammenhengende forklaringslinje (provenanceLesbarTekst),
 *    ikke fasitens tre strukturerte punkter (Agent/Data/Regel) — provenance-
 *    modellen lagrer ikke de tre feltene separat.
 *  - «Løst nylig» viser faktisk godkjenningstidspunkt, ikke fasitens
 *    fremtidige «sjekk DATO» — vi lagrer ikke en fremtidig sjekk-dato.
 */

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Caps, Icon, Inspektorpanel, InspektorBlokk, InspektorKpi, MasterDetalj, useInspektorSynlig } from "@/components/v2";
import { handlingstypeLabel } from "@/lib/labels/handlingstyper";
import { acceptPlanAction, rejectPlanAction } from "@/lib/agents/actions";
import { avvisProaktivtForslag, godkjennCaddieDraft } from "@/app/admin/agencyos/caddie/dashbord/actions";
import { avslaaForespørsel, markerSomPlanlagt } from "@/app/admin/(legacy)/foresporsler/actions";
import { batchApproveLowRisk } from "@/app/admin/(legacy)/approvals/actions";
import { toast } from "sonner";
import { delUkesdigestAction } from "@/app/admin/godkjenninger/del-digest-action";

// ── Datakontrakt (mappes fra Prisma i ruten) ────────────────────
export interface AdminGodkjenningV2Row {
  id: string;
  actionType: string;
  playerId: string;
  who: string;
  title: string;
  detail: string;
  signalKind: string | null;
  signalValue: string | null;
  diffPreview: string | null;
  when: string;
  urgent: boolean;
  lowRisk: boolean;
  /** A1: kilde-chip — "agent" (PlanAction) | "caddie" | "forespørsel". */
  kilde?: "agent" | "caddie" | "forespørsel";
  /** A1: kilder uten inline godkjenn-action lenker til sin flate. */
  eksternHref?: string | null;
  /** Punkt 5: lesbar forklaring fra PlanAction.provenance. Skjules når null
   *  (eldre saker uten strukturert kilde-sporing). */
  hvorfor?: string | null;
}
export interface AdminGodkjenningerV2Data {
  rows: AdminGodkjenningV2Row[];
  lowRiskCount: number;
  /** Kanonisk kø-telling (koTelling) — samme tall som innboks-banner/varsler. */
  totalt?: number;
  /** Nylig godkjente saker med sjekkpunkt (Løst / ETTER→FØR). */
  lostSjekkpunkter?: {
    id: string;
    who: string;
    sjekkpunkt: string;
    when: string;
  }[];
  /** Fasitens kildefaner-tellinger (agent/caddie-utkast/økt-forespørsler). */
  kilder?: { agent: number; caddie: number; forespørsel: number };
  /** Eldste sak i køen — «Køen i tall». Null når køen er tom. */
  eldste?: { dagerLabel: string; who: string } | null;
  /** Godkjent/avvist siste 7 dager på tvers av alle tre kilder. */
  godkjent7Dager?: number;
  avvist7Dager?: number;
  /** D3: ukesrapporten — et LESEELEMENT i køen, ikke en beslutning. */
  ukesrapport?: AdminUkesrapportKort | null;
}

/**
 * D3 · ukesrapport-kortet.
 * Fasit: designsystem/paper/fase2/agencyos/agencyos-godkjenninger.html
 *
 * Rapporten ber ikke om noen beslutning — den har derfor ingen Godkjenn-knapp
 * og bærer info-kant i stedet for beslutningskortenes fg-kant. Agenten leser
 * alt og skriver ingenting; å dele digesten er en manuell handling.
 */
export interface AdminUkesrapportKort {
  ukenummer: number;
  when: string;
  /** Talte nøkkeltall — hver med sin nevner i klartekst. */
  tall: { key: string; verdi: string; nevner: string }[];
  /** «Hvorfor?» — agent, kjøretid, datagrunnlag, nevner. */
  hvorfor: string[];
}

type FilterKey = "alle" | "agent" | "caddie" | "forespørsel" | "rapport";

const pl = (n: number, en: string, flere: string) => `${n} ${n === 1 ? en : flere}`;

/** md-breakpoint (kortenes handlingsrad: full bredde vs. inline). */
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

function knappStil(fyll: "ink" | "ghost" | "fare", extra?: React.CSSProperties): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 44,
    padding: "0 16px",
    borderRadius: TL.radius.row,
    fontFamily: TL.font.sans,
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    textDecoration: "none",
  };
  if (fyll === "ink") return { ...base, background: TL.fill, color: TL.onFill, border: `1px solid ${TL.fill}`, ...extra };
  if (fyll === "fare") return { ...base, background: "transparent", color: TL.danger, border: `1px solid ${TL.hair}`, ...extra };
  return { ...base, background: TL.elev, color: TL.text, border: `1px solid ${TL.hair}`, ...extra };
}

/** Massehandling: godkjenn alle lav-risiko-forslag i køen (fasitens ren `.btn`, ikke ink). */
function GodkjennLavRisikoKnapp({ count, full }: { count: number; full?: boolean }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  if (count === 0) return null;
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => start(async () => { await batchApproveLowRisk(); router.refresh(); })}
      className="v2-press v2-focus"
      data-od-id="cta-godkjenn-lavrisiko"
      style={{ ...knappStil("ghost"), width: full ? "100%" : undefined, opacity: busy ? 0.55 : 1 }}
    >
      {busy ? "Godkjenner …" : `Godkjenn ${pl(count, "lavrisiko", "lavrisiko")} samlet`}
    </button>
  );
}

/** Handlingsraden per sak — settet avhenger av kilden (agent/caddie/forespørsel). */
function SakHandlinger({ row, mobile }: { row: AdminGodkjenningV2Row; mobile: boolean }) {
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
          border: `1px solid ${TL.hair}`,
          background: TL.dock,
          padding: "10px 14px",
          fontFamily: TL.font.sans,
          fontSize: 13,
          color: TL.text,
        }}
      />
      <button
        type="button"
        className="v2-press v2-focus"
        disabled={pending}
        onClick={() => kjor(() => rejectPlanAction(row.id, avvisGrunn.trim() || undefined))}
        style={knappStil("fare")}
      >
        Avvis
      </button>
      <button
        type="button"
        className="v2-press v2-focus"
        disabled={pending}
        onClick={() => { setAvvisModus(false); setAvvisGrunn(""); }}
        style={knappStil("ghost")}
      >
        Angre
      </button>
    </div>
  ) : null;

  const knapper: { key: string; label: string; fyll: "ink" | "ghost" | "fare"; onClick?: () => void; href?: string }[] =
    kilde === "agent"
      ? [
          { key: "godkjenn", label: "Godkjenn", fyll: "ink", onClick: () => kjor(() => acceptPlanAction(row.id)) },
          { key: "endre", label: "Endre først", fyll: "ghost", href: `/admin/godkjenninger/${row.id}` },
          ...(avvisModus
            ? []
            : [{ key: "avvis", label: "Avvis", fyll: "fare" as const, onClick: () => setAvvisModus(true) }]),
        ]
      : kilde === "caddie"
        ? [
            { key: "send", label: "Send", fyll: "ink", onClick: () => kjor(() => godkjennCaddieDraft(row.id)) },
            { key: "apne", label: "Åpne i Caddie", fyll: "ghost", href: row.eksternHref ?? "/admin/agencyos/caddie/dashbord" },
            { key: "forkast", label: "Forkast", fyll: "fare", onClick: () => kjor(() => avvisProaktivtForslag(row.id)) },
          ]
        : [
            { key: "kalender", label: "Legg i kalenderen", fyll: "ink", onClick: () => kjor(() => markerSomPlanlagt(row.id)) },
            { key: "tid", label: "Foreslå annen tid", fyll: "ghost", href: row.eksternHref ?? "/admin/foresporsler" },
            { key: "kanikke", label: "Kan ikke", fyll: "fare", onClick: () => kjor(() => avslaaForespørsel(row.id)) },
          ];

  return (
    /* stopPropagation: kortet bak er klikkbart (velger sak i inspektørpanelet)
       — en handling skal aldri også endre valget. */
    <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 12, opacity: pending ? 0.5 : 1 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {knapper.map((k) =>
          k.href ? (
            <Link key={k.key} href={k.href} className="v2-press v2-focus" style={{ ...knappStil(k.fyll), flex: mobile ? "1 1 45%" : undefined }}>
              {k.label}
            </Link>
          ) : (
            <button
              key={k.key}
              type="button"
              className="v2-press v2-focus"
              disabled={pending}
              onClick={k.onClick}
              style={{ ...knappStil(k.fyll), flex: mobile ? "1 1 45%" : undefined }}
            >
              {k.label}
            </button>
          ),
        )}
      </div>
      {avvisFelt}
    </div>
  );
}

/** Fasitens .kort — meta (navn/tag/kilde/tid) → tittel → forklaring → «Dette
 *  endres» → «Hvorfor?» → handlinger. `forste` speiler .kort.forste. */
/**
 * D3 · ukesrapporten i køen — LESEELEMENT.
 *
 * Skiller seg bevisst fra SakKort: info-kant i stedet for fg-kant, kilden sier
 * «leses, ikke godkjennes», og det finnes ingen Godkjenn-knapp. Deling av
 * digesten er en manuell handling, aldri automatikk.
 */
function RapportKort({ rapport }: { rapport: AdminUkesrapportKort }) {
  return (
    <article
      data-od-id="panel-ukesrapport"
      style={{
        background: TL.elev,
        border: `1px solid ${TL.hair}`,
        borderRadius: TL.radius.card,
        padding: "16px 18px",
        boxShadow: `inset 3px 0 0 ${TL.viz.target}`,
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>
          Ukesrapport · uke {rapport.ukenummer}
        </span>
        <span style={{ fontFamily: TL.font.mono, fontSize: 10, letterSpacing: "0.04em", textTransform: "uppercase", color: TL.viz.target }}>
          agent · leses, ikke godkjennes
        </span>
        <span style={{ marginLeft: "auto", fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{rapport.when}</span>
      </div>

      <h3 style={{ margin: "8px 0 0", fontFamily: TL.font.sans, fontSize: 14.5, fontWeight: 600, color: TL.text }}>
        Uke {rapport.ukenummer} oppsummert — hele stallen
      </h3>
      <p style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.55 }}>
        Rapportagenten leser plan, logg, runder og tester — den skriver aldri noe selv. Alt under er
        telt, ikke vurdert.
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
        {rapport.tall.map((t) => (
          <div key={t.key} style={{ minWidth: 120 }}>
            <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 9, letterSpacing: "0.07em", textTransform: "uppercase", color: TL.mute }}>
              {t.key}
            </span>
            <span style={{ fontFamily: TL.font.mono, fontSize: 15, fontWeight: 600, color: TL.text }}>{t.verdi}</span>
            <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 9.5, color: TL.mute }}>{t.nevner}</span>
          </div>
        ))}
      </div>

      {rapport.hvorfor.length > 0 && (
        <details style={{ marginTop: 12 }}>
          <summary style={{ cursor: "pointer", fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>Hvorfor?</summary>
          <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, lineHeight: 1.6 }}>
            {rapport.hvorfor.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </details>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
        <DelDigestKnapp />
      </div>
    </article>
  );
}

/**
 * Deling er en manuell handling — knappen finnes nettopp for at det ALDRI skal
 * skje automatisk. Ingen bekreftelsesdialog: handlingen er additiv og
 * idempotent, så en ekstra trykk deler ikke noe på nytt.
 */
function DelDigestKnapp() {
  const [sender, setSender] = useState(false);

  return (
    <button
      type="button"
      className="v2-press v2-focus"
      disabled={sender}
      data-od-id="cta-rapport-del"
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
      style={{
        ...knappStil("ghost"),
        opacity: sender ? 0.6 : 1,
        cursor: sender ? "wait" : "pointer",
      }}
    >
      {sender ? "Deler …" : "Del digest med spillere og foresatte"}
    </button>
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
  /** Fasitens `.kort.forste`-kant — følger valgt sak, ellers første i køen. */
  markert: boolean;
  mobile: boolean;
  /** true når inspektørpanelet er synlig (≥1024px) — klikk velger saken inn i panelet. */
  kanVelges: boolean;
  onVelg: (id: string) => void;
}) {
  const kilde = row.kilde ?? "agent";
  const kildeLabel = kilde === "caddie" ? "caddie-utkast · melding" : kilde === "forespørsel" ? "forespørsel · fra spiller" : "agent · handlingssenter";
  return (
    <article
      data-od-id={`panel-godkjenning-${row.id}`}
      aria-current={markert ? "true" : undefined}
      onClick={kanVelges ? () => onVelg(row.id) : undefined}
      style={{
        background: TL.elev,
        border: `1px solid ${markert ? TL.text : TL.hair}`,
        borderRadius: TL.radius.card,
        padding: mobile ? "14px 15px" : "16px 18px",
        boxShadow: markert ? `inset 3px 0 0 ${TL.text}` : undefined,
        cursor: kanVelges ? "pointer" : undefined,
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text }}>{row.who}</span>
        {row.urgent && (
          <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: TL.warn, border: `1px solid ${TL.warn}`, borderRadius: TL.radius.row, padding: "2px 7px" }}>
            Haster
          </span>
        )}
        {row.lowRisk && (
          <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: TL.mute, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, padding: "2px 7px" }}>
            Lavrisiko
          </span>
        )}
        <span style={{ fontFamily: TL.font.mono, fontSize: 10, letterSpacing: "0.04em", textTransform: "uppercase", color: TL.mute }}>{kildeLabel}</span>
        <span style={{ marginLeft: "auto", fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{row.when}</span>
      </div>

      <h3 style={{ margin: "8px 0 0", fontFamily: TL.font.sans, fontSize: 14.5, fontWeight: 600, color: TL.text }}>{row.title}</h3>
      {row.detail && (
        <p style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: 13, lineHeight: 1.55, color: TL.mute }}>{row.detail}</p>
      )}
      <div style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 6 }}>{handlingstypeLabel(row.actionType)}</div>

      {row.diffPreview && (
        <div style={{ margin: "10px 0 0", padding: "10px 14px", background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row }}>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 9, letterSpacing: "0.07em", textTransform: "uppercase", color: TL.mute, marginBottom: 4 }}>
            Dette endres
          </span>
          <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.text, overflowWrap: "anywhere" }}>{row.diffPreview}</span>
        </div>
      )}

      {row.hvorfor && (
        <details onClick={(e) => e.stopPropagation()} style={{ marginTop: 10 }}>
          <summary style={{ cursor: "pointer", fontFamily: TL.font.sans, fontSize: 12, fontWeight: 600, color: TL.mute }}>Hvorfor?</summary>
          <p style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: 12, lineHeight: 1.55, color: TL.mute }}>{row.hvorfor}</p>
        </details>
      )}

      <SakHandlinger row={row} mobile={mobile} />
    </article>
  );
}

/**
 * Sak-inspektøren (A2) — valgt sak i 380px-panelet: nok til å FORSTÅ
 * («Dette endres», «Hvorfor?») og AVGJØRE (samme handlinger som kortet,
 * samme server actions). Rutefasit.md §Claude-følelsen: panelet forklarer og
 * avgjør valgt sak — aldri en ny side. Ingen sak valgt → «Køen i tall»
 * (fasitens panelinnhold i agencyos-godkjenninger.html).
 */
function SakInspektor({ row }: { row: AdminGodkjenningV2Row }) {
  const kilde = row.kilde ?? "agent";
  const kildeLabel = kilde === "caddie" ? "caddie-utkast · melding" : kilde === "forespørsel" ? "forespørsel · fra spiller" : "agent · handlingssenter";
  return (
    <Inspektorpanel
      tittel={row.who}
      ariaLabel={`Valgt sak: ${row.who}`}
      tag={
        row.urgent ? (
          <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: TL.warn, border: `1px solid ${TL.warn}`, borderRadius: TL.radius.row, padding: "2px 7px" }}>
            Haster
          </span>
        ) : row.lowRisk ? (
          <span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: TL.mute, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, padding: "2px 7px" }}>
            Lavrisiko
          </span>
        ) : undefined
      }
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: TL.font.mono, fontSize: 10, letterSpacing: "0.04em", textTransform: "uppercase", color: TL.mute }}>{kildeLabel}</span>
        <span style={{ marginLeft: "auto", fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{row.when}</span>
      </div>

      <div>
        <h3 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 14.5, fontWeight: 600, color: TL.text }}>{row.title}</h3>
        {row.detail && (
          <p style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: 12.5, lineHeight: 1.55, color: TL.mute }}>{row.detail}</p>
        )}
        <div style={{ fontFamily: TL.font.mono, fontSize: 10, color: TL.mute, marginTop: 6 }}>{handlingstypeLabel(row.actionType)}</div>
      </div>

      {row.diffPreview && (
        <div style={{ padding: "10px 14px", background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row }}>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 9, letterSpacing: "0.07em", textTransform: "uppercase", color: TL.mute, marginBottom: 4 }}>
            Dette endres
          </span>
          <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.text, overflowWrap: "anywhere" }}>{row.diffPreview}</span>
        </div>
      )}

      {row.hvorfor && (
        <InspektorBlokk label="Hvorfor?">
          <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12, lineHeight: 1.55, color: TL.mute }}>{row.hvorfor}</p>
        </InspektorBlokk>
      )}

      <SakHandlinger row={row} mobile={false} />
    </Inspektorpanel>
  );
}

/** Fasitens aside — «Køen i tall»: KPI-rad, forklaring, kilder, bunn-CTA. */
function KøenITall({ data }: { data: AdminGodkjenningerV2Data }) {
  const totalt = data.totalt ?? data.rows.length;
  const kilder = data.kilder ?? { agent: 0, caddie: 0, forespørsel: 0 };
  return (
    <Inspektorpanel
      tittel="Køen i tall"
      ariaLabel="Køens tall"
      fot={data.lowRiskCount > 0 ? <GodkjennLavRisikoKnapp count={data.lowRiskCount} full /> : undefined}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <InspektorKpi label="Venter" verdi={String(totalt)} sub={`${kilder.agent} agent · ${kilder.caddie} caddie · ${kilder.forespørsel} fsp`} />
        <InspektorKpi label="Lavrisiko" verdi={String(data.lowRiskCount)} sub="kan godkjennes samlet" />
        <InspektorKpi label="Eldste" verdi={data.eldste?.dagerLabel ?? "—"} sub={data.eldste?.who ?? "Ingen i kø"} />
        <InspektorKpi label="Godkjent 7 dg" verdi={String(data.godkjent7Dager ?? 0)} sub={`${data.avvist7Dager ?? 0} avvist`} />
      </div>

      <div style={{ background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.row, padding: 12 }}>
        <Caps size={9}>Slik leses køen</Caps>
        <p style={{ margin: "8px 0 0", fontFamily: TL.font.sans, fontSize: 12, lineHeight: 1.55, color: TL.mute }}>
          Hvert forslag viser hva som faktisk endres før du sier ja. Har et forslag ingen «Dette endres»-linje, er
          det ingen planendring — da er det en melding eller en forespørsel.
        </p>
      </div>

      <InspektorBlokk label="Kilder">
        <KildeLinje label="Agent (PlanAction)" verdi={String(kilder.agent)} />
        <KildeLinje label="Caddie-utkast" verdi={String(kilder.caddie)} />
        <KildeLinje label="Økt-forespørsel" verdi={String(kilder.forespørsel)} />
        <KildeLinje label="E-postutkast" verdi="innboks" href="/admin/innboks" />
      </InspektorBlokk>
    </Inspektorpanel>
  );
}

function KildeLinje({ label, verdi, href }: { label: string; verdi: string; href?: string }) {
  const content = (
    <>
      <span style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.text }}>{label}</span>
      <span style={{ fontFamily: TL.font.mono, fontSize: 12, color: TL.mute }}>{verdi}</span>
    </>
  );
  if (href) {
    return (
      <Link href={href} style={{ display: "flex", justifyContent: "space-between", gap: 8, textDecoration: "none" }}>
        {content}
      </Link>
    );
  }
  return <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>{content}</div>;
}

export function AdminGodkjenningerV2({ data }: { data: AdminGodkjenningerV2Data }) {
  const mobile = useMediaQuery("(max-width: 767px)");
  const visPanel = useInspektorSynlig();
  const [filter, setFilter] = useState<FilterKey>("alle");
  // A2: valgt sak fyller inspektørpanelet; ingen valgt → «Køen i tall» (fasitens
  // panelinnhold). Klikk på valgt sak igjen går tilbake til køtallene. Godkjennes/
  // avvises saken, forsvinner den fra rows og panelet faller tilbake av seg selv.
  const [valgtId, setValgtId] = useState<string | null>(null);

  const kilder = data.kilder ?? { agent: 0, caddie: 0, forespørsel: 0 };
  const totalt = data.totalt ?? data.rows.length;
  const antallKilder = [kilder.agent, kilder.caddie, kilder.forespørsel].filter((n) => n > 0).length || 3;

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

  /* Rapporten vises under «Alle» og sitt eget filter — den er ikke en sak, så
     den skal ikke dukke opp under kilde-filtrene for beslutninger. */
  const visRapport = rapport != null && (filter === "alle" || filter === "rapport");

  const valgtSak = valgtId ? (data.rows.find((r) => r.id === valgtId) ?? null) : null;

  return (
    <MasterDetalj
      data-paper-slug="agencyos-godkjenninger"
      data-od-id="agencyos-godkjenninger"
      panel={valgtSak ? <SakInspektor row={valgtSak} /> : <KøenITall data={data} />}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
        {/* ── Hode ── */}
        <div data-paper-pattern-topp>
          <h1 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 17, fontWeight: 600, color: TL.text }}>Godkjenninger</h1>
          <span style={{ display: "block", fontFamily: TL.font.mono, fontSize: 10.5, color: TL.mute, marginTop: 2 }}>
            agencyos · én kø · {antallKilder} kilder
          </span>
        </div>

        {/* ── Kildefaner ── */}
        <div role="group" aria-label="Kilder" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {filtre.map((f) => {
            const aktiv = f.k === filter;
            return (
              <button
                key={f.k}
                type="button"
                aria-pressed={aktiv}
                onClick={() => setFilter(f.k)}
                className="v2-press v2-focus"
                data-od-id={`filter-${f.k}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 44,
                  padding: "0 16px",
                  borderRadius: TL.radius.pill,
                  border: `1px solid ${aktiv ? TL.text : TL.hair}`,
                  background: aktiv ? TL.text : TL.elev,
                  color: aktiv ? TL.scene : TL.text,
                  fontFamily: TL.font.sans,
                  fontSize: 12.5,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{f.n}</span>
                <span style={{ fontFamily: TL.font.mono, fontSize: 11, opacity: 0.75 }}>{f.antall}</span>
              </button>
            );
          })}
        </div>

        {/* ── Kø-hode: N venter på deg + ghost «godkjenn lavrisiko samlet» ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontFamily: TL.font.mono, fontSize: 22, fontWeight: 600, color: TL.text }}>{totalt}</span>
          <Caps size={9}>venter på deg</Caps>
          {data.lowRiskCount > 0 && (
            <div style={{ marginLeft: mobile ? undefined : "auto", width: mobile ? "100%" : undefined }}>
              <GodkjennLavRisikoKnapp count={data.lowRiskCount} full={mobile} />
            </div>
          )}
        </div>

        {/* ── Kø ── */}
        {visRapport && <RapportKort rapport={rapport!} />}
        {filtrert.length === 0 && !visRapport ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center", padding: "34px 24px", background: TL.dock, border: `1px dashed ${TL.hair}`, borderRadius: TL.radius.card }}>
            <Icon name="check-circle" size={20} style={{ color: TL.mute }} />
            <h3 style={{ margin: "6px 0 0", fontFamily: TL.font.sans, fontSize: 14.5, fontWeight: 600, color: TL.text }}>
              {data.rows.length === 0 ? "Køen er tom" : "Ingen saker i dette filteret"}
            </h3>
            <p style={{ margin: 0, maxWidth: "44ch", fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.55 }}>
              {data.rows.length === 0
                ? "Ingenting venter på godkjenning akkurat nå. Agentene sender nye forslag når det kommer inn nye runder, tester eller signaler fra spillerne dine."
                : "Bytt filter for å se resten av køen."}
            </p>
            {data.rows.length === 0 && (
              <Link href="/admin/spillere" className="v2-press v2-focus" style={{ ...knappStil("ghost"), marginTop: 6 }}>
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

        {/* ── Løst nylig ── */}
        {(data.lostSjekkpunkter?.length ?? 0) > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <h2 style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 14.5, fontWeight: 600, color: TL.text }}>Løst nylig</h2>
              <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>
                {pl(data.lostSjekkpunkter!.length, "sjekkpunkt", "sjekkpunkter")}
              </span>
            </div>
            <p style={{ margin: 0, fontFamily: TL.font.sans, fontSize: 12, color: TL.mute }}>
              Godkjente forslag med sjekkpunkt — de kommer tilbake hit når fristen er nådd.
            </p>
            <div style={{ background: TL.elev, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.card, padding: "4px 16px" }}>
              {data.lostSjekkpunkter!.map((l, i) => (
                <div
                  key={l.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "10px 0",
                    borderTop: i === 0 ? undefined : `1px solid ${TL.hair}`,
                    fontFamily: TL.font.sans,
                    fontSize: 12.5,
                    color: TL.text,
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    {l.who} · {l.sjekkpunkt}
                  </span>
                  <span style={{ flex: "none", fontFamily: TL.font.mono, fontSize: 11, color: TL.mute }}>{l.when}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MasterDetalj>
  );
}
