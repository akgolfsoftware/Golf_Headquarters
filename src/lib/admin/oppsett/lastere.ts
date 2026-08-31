/**
 * Oppsett — datalasting per fane (MASTERPLAN 15.3).
 *
 * Hver funksjon er flyttet ORDRETT ut av siden den kom fra — samme
 * spørringer, samme mapping, samme formatering. Kun den aktive fanen lastes.
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { coachScopedPlayerWhere } from "@/lib/auth/coached";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability, CAPABILITY_BESKRIVELSER, ROLE_CAPABILITIES, can } from "@/lib/auth/cbac";
import { beregnEffektive } from "@/lib/auth/effective-capabilities-core";
import type { UserRole, FacilityType } from "@/generated/prisma/client";
import type { requirePortalUser } from "@/lib/auth/requirePortalUser";

type PortalUser = Awaited<ReturnType<typeof requirePortalUser>>;
import type { AdminOppsettHubData } from "@/components/admin/v2/oppsett/AdminOppsettHubTrainLock";
import type { KlubbItem, ClubSettingsData, KlubbFasilitet } from "@/components/admin/v2/oppsett/AdminKlubbInnstillingerTrainLock";
import type { AdminKalenderSynkV2Data, KalenderRad } from "@/components/admin/v2/oppsett/AdminKalenderSynkTrainLock";
import type { AdminTilgangV2Row } from "@/components/admin/v2/oppsett/AdminTilgangTrainLock";
import type { PerTrenerCoach } from "@/components/admin/v2/oppsett/AdminTilgangPerTrenerTrainLock";
import type { AdminSecurityV2Data } from "@/components/admin/v2/oppsett/AdminSecurityTrainLock";
import type { IntegrasjonKort, IntegrasjonStatus } from "@/components/admin/v2/oppsett/AdminIntegrasjonerTrainLock";
import type { AdminApiKeysV2Data, AdminApiKeysV2Nokkel } from "@/components/admin/v2/oppsett/AdminApiKeysTrainLock";
import { hentPeriodeNavnOversikt } from "@/app/admin/settings/periode-navn/actions";
import { PERIODE_NAVN_LABELS } from "@/app/admin/settings/periode-navn/labels";

const ROLLER: UserRole[] = ["ADMIN", "COACH", "PLAYER", "PARENT", "GUEST"];

// ── Akademi (fra /admin/settings, uendret) ──────────────────────────────────

export async function lastAkademiData(user: PortalUser): Promise<AdminOppsettHubData> {
  const [locations, settingsRow, team, totalSpillere] = await Promise.all([
    prisma.location.findMany({
      select: { id: true, name: true, active: true, _count: { select: { facilities: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.clubSettings.findFirst({ select: { clubName: true } }),
    prisma.user.findMany({
      where: { role: { in: ["COACH", "ADMIN"] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: { select: { coachedGroups: true, coachAvailability: true } },
      },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
    prisma.user.count({ where: coachScopedPlayerWhere(user) }),
  ]);

  const totalCount = team.length;
  const adminCount = team.filter((u) => u.role === "ADMIN").length;
  const coachCount = team.filter((u) => u.role === "COACH").length;
  const snittSpillere = totalCount > 0 ? (totalSpillere / totalCount).toFixed(1).replace(".", ",") : "—";

  return {
    akademi: {
      navn: settingsRow?.clubName?.trim() || "AK Golf Academy",
      hjemmeklubb: locations.find((l) => l.active)?.name ?? null,
      sesong: new Date().getFullYear(),
      ukestart: "Mandag",
    },
    varslerBeskrivelse: "Kø, godkjenning, live",
    tilgang: {
      medlemmer: team.map((u) => ({
        id: u.id,
        navn: u.name ?? "Uten navn",
        epost: u.email,
        rolle: u.role === "ADMIN" ? "ADMIN" : "COACH",
        grupper: u._count.coachedGroups,
        tidsvinduer: u._count.coachAvailability,
      })),
      totalCount,
      adminCount,
      coachCount,
      totalSpillere,
      snittSpillere,
      inviterHref: "/admin/team/inviter",
      tilgangsmatriseHref: "/admin/oppsett?fane=tilgang",
    },
    klubb: {
      lokasjoner: locations.map((l) => ({ id: l.id, navn: l.name, aktiv: l.active, fasiliteter: l._count.facilities })),
      innstillingerHref: "/admin/oppsett?fane=klubb",
      fasiliteterHref: "/admin/anlegg",
    },
    konto: {
      navn: user.name ?? "Coach",
      epost: user.email,
      rolleLabel: user.role === "ADMIN" ? "Administrator" : "Coach",
      href: "/admin/profile",
    },
  };
}

// ── Klubb (fra /admin/klubb/innstillinger, uendret) ─────────────────────────

const TOM = "—";

const TYPE_IKON: Record<FacilityType, string> = {
  STUDIO: "radar",
  RANGE_1F: "flag",
  RANGE_2F: "flag",
  PUTTING_GREEN: "circle-dot",
  SHORT_GAME: "circle-dot",
  COURSE_9H: "map",
  COURSE_18H: "map",
  SPECIFIC_HOLES: "map",
  GENERAL: "building-2",
};

type Apningstider = { hverdag: string; helg: string };

function parseApningstider(raw: unknown): Apningstider | null {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const o = raw as Record<string, unknown>;
    const hverdag = typeof o.hverdag === "string" ? o.hverdag : "";
    const helg = typeof o.helg === "string" ? o.helg : "";
    if (hverdag || helg) return { hverdag, helg };
  }
  return null;
}

/** Krever Capability.MANAGE_FACILITIES i tillegg til ADMIN — kall FØR bruk. */
export async function sjekkKlubbTilgang(): Promise<void> {
  await requireCapability(Capability.MANAGE_FACILITIES);
}

export async function lastKlubbData(): Promise<{ klubber: KlubbItem[]; settings: ClubSettingsData }> {
  const naa = new Date();
  const ukeStart = new Date(naa);
  ukeStart.setHours(0, 0, 0, 0);
  ukeStart.setDate(ukeStart.getDate() - ((ukeStart.getDay() + 6) % 7));
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const [locations, settingsRow] = await Promise.all([
    prisma.location.findMany({
      orderBy: { name: "asc" },
      include: {
        facilities: {
          orderBy: [{ active: "desc" }, { name: "asc" }],
          include: {
            _count: {
              select: {
                bookings: {
                  where: {
                    startAt: { gte: ukeStart, lt: ukeSlutt },
                    status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.clubSettings.findFirst(),
  ]);

  const apningstider = parseApningstider(settingsRow?.apningstider);
  const settings: ClubSettingsData = {
    clubName: settingsRow?.clubName ?? "",
    dagligLeder: settingsRow?.dagligLeder ?? "",
    orgNr: settingsRow?.orgNr ?? "",
    epost: settingsRow?.epost ?? "",
    telefon: settingsRow?.telefon ?? "",
    adresse: settingsRow?.adresse ?? "",
    apningstider: apningstider ?? { hverdag: "", helg: "" },
  };

  const klubber: KlubbItem[] = await Promise.all(
    locations.map(async (l) => {
      const [spillereCount, coacherCount] = await Promise.all([
        prisma.user.count({
          where: {
            role: "PLAYER",
            homeClub: { contains: l.name.split(" ")[0], mode: "insensitive" },
          },
        }),
        prisma.user.count({
          where: {
            role: "COACH",
            homeClub: { contains: l.name.split(" ")[0], mode: "insensitive" },
          },
        }),
      ]);

      const defaultFacility = l.facilities[0] ?? null;

      return {
        id: l.id,
        name: l.name,
        address: l.address,
        active: l.active,
        latitude: l.latitude,
        longitude: l.longitude,
        facilities: l.facilities.map((f) => ({
          id: f.id,
          name: f.name,
          ikonNavn: TYPE_IKON[f.type],
          type: f.type,
          capacity: f.capacity,
          active: f.active,
          bookinger: f._count.bookings,
          description: f.description,
        })),
        spillereCount,
        coacherCount,
        defaultFacilityId: defaultFacility?.id ?? null,
        dagligLederNavn: settings.dagligLeder || TOM,
        dagligLederEmail: settings.epost || TOM,
        apningstider: {
          hverdag: settings.apningstider.hverdag || TOM,
          helg: settings.apningstider.helg || TOM,
        },
      } satisfies KlubbItem;
    }),
  );

  return { klubber, settings };
}

export type { KlubbFasilitet };

// ── Kalender (fra /admin/settings/calendar, uendret) ────────────────────────

export async function lastKalenderData(
  userId: string,
  ok: string | undefined,
  error: string | undefined,
): Promise<AdminKalenderSynkV2Data> {
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId },
    include: {
      subscriptions: {
        orderBy: [{ syncPush: "desc" }, { calendarName: "asc" }],
      },
    },
  });

  const rader: KalenderRad[] =
    conn?.subscriptions.map((s) => ({
      id: s.id,
      googleCalendarId: s.googleCalendarId,
      calendarName: s.calendarName,
      color: s.color,
      syncPush: s.syncPush,
      syncPull: s.syncPull,
      visIKalender: s.visIKalender,
      active: s.active,
      lastError: s.lastError,
    })) ?? [];

  return {
    okParam: ok === "1",
    errorParam: error ?? null,
    connection: conn
      ? {
          googleEmail: conn.googleEmail,
          status: conn.status,
          lastSyncAt: conn.lastSyncAt
            ? conn.lastSyncAt.toLocaleString("nb-NO", { dateStyle: "medium", timeStyle: "short" })
            : null,
          lastError: conn.lastError,
        }
      : null,
    subscriptions: rader,
  };
}

// ── Tilgang (fra /admin/settings/tilgang, uendret) ──────────────────────────

export function lastTilgangRoller(): { roller: UserRole[]; rader: AdminTilgangV2Row[] } {
  const capabilities = Object.values(Capability);
  const rader: AdminTilgangV2Row[] = capabilities.map((cap) => ({
    id: cap,
    beskrivelse: CAPABILITY_BESKRIVELSER[cap],
    tillatt: Object.fromEntries(ROLLER.map((rolle) => [rolle, can(rolle, cap)])) as Record<UserRole, boolean>,
  }));
  return { roller: ROLLER, rader };
}

export async function lastTilgangPerTrener(): Promise<PerTrenerCoach[]> {
  const capabilities = Object.values(Capability);
  const coaches = await prisma.user.findMany({
    where: { role: "COACH", deletedAt: null },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
  const overrides = await prisma.userCapability.findMany({
    where: { userId: { in: coaches.map((c) => c.id) } },
    select: { userId: true, capability: true, mode: true },
  });

  return coaches.map((coach) => {
    const egne = overrides.filter((o) => o.userId === coach.id);
    const effektive = beregnEffektive(ROLE_CAPABILITIES.COACH, egne);
    return {
      id: coach.id,
      navn: coach.name,
      epost: coach.email,
      rader: capabilities.map((cap) => {
        const override = egne.find((o) => o.capability === cap);
        return {
          capability: cap,
          beskrivelse: CAPABILITY_BESKRIVELSER[cap],
          standard: can("COACH", cap),
          override: override?.mode === "GRANT" || override?.mode === "REVOKE" ? override.mode : null,
          effektiv: effektive.has(cap),
        };
      }),
    };
  });
}

// ── Sikkerhet (fra /admin/settings/security, uendret) ───────────────────────

export function lastSikkerhetData(user: PortalUser): AdminSecurityV2Data {
  return {
    rolle: user.role === "ADMIN" ? "ADMIN" : "COACH",
    epost: user.email,
    sistOppdatert: user.updatedAt.toLocaleString("nb-NO", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

// ── Integrasjoner (fra /admin/integrasjoner, uendret) ───────────────────────

function nokFormat(ore: number): string {
  return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(ore / 100);
}

export async function lastIntegrasjonerData(me: PortalUser): Promise<IntegrasjonKort[]> {
  const googleConn = await prisma.googleCalendarConnection.findUnique({
    where: { userId: me.id },
    select: { id: true, updatedAt: true, status: true, lastError: true },
  });
  const googleKreverPalogging = googleConn?.status === "ERROR";

  const stripeAktiv = Boolean(process.env.STRIPE_SECRET_KEY);
  const tretti = new Date();
  tretti.setDate(tretti.getDate() - 30);
  const stripeSum = stripeAktiv
    ? await prisma.booking.aggregate({
        _sum: { priceOre: true },
        where: { stripePaymentIntentId: { not: null }, startAt: { gte: tretti } },
      })
    : null;
  const stripeBelop = stripeSum?._sum.priceOre ?? 0;

  const anthropicAktiv = Boolean(process.env.ANTHROPIC_API_KEY);
  const resendAktiv = Boolean(process.env.RESEND_API_KEY);

  return [
    {
      key: "google-calendar",
      title: "Google Calendar",
      icon: "calendar",
      status: (googleKreverPalogging ? "error" : googleConn ? "connected" : "disconnected") as IntegrasjonStatus,
      statusLabel: googleKreverPalogging ? "Krever pålogging" : googleConn ? "Koblet" : "Ikke koblet",
      description: "Toveis-sync av timer og bookinger med trenerens Google-kalender.",
      meta: googleKreverPalogging
        ? (googleConn?.lastError ?? "Tilgangen utløp — logg inn på nytt.")
        : googleConn
          ? `Sist oppdatert ${googleConn.updatedAt.toLocaleDateString("nb-NO")}`
          : undefined,
      ctaLabel: googleKreverPalogging ? "Logg inn på nytt" : googleConn ? "Administrer" : "Koble til",
      ctaHref: "/admin/oppsett?fane=kalender",
    },
    {
      key: "stripe",
      title: "Stripe",
      icon: "credit-card",
      status: (stripeAktiv ? "active" : "disconnected") as IntegrasjonStatus,
      statusLabel: stripeAktiv ? "Aktiv" : "Ikke konfigurert",
      description: "Betaling for bookinger, abonnement og fakturering.",
      meta: stripeAktiv ? `${nokFormat(stripeBelop)} siste 30 dager` : undefined,
      ctaLabel: "Se økonomi",
      ctaHref: "/admin/finance",
    },
    {
      key: "notion",
      title: "Notion",
      icon: "file-text",
      status: "disconnected",
      statusLabel: "Ikke koblet",
      description: "Speil prosjekter og oppgaver fra Notion-arbeidsområdet.",
      meta: "Venter på Notion-token",
      ctaLabel: "Koble Notion",
      ctaHref: "https://www.notion.so/profile/integrations",
      ctaExternal: true,
    },
    {
      key: "anthropic",
      title: "Anthropic (AI)",
      icon: "sparkles",
      status: (anthropicAktiv ? "active" : "disconnected") as IntegrasjonStatus,
      statusLabel: anthropicAktiv ? "Aktiv" : "Ikke konfigurert",
      description: "Claude-modeller for AI-agenter, godkjennelser og innholdsgenerering.",
      ctaLabel: "Se agenter",
      ctaHref: "/admin/agenticos",
    },
    {
      key: "resend",
      title: "Resend (E-post)",
      icon: "mail",
      status: (resendAktiv ? "active" : "disconnected") as IntegrasjonStatus,
      statusLabel: resendAktiv ? "Aktiv" : "Ikke konfigurert",
      description: "Transaksjonell e-post — bekreftelser, påminnelser, maler.",
      ctaLabel: "E-postmaler",
      ctaHref: "/admin/email-templates",
    },
    {
      key: "supabase",
      title: "Supabase",
      icon: "database",
      status: "active",
      statusLabel: "Aktiv",
      description: "Postgres-database og autentisering. Kjernen i hele plattformen.",
      meta: "Always-on",
      ctaLabel: "Status",
      ctaHref: "https://status.supabase.com",
      ctaExternal: true,
    },
  ];
}

// ── API (fra /admin/settings/api, uendret) ──────────────────────────────────

const scopesSchema = z.array(z.string());

function formatDate(d: Date) {
  return d.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function relativ(d: Date) {
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "nå nettopp";
  if (min < 60) return `${min} min siden`;
  const t = Math.floor(min / 60);
  if (t < 24) return `${t}t siden`;
  const dg = Math.floor(t / 24);
  return `${dg} dag${dg === 1 ? "" : "er"} siden`;
}

export async function lastApiData(): Promise<AdminApiKeysV2Data> {
  const keys = await prisma.apiKey.findMany({
    include: { user: { select: { name: true } } },
    orderBy: [{ revokedAt: "asc" }, { createdAt: "desc" }],
  });

  const nokler: AdminApiKeysV2Nokkel[] = keys.map((k) => {
    const scopesParsed = scopesSchema.safeParse(k.scopes);
    return {
      id: k.id,
      navn: k.name,
      prefix: k.prefix,
      scopes: scopesParsed.success ? scopesParsed.data : [],
      eier: k.user.name ?? "Uten navn",
      opprettet: formatDate(k.createdAt),
      sistBrukt: k.lastUsedAt ? `Brukt ${relativ(k.lastUsedAt)}` : "Aldri brukt",
      utloper: k.expiresAt ? formatDate(k.expiresAt) : null,
      revokert: k.revokedAt != null,
    };
  });

  return {
    nokler,
    aktiveCount: nokler.filter((n) => !n.revokert).length,
    totalCount: nokler.length,
  };
}

// ── Perioder (fra /admin/settings/periode-navn, uendret) ───────────────────

export async function lastPerioderData() {
  const oversikt = await hentPeriodeNavnOversikt();
  return { oversikt, typer: PERIODE_NAVN_LABELS };
}
