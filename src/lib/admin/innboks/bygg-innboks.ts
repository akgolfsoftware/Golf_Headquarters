/**
 * Innboks (AG-04) — samler kildene til én liste. Ren funksjon: ingen Prisma,
 * ingen React, så sortering, haster-regel og telling kan låses med test.
 *
 * Kildene og handlingene er de samme som før sammenslåingen:
 *   /admin/kommunikasjon — saker (varsler, tilbakemeldinger, Jarvis-triage),
 *                          e-postutkast (InnboksEpost, bare head coach)
 *   /admin/ko            — PlanAction, CaddieDraft, SessionRequest
 *   /admin/queue         — oppfølging (FollowUpCase)
 * I tillegg åpne spørsmål fra spillere (Question), som bjella trenger for
 * regelen «spillerspørsmål ubesvart over 24 timer haster».
 */
import type { InnboksHandling, InnboksSak } from "@/lib/admin/innboks-saker";
import type { AdminGodkjenningV2Row } from "@/components/admin/v2/AdminGodkjenningerV2";
import type { InnboksEpostVm } from "@/lib/innboks/data";
import type { OppfolgingKort } from "@/lib/admin/oppfolging/last-oppfolging";
import type { SporsmalVm } from "./last-sporsmal";
import type { InnboksFilterId, OppfStatus } from "./filter";

export type InnboksPostHandling =
  | { t: "plan"; id: string; lavRisiko: boolean }
  | { t: "caddie"; id: string }
  | { t: "caddieGruppe"; antall: number }
  | { t: "foresporsel"; id: string }
  /** Varsel, tilbakemelding og Jarvis-triage — avgjorInnboksSak med sakens egne ord. */
  | { t: "sak"; sakId: string; primaer: InnboksHandling | null; sekundaer: InnboksHandling | null }
  | { t: "epost"; id: string; lukket: boolean }
  | { t: "sporsmal"; id: string }
  | { t: "oppf"; spillerId: string; status: OppfStatus }
  | { t: "ingen" };

export type GodkjennKilde = "motor" | "caddie" | "foresporsel";

export type InnboksPost = {
  /** Unik nøkkel i lista (kilde + rad-id). */
  key: string;
  /** Fanene posten hører til. «Alle» viser alt som ikke er løst, unntatt Datakvalitet. */
  filtre: InnboksFilterId[];
  /** Bare i «Alle» når true (samlerader for mange like Caddie-utkast). */
  bareAlle?: boolean;
  /** Bare i egen fane, aldri i «Alle» (enkeltutkast som er samlet i «Alle»). */
  ikkeAlle?: boolean;
  godkjennKilde?: GodkjennKilde;
  oppf?: OppfStatus;
  kind: string;
  fra: string;
  konto?: string | null;
  tittel: string;
  tekst: string;
  /** Linjer med overskrift (Hvorfor · Dette endres · Forventet effekt · Hvorfor nå). */
  detaljer: { label: string; tekst: string }[];
  grunnlag: string[];
  merker: string[];
  at: string;
  /** Timer siden saken kom. null = ukjent (sorteres sist). */
  alderTimer: number | null;
  /** Spørsmål fra spiller ubesvart i over 24 t. */
  haster: boolean;
  /** Oppfølgingssak i Risiko. */
  risiko: boolean;
  lost: boolean;
  lostTekst: string | null;
  utkast: { av: string; tekst: string; kanRedigeres: boolean } | null;
  /** «Svar» åpner skrivefelt (e-post og spørsmål). */
  kanSvare: boolean;
  handling: InnboksPostHandling;
  lenker: { label: string; href: string }[];
};

export type InnboksKilder = {
  saker: InnboksSak[];
  godkjenn: AdminGodkjenningV2Row[];
  oppfolging: OppfolgingKort[];
  sporsmal: SporsmalVm[];
  epost: InnboksEpostVm[];
  /** Sendt eller arkivert e-post — lastes bare når fanen ber om det. */
  epostSendt: InnboksEpostVm[];
  now: Date;
};

const TIME = 3_600_000;

function alder(iso: string | undefined, now: Date): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? Math.max(0, (now.getTime() - t) / TIME) : null;
}

/** «07:52» i dag, ellers «Fre 25.09 · 12:10» — Oslo-tid. */
export function tidTekst(iso: string | undefined, now: Date): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  const dag = (x: Date) => x.toLocaleDateString("sv-SE", { timeZone: "Europe/Oslo" });
  const kl = d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" });
  if (dag(d) === dag(now)) return kl;
  const ukedag = d.toLocaleDateString("nb-NO", { weekday: "short", timeZone: "Europe/Oslo" }).replace(".", "");
  const dato = d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", timeZone: "Europe/Oslo" });
  return `${ukedag.charAt(0).toUpperCase()}${ukedag.slice(1)} ${dato} · ${kl}`;
}

const tom = (s: string | null | undefined) => !s || !s.trim();

function kontraktDetaljer(sak: InnboksSak | undefined): { label: string; tekst: string }[] {
  const k = sak?.kontrakt;
  if (!k) return [];
  const rader: [string, string | null][] = [
    ["Hvorfor", k.hvorfor],
    ["Dette endres", k.hva],
    ["Forventet effekt", k.effekt],
    ["Hvorfor nå", k.hvorforNa],
  ];
  return rader.filter((r): r is [string, string] => !tom(r[1])).map(([label, tekst]) => ({ label, tekst }));
}

const OPPF_KIND: Record<OppfStatus, string> = { risk: "Risiko", watch: "Følg med", check: "Sjekk inn", ok: "Løst" };

export function byggInnboks(k: InnboksKilder): InnboksPost[] {
  const { now } = k;
  const sakPerId = new Map(k.saker.map((s) => [s.id, s] as const));
  const ut: InnboksPost[] = [];

  // ── Godkjenn: PlanAction, CaddieDraft og SessionRequest (Kø) ────────────
  const caddieRader = k.godkjenn.filter((r) => r.kilde === "caddie");
  const caddiePerTittel = new Map<string, AdminGodkjenningV2Row[]>();
  for (const r of caddieRader) caddiePerTittel.set(r.title, [...(caddiePerTittel.get(r.title) ?? []), r]);

  for (const r of k.godkjenn) {
    const kilde = r.kilde ?? "agent";
    const iso = r.opprettetIso;
    const felles = {
      fra: r.who,
      at: iso ? tidTekst(iso, now) : r.when,
      alderTimer: alder(iso, now),
      haster: false,
      risiko: false,
      lost: false,
      lostTekst: null,
      kanSvare: false,
      grunnlag: [] as string[],
    };
    if (kilde === "agent") {
      const sak = sakPerId.get(`planAction:${r.id}`);
      const detaljer = kontraktDetaljer(sak);
      if (!detaljer.some((d) => d.label === "Dette endres") && r.diffPreview) detaljer.push({ label: "Dette endres", tekst: r.diffPreview });
      if (r.hvorfor) detaljer.push({ label: "Kilde", tekst: r.hvorfor });
      ut.push({
        ...felles,
        key: `plan:${r.id}`,
        filtre: ["godkjenn"],
        godkjennKilde: "motor",
        kind: "Forslag fra motoren",
        tittel: r.title,
        tekst: r.detail || "—",
        detaljer,
        grunnlag: sak?.grunnlag ?? [],
        merker: r.lowRisk ? ["Lav risiko"] : [],
        utkast: null,
        handling: { t: "plan", id: r.id, lavRisiko: r.lowRisk },
        lenker: r.playerId ? [{ label: "Spiller 360", href: `/admin/spillere/${r.playerId}` }] : [],
      });
    } else if (kilde === "caddie") {
      const sak = sakPerId.get(`caddieDraft:${r.id}`);
      const samlet = (caddiePerTittel.get(r.title)?.length ?? 0) >= 2;
      ut.push({
        ...felles,
        key: `caddie:${r.id}`,
        filtre: ["caddie", "godkjenn"],
        ikkeAlle: samlet,
        godkjennKilde: "caddie",
        kind: "Caddie-utkast",
        tittel: r.title,
        tekst: "Utkast fra Caddie. Ingenting er sendt.",
        detaljer: [],
        grunnlag: sak?.grunnlag ?? [],
        merker: [],
        utkast: { av: "Caddie", tekst: sak?.kontrakt?.hva ?? r.detail, kanRedigeres: false },
        handling: { t: "caddie", id: r.id },
        lenker: [{ label: "Åpne i Caddie", href: r.eksternHref ?? "/admin/agencyos/caddie/dashbord" }],
      });
    } else {
      ut.push({
        ...felles,
        key: `foresporsel:${r.id}`,
        filtre: ["spillere", "godkjenn"],
        godkjennKilde: "foresporsel",
        kind: "Ber om økt",
        tittel: r.title,
        tekst: r.detail || "Uten detaljer.",
        detaljer: [],
        merker: [],
        utkast: null,
        handling: { t: "foresporsel", id: r.id },
        lenker: [
          { label: "Foreslå annen tid", href: r.eksternHref ?? "/admin/foresporsler" },
          ...(r.playerId ? [{ label: "Spiller 360", href: `/admin/spillere/${r.playerId}` }] : []),
        ],
      });
    }
  }

  // Mange like Caddie-utkast blir én samlerad i «Alle» (signering 12.08:
  // 30 identiske rader druknet resten). Ingen samlet sending herfra.
  for (const [tittel, rader] of caddiePerTittel) {
    if (rader.length < 2) continue;
    const isoer = rader.map((r) => r.opprettetIso).filter((x): x is string => !!x).sort();
    const nyeste = isoer[isoer.length - 1];
    const hvem = new Set(rader.map((r) => r.who));
    ut.push({
      key: `caddieGruppe:${tittel}`,
      filtre: [],
      bareAlle: true,
      godkjennKilde: "caddie",
      kind: "Caddie-utkast",
      fra: hvem.size === 1 ? [...hvem][0]! : `${hvem.size} spillere`,
      tittel: `${tittel} · ${rader.length}`,
      tekst: `${rader.length} utkast venter. Les dem hver for seg under Caddie-forslag. Ingenting er sendt.`,
      detaljer: [],
      grunnlag: [],
      merker: [],
      at: nyeste ? tidTekst(nyeste, now) : "—",
      alderTimer: alder(nyeste, now),
      haster: false,
      risiko: false,
      lost: false,
      lostTekst: null,
      utkast: null,
      kanSvare: false,
      handling: { t: "caddieGruppe", antall: rader.length },
      lenker: [{ label: "Åpne i Caddie", href: "/admin/agencyos/caddie/dashbord" }],
    });
  }

  // ── Saker fra Kommunikasjon: varsler, tilbakemeldinger, Jarvis-triage ──
  for (const s of k.saker) {
    const felles = {
      fra: s.hvem,
      tittel: s.tittel,
      tekst: s.sub,
      detaljer: kontraktDetaljer(s),
      grunnlag: s.grunnlag,
      merker: [] as string[],
      at: s.opprettetIso ? tidTekst(s.opprettetIso, now) : s.frist,
      alderTimer: alder(s.opprettetIso, now),
      haster: false,
      risiko: false,
      lost: s.lost,
      lostTekst: s.lostTekst,
      kanSvare: false,
      lenker: s.href && s.kilde === "notification" ? [{ label: s.hrefTekst ?? "Åpne", href: s.href }] : [],
    };
    const handling: InnboksPostHandling = s.lost
      ? { t: "ingen" }
      : { t: "sak", sakId: s.id, primaer: s.primaer, sekundaer: s.sekundaer };
    if (s.kilde === "notification") {
      ut.push({ ...felles, key: s.id, filtre: ["varsler"], kind: s.type === "drift" ? "Drift" : "Varsel", utkast: null, handling });
    } else if (s.kilde === "appFeedback") {
      ut.push({ ...felles, key: s.id, filtre: ["spillere"], kind: "Tilbakemelding", utkast: null, handling });
    } else if (s.kilde === "sak") {
      ut.push({
        ...felles,
        key: s.id,
        filtre: ["epost"],
        kind: (s.grunnlag[0] ?? "Henvendelse").replace(/^Kilde: /, "").replace(/^./, (c) => c.toUpperCase()),
        merker: s.snart ? [s.frist.charAt(0).toUpperCase() + s.frist.slice(1)] : [],
        utkast: tom(s.foreslattSvar) ? null : { av: "Jarvis", tekst: s.foreslattSvar!, kanRedigeres: false },
        handling,
      });
    } else if (s.kilde === "planAction" && s.lost) {
      // Nylig avgjorte forslag — «Løst» under Godkjenn, som i Kommunikasjon.
      ut.push({ ...felles, key: `lost:${s.id}`, filtre: ["godkjenn"], godkjennKilde: "motor", kind: "Forslag fra motoren", utkast: null, handling: { t: "ingen" } });
    }
  }

  // ── E-post (InnboksEpost, post@akgolf.no) ────────────────────────────
  for (const e of [...k.epost, ...k.epostSendt]) {
    const lukket = e.status === "SENDT" || e.status === "ARKIVERT";
    ut.push({
      key: `epost:${e.id}`,
      filtre: ["epost"],
      kind: "E-post",
      fra: e.fraNavn ?? e.fraEpost,
      konto: "post@akgolf.no",
      tittel: e.emne,
      tekst: e.brodtekst || "(tom e-post)",
      detaljer: [],
      grunnlag: e.fraNavn ? [e.fraEpost] : [],
      merker: e.status === "NY" ? ["Ny"] : [],
      at: e.mottattIso ? tidTekst(e.mottattIso, now) : e.mottattAt,
      alderTimer: alder(e.mottattIso, now),
      haster: false,
      risiko: false,
      lost: lukket,
      lostTekst: lukket ? (e.status === "SENDT" ? "Sendt" : "Arkivert") : null,
      utkast: !lukket && !tom(e.utkastSvar) ? { av: "AI", tekst: e.utkastSvar!, kanRedigeres: true } : null,
      kanSvare: !lukket,
      handling: { t: "epost", id: e.id, lukket },
      lenker: [],
    });
  }

  // ── Spørsmål fra spillere (Question) ────────────────────────────────
  for (const q of k.sporsmal) {
    const a = alder(q.opprettetIso, now);
    ut.push({
      key: `sporsmal:${q.id}`,
      filtre: ["spillere"],
      kind: "Spørsmål",
      fra: q.spiller,
      tittel: q.tittel,
      tekst: q.tekst,
      detaljer: [],
      grunnlag: [],
      merker: [],
      at: tidTekst(q.opprettetIso, now),
      alderTimer: a,
      haster: a != null && a > 24,
      risiko: false,
      lost: false,
      lostTekst: null,
      utkast: null,
      kanSvare: true,
      handling: { t: "sporsmal", id: q.id },
      lenker: [{ label: "Spiller 360", href: `/admin/spillere/${q.spillerId}` }],
    });
  }

  // ── Oppfølging (FollowUpCase) ───────────────────────────────────────
  for (const o of k.oppfolging) {
    ut.push({
      key: `oppf:${o.id}`,
      filtre: ["oppfolging"],
      oppf: o.status,
      kind: OPPF_KIND[o.status],
      fra: o.navn,
      tittel: o.signalTekst,
      tekst: o.siden.charAt(0).toUpperCase() + o.siden.slice(1) + ".",
      detaljer: o.stats.map((s) => ({ label: s.k, tekst: s.v })),
      grunnlag: [o.epost],
      merker: o.tags,
      at: o.dagerSidenInnlogging == null ? "Aldri innlogget" : `Sist innlogget for ${o.dagerSidenInnlogging} d siden`,
      alderTimer: o.dagerSidenInnlogging == null ? null : o.dagerSidenInnlogging * 24,
      haster: false,
      risiko: o.status === "risk",
      lost: o.status === "ok",
      lostTekst: o.status === "ok" ? "Løst" : null,
      utkast: null,
      kanSvare: false,
      handling: { t: "oppf", spillerId: o.id, status: o.status },
      lenker: [
        { label: "Spiller 360", href: `/admin/spillere/${o.id}` },
        { label: "Book økt", href: "/admin/bookinger/ny" },
      ],
    });
  }

  return ut;
}

/** Haster først, deretter nyeste. Ukjent alder sist. */
export function sorterInnboks(liste: readonly InnboksPost[]): InnboksPost[] {
  const vekt = (p: InnboksPost) => (p.haster || p.risiko ? 0 : 1);
  return [...liste].sort((a, b) => vekt(a) - vekt(b) || (a.alderTimer ?? Infinity) - (b.alderTimer ?? Infinity));
}

/** Er posten med i fanen? «Alle» viser det som er åpent, uten Datakvalitet og uten enkeltutkast som er samlet. */
export function iFilter(p: InnboksPost, f: InnboksFilterId): boolean {
  if (f === "alle") return !p.lost && !p.ikkeAlle;
  if (p.bareAlle) return false;
  return p.filtre.includes(f);
}

export function tellFilter(liste: readonly InnboksPost[], f: InnboksFilterId): number {
  return liste.filter((p) => iFilter(p, f) && !p.lost).length;
}

/** Bjella lyser rust bare når noe haster: Risiko, eller spillerspørsmål ubesvart over 24 t. */
export function innboksHaster(liste: readonly InnboksPost[]): boolean {
  return liste.some((p) => !p.lost && (p.haster || p.risiko));
}

/** Åpne saker (bjellas tall): alt i «Alle». */
export function apneSaker(liste: readonly InnboksPost[]): number {
  return tellFilter(liste, "alle");
}
