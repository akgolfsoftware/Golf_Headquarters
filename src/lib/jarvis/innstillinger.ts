/**
 * JarvisInnstilling — én lese-funksjon brukt av kø, kalender, innsamlere
 * og Telegram. Ingen rad / DB-feil = STANDARD_INNSTILLINGER (skjemaets
 * @default), aldri en hard feil.
 *
 * Stille tidsrom: 22:00–07:00 Europe/Oslo når bryteren er på.
 */
import { prisma } from "@/lib/prisma";
import { SakKanal } from "@/generated/prisma/enums";
import { STANDARD_INNSTILLINGER, type Innstillinger } from "@/lib/jarvis/types";

function fraRad(rad: Innstillinger): Innstillinger {
  return {
    kanalGmail: rad.kanalGmail,
    kanalImessage: rad.kanalImessage,
    kanalTelegram: rad.kanalTelegram,
    kanalAnrop: rad.kanalAnrop,
    kanalKalender: rad.kanalKalender,
    slaTerskelTimer: rad.slaTerskelTimer,
    stemmeAktivert: rad.stemmeAktivert,
    stilleTidsromAktivert: rad.stilleTidsromAktivert,
  };
}

export async function hentJarvisInnstillinger(userId?: string): Promise<Innstillinger> {
  try {
    const id =
      userId ??
      (
        await prisma.user.findFirst({
          where: { role: "ADMIN", deletedAt: null },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        })
      )?.id;
    if (!id) return STANDARD_INNSTILLINGER;
    const rad = await prisma.jarvisInnstilling.findUnique({ where: { userId: id } });
    if (!rad) return STANDARD_INNSTILLINGER;
    return fraRad(rad);
  } catch {
    return STANDARD_INNSTILLINGER;
  }
}

/** Alias — Jarvis kjører kun for ADMIN. */
export const hentJarvisInnstillingerForAdmin = () => hentJarvisInnstillinger();

export function kanalPa(inn: Innstillinger, kanal: SakKanal): boolean {
  switch (kanal) {
    case SakKanal.EPOST:
      return inn.kanalGmail;
    case SakKanal.SMS:
    case SakKanal.IMESSAGE:
      return inn.kanalImessage;
    case SakKanal.TELEGRAM:
      return inn.kanalTelegram;
    case SakKanal.ANROP:
      return inn.kanalAnrop;
    case SakKanal.KALENDER:
      return inn.kanalKalender;
    case SakKanal.LYD:
      return inn.stemmeAktivert;
    case SakKanal.TASK:
      return true;
  }
}

export function filtrerSakerEtterKanal<T extends { kanal: SakKanal }>(
  saker: T[],
  inn: Innstillinger,
): T[] {
  return saker.filter((s) => kanalPa(inn, s.kanal));
}

/** Time 0–23 i Europe/Oslo. */
export function osloTime(na: Date): number {
  const deler = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(na);
  return Number(deler.find((p) => p.type === "hour")?.value ?? "0");
}

/** 22:00 inkl. til 07:00 ekskl. Oslo, kun når bryteren er på. */
export function iStilleTidsrom(na: Date, inn: Innstillinger): boolean {
  if (!inn.stilleTidsromAktivert) return false;
  const time = osloTime(na);
  return time >= 22 || time < 7;
}

export function slaTerskelTimer(inn: Innstillinger): number {
  const t = inn.slaTerskelTimer;
  if (!Number.isFinite(t) || t < 1) return STANDARD_INNSTILLINGER.slaTerskelTimer;
  return Math.min(Math.round(t), 72);
}

/** Telegram-oppsummering fra innsamlere — av hvis kanal av eller stille tidsrom. */
export function skalSendeJarvisTelegram(inn: Innstillinger, na: Date = new Date()): boolean {
  return inn.kanalTelegram && !iStilleTidsrom(na, inn);
}
