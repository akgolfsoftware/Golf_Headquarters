/**
 * AgencyOS — Tjenester (GJENNOMFØRE · TJENESTER), /admin/services.
 *
 * Port av fasit `agencyos-app/screens-ops.jsx` → ServicesScreen (mørkt tema,
 * desktop 1280): PageHead («Fem tjenester.» + «Ny tjeneste») og tabell
 * Tjeneste/Varighet/Pris/Status. Aktiv = chip-ok, inaktiv = «Skjult» (neu) —
 * som fasit. Demo-stall-tjenestene ligger inactive og vises dermed som Skjult.
 *
 * Datakilde: prisma.serviceType (priceOre/durationMin/active — ekte tall).
 * «Ny tjeneste» gjenbruker eksisterende ServiceForm (ekte CRUD, urørt).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  AgChip,
  AgPage,
  AgPageHead,
  AgTable,
  AgTd,
  AgTh,
  agTrClass,
} from "@/components/admin/agencyos/ui";
import { ServiceForm } from "./service-form";

export const dynamic = "force-dynamic";

const TALLORD = [
  "Null", "Én", "To", "Tre", "Fire", "Fem", "Seks",
  "Sju", "Åtte", "Ni", "Ti", "Elleve", "Tolv",
];

function prisLabel(priceOre: number): string {
  const kr = priceOre / 100;
  return `${kr.toLocaleString("nb-NO", {
    maximumFractionDigits: priceOre % 100 === 0 ? 0 : 2,
  })} kr`;
}

export default async function ServicesPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const tjenester = await prisma.serviceType.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      durationMin: true,
      priceOre: true,
      active: true,
    },
  });

  const tittel =
    tjenester.length < TALLORD.length ? TALLORD[tjenester.length] : String(tjenester.length);

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Gjennomføre · Tjenester"
        title={tittel}
        italic={tjenester.length === 1 ? "tjeneste." : "tjenester."}
        lead="Det spillere kan booke. Pris og varighet styrer booking-flyten og faktureringen."
        actions={<ServiceForm triggerLabel="+ Ny tjeneste" />}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <AgTable>
          <thead>
            <tr>
              <AgTh>Tjeneste</AgTh>
              <AgTh>Varighet</AgTh>
              <AgTh num>Pris</AgTh>
              <AgTh>Status</AgTh>
            </tr>
          </thead>
          <tbody>
            {tjenester.length === 0 && (
              <tr>
                <td colSpan={4} className="px-[14px] py-10 text-center text-[13px] text-muted-foreground">
                  Ingen tjenester ennå — opprett den første.
                </td>
              </tr>
            )}
            {tjenester.map((s) => (
              <tr key={s.id} className={`${agTrClass} leading-[1.3]`}>
                <AgTd className="font-semibold">{s.name}</AgTd>
                <AgTd>
                  <span className="font-mono text-xs text-muted-foreground">
                    {s.durationMin} min
                  </span>
                </AgTd>
                <AgTd num>{prisLabel(s.priceOre)}</AgTd>
                <AgTd>
                  <AgChip tone={s.active ? "ok" : "neu"}>{s.active ? "Aktiv" : "Skjult"}</AgChip>
                </AgTd>
              </tr>
            ))}
          </tbody>
        </AgTable>
      </div>
    </AgPage>
  );
}
