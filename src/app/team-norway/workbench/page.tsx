import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import type { CSSProperties } from "react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import type { TnBruker } from "@/lib/domain/tn-arbeidsflate";
import {
  hentTnWorkbenchKontekst,
  harTnPersonligPlanLesetilgang,
  kanRedigereTnGruppeplan,
  hentTnGruppePerioder,
  hentTnGruppeTimer,
  tnLagrePeriode,
  tnSlettPeriode,
  tnRullUtAarsplan,
  tnOpprettOkt,
  tnFlyttOkt,
  tnSlettOkt,
  tnPubliserOkt,
  tnKopierOkt,
  tnSettMal,
  tnRedigerOktInnhold,
  tnPubliserFlere,
  hentTnKilder,
  tnOpprettFraMal,
  tnLeggTilOvelseIOkt,
  hentTnTrainingSessionV2,
  hentTnTrainingPlanSession,
  osloMidnattUtc,
  type TnWorkbenchKontekst,
  type TnAnnenOktRad,
} from "@/lib/domain/tn-workbench";
import { loadWeek, loadMonth, loadYear, loadSession } from "@/lib/workbench/wb-actions";
import { mondayOf, monthStartOf, lastDayOfMonth, addDays } from "@/lib/domain/workbench/operations";
import { PYRAMID_LABEL, STATUS_LABEL, BLOCK_LABEL } from "@/lib/domain/workbench/labels";
import type { PyramidArea, RecurrencePolicy, WorkbenchMode, SourceItem } from "@/lib/domain/workbench/types";
import { TN } from "@/lib/v2/team-norway";
import { TnShell, TnSidehode, TnSeksjon, TnSpillerFaner } from "@/components/team-norway/tn-shell";
import { TnKort, TnPille, TnKnapp } from "@/components/team-norway/core";

export const dynamic = "force-dynamic";

/**
 * TN-22 Workbench/kalender (14.09.2026, rettet etter Codex-review samme dag
 * — `root-review-plan.md`).
 *
 * Alle skrivinger går via `src/lib/domain/tn-workbench.ts` (TN-rolleport +
 * roster-port + eierskapsport) — denne siden kaller ALDRI de delte
 * Workbench-/gruppeperiode-actionene direkte lenger. En TN-spiller som
 * navigerer hit sendes videre til sin egen, allerede riktig abonnements-
 * gatede side i stedet for å få en parallell redigeringsflate her (unngår å
 * la et gratisnivå bruke en FULL-funksjon via en TN-omvei).
 *
 */

const VISNINGER = ["periode", "aar", "maned", "uke", "dag"] as const;
type Visning = (typeof VISNINGER)[number];
const PYRAMIDER: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
const MANED_NAVN = ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"];

/** Norske etiketter for statusene på `TrainingSessionV2`/`TrainingPlanSession` — egne enum, adskilt fra Workbench sin `STATUS_LABEL`. */
const ANNEN_OKT_STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planlagt",
  ACTIVE: "Pågår",
  PAUSED: "Pauset",
  COMPLETED: "Fullført",
  ABANDONED: "Avbrutt",
  SKIPPED: "Hoppet over",
  CANCELLED: "Kansellert",
  IN_PROGRESS: "Pågår",
};

const ISO_DATO = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MANED = /^\d{4}-\d{2}$/;
const ISO_AAR = /^\d{4}$/;

function osloIdag(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

function parseVisning(raw: string | undefined, harSpiller: boolean): Visning {
  if (raw && (VISNINGER as readonly string[]).includes(raw)) return raw as Visning;
  return harSpiller ? "uke" : "periode";
}

function tnWorkbenchHref(params: { spiller?: string; visning?: Visning; dato?: string; okt?: string; feil?: string }): string {
  const q = new URLSearchParams();
  if (params.spiller) q.set("spiller", params.spiller);
  if (params.visning) q.set("visning", params.visning);
  if (params.dato) q.set("dato", params.dato);
  if (params.okt) q.set("okt", params.okt);
  if (params.feil) q.set("feil", params.feil);
  const qs = q.toString();
  return `/team-norway/workbench${qs ? `?${qs}` : ""}`;
}

function fmtDato(d: Date): string {
  return new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
}
function fmtTid(d: Date): string {
  return new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", hour: "2-digit", minute: "2-digit" }).format(d);
}
function fmtMinutt(m: number): string {
  const t = Math.max(0, Math.min(1439, m));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/** Statuser der `/portal/live/[id]` faktisk fører til en Live-/oppsummeringsside for ØKTEN — DRAFT/CANCELLED/SKIPPED sender viewer til SIN EGEN Workbench (feil kontekst for en TN-trener). */
function harLiveInngang(status: string): boolean {
  return status === "SCHEDULED" || status === "PUBLISHED" || status === "IN_PROGRESS" || status === "COMPLETED";
}

type Props = {
  searchParams: Promise<{ spiller?: string; visning?: string; dato?: string; okt?: string; feil?: string }>;
};

export default async function TeamNorwayWorkbenchPage({ searchParams }: Props) {
  const bruker = await requirePortalUser({ kreverTilgang: "INGEN" });
  const kontekst = await hentTnWorkbenchKontekst(bruker);
  if (!kontekst) notFound();

  // En TN-spiller får sin egen plan i PlayerHQs Workbench, som allerede har
  // riktig abonnementsgate (FULL) for redigering — ingen parallell
  // redigeringsflate bygges her for spillerens EGEN plan.
  if (kontekst.erSpiller) redirect("/portal/planlegge/workbench");

  const sp = await searchParams;
  const spillerParam = sp.spiller && z.string().min(1).max(64).safeParse(sp.spiller).success ? sp.spiller : undefined;
  const spillerId = spillerParam && kontekst.spillere.some((s) => s.id === spillerParam) ? spillerParam : undefined;
  const visning = parseVisning(sp.visning, !!spillerId);
  const idag = osloIdag();
  const datoRaw = sp.dato;
  const gruppeId = kontekst.gruppeId;

  // ---------------------------------------------------------------------
  // Server actions (inline "use server"). Hver funksjon henter FERSK bruker
  // (ikke den lukkede closure-verdien) og går alltid via TN-wrapperne i
  // tn-workbench.ts, som selv gjør TN-rolle-/roster-/eierskapsporten — ALDRI
  // de delte actionene direkte.
  // ---------------------------------------------------------------------

  async function opprettPeriode(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    if (!ferskKontekst) return;
    const input = {
      lPhase: String(form.get("lPhase") ?? ""),
      startDato: String(form.get("startDato") ?? ""),
      sluttDato: String(form.get("sluttDato") ?? ""),
      fokus: String(form.get("fokus") ?? ""),
      ukevolumMin: form.get("ukevolumMin") ? Number(form.get("ukevolumMin")) : undefined,
      ukevolumMax: form.get("ukevolumMax") ? Number(form.get("ukevolumMax")) : undefined,
    };
    const svar = await tnLagrePeriode(ferskBruker, ferskKontekst, input);
    redirect(tnWorkbenchHref({ visning: "periode", feil: svar.ok ? undefined : svar.feil }));
  }

  async function slettPeriode(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    if (!ferskKontekst) return;
    const periodeId = String(form.get("periodeId") ?? "");
    const svar = periodeId ? await tnSlettPeriode(ferskBruker, ferskKontekst, periodeId) : { ok: false as const, feil: "Mangler periode." };
    redirect(tnWorkbenchHref({ visning: "periode", feil: svar.ok ? undefined : svar.feil }));
  }

  async function rullUtAarsplan() {
    "use server";
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    if (!ferskKontekst) return;
    const svar = await tnRullUtAarsplan(ferskBruker, ferskKontekst);
    redirect(tnWorkbenchHref({ visning: "periode", feil: svar.ok ? undefined : svar.feil }));
  }

  async function opprettOkt(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    const malSpillerId = String(form.get("spillerId") ?? "");
    if (!ferskKontekst || !malSpillerId) return;
    const dato = String(form.get("dato") ?? "");
    const [t, m] = String(form.get("tid") ?? "08:00").split(":").map(Number);
    const svar = await tnOpprettOkt(ferskBruker, ferskKontekst, malSpillerId, {
      date: dato,
      startMinute: (Number.isFinite(t) ? t : 8) * 60 + (Number.isFinite(m) ? m : 0),
      durationMinutes: Number(form.get("varighet") ?? 60),
      title: String(form.get("tittel") ?? "Økt"),
      pyramid: (String(form.get("pyramid") ?? "TEK")) as PyramidArea,
    });
    redirect(tnWorkbenchHref({ spiller: malSpillerId, visning: "uke", dato, feil: svar.ok ? undefined : svar.feil }));
  }

  async function flyttOkt(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    const malSpillerId = String(form.get("spillerId") ?? "");
    const sessionId = String(form.get("sessionId") ?? "");
    if (!ferskKontekst || !malSpillerId || !sessionId) return;
    const dato = String(form.get("nyDato") ?? "");
    const [t, m] = String(form.get("nyTid") ?? "08:00").split(":").map(Number);
    const svar = await tnFlyttOkt(ferskBruker, ferskKontekst, malSpillerId, {
      sessionId,
      newDate: dato,
      newStartMinute: (Number.isFinite(t) ? t : 8) * 60 + (Number.isFinite(m) ? m : 0),
    });
    redirect(tnWorkbenchHref({ spiller: malSpillerId, visning: "dag", dato, okt: sessionId, feil: svar.ok ? undefined : svar.feil }));
  }

  async function slettOkt(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    const malSpillerId = String(form.get("spillerId") ?? "");
    const sessionId = String(form.get("sessionId") ?? "");
    if (!ferskKontekst || !malSpillerId || !sessionId) return;
    const bekreft = String(form.get("bekreft") ?? "");
    const svar = await tnSlettOkt(ferskBruker, ferskKontekst, malSpillerId, sessionId, bekreft);
    redirect(tnWorkbenchHref({ spiller: malSpillerId, visning: "uke", feil: svar.ok ? undefined : svar.feil }));
  }

  async function publiserOkt(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    const malSpillerId = String(form.get("spillerId") ?? "");
    const sessionId = String(form.get("sessionId") ?? "");
    if (!ferskKontekst || !malSpillerId || !sessionId) return;
    const svar = await tnPubliserOkt(ferskBruker, ferskKontekst, malSpillerId, sessionId);
    redirect(tnWorkbenchHref({ spiller: malSpillerId, visning: "dag", okt: sessionId, feil: svar.ok ? undefined : svar.feil }));
  }

  async function kopierOkt(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    const malSpillerId = String(form.get("spillerId") ?? "");
    const kildeSessionId = String(form.get("sessionId") ?? "");
    if (!ferskKontekst || !malSpillerId || !kildeSessionId) return;
    const nyDato = String(form.get("nyDato") ?? "");
    const [t, m] = String(form.get("nyTid") ?? "08:00").split(":").map(Number);
    const svar = await tnKopierOkt(ferskBruker, ferskKontekst, malSpillerId, {
      kildeSessionId,
      nyDato,
      nyStartMinutt: (Number.isFinite(t) ? t : 8) * 60 + (Number.isFinite(m) ? m : 0),
    });
    redirect(tnWorkbenchHref({ spiller: malSpillerId, visning: "dag", dato: nyDato, feil: svar.ok ? undefined : svar.feil }));
  }

  async function settMal(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    const malSpillerId = String(form.get("spillerId") ?? "");
    const sessionId = String(form.get("sessionId") ?? "");
    if (!ferskKontekst || !malSpillerId || !sessionId) return;
    const erMal = String(form.get("erMal") ?? "") === "true";
    const svar = await tnSettMal(ferskBruker, ferskKontekst, malSpillerId, sessionId, erMal);
    redirect(tnWorkbenchHref({ spiller: malSpillerId, visning: "dag", okt: sessionId, feil: svar.ok ? undefined : svar.feil }));
  }

  async function redigerOktInnhold(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    const malSpillerId = String(form.get("spillerId") ?? "");
    const sessionId = String(form.get("sessionId") ?? "");
    if (!ferskKontekst || !malSpillerId || !sessionId) return;
    const policy = String(form.get("policy") ?? "DENNE") as RecurrencePolicy;
    const svar = await tnRedigerOktInnhold(ferskBruker, ferskKontekst, malSpillerId, {
      sessionId,
      policy,
      patch: {
        title: String(form.get("tittel") ?? "") || undefined,
        pyramid: (String(form.get("pyramid") ?? "") || undefined) as PyramidArea | undefined,
        // Aldri konverter en tom streng til undefined her: notater-feltet skal
        // kunne tømmes bevisst. `undefined` betyr «ikke rør feltet», "" betyr
        // «fjern teksten» — begge må kunne uttrykkes, og skjemaet sender alltid
        // feltet (forhåndsutfylt via defaultValue), så den tomme verdien er
        // alltid en bevisst handling, aldri en utilsiktet forglemmelse.
        notes: String(form.get("notater") ?? ""),
      },
    });
    redirect(tnWorkbenchHref({ spiller: malSpillerId, visning: "dag", okt: sessionId, feil: svar.ok ? undefined : svar.feil }));
  }

  async function publiserFlere(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    const malSpillerId = String(form.get("spillerId") ?? "");
    if (!ferskKontekst || !malSpillerId) return;
    const sessionIds = form.getAll("sessionId").map(String).filter(Boolean);
    const svar = await tnPubliserFlere(ferskBruker, ferskKontekst, malSpillerId, sessionIds);
    redirect(tnWorkbenchHref({ spiller: malSpillerId, visning: "uke", dato: datoRaw, feil: svar.ok ? undefined : svar.feil }));
  }

  async function opprettFraKilde(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    const malSpillerId = String(form.get("spillerId") ?? "");
    const sourceId = String(form.get("sourceId") ?? "");
    if (!ferskKontekst || !malSpillerId || !sourceId) return;
    const nyDato = String(form.get("dato") ?? "");
    const [t, m] = String(form.get("tid") ?? "08:00").split(":").map(Number);
    const svar = await tnOpprettFraMal(ferskBruker, ferskKontekst, malSpillerId, {
      sourceId,
      dato: nyDato,
      startMinutt: (Number.isFinite(t) ? t : 8) * 60 + (Number.isFinite(m) ? m : 0),
    });
    redirect(tnWorkbenchHref({ spiller: malSpillerId, visning: "dag", dato: nyDato, feil: svar.ok ? undefined : svar.feil }));
  }

  async function leggTilOvelse(form: FormData) {
    "use server";
    const ferskBruker = await requirePortalUser({ kreverTilgang: "INGEN" });
    const ferskKontekst = await hentTnWorkbenchKontekst(ferskBruker);
    const malSpillerId = String(form.get("spillerId") ?? "");
    const sessionId = String(form.get("sessionId") ?? "");
    const sourceId = String(form.get("sourceId") ?? "");
    if (!ferskKontekst || !malSpillerId || !sessionId || !sourceId) return;
    const svar = await tnLeggTilOvelseIOkt(ferskBruker, ferskKontekst, malSpillerId, { sessionId, sourceId });
    redirect(tnWorkbenchHref({ spiller: malSpillerId, visning: "dag", okt: sessionId, feil: svar.ok ? undefined : svar.feil }));
  }

  return (
    <TnShell
      aktiv="workbench"
      brukerNavn={bruker.name ?? "Ukjent"}
      rolle="Trener"
      groupId={gruppeId}
      visTrenerflater={kontekst.erTrener}
      kanAdministrere={kontekst.kanAdministrere}
    >
      <TnSidehode
        overlinje={`TN-22 · ${kontekst.gruppeNavn}`}
        tittel="Workbench"
        ingress="Gruppens årsplan og faste tider, og — når du har personlig trener-tilgang til spilleren — plan, uke og øktdetalj."
      />

      {spillerId && (
        <TnSpillerFaner
          spillerId={spillerId}
          spillerNavn={kontekst.spillere.find((s) => s.id === spillerId)?.navn ?? spillerId}
          aktiv="workbench"
          kanAdministrere={!kontekst.erSpiller}
        />
      )}

      {sp.feil && (
        <p role="alert" style={{ margin: 0, padding: 12, borderRadius: TN.radius.sm, background: TN.status.redBg, color: TN.status.redText, fontSize: TN.text.sm }}>
          {sp.feil}
        </p>
      )}

      <TnSeksjon tittel="Velg spiller">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href={tnWorkbenchHref({ visning: "periode" })} style={pilleLenkeStil(!spillerId)}>
            Gruppe · {kontekst.gruppeNavn}
          </Link>
          {kontekst.spillere.map((s) => (
            <Link key={s.id} href={tnWorkbenchHref({ spiller: s.id, visning: "uke" })} style={pilleLenkeStil(spillerId === s.id)}>
              {s.navn}
            </Link>
          ))}
        </div>
      </TnSeksjon>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(spillerId ? (["aar", "maned", "uke", "dag"] as Visning[]) : (["periode", "aar", "maned", "uke"] as Visning[])).map((v) => (
          <Link key={v} href={tnWorkbenchHref({ spiller: spillerId, visning: v, dato: datoRaw })} style={pilleLenkeStil(visning === v)}>
            {VISNING_LABEL[v]}
          </Link>
        ))}
      </div>

      {spillerId ? (
        await renderPersonligPlan({ bruker, kontekst, spillerId, visning, datoRaw, idag, opprettOkt, flyttOkt, slettOkt, publiserOkt, kopierOkt, settMal, redigerOktInnhold, publiserFlere, opprettFraKilde, leggTilOvelse, okt: sp.okt })
      ) : (
        await renderGruppeplan({ bruker, kontekst, visning, datoRaw, idag, opprettPeriode, slettPeriode, rullUtAarsplan })
      )}
    </TnShell>
  );
}

const VISNING_LABEL: Record<Visning, string> = { periode: "Periode", aar: "År", maned: "Måned", uke: "Uke", dag: "Dag" };

function pilleLenkeStil(aktiv: boolean): CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    minHeight: 36,
    padding: "6px 14px",
    borderRadius: TN.radius.full,
    fontSize: TN.text.sm,
    fontWeight: TN.weight.semibold,
    textDecoration: "none",
    background: aktiv ? TN.navy900 : TN.white,
    color: aktiv ? TN.white : TN.navy900,
    border: `1px solid ${aktiv ? TN.navy900 : TN.borderDefault}`,
  };
}

// ---------------------------------------------------------------------------
// Gruppenivå: GroupPeriodBlock (årsplan) + GroupSchedule (faste tider)
// ---------------------------------------------------------------------------

type BrukerArg = TnBruker;

async function renderGruppeplan(args: {
  bruker: BrukerArg;
  kontekst: TnWorkbenchKontekst;
  visning: Visning;
  datoRaw: string | undefined;
  idag: string;
  opprettPeriode: (form: FormData) => Promise<void>;
  slettPeriode: (form: FormData) => Promise<void>;
  rullUtAarsplan: () => Promise<void>;
}) {
  const { bruker, kontekst, visning, datoRaw, idag, opprettPeriode, slettPeriode, rullUtAarsplan } = args;
  const kanRedigere = await kanRedigereTnGruppeplan(bruker, kontekst);

  if (visning === "periode") {
    const perioder = await hentTnGruppePerioder(kontekst.gruppeId);
    return (
      <TnSeksjon tittel="Årsplan — periodeblokker" forklaring="Perioder for hele gruppen. Redigering krever trener-rolle i gruppen.">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {perioder.length === 0 && <TnKort><p style={{ margin: 0, color: TN.textSecondary }}>Ingen periodeblokker registrert ennå.</p></TnKort>}
          {perioder.map((p) => (
            <TnKort key={p.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <TnPille tone="navy">{p.lPhase}</TnPille>
                  <p style={{ margin: "8px 0 0", fontWeight: TN.weight.semibold }}>{fmtDato(p.startDate)} – {fmtDato(p.endDate)}</p>
                  {p.focus && <p style={{ margin: "4px 0 0", color: TN.textSecondary, fontSize: TN.text.sm }}>{p.focus}</p>}
                  {(p.weeklyVolMin || p.weeklyVolMax) && (
                    <p style={{ margin: "4px 0 0", color: TN.textSecondary, fontSize: TN.text.xs, fontFamily: TN.font.mono }}>
                      Ukevolum {p.weeklyVolMin ?? "—"}–{p.weeklyVolMax ?? "—"} t
                    </p>
                  )}
                </div>
                {kanRedigere && (
                  <form action={slettPeriode}>
                    <input type="hidden" name="periodeId" value={p.id} />
                    <TnKnapp type="submit" variant="tekst">Slett</TnKnapp>
                  </form>
                )}
              </div>
            </TnKort>
          ))}
        </div>

        {kanRedigere ? (
          <TnKort>
            <form action={opprettPeriode} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ margin: 0, fontWeight: TN.weight.semibold }}>Ny periodeblokk</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
                <label style={feltLabelStil}>Fase
                  <select name="lPhase" required style={feltInputStil}>
                    {["GRUNN", "SPESIALISERING", "TURNERING"].map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </label>
                <label style={feltLabelStil}>Start<input type="date" name="startDato" required style={feltInputStil} /></label>
                <label style={feltLabelStil}>Slutt<input type="date" name="sluttDato" required style={feltInputStil} /></label>
                <label style={feltLabelStil}>Ukevolum min (t)<input type="number" name="ukevolumMin" min={0} style={feltInputStil} /></label>
                <label style={feltLabelStil}>Ukevolum maks (t)<input type="number" name="ukevolumMax" min={0} style={feltInputStil} /></label>
              </div>
              <label style={feltLabelStil}>Fokus<input type="text" name="fokus" maxLength={200} style={feltInputStil} /></label>
              <div><TnKnapp type="submit" variant="primaer">Lagre periode</TnKnapp></div>
            </form>
          </TnKort>
        ) : (
          <TnKort><p style={{ margin: 0, color: TN.textSecondary, fontSize: TN.text.sm }}>Du har lesetilgang til årsplanen, men ikke rettigheten til å redigere den.</p></TnKort>
        )}

        {kanRedigere && perioder.length > 0 && (
          <form action={rullUtAarsplan}>
            <TnKnapp type="submit" variant="sekundaer">Rull ut årsplanen til gruppens spillere</TnKnapp>
          </form>
        )}
      </TnSeksjon>
    );
  }

  if (visning === "aar") {
    const year = datoRaw && ISO_AAR.test(datoRaw) ? Number(datoRaw) : Number(idag.slice(0, 4));
    const perioder = await hentTnGruppePerioder(kontekst.gruppeId);
    const iAar = perioder.filter((p) => p.startDate.getUTCFullYear() <= year && p.endDate.getUTCFullYear() >= year);
    return (
      <TnSeksjon tittel={`${year}`}>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={tnWorkbenchHref({ visning: "aar", dato: String(year - 1) })} style={pilleLenkeStil(false)}>← {year - 1}</Link>
          <Link href={tnWorkbenchHref({ visning: "aar", dato: String(year + 1) })} style={pilleLenkeStil(false)}>{year + 1} →</Link>
        </div>
        {iAar.length === 0 ? <TnKort><p style={{ margin: 0, color: TN.textSecondary }}>Ingen periodeblokker i {year}.</p></TnKort> : iAar.map((p) => (
          <TnKort key={p.id}><TnPille tone="navy">{p.lPhase}</TnPille><p style={{ margin: "6px 0 0" }}>{fmtDato(p.startDate)} – {fmtDato(p.endDate)}{p.focus ? ` · ${p.focus}` : ""}</p></TnKort>
        ))}
      </TnSeksjon>
    );
  }

  // maned / uke — GroupSchedule i vinduet
  const referanse = datoRaw && ISO_DATO.test(datoRaw) ? datoRaw : idag;
  const fraTil = visning === "uke"
    ? { fra: mondayOf(referanse), til: addDays(mondayOf(referanse), 6) }
    : { fra: monthStartOf(referanse), til: lastDayOfMonth(monthStartOf(referanse)) };
  const timer = await hentTnGruppeTimer(kontekst.gruppeId, fraTil.fra, fraTil.til);
  return (
    <TnSeksjon tittel={visning === "uke" ? `Uke — ${fmtDato(new Date(`${fraTil.fra}T12:00:00Z`))}` : `Måned — ${fraTil.fra.slice(0, 7)}`}>
      {timer.length === 0 ? (
        <TnKort><p style={{ margin: 0, color: TN.textSecondary }}>Ingen faste gruppetider i dette vinduet.</p></TnKort>
      ) : timer.map((t) => (
        <TnKort key={t.id}>
          <p style={{ margin: 0, fontWeight: TN.weight.semibold }}>{t.title}</p>
          <p style={{ margin: "4px 0 0", color: TN.textSecondary, fontSize: TN.text.sm, fontFamily: TN.font.mono }}>
            {fmtDato(t.startAt)} · {fmtTid(t.startAt)}–{fmtTid(t.endAt)}{t.location ? ` · ${t.location}` : ""}
          </p>
        </TnKort>
      ))}
      {kanRedigere && (
        <Link href={`/admin/grupper/${kontekst.gruppeId}/timeplan`} style={{ color: TN.navy700, fontSize: TN.text.sm, fontWeight: TN.weight.semibold }}>
          Rediger faste gruppetider i AgencyOS →
        </Link>
      )}
    </TnSeksjon>
  );
}

// ---------------------------------------------------------------------------
// Personlig plan (spiller valgt) — reell plan via de TN-portede skrivewrapperne
// ---------------------------------------------------------------------------

async function renderPersonligPlan(args: {
  bruker: BrukerArg;
  kontekst: TnWorkbenchKontekst;
  spillerId: string;
  visning: Visning;
  datoRaw: string | undefined;
  idag: string;
  opprettOkt: (form: FormData) => Promise<void>;
  flyttOkt: (form: FormData) => Promise<void>;
  slettOkt: (form: FormData) => Promise<void>;
  publiserOkt: (form: FormData) => Promise<void>;
  kopierOkt: (form: FormData) => Promise<void>;
  settMal: (form: FormData) => Promise<void>;
  redigerOktInnhold: (form: FormData) => Promise<void>;
  publiserFlere: (form: FormData) => Promise<void>;
  opprettFraKilde: (form: FormData) => Promise<void>;
  leggTilOvelse: (form: FormData) => Promise<void>;
  okt?: string;
}) {
  const { bruker, kontekst, spillerId, visning, datoRaw, idag, opprettOkt, flyttOkt, slettOkt, publiserOkt, kopierOkt, settMal, redigerOktInnhold, publiserFlere, opprettFraKilde, leggTilOvelse, okt } = args;

  const harLesetilgang = await harTnPersonligPlanLesetilgang(bruker, kontekst, spillerId);
  if (!harLesetilgang) {
    return (
      <TnSeksjon tittel="Ingen personlig plan-tilgang">
        <TnKort>
          <p style={{ margin: 0, color: TN.textSecondary }}>
            Du er trener i Team Norway, men ikke denne spillerens personlige coach — TN-rollen alene gir ikke tilgang til
            den individuelle planen. Kun gruppens årsplan og faste tider er tilgjengelig for deg over.
          </p>
        </TnKort>
      </TnSeksjon>
    );
  }
  const kanSkrive = kontekst.kanAdministrere;

  const mode: WorkbenchMode = { kind: "AGENCY", subjectId: spillerId, sources: ["OEKTER"] };

  if (okt) {
    const detalj = await loadSession(okt);
    if (detalj.ok && detalj.data && detalj.data.playerId === spillerId) {
      const s = detalj.data;
      return (
        <TnSeksjon tittel="Øktdetalj">
          <TnKort>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <TnPille tone={s.status === "COMPLETED" ? "green" : s.status === "PUBLISHED" ? "navy" : "nøytral"}>{STATUS_LABEL[s.status]}</TnPille>
                <p style={{ margin: "8px 0 0", fontWeight: TN.weight.semibold, fontSize: TN.text.h3 }}>{s.title}</p>
                <p style={{ margin: "4px 0 0", color: TN.textSecondary, fontSize: TN.text.sm }}>
                  {PYRAMID_LABEL[s.pyramid]} · {BLOCK_LABEL[s.blockType]} · {s.date} {fmtMinutt(s.startMinute)}–{fmtMinutt(s.startMinute + s.durationMinutes)}
                </p>
                {s.notes && <p style={{ margin: "8px 0 0", fontSize: TN.text.sm }}>{s.notes}</p>}
              </div>
              {kanSkrive && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                  {harLiveInngang(s.status) ? (
                    <Link href={`/portal/live/${s.id}`} style={pilleLenkeStil(false)}>Gå til spillerens Live/oppsummering</Link>
                  ) : (
                    <p style={{ margin: 0, color: TN.textSecondary, fontSize: TN.text.xs }}>Ingen Live-inngang før økten er planlagt/publisert.</p>
                  )}
                  {s.status === "SCHEDULED" || s.status === "DRAFT" ? (
                    <form action={publiserOkt}>
                      <input type="hidden" name="spillerId" value={spillerId} />
                      <input type="hidden" name="sessionId" value={s.id} />
                      <TnKnapp type="submit" variant="sekundaer">Publiser — spilleren ser den etterpå</TnKnapp>
                    </form>
                  ) : null}
                  <form action={flyttOkt} style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                    <input type="hidden" name="spillerId" value={spillerId} />
                    <input type="hidden" name="sessionId" value={s.id} />
                    <label style={feltLabelStil}>Ny dato<input type="date" name="nyDato" defaultValue={s.date} style={feltInputStil} /></label>
                    <label style={feltLabelStil}>Ny tid<input type="time" name="nyTid" defaultValue={fmtMinutt(s.startMinute)} style={feltInputStil} /></label>
                    <TnKnapp type="submit" variant="sekundaer">Flytt</TnKnapp>
                  </form>
                  <form action={slettOkt} style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
                    <input type="hidden" name="spillerId" value={spillerId} />
                    <input type="hidden" name="sessionId" value={s.id} />
                    <label style={feltLabelStil}>Skriv SLETT for å bekrefte<input type="text" name="bekreft" style={feltInputStil} /></label>
                    <TnKnapp type="submit" variant="tekst">Slett</TnKnapp>
                  </form>
                </div>
              )}
            </div>
          </TnKort>

          {kanSkrive && (
            <TnKort>
              <p style={{ margin: 0, fontWeight: TN.weight.semibold, fontSize: TN.text.sm }}>Kopier, mal og rediger</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                <form action={kopierOkt} style={{ display: "flex", gap: 6, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <input type="hidden" name="spillerId" value={spillerId} />
                  <input type="hidden" name="sessionId" value={s.id} />
                  <label style={feltLabelStil}>Kopier til dato<input type="date" name="nyDato" required style={feltInputStil} /></label>
                  <label style={feltLabelStil}>Tid<input type="time" name="nyTid" defaultValue={fmtMinutt(s.startMinute)} style={feltInputStil} /></label>
                  <TnKnapp type="submit" variant="sekundaer" size="sm">Kopier økten</TnKnapp>
                </form>

                <form action={settMal} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input type="hidden" name="spillerId" value={spillerId} />
                  <input type="hidden" name="sessionId" value={s.id} />
                  <input type="hidden" name="erMal" value={s.isTemplate ? "false" : "true"} />
                  <TnKnapp type="submit" variant="sekundaer" size="sm">{s.isTemplate ? "Fjern som mal" : "Lagre som mal"}</TnKnapp>
                  {s.isTemplate && <span style={{ fontSize: TN.text.xs, color: TN.textSecondary }}>Vises i kildepanelet under «Maler» for denne spilleren.</span>}
                </form>

                <form action={redigerOktInnhold} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <input type="hidden" name="spillerId" value={spillerId} />
                  <input type="hidden" name="sessionId" value={s.id} />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 8 }}>
                    <label style={feltLabelStil}>Tittel<input type="text" name="tittel" defaultValue={s.title} style={feltInputStil} /></label>
                    <label style={feltLabelStil}>Område
                      <select name="pyramid" defaultValue={s.pyramid} style={feltInputStil}>
                        {PYRAMIDER.map((p) => <option key={p} value={p}>{PYRAMID_LABEL[p]}</option>)}
                      </select>
                    </label>
                    {s.seriesId && (
                      <label style={feltLabelStil}>Gjelder
                        <select name="policy" style={feltInputStil}>
                          <option value="DENNE">Kun denne økten</option>
                          <option value="DENNE_OG_FREMOVER">Denne og fremover</option>
                          <option value="HELE_SERIEN">Hele serien</option>
                        </select>
                      </label>
                    )}
                  </div>
                  <label style={feltLabelStil}>Notater<textarea name="notater" defaultValue={s.notes ?? ""} style={{ ...feltInputStil, minHeight: 60 }} /></label>
                  <div><TnKnapp type="submit" variant="sekundaer" size="sm">Lagre endringer</TnKnapp></div>
                </form>
              </div>
            </TnKort>
          )}

          {kanSkrive && await renderLeggTilOvelse({ spillerId, sessionId: s.id, bruker, kontekst, leggTilOvelse })}

          <Link href={tnWorkbenchHref({ spiller: spillerId, visning: "uke", dato: s.date })} style={{ color: TN.navy700, fontSize: TN.text.sm }}>← Tilbake til uken</Link>
        </TnSeksjon>
      );
    }
  }

  if (visning === "aar") {
    const year = datoRaw && ISO_AAR.test(datoRaw) ? Number(datoRaw) : Number(idag.slice(0, 4));
    const res = await loadYear({ year, mode, playerId: spillerId });
    if (!res.ok) return <TnKort><p style={{ margin: 0, color: TN.status.redText }}>{res.error}</p></TnKort>;
    const [andreV2Aar, andrePlanAar] = await Promise.all([
      hentTnTrainingSessionV2(spillerId, osloMidnattUtc(`${year}-01-01`), osloMidnattUtc(`${year + 1}-01-01`)),
      hentTnTrainingPlanSession(spillerId, osloMidnattUtc(`${year}-01-01`), osloMidnattUtc(`${year + 1}-01-01`)),
    ]);
    const andreAntallAar = andreV2Aar.length + andrePlanAar.length;
    return (
      <TnSeksjon tittel={`${year}`}>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={tnWorkbenchHref({ spiller: spillerId, visning: "aar", dato: String(year - 1) })} style={pilleLenkeStil(false)}>← {year - 1}</Link>
          <Link href={tnWorkbenchHref({ spiller: spillerId, visning: "aar", dato: String(year + 1) })} style={pilleLenkeStil(false)}>{year + 1} →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>
          {res.data.months.map((m) => (
            <Link key={m.monthStart} href={tnWorkbenchHref({ spiller: spillerId, visning: "maned", dato: m.monthStart.slice(0, 7) })} style={{ textDecoration: "none" }}>
              <TnKort>
                <p style={{ margin: 0, fontWeight: TN.weight.semibold }}>{MANED_NAVN[m.monthIndex - 1]}</p>
                <p style={{ margin: "4px 0 0", color: TN.textSecondary, fontSize: TN.text.sm, fontFamily: TN.font.mono }}>
                  {m.sessionCount} Workbench-{m.sessionCount === 1 ? "økt" : "økter"}{m.dominantPyramid ? ` · ${PYRAMID_LABEL[m.dominantPyramid]}` : ""}
                </p>
                {m.eventLabels.length > 0 && <p style={{ margin: "4px 0 0", fontSize: TN.text.xs, color: TN.textSecondary }}>{m.eventLabels.join(", ")}</p>}
              </TnKort>
            </Link>
          ))}
        </div>
        {andreAntallAar > 0 && (
          <TnKort>
            <p style={{ margin: 0, fontSize: TN.text.sm, color: TN.textSecondary }}>
              + {andreAntallAar} {andreAntallAar === 1 ? "økt" : "økter"} dette året i eldre/parallelle modeller (kalender- og planøkter) —
              vises separat i dagsvisningen, ikke i tallene over.
            </p>
          </TnKort>
        )}
      </TnSeksjon>
    );
  }

  if (visning === "maned") {
    const monthStart = datoRaw && ISO_MANED.test(datoRaw) ? `${datoRaw}-01` : monthStartOf(idag);
    const res = await loadMonth({ monthStart, mode, playerId: spillerId });
    if (!res.ok) return <TnKort><p style={{ margin: 0, color: TN.status.redText }}>{res.error}</p></TnKort>;
    const dager = res.data.weeks.flatMap((w) => w.days).filter((d) => d.lines.length > 0);
    const forrigeManed = addDays(monthStart, -1).slice(0, 7);
    const nesteManed = monthStartOf(addDays(lastDayOfMonth(monthStart), 1)).slice(0, 7);
    const [andreV2Maned, andrePlanManed] = await Promise.all([
      hentTnTrainingSessionV2(spillerId, osloMidnattUtc(monthStart), osloMidnattUtc(`${nesteManed}-01`)),
      hentTnTrainingPlanSession(spillerId, osloMidnattUtc(monthStart), osloMidnattUtc(`${nesteManed}-01`)),
    ]);
    const andreAntallManed = andreV2Maned.length + andrePlanManed.length;
    return (
      <TnSeksjon tittel={monthStart.slice(0, 7)}>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={tnWorkbenchHref({ spiller: spillerId, visning: "maned", dato: forrigeManed })} style={pilleLenkeStil(false)}>← Forrige måned</Link>
          <Link href={tnWorkbenchHref({ spiller: spillerId, visning: "maned", dato: idag.slice(0, 7) })} style={pilleLenkeStil(false)}>Denne måneden</Link>
          <Link href={tnWorkbenchHref({ spiller: spillerId, visning: "maned", dato: nesteManed })} style={pilleLenkeStil(false)}>Neste måned →</Link>
        </div>
        {dager.length === 0 ? <TnKort><p style={{ margin: 0, color: TN.textSecondary }}>Ingen Workbench-økter denne måneden.</p></TnKort> : null}
        {dager.map((d) => (
          <Link key={d.date} href={tnWorkbenchHref({ spiller: spillerId, visning: "dag", dato: d.date })} style={{ textDecoration: "none" }}>
            <TnKort>
              <p style={{ margin: 0, fontSize: TN.text.sm }}>
                <strong>{d.date}</strong> · {d.lines.map((l) => l.title).join(", ")}{d.restCount > 0 ? ` +${d.restCount} mer` : ""}
              </p>
            </TnKort>
          </Link>
        ))}
        {andreAntallManed > 0 && (
          <TnKort>
            <p style={{ margin: 0, fontSize: TN.text.sm, color: TN.textSecondary }}>
              + {andreAntallManed} {andreAntallManed === 1 ? "økt" : "økter"} denne måneden i eldre/parallelle modeller (kalender- og
              planøkter) — vises separat i dagsvisningen, ikke i listen over.
            </p>
          </TnKort>
        )}
      </TnSeksjon>
    );
  }

  const dag = datoRaw && ISO_DATO.test(datoRaw) ? datoRaw : idag;
  const weekStart = mondayOf(dag);
  const res = await loadWeek({ weekStart, mode, playerId: spillerId });
  if (!res.ok) return <TnKort><p style={{ margin: 0, color: TN.status.redText }}>{res.error}</p></TnKort>;
  const alleUkensOkter = res.data.days.flatMap((d) => d.sessions);
  const dagsokter = visning === "dag" ? alleUkensOkter.filter((s) => s.date === dag) : alleUkensOkter;
  const ikkePublisert = dagsokter.filter((s) => s.status === "DRAFT" || s.status === "SCHEDULED");

  const [andreV2, andrePlan] = await Promise.all([
    hentTnTrainingSessionV2(spillerId, osloMidnattUtc(weekStart), osloMidnattUtc(addDays(weekStart, 7))),
    hentTnTrainingPlanSession(spillerId, osloMidnattUtc(weekStart), osloMidnattUtc(addDays(weekStart, 7))),
  ]);
  const andreOkter: TnAnnenOktRad[] = visning === "dag"
    ? [...andreV2, ...andrePlan].filter((r) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(r.start) === dag)
    : [...andreV2, ...andrePlan];

  return (
    <TnSeksjon
      tittel={visning === "dag" ? fmtDato(new Date(`${dag}T12:00:00Z`)) : `Uke fra ${weekStart}`}
      forklaring="Samme plan som spilleren ser i PlayerHQ — endringer her er ekte og gjelder umiddelbart."
    >
      <div style={{ display: "flex", gap: 8 }}>
        <Link href={tnWorkbenchHref({ spiller: spillerId, visning, dato: addDays(visning === "dag" ? dag : weekStart, visning === "dag" ? -1 : -7) })} style={pilleLenkeStil(false)}>← Forrige</Link>
        <Link href={tnWorkbenchHref({ spiller: spillerId, visning, dato: idag })} style={pilleLenkeStil(false)}>I dag</Link>
        <Link href={tnWorkbenchHref({ spiller: spillerId, visning, dato: addDays(visning === "dag" ? dag : weekStart, visning === "dag" ? 1 : 7) })} style={pilleLenkeStil(false)}>Neste →</Link>
      </div>

      {dagsokter.length === 0 ? (
        <TnKort><p style={{ margin: 0, color: TN.textSecondary }}>Ingen økter i dette vinduet.</p></TnKort>
      ) : dagsokter.map((s) => (
        <Link key={s.id} href={tnWorkbenchHref({ spiller: spillerId, visning: "dag", dato: s.date, okt: s.id })} style={{ textDecoration: "none" }}>
          <TnKort>
            <p style={{ margin: 0, fontSize: TN.text.sm }}>
              <strong>{s.date} {fmtMinutt(s.startMinute)}</strong> · {s.title} · {PYRAMID_LABEL[s.pyramid]} · <TnPille tone={s.status === "COMPLETED" ? "green" : "nøytral"}>{STATUS_LABEL[s.status]}</TnPille>
            </p>
          </TnKort>
        </Link>
      ))}

      {kanSkrive && ikkePublisert.length > 0 && (
        <TnKort>
          <p style={{ margin: 0, fontWeight: TN.weight.semibold, fontSize: TN.text.sm }}>Gjennomgå og publiser</p>
          <p style={{ margin: "4px 0 12px", color: TN.textSecondary, fontSize: TN.text.xs }}>
            Se gjennom hele utvalget under før du publiserer — spilleren ser de valgte øktene med én gang.
          </p>
          <form action={publiserFlere} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input type="hidden" name="spillerId" value={spillerId} />
            {ikkePublisert.map((s) => (
              <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: TN.text.sm }}>
                <input type="checkbox" name="sessionId" value={s.id} />
                <span>{s.date} {fmtMinutt(s.startMinute)} · {s.title} · {PYRAMID_LABEL[s.pyramid]} · <TnPille tone="nøytral">{STATUS_LABEL[s.status]}</TnPille></span>
              </label>
            ))}
            <div><TnKnapp type="submit" variant="primaer" size="sm">Publiser valgte økter</TnKnapp></div>
          </form>
        </TnKort>
      )}

      {andreOkter.length > 0 && (
        <TnKort>
          <p style={{ margin: 0, fontWeight: TN.weight.semibold, fontSize: TN.text.sm }}>Andre økt-typer i dette vinduet</p>
          <p style={{ margin: "4px 0 12px", color: TN.textSecondary, fontSize: TN.text.xs }}>
            Fra eldre/parallelle modeller (kalender- og planøkter) — vist separat, aldri slått sammen med listen over. Ikke redigerbare herfra.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {andreOkter.map((r) => (
              <Link key={r.id} href={`/portal/live/${r.id}`} style={{ textDecoration: "none" }}>
                <p style={{ margin: 0, fontSize: TN.text.sm, color: TN.navy900 }}>
                  {new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(r.start)} · {r.title}
                  {" · "}<span style={{ fontFamily: TN.font.mono, fontSize: TN.text.xs, color: TN.textSecondary }}>{r.kilde === "TRAININGSESSION_V2" ? "Kalenderøkt" : "Eldre planøkt"} · {ANNEN_OKT_STATUS_LABEL[r.status] ?? r.status}</span>
                </p>
              </Link>
            ))}
          </div>
        </TnKort>
      )}

      {kanSkrive && (
        <TnKort>
          <form action={opprettOkt} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p style={{ margin: 0, fontWeight: TN.weight.semibold }}>Ny økt</p>
            <input type="hidden" name="spillerId" value={spillerId} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
              <label style={feltLabelStil}>Dato<input type="date" name="dato" required defaultValue={visning === "dag" ? dag : weekStart} style={feltInputStil} /></label>
              <label style={feltLabelStil}>Tid<input type="time" name="tid" defaultValue="08:00" style={feltInputStil} /></label>
              <label style={feltLabelStil}>Varighet (min)<input type="number" name="varighet" min={15} max={720} defaultValue={60} style={feltInputStil} /></label>
              <label style={feltLabelStil}>Område
                <select name="pyramid" style={feltInputStil}>
                  {PYRAMIDER.map((p) => <option key={p} value={p}>{PYRAMID_LABEL[p]}</option>)}
                </select>
              </label>
            </div>
            <label style={feltLabelStil}>Tittel<input type="text" name="tittel" required maxLength={200} style={feltInputStil} /></label>
            <div><TnKnapp type="submit" variant="primaer">Legg til økt</TnKnapp></div>
          </form>
        </TnKort>
      )}

      {kanSkrive && await renderOpprettFraKilde({ spillerId, standardDato: visning === "dag" ? dag : weekStart, bruker, kontekst, opprettFraKilde })}
    </TnSeksjon>
  );
}

/** Kilde-etikett for select-lista — samme mønster som kildepanelet i AgencyOS Workbench. */
function kildeEtikett(k: SourceItem): string {
  if (k.kind === "DRILL") return `Øvelse · ${k.title}`;
  if (k.kind === "TEMPLATE") return `Mal · ${k.title}`;
  return `Forrige uke (${k.subtitle ?? ""}) · ${k.title}`;
}

/** «Ny økt fra mal/øvelse» — kildepanelet gjenbrukt via `hentTnKilder`/`tnOpprettFraMal`. Skjules helt når spilleren ikke har noen lagrede kilder ennå. */
async function renderOpprettFraKilde(args: {
  spillerId: string;
  standardDato: string;
  bruker: BrukerArg;
  kontekst: TnWorkbenchKontekst;
  opprettFraKilde: (form: FormData) => Promise<void>;
}) {
  const { spillerId, standardDato, bruker, kontekst, opprettFraKilde } = args;
  const kilder = await hentTnKilder(bruker, kontekst, spillerId);
  if (kilder.length === 0) {
    return (
      <TnKort>
        <p style={{ margin: 0, fontWeight: TN.weight.semibold, fontSize: TN.text.sm }}>Ny økt fra mal eller øvelse</p>
        <p style={{ margin: "4px 0 0", color: TN.textSecondary, fontSize: TN.text.xs }}>
          Ingen lagrede maler eller øvelser tilgjengelig for denne spilleren ennå.
        </p>
      </TnKort>
    );
  }
  return (
    <TnKort>
      <p style={{ margin: 0, fontWeight: TN.weight.semibold, fontSize: TN.text.sm }}>Ny økt fra mal eller øvelse</p>
      <form action={opprettFraKilde} style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", marginTop: 10 }}>
        <input type="hidden" name="spillerId" value={spillerId} />
        <label style={feltLabelStil}>Kilde
          <select name="sourceId" style={feltInputStil} required>
            {kilder.map((k) => <option key={k.id} value={k.id}>{kildeEtikett(k)}</option>)}
          </select>
        </label>
        <label style={feltLabelStil}>Dato<input type="date" name="dato" required defaultValue={standardDato} style={feltInputStil} /></label>
        <label style={feltLabelStil}>Tid<input type="time" name="tid" defaultValue="08:00" style={feltInputStil} /></label>
        <TnKnapp type="submit" variant="sekundaer" size="sm">Opprett fra kilde</TnKnapp>
      </form>
    </TnKort>
  );
}

/** «Legg til øvelse»-listen på en eksisterende økt — samme kildepanel, filtrert til DRILL (`addDrillFromSource` godtar kun øvelser). */
async function renderLeggTilOvelse(args: {
  spillerId: string;
  sessionId: string;
  bruker: BrukerArg;
  kontekst: TnWorkbenchKontekst;
  leggTilOvelse: (form: FormData) => Promise<void>;
}) {
  const { spillerId, sessionId, bruker, kontekst, leggTilOvelse } = args;
  const ovelser = (await hentTnKilder(bruker, kontekst, spillerId)).filter((k) => k.kind === "DRILL");
  if (ovelser.length === 0) {
    return (
      <TnKort>
        <p style={{ margin: 0, fontWeight: TN.weight.semibold, fontSize: TN.text.sm }}>Legg til øvelse</p>
        <p style={{ margin: "4px 0 0", color: TN.textSecondary, fontSize: TN.text.xs }}>Ingen øvelser tilgjengelig for denne spilleren ennå.</p>
      </TnKort>
    );
  }
  return (
    <TnKort>
      <p style={{ margin: 0, fontWeight: TN.weight.semibold, fontSize: TN.text.sm }}>Legg til øvelse</p>
      <form action={leggTilOvelse} style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap", marginTop: 10 }}>
        <input type="hidden" name="spillerId" value={spillerId} />
        <input type="hidden" name="sessionId" value={sessionId} />
        <label style={feltLabelStil}>Øvelse
          <select name="sourceId" style={feltInputStil} required>
            {ovelser.map((k) => <option key={k.id} value={k.id}>{k.title}</option>)}
          </select>
        </label>
        <TnKnapp type="submit" variant="sekundaer" size="sm">Legg til i økten</TnKnapp>
      </form>
    </TnKort>
  );
}

const feltLabelStil: CSSProperties = { display: "flex", flexDirection: "column", gap: 4, fontSize: TN.text.xs, color: TN.textSecondary };
const feltInputStil: CSSProperties = { minHeight: 40, padding: "6px 10px", border: `1px solid ${TN.borderDefault}`, borderRadius: TN.radius.sm, fontSize: TN.text.sm, background: TN.white, color: TN.navy900 };
