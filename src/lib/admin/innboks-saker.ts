/**
 * AgencyOS · Innboks — én sak-liste på tvers av alle køene.
 *
 * Fasit: designsystem/paper/fase1/agencyos-innboks.html (+ -mobil).
 * Fasiten har ÉN liste med filterpiller og ett detaljpanel som forklarer og
 * avgjør den valgte saken. Appen hadde fem separate ruter (Innboks ·
 * Godkjenning · Varsler · Oppfølging · Oppgaver) og en høyrekolonne med
 * innsikt/tilbakemeldinger i stedet for beslutningsgrunnlaget. Denne loaderen
 * samler kildene til fasitens fire saktyper:
 *
 *   forslag     — PlanAction PENDING + CaddieDraft PENDING (venter godkjenning)
 *   forespørsel — SessionRequest PENDING + AppFeedback NY (kommer fra spiller)
 *   drift       — varsler om booking/faktura/abonnement
 *   varsel      — øvrige systemvarsler (agentfeil m.m.)
 *
 * Rutene bak lever videre — ingen URL er fjernet, og hver sak lenker til sin
 * egen flate via `href`. Det som er borte fra denne skjermen er fanene.
 *
 * Kun `forslag` bærer anbefalingskontrakten (Hvorfor · Hva · Forventet effekt ·
 * Hvorfor nå), akkurat som i fasiten. Felter agenten ikke har skrevet står som
 * null og vises som «ikke oppgitt» — de fabrikeres aldri.
 */

import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { handlingstypeLabel } from "@/lib/labels/handlingstyper";
import { caddieDraftTittel } from "@/lib/caddie/draft-labels";
import { provenanceLinjer } from "@/lib/agents/provenance";
import {
  buildDiffPreview,
  erHasterHandling,
  narTekst,
  planActionSuggestionSchema,
} from "@/lib/admin/plan-action-diff";

export type InnboksSakType = "forslag" | "forespørsel" | "drift" | "varsel";

export type InnboksKilde =
  | "planAction"
  | "caddieDraft"
  | "sessionRequest"
  | "notification"
  | "appFeedback"
  | "sak";

/** Anbefalingskontrakten fra fasiten — fire deler, alltid samme rekkefølge. */
export type InnboksKontrakt = {
  hvorfor: string | null;
  hva: string | null;
  effekt: string | null;
  hvorforNa: string | null;
};

export type InnboksHandling = {
  label: string;
  /** «godkjenn» er den bekreftende veien, «avvis» den avvisende. */
  slag: "godkjenn" | "avvis";
  /** Avvisning som skal ha en grunn (PlanAction) åpner et felt først. */
  krevGrunn?: boolean;
};

export type InnboksSak = {
  /** «<kilde>:<rad-id>» — server-handlingen ruter på prefikset. */
  id: string;
  kilde: InnboksKilde;
  type: InnboksSakType;
  tittel: string;
  sub: string;
  hvem: string;
  frist: string;
  /** Rød frist i lista (fasitens .frist.snart). */
  snart: boolean;
  lost: boolean;
  lostTekst: string | null;
  kontrakt: InnboksKontrakt | null;
  /** Kun Sak (Jarvis-triage) setter denne — AI-skrevet svarutkast, vist rått i detaljpanelet. */
  foreslattSvar?: string | null;
  grunnlag: string[];
  href: string | null;
  hrefTekst: string | null;
  primaer: InnboksHandling | null;
  sekundaer: InnboksHandling | null;
};

export type InnboksData = {
  saker: InnboksSak[];
  /** Antall åpne saker — telleren i hodet og på rail-badgen. */
  apne: number;
  /** «fredag 31. juli» i Oslo-tid. */
  dagLabel: string;
};

const DAG = 1000 * 60 * 60 * 24;

/** Varsler om penger, booking og abonnement er drift — resten er systemvarsel. */
const DRIFT_ORD = /(booking|faktur|betal|stripe|abonnement|purring|drift)/i;

function alderDager(d: Date, now: Date): number {
  return Math.floor((now.getTime() - d.getTime()) / DAG);
}

function osloDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Oslo",
  });
}

/**
 * «Hvorfor nå» utledes av ekte tall — hastegrad på handlingstypen og hvor
 * lenge saken faktisk har ligget. Ingen agent skriver dette feltet i dag, og
 * en oppdiktet begrunnelse er verre enn ingen.
 */
function hvorforNaTekst(opprettet: Date, now: Date, haster: boolean): string {
  const dager = alderDager(opprettet, now);
  if (haster) return "Haster — handlingstypen krever avgjørelse før planen kjøres videre.";
  if (dager >= 3)
    return `Har ligget i ${dager} dager. Spilleren ser ingenting før du svarer.`;
  if (dager >= 1) return `Kom ${narTekst(opprettet, now)}. Ingen frist er satt.`;
  return "Kom i dag. Ingen frist er satt.";
}

function fristTekst(opprettet: Date, now: Date, haster: boolean): { frist: string; snart: boolean } {
  const dager = alderDager(opprettet, now);
  if (haster) return { frist: "haster", snart: true };
  if (dager >= 3) return { frist: `ventet ${dager} dager`, snart: true };
  return { frist: narTekst(opprettet, now), snart: false };
}

const SAK_KANAL_LABEL: Record<string, string> = {
  EPOST: "e-post",
  SMS: "SMS",
  IMESSAGE: "iMessage",
  TELEGRAM: "Telegram",
  ANROP: "anrop",
  KALENDER: "kalender",
  TASK: "oppgave",
  LYD: "lydopptak",
};

/**
 * Sak.frist er en ABSOLUTT SLA-frist (6 timer fra innsamling, satt av
 * scripts/saker-innsamling/gmail.ts) — motsatt av de andre sak-typenes
 * alder-baserte frist over. «Snart» er her under 2 timer igjen, ikke antall
 * dager saken har ligget (jf. steg 5 i jarvis-masterplan.md).
 */
function sakFristTekst(frist: Date | null, now: Date): { frist: string; snart: boolean } {
  if (!frist) return { frist: "ingen frist satt", snart: false };
  const timerIgjen = (frist.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (timerIgjen <= 0) return { frist: "fristen er ute", snart: true };
  if (timerIgjen < 2) {
    const minutterIgjen = Math.max(1, Math.round(timerIgjen * 60));
    return { frist: `frist om ${minutterIgjen} min`, snart: true };
  }
  if (timerIgjen < 24) return { frist: `frist om ${Math.round(timerIgjen)} t`, snart: false };
  return { frist: `frist om ${Math.round(timerIgjen / 24)} d`, snart: false };
}

/** Fasitens rekkefølge: det som kan avgjøres først, deretter det som kun opplyser. */
const TYPE_VEKT: Record<InnboksSakType, number> = {
  forslag: 0,
  "forespørsel": 1,
  drift: 2,
  varsel: 3,
};

export async function loadInnboksSaker(user: {
  id: string;
  role: string;
  name?: string | null;
}): Promise<InnboksData> {
  const now = new Date();
  const spillerScope = coachScopedPlayerWhere(user);
  const lostGrense = new Date(now.getTime() - 7 * DAG);

  const [actions, caddieDraftsRaw, sessionRequests, varsler, feedback, mineSpillere, losteActions] =
    await Promise.all([
      prisma.planAction.findMany({
        where: {
          status: "PENDING",
          OR: [{ coachId: user.id }, { coachId: null }],
          user: spillerScope,
        },
        include: {
          user: { select: { id: true, name: true } },
          plan: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 40,
      }),
      prisma.caddieDraft.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 30,
        select: {
          id: true,
          userId: true,
          previewText: true,
          toolName: true,
          toolInput: true,
          createdAt: true,
        },
      }),
      prisma.sessionRequest
        .findMany({
          where: {
            status: "PENDING",
            OR: [{ coachId: user.id }, { coachId: null }],
            user: spillerScope,
          },
          orderBy: { createdAt: "desc" },
          take: 30,
          select: {
            id: true,
            userId: true,
            reason: true,
            preferredDate: true,
            preferredTime: true,
            createdAt: true,
            user: { select: { name: true } },
          },
        })
        .catch(() => []),
      prisma.notification.findMany({
        where: { userId: user.id, createdAt: { gte: lostGrense } },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.appFeedback.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
      prisma.user.findMany({ where: spillerScope, select: { id: true } }),
      prisma.planAction.findMany({
        where: {
          status: { in: ["ACCEPTED", "REJECTED"] },
          user: spillerScope,
          updatedAt: { gte: lostGrense },
        },
        orderBy: { updatedAt: "desc" },
        take: 12,
        select: {
          id: true,
          actionType: true,
          status: true,
          updatedAt: true,
          sjekkpunkt: true,
          user: { select: { name: true } },
        },
      }),
    ]);

  // CaddieDraft.userId er EIEREN (ADMIN) — spilleren utkastet gjelder ligger i
  // toolInput. Coach ser kun utkast for sine egne spillere (samme regel som
  // godkjenninger-flaten).
  const draftSpillerId = (toolInput: unknown): string | null => {
    const inp = toolInput as { playerId?: unknown; spillerId?: unknown } | null;
    if (typeof inp?.playerId === "string") return inp.playerId;
    if (typeof inp?.spillerId === "string") return inp.spillerId;
    return null;
  };
  const mineIds = new Set(mineSpillere.map((s) => s.id));
  const caddieDrafts =
    user.role === "ADMIN"
      ? caddieDraftsRaw
      : caddieDraftsRaw.filter((d) => {
          const spiller = draftSpillerId(d.toolInput);
          return spiller != null && mineIds.has(spiller);
        });

  // Navn til alle brukere sakene peker på (AppFeedback og CaddieDraft har
  // ingen relasjon — de slås opp i én runde).
  const navneIder = [
    ...new Set([
      ...caddieDrafts.flatMap((d) => {
        const spiller = draftSpillerId(d.toolInput);
        return spiller ? [d.userId, spiller] : [d.userId];
      }),
      ...feedback.map((f) => f.userId),
    ]),
  ];
  const navn = new Map(
    (
      await prisma.user.findMany({
        where: { id: { in: navneIder } },
        select: { id: true, name: true },
      })
    ).map((u) => [u.id, u.name ?? "Ukjent spiller"] as const),
  );

  // ── Sak (Jarvis) — Anders' egen Gmail/SMS/iMessage-triage-kø ─────────
  // Ingen coach-scoping å arve (Sak er ikke knyttet til en spiller) — i
  // stedet begrenses hele kilden til ADMIN, samme prinsipp som
  // CaddieDraft-filteret over: en coach skal ikke se Anders' private/
  // forretningsmessige korrespondanse i sin egen innboks.
  const sakRader =
    user.role === "ADMIN"
      ? await prisma.sak.findMany({
          where: { status: "VENTER" },
          orderBy: { opprettet: "desc" },
          take: 40,
        })
      : [];

  const saker: InnboksSak[] = [];

  // ── forslag · PlanAction ────────────────────────────────────────────
  for (const a of actions) {
    const parsed = planActionSuggestionSchema.safeParse(a.suggestion);
    const sugg = parsed.success ? parsed.data : null;
    const haster = erHasterHandling(a.actionType);
    const diff = await buildDiffPreview(a.actionType, a.suggestion, a.userId, a.planId);
    const sjekkpunkt =
      typeof (sugg as { sjekkpunkt?: unknown } | null)?.sjekkpunkt === "string"
        ? String((sugg as { sjekkpunkt: string }).sjekkpunkt).trim()
        : null;
    const hvorfor = sugg?.forklaring ?? sugg?.detail ?? null;
    const { frist, snart } = fristTekst(a.createdAt, now, haster);
    const grunnlag = provenanceLinjer(a.provenance);
    grunnlag.push(`Skrevet ${narTekst(a.createdAt, now)} · ${a.agentName}`);
    if (a.plan) grunnlag.push(`Gjelder planen «${a.plan.name}»`);

    saker.push({
      id: `planAction:${a.id}`,
      kilde: "planAction",
      type: "forslag",
      tittel: sugg?.title ?? sugg?.tittel ?? handlingstypeLabel(a.actionType),
      sub:
        hvorfor ??
        diff ??
        `${handlingstypeLabel(a.actionType)} — agenten har skrevet et utkast. Ingenting er sendt.`,
      hvem: a.user.name ?? "Spiller",
      frist,
      snart,
      lost: false,
      lostTekst: null,
      kontrakt: {
        hvorfor,
        hva: diff,
        effekt: sjekkpunkt ? `Sjekkpunkt etter godkjenning: ${sjekkpunkt}` : null,
        hvorforNa: hvorforNaTekst(a.createdAt, now, haster),
      },
      grunnlag,
      href: `/admin/godkjenninger#${a.id}`,
      hrefTekst: "Åpne i godkjenninger",
      primaer: { label: "Godkjenn og send", slag: "godkjenn" },
      sekundaer: { label: "Avvis", slag: "avvis", krevGrunn: true },
    });
  }

  // ── forslag · CaddieDraft ───────────────────────────────────────────
  // Signering 12.08: 30+ identiske «Caddie-utkast»-rader druknet resten av
  // innboksen. Utkast av samme type samles derfor til ÉN sak med teller.
  // Samleraden får ingen godkjenn/avvis: å sende 30 AI-skrevne meldinger med
  // ett trykk er nettopp det innboksen skal hindre — den leder til Caddie,
  // der utkastene leses hver for seg. Er det bare ett utkast av en type,
  // beholder det sine egne handlinger.
  const draftsPerType = new Map<string, typeof caddieDrafts>();
  for (const d of caddieDrafts) {
    const gruppe = draftsPerType.get(d.toolName);
    if (gruppe) gruppe.push(d);
    else draftsPerType.set(d.toolName, [d]);
  }
  for (const [toolName, gruppe] of draftsPerType) {
    if (gruppe.length < 2) continue;
    const eldst = gruppe.reduce((a, b) => (a.createdAt <= b.createdAt ? a : b));
    const { frist, snart } = fristTekst(eldst.createdAt, now, false);
    const hvem = new Set(
      gruppe.map((d) => {
        const sid = draftSpillerId(d.toolInput) ?? d.userId;
        return navn.get(sid) ?? navn.get(d.userId) ?? "Spiller";
      }),
    );
    saker.push({
      id: `caddieDraftGruppe:${toolName}`,
      kilde: "caddieDraft",
      type: "forslag",
      tittel: `${caddieDraftTittel(toolName)} · ${gruppe.length}`,
      sub: `${gruppe.length} utkast venter. Ingenting er sendt.`,
      hvem: hvem.size === 1 ? [...hvem][0] : `${hvem.size} spillere`,
      frist,
      snart,
      lost: false,
      lostTekst: null,
      kontrakt: {
        hvorfor: null,
        hva: `Caddie har skrevet ${gruppe.length} utkast av samme type. Les dem hver for seg i Caddie — de sendes ikke herfra.`,
        effekt: null,
        hvorforNa: hvorforNaTekst(eldst.createdAt, now, false),
      },
      grunnlag: [
        `Kilde: Caddie · verktøy ${toolName}`,
        `Eldste utkast skrevet ${narTekst(eldst.createdAt, now)}`,
      ],
      href: "/admin/agencyos/caddie/dashbord",
      hrefTekst: "Åpne i Caddie",
      primaer: null,
      sekundaer: null,
    });
  }

  for (const d of caddieDrafts) {
    if ((draftsPerType.get(d.toolName)?.length ?? 0) >= 2) continue;
    const spillerId = draftSpillerId(d.toolInput) ?? d.userId;
    const { frist, snart } = fristTekst(d.createdAt, now, false);
    saker.push({
      id: `caddieDraft:${d.id}`,
      kilde: "caddieDraft",
      type: "forslag",
      tittel: caddieDraftTittel(d.toolName),
      sub: d.previewText.slice(0, 200),
      hvem: navn.get(spillerId) ?? navn.get(d.userId) ?? "Spiller",
      frist,
      snart,
      lost: false,
      lostTekst: null,
      kontrakt: {
        hvorfor: null,
        hva: d.previewText,
        effekt: null,
        hvorforNa: hvorforNaTekst(d.createdAt, now, false),
      },
      grunnlag: [
        `Kilde: Caddie · verktøy ${d.toolName}`,
        `Skrevet ${narTekst(d.createdAt, now)}`,
      ],
      href: "/admin/agencyos/caddie/dashbord",
      hrefTekst: "Åpne i Caddie",
      primaer: { label: "Godkjenn og send", slag: "godkjenn" },
      sekundaer: { label: "Avvis", slag: "avvis" },
    });
  }

  // ── forespørsel · SessionRequest ────────────────────────────────────
  for (const r of sessionRequests) {
    const onsket = r.preferredDate
      ? `ønsker ${osloDato(r.preferredDate)}${r.preferredTime ? ` ${r.preferredTime}` : ""}`
      : null;
    const naerFrist =
      r.preferredDate != null && r.preferredDate.getTime() - now.getTime() < 3 * DAG;
    saker.push({
      id: `sessionRequest:${r.id}`,
      kilde: "sessionRequest",
      type: "forespørsel",
      tittel: "Ber om økt",
      sub: r.reason?.trim() || "Uten oppgitt grunn.",
      hvem: r.user?.name ?? "Spiller",
      frist: onsket ?? narTekst(r.createdAt, now),
      snart: naerFrist,
      lost: false,
      lostTekst: null,
      kontrakt: null,
      grunnlag: [
        `Kilde: PlayerHQ · forespørsel ${narTekst(r.createdAt, now)}`,
        onsket ? `Ønsket tidspunkt: ${onsket}` : "Ingen ønsket dato oppgitt",
      ],
      href: "/admin/foresporsler",
      hrefTekst: "Åpne forespørsler",
      primaer: { label: "Merk som planlagt", slag: "godkjenn" },
      sekundaer: { label: "Avslå", slag: "avvis" },
    });
  }

  // ── forespørsel · AppFeedback (spillerens tilbakemeldinger) ─────────
  for (const f of feedback) {
    const erNy = f.status !== "SETT";
    saker.push({
      id: `appFeedback:${f.id}`,
      kilde: "appFeedback",
      type: "forespørsel",
      tittel: `Tilbakemelding · ${f.type}`,
      sub: f.tekst.slice(0, 200),
      hvem: navn.get(f.userId) ?? "Ukjent spiller",
      frist: erNy ? narTekst(f.createdAt, now) : "kvittert ut",
      snart: false,
      lost: !erNy,
      lostTekst: erNy ? null : "kvittert ut",
      kontrakt: null,
      grunnlag: [
        `Kilde: appen${f.side ? ` · ${f.side}` : ""}`,
        `Sendt ${narTekst(f.createdAt, now)}`,
      ],
      href: null,
      hrefTekst: null,
      primaer: erNy ? { label: "Kvitter ut", slag: "godkjenn" } : null,
      sekundaer: null,
    });
  }

  // ── forespørsel · Sak (Jarvis-triage) ────────────────────────────────
  for (const s of sakRader) {
    const kanalLabel = SAK_KANAL_LABEL[s.kanal] ?? s.kanal.toLowerCase();
    const { frist, snart } = sakFristTekst(s.frist, now);
    saker.push({
      id: `sak:${s.id}`,
      kilde: "sak",
      type: "forespørsel",
      tittel: s.emne?.trim() || `Henvendelse via ${kanalLabel}`,
      sub: s.innhold.slice(0, 200),
      hvem: s.avsender ?? "Ukjent avsender",
      frist,
      snart,
      lost: false,
      lostTekst: null,
      kontrakt: null,
      foreslattSvar: s.foreslattSvar,
      grunnlag: [`Kilde: ${kanalLabel}`, `Kom ${narTekst(s.opprettet, now)}`],
      href: null,
      hrefTekst: null,
      primaer: {
        label: s.kanal === "EPOST" ? "Godkjenn og opprett utkast" : "Godkjenn",
        slag: "godkjenn",
      },
      sekundaer: { label: "Avvis", slag: "avvis" },
    });
  }

  // ── drift og varsel · Notification ──────────────────────────────────
  for (const n of varsler) {
    const lest = n.readAt != null;
    const erDrift = DRIFT_ORD.test(`${n.type} ${n.title}`);
    saker.push({
      id: `notification:${n.id}`,
      kilde: "notification",
      type: erDrift ? "drift" : "varsel",
      tittel: n.title,
      sub: n.body ?? "Ingen detaljer oppgitt.",
      hvem: "System",
      frist: lest ? "lest" : "til orientering",
      snart: false,
      lost: lest,
      lostTekst: lest ? `kvittert ut ${narTekst(n.readAt!, now)}` : null,
      kontrakt: null,
      grunnlag: [`Kilde: ${n.type}`, `Kom ${narTekst(n.createdAt, now)}`],
      href: n.link ?? null,
      hrefTekst: n.link ? "Åpne" : null,
      primaer: lest ? null : { label: "Kvitter ut", slag: "godkjenn" },
      sekundaer: null,
    });
  }

  // ── løst · nylig avgjorte forslag ───────────────────────────────────
  for (const a of losteActions) {
    const godkjent = a.status === "ACCEPTED";
    saker.push({
      id: `planAction:${a.id}`,
      kilde: "planAction",
      type: "forslag",
      tittel: handlingstypeLabel(a.actionType),
      sub: a.sjekkpunkt?.trim() || (godkjent ? "Godkjent og sendt." : "Avvist. Ingenting ble sendt."),
      hvem: a.user.name ?? "Spiller",
      frist: narTekst(a.updatedAt, now),
      snart: false,
      lost: true,
      lostTekst: `${godkjent ? "godkjent" : "avvist"} ${narTekst(a.updatedAt, now)}`,
      kontrakt: null,
      grunnlag: [
        `Avgjort ${narTekst(a.updatedAt, now)}`,
        a.sjekkpunkt?.trim() ? `Sjekkpunkt: ${a.sjekkpunkt.trim()}` : "Uten sjekkpunkt",
      ],
      href: `/admin/godkjenninger#${a.id}`,
      hrefTekst: "Åpne i godkjenninger",
      primaer: null,
      sekundaer: null,
    });
  }

  saker.sort((a, b) => {
    if (a.lost !== b.lost) return a.lost ? 1 : -1;
    if (a.snart !== b.snart) return a.snart ? -1 : 1;
    return TYPE_VEKT[a.type] - TYPE_VEKT[b.type];
  });

  return {
    saker,
    apne: saker.filter((s) => !s.lost).length,
    dagLabel: now.toLocaleDateString("nb-NO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "Europe/Oslo",
    }),
  };
}
