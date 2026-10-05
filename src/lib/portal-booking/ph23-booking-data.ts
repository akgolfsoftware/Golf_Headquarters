/**
 * PH-23 Booking (spiller) datamodell og hjelpefunksjoner.
 * Kilde: Claude Design Precision Athletics (PH-23.jsx, data-meg.js).
 */

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

export type PH23BookingData = {
  rate: number;
  cancelHours: number;
  card: PH23BookingCard;
  services: PH23Service[];
  days: [string, string][];
  slots: Record<number, string[]>;
  slotDetails?: Record<string, { dateIso: string; coachId: string; coachNavn: string }>;
  mine: PH23MyBooking[];
  past: PH23PastBooking[];
  playerEmail: string;
};

/** Formaterer beløp i norske kroner med tusenskilletegn. */
export function formatKr(n: number | null | undefined): string {
  if (n == null) return "—";
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " kr";
}

/** Beregner pris for en gitt tjeneste basert på timepris eller fastpris. */
export function beregnTjenestePris(service: PH23Service, rate: number): number {
  if (service.price != null) return service.price;
  return Math.round((rate * service.min) / 60);
}

/** Syntetiske standarddata for PH-23 ved tomt/mock-grunnlag. */
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

/**
 * Mapper BookingHubData fra Prisma over til PH-23 datamodell.
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
    }[];
  },
  playerEmail: string,
  services?: PH23Service[],
  slotVindu?: { dager: { datoIso: string; tider: { kl: string }[] }[] }
): PH23BookingData {
  const synth = getSyntheticPH23Data(false);

  const renewsDato = hub.credits.renewsAtIso
    ? new Date(hub.credits.renewsAtIso).toLocaleDateString("nb-NO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : synth.card.resets;

  const card: PH23BookingCard = {
    pkg:
      hub.credits.monthlyCredits === 4
        ? "Performance Pro"
        : hub.credits.monthlyCredits === 2
          ? "Performance"
          : hub.credits.tier === "FULL"
            ? "Full"
            : "Talent",
    total: hub.credits.monthlyCredits || synth.card.total,
    left: hub.credits.creditsRemaining,
    valid: renewsDato,
    resets: renewsDato,
    covers: "Én coachet økt trekker ett klipp",
  };

  const mine: PH23MyBooking[] = hub.upcoming.map((b) => {
    const d = new Date(b.startIso);
    const dayStr = d.toLocaleDateString("nb-NO", { weekday: "short", day: "2-digit", month: "2-digit" });
    const capitalizedDay = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
    const timeStr = d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });

    return {
      id: b.id,
      svc: b.serviceName,
      svcName: `${b.serviceName} · ${b.durationMin} min`,
      day: capitalizedDay,
      t: timeStr,
      place: b.locationName,
      status: b.status === "CONFIRMED" ? "Bekreftet" : "Venter",
      pay: b.fromCredits ? "Klipp" : "Betalt",
      coachName: b.coachName,
    };
  });

  const past: PH23PastBooking[] = hub.past.map((b) => {
    const d = new Date(b.startIso);
    const dayStr = d.toLocaleDateString("nb-NO", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const capitalizedDay = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
    const timeStr = d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });

    return {
      id: b.id,
      svc: b.serviceName,
      svcName: `${b.serviceName} · ${b.durationMin} min`,
      day: capitalizedDay,
      t: timeStr,
      ref: `BK-${b.id.slice(0, 8).toUpperCase()}`,
      src: `${b.locationName} · ${b.coachName ?? "Uten coach"}`,
    };
  });

  // Håndter dager og slots hvis vi har slotVindu
  let days = synth.days;
  let slots = synth.slots;

  if (slotVindu && slotVindu.dager.length > 0) {
    days = slotVindu.dager.slice(0, 5).map((d) => {
      const date = new Date(d.datoIso);
      const dagNavn = date.toLocaleDateString("nb-NO", { weekday: "short" });
      const dagMnd = date.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" });
      return [dagNavn.charAt(0).toUpperCase() + dagNavn.slice(1), dagMnd];
    });

    slots = {};
    slotVindu.dager.slice(0, 5).forEach((d, idx) => {
      slots[idx] = d.tider.map((t) => t.kl);
    });
  }

  return {
    rate: synth.rate,
    cancelHours: synth.cancelHours,
    card,
    services: services && services.length > 0 ? services : synth.services,
    days,
    slots,
    mine: mine.length > 0 ? mine : synth.mine,
    past: past.length > 0 ? past : synth.past,
    playerEmail,
  };
}

