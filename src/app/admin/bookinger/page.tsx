/**
 * AgencyOS — Bookinger (GJENNOMFØRE · BOOKINGER), /admin/bookinger.
 *
 * Port av fasit `agencyos-app/screens-ops.jsx` → BookingsScreen (mørkt tema,
 * desktop 1280): PageHead («N bookinger uke X.» + pending-avhengig lead +
 * «Ny booking») og tabell Spiller/Type/Tid/Status med Bekreft/Avvis i raden
 * for ventende bookinger (ekte server-actions, ikke demo).
 *
 * Datakilde: prisma.booking for inneværende uke (man–søn). «Ny booking»
 * lenker til eksisterende wizard /admin/bookinger/ny (urørt underside).
 * Status-mapping: PENDING=Venter svar · CONFIRMED=Bekreftet ·
 * CANCELLED=Avlyst · COMPLETED=Fullført.
 */

import Link from "next/link";
import { Plus } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  AgChip,
  AgPage,
  AgPageHead,
  AgPlayerCell,
  AgTable,
  AgTd,
  AgTh,
  agBtnClass,
  agTrClass,
} from "@/components/admin/agencyos/ui";
import { BekreftAvvis } from "./bekreft-avvis";

export const dynamic = "force-dynamic";

const DAGER_KORT = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"]; // getDay()-indeks

function mandagFor(d: Date): Date {
  const m = new Date(d);
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

function isoUke(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dag = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dag);
  const aarStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - aarStart.getTime()) / 86_400_000 + 1) / 7);
}

function tidLabel(d: Date): string {
  const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${DAGER_KORT[d.getDay()]} ${d.getDate()}. · ${hhmm}`;
}

function initialer(navn: string): string {
  const deler = navn.trim().split(/\s+/);
  if (deler.length === 1) return deler[0].slice(0, 2).toUpperCase();
  return (deler[0][0] + deler[deler.length - 1][0]).toUpperCase();
}

const STATUS: Record<string, { label: string; tone: "ok" | "warn" | "neu" }> = {
  PENDING: { label: "Venter svar", tone: "warn" },
  CONFIRMED: { label: "Bekreftet", tone: "ok" },
  CANCELLED: { label: "Avlyst", tone: "neu" },
  COMPLETED: { label: "Fullført", tone: "neu" },
};

export default async function BookingerPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const ukeStart = mandagFor(new Date());
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);
  const ukeNr = isoUke(ukeStart);

  const bookinger = await prisma.booking.findMany({
    where: { startAt: { gte: ukeStart, lt: ukeSlutt } },
    orderBy: { startAt: "asc" },
    include: {
      user: { select: { id: true, name: true } },
      serviceType: { select: { name: true } },
    },
  });

  const venter = bookinger.filter((b) => b.status === "PENDING").length;
  const lead =
    venter === 0
      ? `Alt besvart. Pro-timer, bays og tee-times for uke ${ukeNr}.`
      : venter === 1
        ? "Én venter på ditt svar — bekreft eller avvis i raden."
        : `${venter} venter på ditt svar — bekreft eller avvis i raden.`;

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Gjennomføre · Bookinger"
        title={`${bookinger.length} ${bookinger.length === 1 ? "booking" : "bookinger"}`}
        italic={`uke ${ukeNr}.`}
        lead={lead}
        actions={
          <Link href="/admin/bookinger/ny" className={agBtnClass("primary")}>
            <Plus size={16} strokeWidth={1.5} /> Ny booking
          </Link>
        }
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <AgTable>
          <thead>
            <tr>
              <AgTh>Spiller</AgTh>
              <AgTh>Type</AgTh>
              <AgTh>Tid</AgTh>
              <AgTh>Status</AgTh>
              <AgTh />
            </tr>
          </thead>
          <tbody>
            {bookinger.length === 0 && (
              <tr>
                <td colSpan={5} className="px-[14px] py-10 text-center text-[13px] text-muted-foreground">
                  Ingen bookinger denne uka.
                </td>
              </tr>
            )}
            {bookinger.map((b) => {
              const navn = b.user?.name ?? b.guestName ?? "Gjest";
              const status = STATUS[b.status] ?? { label: b.status, tone: "neu" as const };
              return (
                <tr key={b.id} className={agTrClass}>
                  <AgTd>
                    <AgPlayerCell initials={initialer(navn)} name={navn} size={28} />
                  </AgTd>
                  <AgTd>{b.serviceType.name}</AgTd>
                  <AgTd>
                    <span className="font-mono text-xs">{tidLabel(b.startAt)}</span>
                  </AgTd>
                  <AgTd>
                    <AgChip tone={status.tone}>{status.label}</AgChip>
                  </AgTd>
                  <AgTd className="text-right">
                    {b.status === "PENDING" ? (
                      <BekreftAvvis bookingId={b.id} />
                    ) : b.user ? (
                      <Link
                        href={`/admin/spillere/${b.user.id}`}
                        className={agBtnClass("ghost", "sm")}
                      >
                        Se
                      </Link>
                    ) : null}
                  </AgTd>
                </tr>
              );
            })}
          </tbody>
        </AgTable>
      </div>
    </AgPage>
  );
}
