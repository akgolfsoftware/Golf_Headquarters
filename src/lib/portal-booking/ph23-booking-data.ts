/**
 * PH-23 Booking (spiller) datamodell og hjelpefunksjoner.
 * Kilde: Claude Design Precision Athletics (PH-23.jsx, data-meg.js).
 */

import { AVBESTILLING_FRIST_TIMER } from "@/lib/booking/policy";

export type PH23Service = {
  id: string;
  name: string;
  min: number;
  coach: string | null;
  coachId?: string | null;
  clip: boolean;
  price?: number | null;
  note?: string;
};

export type PH23BookingCard = {
  pkg: string;
  total: number;
  left: number;
  valid: string;
  resets: string;
  covers: string;
};

export type PH23SlotDay = {
  dayName: string;
  dayMonth: string;
  dateIso: string;
  slots: {
    t: string;
    coachId: string;
    coachNavn: string;
  }[];
};

export type PH23MyBooking = {
  id: string;
  svc: string;
  /** ServiceType-id — trengs for å hente ledige tider ved flytting. */
  serviceTypeId?: string;
  svcName: string;
  day: string;
  t: string;
  place: string;
  status: "Bekreftet" | "Avbestilt" | "Venter";
  pay: string;
  startIso?: string;
  coachId?: string | null;
  coachName?: string | null;
};

export type PH23PastBooking = {
  id: string;
  svc: string;
  svcName: string;
  day: string;
  t: string;
  ref: string;
  src: string;
};

/** Ekte ledig tid: eksakt start (naiv Oslo-veggklokke, samme streng som wizarden) og coach. */
export type PH23SlotDetalj = { startIso: string; coachId: string; coachNavn: string };

export type PH23BookingData = {
  /** Timepris brukt når tjenesten mangler fastpris. Null = ingen kjent pris («—»). */
  rate: number | null;
  cancelHours: number;
  card: PH23BookingCard;
  services: PH23Service[];
  days: [string, string][];
  slots: Record<number, string[]>;
  /** Nøkkel `${dagIndex}|${kl}` → ekte slot. Mangler nøkkelen, kan tiden ikke bookes. */
  slotDetails?: Record<string, PH23SlotDetalj>;
  mine: PH23MyBooking[];
  past: PH23PastBooking[];
  playerEmail: string;
};

/** Formaterer beløp i norske kroner med tusenskilletegn. */
export function formatKr(n: number | null | undefined): string {
  if (n == null) return "—";
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " kr";
}

/** Beregner pris for en gitt tjeneste basert på timepris eller fastpris. Null = ukjent pris. */
export function beregnTjenestePris(service: PH23Service, rate: number | null): number | null {
  if (service.price != null) return service.price;
  if (rate == null) return null;
  return Math.round((rate * service.min) / 60);
}

/**
 * Syntetiske data for PH-23 — KUN for skjermkatalog og prøvefiler.
 * Brukes aldri i produksjonsruten: mapHubDataToPH23 faller aldri tilbake hit.
 */
export function getSyntheticPH23Data(empty = false): PH23BookingData {
  if (empty) {
    return {
      rate: 950,
      cancelHours: 24,
      card: {
        pkg: "Ingen pakke",
        total: 0,
        left: 0,
        valid: "—",
        resets: "—",
        covers: "Klipp følger coaching-pakkene",
      },
      services: [
        { id: "pt60", name: "Privattime", min: 60, coach: "Anders Kristiansen", clip: true, note: "60 min privattime med TrackMan og video" },
        { id: "pt30", name: "Privattime", min: 30, coach: "Anders Kristiansen", clip: true, note: "30 min oppfølging eller fokusøkt" },
        { id: "bay", name: "TrackMan-bay", min: 60, coach: null, clip: false, price: 350, note: "Egentrening i TrackMan-simulator på Fredrikstad GK" },
      ],
      days: [
        ["Man", "28.09"],
        ["Tir", "29.09"],
        ["Ons", "30.09"],
        ["Tor", "01.10"],
        ["Fre", "02.10"],
      ],
      slots: { 0: [], 1: [], 2: [], 3: [], 4: [] },
      mine: [],
      past: [],
      playerEmail: "spiller@akgolf.test",
    };
  }

  return {
    rate: 950,
    cancelHours: 24,
    card: {
      pkg: "Performance Pro",
      total: 4,
      left: 3,
      valid: "30.09.2026",
      resets: "01.10.2026",
      covers: "Én coachet økt trekker ett klipp",
    },
    services: [
      { id: "pt60", name: "Privattime", min: 60, coach: "Anders Kristiansen", clip: true, note: "60 min privattime med TrackMan og video" },
      { id: "pt30", name: "Privattime", min: 30, coach: "Anders Kristiansen", clip: true, note: "30 min oppfølging eller fokusøkt" },
      { id: "bay", name: "TrackMan-bay", min: 60, coach: null, clip: false, price: 350, note: "Egentrening i TrackMan-simulator på Fredrikstad GK" },
    ],
    days: [
      ["Man", "28.09"],
      ["Tir", "29.09"],
      ["Ons", "30.09"],
      ["Tor", "01.10"],
      ["Fre", "02.10"],
    ],
    slots: {
      0: ["15:00", "16:30"],
      1: ["14:00", "17:30", "18:30"],
      2: [],
      3: ["15:30", "16:30"],
      4: ["14:00"],
    },
    mine: [
      {
        id: "b1",
        svc: "pt60",
        svcName: "Privattime · 60 min",
        day: "Tir 29.09",
        t: "16:30",
        place: "Studio · Fredrikstad GK",
        status: "Bekreftet",
        pay: "Klipp",
      },
    ],
    past: [
      {
        id: "g1",
        svc: "pt60",
        svcName: "Privattime · 60 min",
        day: "Lør 12.09.2026",
        t: "14:00",
        ref: "BK-2026-0884",
        src: "Studio 1 · Fredrikstad GK",
      },
      {
        id: "g2",
        svc: "pt30",
        svcName: "Privattime · 30 min",
        day: "Tor 27.08.2026",
        t: "17:00",
        ref: "BK-2026-0812",
        src: "Studio 1 · Fredrikstad GK",
      },
    ],
    playerEmail: "tobias.lindvik@epost.no",
  };
}

/** Nøkkel for slotDetails. */
export function slotNokkel(dagIndex: number, kl: string): string {
  return `${dagIndex}|${kl}`;
}

type SlotVinduInn = {
  dager: { datoIso: string; tider: { kl: string; coachId: string; coachNavn: string; startIso?: string }[] }[];
};

/**
 * Bygger dager, tider og slot-detaljer fra et ekte slot-vindu (beregnSlotVindu).
 * Bare tider med eksakt start blir bookbare. Tomt vindu gir tomme lister — aldri demotider.
 */
export function byggSlotData(slotVindu: SlotVinduInn | null | undefined, antallDager = 5): {
  days: [string, string][];
  slots: Record<number, string[]>;
  slotDetails: Record<string, PH23SlotDetalj>;
} {
  const days: [string, string][] = [];
  const slots: Record<number, string[]> = {};
  const slotDetails: Record<string, PH23SlotDetalj> = {};
  const dager = (slotVindu?.dager ?? []).filter((d) => d.tider.some((t) => t.startIso)).slice(0, antallDager);

  dager.forEach((d, idx) => {
    const date = new Date(d.datoIso);
    const dagNavn = date.toLocaleDateString("nb-NO", { weekday: "short" }).replace(".", "");
    const dagMnd = date.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" });
    days.push([dagNavn.charAt(0).toUpperCase() + dagNavn.slice(1), dagMnd]);
    slots[idx] = [];
    for (const t of d.tider) {
      if (!t.startIso) continue;
      slots[idx].push(t.kl);
      slotDetails[slotNokkel(idx, t.kl)] = { startIso: t.startIso, coachId: t.coachId, coachNavn: t.coachNavn };
    }
  });

  return { days, slots, slotDetails };
}

/**
 * Mapper BookingHubData fra Prisma over til PH-23 datamodell.
 * Bare ekte data: mangler noe, blir det tomt eller «—». Ingen demodata.
 */
export function mapHubDataToPH23(
  hub: {
    credits: {
      monthlyCredits: number;
      creditsRemaining: number;
      renewsAtIso: string | null;
      canUseCredits: boolean;
      tier: string;
    };
    upcoming: {
      id: string;
      serviceTypeId?: string;
      serviceName: string;
      locationName: string;
      coachName: string | null;
      startIso: string;
      durationMin: number;
      fromCredits: boolean;
      status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
    }[];
    past: {
      id: string;
      serviceName: string;
      locationName: string;
      coachName: string | null;
      startIso: string;
      durationMin: number;
      status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
    }[];
  },
  playerEmail: string,
  services?: PH23Service[],
  slotVindu?: SlotVinduInn | null,
): PH23BookingData {
  const harPakke = hub.credits.canUseCredits && hub.credits.monthlyCredits > 0;
  const renewsDato = hub.credits.renewsAtIso
    ? new Date(hub.credits.renewsAtIso).toLocaleDateString("nb-NO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  const card: PH23BookingCard = {
    pkg: !harPakke
      ? "Ingen pakke"
      : hub.credits.monthlyCredits === 4
        ? "Performance Pro"
        : hub.credits.monthlyCredits === 2
          ? "Performance"
          : "Coaching-pakke",
    total: harPakke ? hub.credits.monthlyCredits : 0,
    left: harPakke ? hub.credits.creditsRemaining : 0,
    valid: harPakke ? renewsDato : "—",
    resets: harPakke ? renewsDato : "—",
    covers: "Én coachet økt trekker ett klipp",
  };

  const dagOgTid = (iso: string, medAar: boolean) => {
    const d = new Date(iso);
    const dayStr = d.toLocaleDateString("nb-NO", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      ...(medAar ? { year: "numeric" as const } : {}),
    });
    return {
      day: dayStr.charAt(0).toUpperCase() + dayStr.slice(1),
      t: d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const mine: PH23MyBooking[] = hub.upcoming.map((b) => ({
    id: b.id,
    svc: b.serviceName,
    serviceTypeId: b.serviceTypeId,
    svcName: `${b.serviceName} · ${b.durationMin} min`,
    ...dagOgTid(b.startIso, false),
    place: b.locationName,
    status: b.status === "CONFIRMED" ? "Bekreftet" : "Venter",
    pay: b.fromCredits ? "Klipp" : "Kort",
    startIso: b.startIso,
    coachName: b.coachName,
  }));

  const past: PH23PastBooking[] = hub.past.map((b) => ({
    id: b.id,
    svc: b.serviceName,
    svcName: `${b.serviceName} · ${b.durationMin} min${b.status === "CANCELLED" ? " · Avbestilt" : ""}`,
    ...dagOgTid(b.startIso, true),
    ref: `BK-${b.id.slice(0, 8).toUpperCase()}`,
    src: `${b.locationName} · ${b.coachName ?? "Uten coach"}`,
  }));

  const { days, slots, slotDetails } = byggSlotData(slotVindu);

  return {
    rate: null,
    cancelHours: AVBESTILLING_FRIST_TIMER,
    card,
    services: services ?? [],
    days,
    slots,
    slotDetails,
    mine,
    past,
    playerEmail,
  };
}

export type PH23BekreftValg = {
  serviceTypeId: string;
  slot: PH23SlotDetalj;
  /** Klipp bare når spilleren har klipp igjen og tjenesten dekkes; ellers kort. */
  betaling: "Klipp" | "Kort";
};

export type PH23BekreftResultat =
  | { type: "bekreftet"; bookingId: string }
  | { type: "betaling"; url: string }
  | { type: "feil"; grunn: string };

export type PH23BekreftAvhengigheter = {
  /** createCreditBooking — CONFIRMED med atomisk klipptrekk. */
  opprettMedKlipp: (input: { serviceTypeId: string; coachId: string; start: string }) => Promise<{ bookingId: string }>;
  /** opprettBookingMedKort — PENDING + Stripe Checkout; webhooken bekrefter. */
  opprettMedKort: (input: {
    serviceTypeId: string;
    coachId: string;
    startIso: string;
  }) => Promise<{ ok: true; url: string } | { ok: false; grunn: string }>;
};

/**
 * «Bekreft booking» i PH-23: kaller den ekte bookingflyten. Timen regnes som booket
 * bare når serveren har bekreftet den (klipp), eller etter betaling hos Stripe (kort).
 */
export async function bekreftPH23Booking(
  valg: PH23BekreftValg,
  deps: PH23BekreftAvhengigheter,
): Promise<PH23BekreftResultat> {
  try {
    if (valg.betaling === "Klipp") {
      const res = await deps.opprettMedKlipp({
        serviceTypeId: valg.serviceTypeId,
        coachId: valg.slot.coachId,
        start: valg.slot.startIso,
      });
      return { type: "bekreftet", bookingId: res.bookingId };
    }
    const res = await deps.opprettMedKort({
      serviceTypeId: valg.serviceTypeId,
      coachId: valg.slot.coachId,
      startIso: valg.slot.startIso,
    });
    return res.ok ? { type: "betaling", url: res.url } : { type: "feil", grunn: res.grunn };
  } catch (err) {
    return { type: "feil", grunn: err instanceof Error ? err.message : "Booking feilet. Prøv igjen." };
  }
}
