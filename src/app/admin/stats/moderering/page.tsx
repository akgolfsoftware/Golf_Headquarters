/**
 * /admin/stats/moderering — coach modereringskø (design 20)
 *
 * Krever ADMIN eller COACH.
 * Viser:
 *   - Hero med kø-status
 *   - KPI-strip (ventende, godkjent, avvist, snitt-tid)
 *   - Tab-bar: Turneringer · Resultater · Profil-endringer · Slett-forespørsler · Historikk
 *   - Stub-tabeller per tab
 *   - GDPR-slett-flow under "Slett"-fanen
 *   - Sticky batch-bar
 */

import type { Metadata } from "next";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ModeringClient } from "./client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stats moderering | CoachHQ",
  description: "Modereringskø for AK Golf Stats.",
  robots: { index: false },
};

// ---------------------------------------------------------------------------
// Stub-data
// ---------------------------------------------------------------------------

const STUB_TURNERINGER = [
  {
    id: "t1",
    navn: "Srixon Tour 6 — Bærum GK",
    dato: "12. jun 2026",
    innlegger: "anders@akgolf.no",
    flagg: 0,
    dubletter: [],
  },
  {
    id: "t2",
    navn: "Srixon Tour 5 — Oslo GK",
    dato: "3. jun 2026",
    innlegger: "coach@akgolf.no",
    flagg: 2,
    dubletter: ["Srixon Tour 5 (Oslo GK)", "Oslo GK Juni"],
  },
  {
    id: "t3",
    navn: "NHF Junior Open",
    dato: "28. mai 2026",
    innlegger: "nhf@golf.no",
    flagg: 4,
    dubletter: [],
  },
  {
    id: "t4",
    navn: "Junior Cup Fredrikstad GK",
    dato: "20. mai 2026",
    innlegger: "data@gfgk.no",
    flagg: 0,
    dubletter: [],
  },
];

const STUB_SLETT = {
  spiller: "Øyvind Rohjan",
  forespurAv: "markus.pedersen@gmail.com",
  mottatt: "22. mai 2026 kl. 14:38",
  grunn: "Ønsker ikke å være registrert i basen lenger",
  rader: 47,
};

export default async function ModeringPage() {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const statsTurneringer = STUB_TURNERINGER.length;
  const statsResultater = 5;
  const statsProfilEndringer = 2;
  const statsSlett = 1;
  const godkjentDenneUka = 18;
  const avvistDenneUka = 3;
  const snittTid = "2t 14m";

  return (
    <ModeringClient
      turneringer={STUB_TURNERINGER}
      slett={STUB_SLETT}
      stats={{
        turneringer: statsTurneringer,
        resultater: statsResultater,
        profilEndringer: statsProfilEndringer,
        slett: statsSlett,
        godkjentDenneUka,
        avvistDenneUka,
        snittTid,
      }}
    />
  );
}
