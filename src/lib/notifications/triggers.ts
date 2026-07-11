/**
 * Notifikasjons-trigger-registry.
 *
 * Sentral kilde for ALLE trigger-typer i plattformen. Mappes til:
 * - Notification.type i database (in-app varsel)
 * - E-postmal-slug (Resend transactional)
 * - Web Push topic (når aktivert)
 *
 * Reglene:
 * - Bruk const-assertion → autocomplete + type-safety
 * - Hver trigger har eksplisitt kategori (spiller/coach/forelder/system)
 * - Channels: ["in-app", "email", "push", "sms"]
 * - Email-slug må matche eksisterende EmailTemplate.slug i DB
 */

export type TriggerCategory = "spiller" | "coach" | "forelder" | "system";
export type Channel = "in-app" | "email" | "push" | "sms";

export type TriggerDefinition = {
  /** Unik identifier — brukes som Notification.type i database */
  key: string;
  /** Visning-tekst for admin/audit-logs */
  label: string;
  /** Hvem som mottar varselet */
  category: TriggerCategory;
  /** Hvilke kanaler som kan brukes (kanal-toggle i bruker-prefs styrer faktisk levering) */
  channels: Channel[];
  /** Slug for EmailTemplate-rad i DB (hvis email-kanal er aktivert) */
  emailSlug?: string;
  /** Standardprioritet — påvirker visning i varselsenter */
  priority: "high" | "normal" | "low";
};

export const TRIGGERS = {
  // ============================================================
  // SPILLER-RELATERTE (varsler til spiller)
  // ============================================================
  WELCOME: {
    key: "welcome",
    label: "Velkomst (ved registrering)",
    category: "spiller",
    channels: ["email"],
    emailSlug: "velkomst-gratis",
    priority: "normal",
  },
  BOOKING_CONFIRMED: {
    key: "booking-confirmed",
    label: "Bekreftelse på booking",
    category: "spiller",
    channels: ["in-app", "email", "push"],
    emailSlug: "booking-bekreftelse",
    priority: "high",
  },
  BOOKING_REMINDER_24H: {
    key: "booking-reminder-24h",
    label: "Påminnelse 24 timer før booking",
    category: "spiller",
    channels: ["in-app", "email", "push"],
    emailSlug: "oekt-paaminnelse",
    priority: "high",
  },
  BOOKING_CANCELLED: {
    key: "booking-cancelled",
    label: "Bekreftelse på avbestilling",
    category: "spiller",
    channels: ["in-app", "email"],
    emailSlug: "booking-avlyst",
    priority: "high",
  },
  BOOKING_RESCHEDULED: {
    key: "booking-rescheduled",
    label: "Reschedule-bekreftelse",
    category: "spiller",
    channels: ["in-app", "email", "push"],
    emailSlug: "booking-flyttet",
    priority: "high",
  },
  INVOICE_SENT: {
    key: "invoice-sent",
    label: "Faktura sendt",
    category: "spiller",
    channels: ["in-app", "email"],
    emailSlug: "faktura-sendt",
    priority: "normal",
  },
  INVOICE_PAID: {
    key: "invoice-paid",
    label: "Faktura betalt (kvittering)",
    category: "spiller",
    channels: ["in-app", "email"],
    emailSlug: "faktura-betalt",
    priority: "normal",
  },
  INVOICE_OVERDUE: {
    key: "invoice-overdue",
    label: "Faktura forfalt",
    category: "spiller",
    channels: ["in-app", "email"],
    emailSlug: "faktura-forfalt",
    priority: "high",
  },
  PLAN_ASSIGNED: {
    key: "plan-assigned",
    label: "Plan tildelt fra coach",
    category: "spiller",
    channels: ["in-app", "email", "push"],
    emailSlug: "plan-tildelt",
    priority: "high",
  },
  COACH_MESSAGE: {
    key: "coach-message",
    label: "Ny melding fra coach",
    category: "spiller",
    channels: ["in-app", "push"],
    priority: "high",
  },
  TEST_RESULT_READY: {
    key: "test-result-ready",
    label: "Test-resultat klar",
    category: "spiller",
    channels: ["in-app", "email"],
    emailSlug: "test-resultat",
    priority: "normal",
  },
  GOAL_ACHIEVED: {
    key: "goal-achieved",
    label: "Mål oppnådd",
    category: "spiller",
    channels: ["in-app", "push"],
    priority: "normal",
  },
  HCP_CHANGED: {
    key: "hcp-changed",
    label: "HCP-endring",
    category: "spiller",
    channels: ["in-app"],
    priority: "low",
  },
  SUBSCRIPTION_RENEWAL: {
    key: "subscription-renewal",
    label: "Forfaller-varsel for abonnement",
    category: "spiller",
    channels: ["in-app", "email"],
    emailSlug: "abonnement-fornying",
    priority: "normal",
  },
  SUBSCRIPTION_CANCELLED: {
    key: "subscription-cancelled",
    label: "Abonnement avsluttet (bekreftelse)",
    category: "spiller",
    channels: ["in-app", "email"],
    emailSlug: "abonnement-avsluttet",
    priority: "normal",
  },

  // ============================================================
  // COACH-RELATERTE (varsler til coach)
  // ============================================================
  NEW_BOOKING: {
    key: "new-booking",
    label: "Ny booking fra spiller",
    category: "coach",
    channels: ["in-app", "email", "push"],
    emailSlug: "ny-booking-coach",
    priority: "high",
  },
  BOOKING_CANCELLED_BY_PLAYER: {
    key: "booking-cancelled-by-player",
    label: "Spiller avbestilte booking",
    category: "coach",
    channels: ["in-app", "email"],
    emailSlug: "booking-avlyst-coach",
    priority: "high",
  },
  PLAYER_LOGGED_ROUND: {
    key: "player-logged-round",
    label: "Spiller logget ny runde",
    category: "coach",
    channels: ["in-app"],
    priority: "low",
  },
  PLAYER_COMPLETED_TEST: {
    key: "player-completed-test",
    label: "Spiller fullført test",
    category: "coach",
    channels: ["in-app", "email"],
    emailSlug: "test-fullfoert",
    priority: "normal",
  },
  PARENT_QUESTION: {
    key: "parent-question",
    label: "Forelder sendte spørsmål",
    category: "coach",
    channels: ["in-app", "email"],
    emailSlug: "forelder-spoersmaal",
    priority: "high",
  },
  APPROVAL_PENDING: {
    key: "approval-pending",
    label: "Ny godkjenning venter",
    category: "coach",
    channels: ["in-app"],
    priority: "high",
  },
  WAGR_IMPORT_DONE: {
    key: "wagr-import-done",
    label: "WAGR-import ferdig",
    category: "coach",
    channels: ["in-app"],
    priority: "low",
  },

  // ============================================================
  // FORELDRE-RELATERTE (varsler til foresatte)
  // ============================================================
  CHILD_BOOKING_UPCOMING: {
    key: "child-booking-upcoming",
    label: "Barnets booking i morgen",
    category: "forelder",
    channels: ["in-app", "email"],
    emailSlug: "forelder-booking-paaminnelse",
    priority: "normal",
  },
  CHILD_INVOICE: {
    key: "child-invoice",
    label: "Faktura for barnet",
    category: "forelder",
    channels: ["in-app", "email"],
    emailSlug: "forelder-faktura",
    priority: "normal",
  },
  CONSENT_REQUIRED: {
    key: "consent-required",
    label: "Foreldresamtykke kreves",
    category: "forelder",
    channels: ["email"],
    emailSlug: "forelder-samtykke",
    priority: "high",
  },

  // ============================================================
  // SYSTEM (admin-varsler)
  // ============================================================
  PASSWORD_RESET: {
    key: "password-reset",
    label: "Tilbakestill passord",
    category: "system",
    channels: ["email"],
    emailSlug: "tilbakestill-passord",
    priority: "high",
  },
  EMAIL_VERIFICATION: {
    key: "email-verification",
    label: "E-post-verifikasjon",
    category: "system",
    channels: ["email"],
    emailSlug: "verifiser-epost",
    priority: "high",
  },
  SECURITY_ALERT: {
    key: "security-alert",
    label: "Sikkerhetsvarsel (uvanlig innlogging)",
    category: "system",
    channels: ["in-app", "email"],
    emailSlug: "sikkerhetsvarsel",
    priority: "high",
  },
  ACCOUNT_DELETED: {
    key: "account-deleted",
    label: "Konto slettet (GDPR-bekreftelse)",
    category: "system",
    channels: ["email"],
    emailSlug: "konto-slettet",
    priority: "high",
  },
} as const satisfies Record<string, TriggerDefinition>;

export type TriggerKey = keyof typeof TRIGGERS;
export type TriggerKeyValue = (typeof TRIGGERS)[TriggerKey]["key"];

/**
 * Hent trigger-definisjon basert på key.
 */
export function getTrigger(key: TriggerKeyValue): TriggerDefinition | undefined {
  return Object.values(TRIGGERS).find((t) => t.key === key);
}

/**
 * Alle triggers gruppert per kategori.
 */
export function triggersByCategory(category: TriggerCategory): TriggerDefinition[] {
  return Object.values(TRIGGERS).filter((t) => t.category === category);
}
