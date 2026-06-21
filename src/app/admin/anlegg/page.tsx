/**
 * AgencyOS — Anlegg (GJENNOMFØRE · ANLEGG), /admin/anlegg.
 *
 * Port av fasit `agencyos-app/screens-ops.jsx` → FacilitiesScreen (mørkt tema,
 * desktop 1280): PageHead («Fire fasiliteter.» + «Nytt anlegg») og 2-kolonners
 * grid av fasilitet-tiles (ikon + tittel + booking-trykk denne uka + beskrivelse).
 * Tile lenker til /admin/availability (fasit-flyt).
 *
 * Datakilde: prisma.location → facilities (aktive) + booking-telling denne uka.
 * Fasit viser «78 % belegg» — ekte belegg-% krever åpningstider vi ikke har,
 * så metaStrong viser ekte antall bookinger denne uka i stedet (aldri påfunn).
 * Beskrivelse (à la «12 matter · 2 TrackMan») = Facility.description, ellers «—».
 * «Nytt anlegg» gjenbruker eksisterende LocationForm (ekte CRUD).
 */

import Link from "next/link";
import {
  Building2,
  CircleDot,
  Flag,
  Map,
  Radar,
  type LucideIcon,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgPage, AgPageHead } from "@/components/admin/agencyos/ui";
import { LocationForm } from "./location-form";
import type { FacilityType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const TALLORD = [
  "Null", "Én", "To", "Tre", "Fire", "Fem", "Seks",
  "Sju", "Åtte", "Ni", "Ti", "Elleve", "Tolv",
];

/** Fasit-ikonsettet (flag/circle-dot/radar/map) mappet fra FacilityType. */
const TYPE_IKON: Record<FacilityType, LucideIcon> = {
  STUDIO: Radar,
  RANGE_1F: Flag,
  RANGE_2F: Flag,
  PUTTING_GREEN: CircleDot,
  SHORT_GAME: CircleDot,
  COURSE_9H: Map,
  COURSE_18H: Map,
  SPECIFIC_HOLES: Map,
  GENERAL: Building2,
};

export default async function AnleggPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const naa = new Date();
  const ukeStart = new Date(naa);
  ukeStart.setHours(0, 0, 0, 0);
  ukeStart.setDate(ukeStart.getDate() - ((ukeStart.getDay() + 6) % 7));
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const locations = await prisma.location.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    include: {
      facilities: {
        where: { active: true },
        orderBy: { name: "asc" },
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
  });

  const tiles = locations.flatMap((l) =>
    l.facilities.map((f) => ({
      id: f.id,
      tittel: `${l.name} · ${f.name}`,
      ikon: TYPE_IKON[f.type],
      bookinger: f._count.bookings,
      beskrivelse: f.description,
    })),
  );

  const tittel = tiles.length < TALLORD.length ? TALLORD[tiles.length] : String(tiles.length);

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Gjennomføre · Anlegg"
        title={tittel}
        italic={tiles.length === 1 ? "fasilitet." : "fasiliteter."}
        lead="Anleggene du disponerer. Tallet viser hvor presset hver ressurs er denne uka."
        actions={<LocationForm triggerLabel="+ Nytt anlegg" />}
      />

      <div className="grid gap-3 md:grid-cols-2">
        {tiles.length === 0 && (
          <div className="rounded-xl border border-border bg-card px-[18px] py-10 text-center text-sm text-muted-foreground md:col-span-2">
            Ingen fasiliteter registrert ennå — legg til et anlegg først.
          </div>
        )}
        {tiles.map((t) => {
          const Ikon = t.ikon;
          return (
            <Link
              key={t.id}
              href="/admin/availability"
              className="flex flex-col gap-[10px] rounded-xl border border-border bg-card p-4 text-left transition-[border-color,box-shadow] hover:border-primary hover:shadow-sm"
            >
              <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-secondary text-primary">
                <Ikon size={20} strokeWidth={1.5} />
              </span>
              <span className="font-display text-base font-bold leading-[1.2] tracking-[-0.015em] text-foreground">
                {t.tittel}
              </span>
              <span className="mt-auto font-mono text-[10px] leading-none text-muted-foreground">
                <b className="font-bold text-primary">
                  {t.bookinger} {t.bookinger === 1 ? "booking" : "bookinger"} denne uka
                </b>{" "}
                {t.beskrivelse ?? "—"}
              </span>
            </Link>
          );
        })}
      </div>
    </AgPage>
  );
}
