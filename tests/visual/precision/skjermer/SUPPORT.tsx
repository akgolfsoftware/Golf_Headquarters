/** Fase 8: reelle støttekomponenter med syntetiske data, uten konto/DB/utgående kall. */
import type { ReactNode } from "react";
import { ForelderSkall } from "@/components/precision/ForelderSkall";
import { ForelderBarnValg } from "@/components/forelder/ForelderBarnValg";
import { ForelderV2 } from "@/components/portal/v2/ForelderV2";
import { ForelderBookingerV2 } from "@/components/portal/v2/ForelderBookingerV2";
import { ForelderOkonomiV2 } from "@/components/portal/v2/ForelderOkonomiV2";
import { ForelderSamtykkeV2 } from "@/components/portal/v2/ForelderSamtykkeV2";
import { ForelderCoachV2 } from "@/components/portal/v2/ForelderCoachV2";
import { GuardianConsentV2 } from "@/components/portal/v2/GuardianConsentV2";
import { MarkedStatsHubV2 } from "@/components/marketing/v2/MarkedStatsHubV2";
import { PrecisionTilstand } from "@/components/system/precision-tilstand";
import { byggCoachingOppfolging } from "@/lib/email/coaching-oppfolging";
import "@/styles/precision-support-upgrade.css";

export const sti = "/forelder";
const barn = [{ id: "syntetisk-a", navn: "Syntetisk spiller med langt navn" }, { id: "syntetisk-b", navn: "Syntetisk søsken" }];
const wrap = (child: ReactNode) => <ForelderSkall barnId="syntetisk-a"><ForelderBarnValg barn={barn} valgt="syntetisk-a" />{child}</ForelderSkall>;
const home = { childFirstName: "Syntetisk", dagensOkt: { dagLabel: "I dag", tittel: "Putting og innspill til valgt mål", detalj: "16:30–17:00 · Treningsområdet" },
  ukenummer: 42, okter: [{ id: "syntetisk-okt", tittel: "Putting og innspill til valgt mål", sub: "30 min · SLAG", status: "I_DAG" as const }], neste: "Coachingtime · 14. oktober kl. 16:30", coachNavn: "Syntetisk coach" };
const bookings = { antallBarn: 2, visBarn: true, ukenummer: 42, denneUka: 1, parentName: "Syntetisk forelder", fokusBarnId: "syntetisk-a",
  kommende: [{ id: "syntetisk-bk-a", startAt: new Date("2026-10-14T16:30:00Z"), serviceName: "Coachingtime med langt navn for å kontrollere linjebryting", durationMin: 30, locationName: "Treningsområdet", coachName: "Syntetisk coach", childName: "Syntetisk", status: "CONFIRMED" },
    { id: "syntetisk-bk-b", startAt: new Date("2026-10-15T17:00:00Z"), serviceName: "Coachingtime", durationMin: 45, locationName: "Treningsområdet", coachName: null, childName: "Søsken", status: "PENDING" }],
  tidligere: [{ id: "syntetisk-bk-c", startAt: new Date("2026-10-10T16:30:00Z"), serviceName: "Coachingtime", durationMin: 30, locationName: "Treningsområdet", coachName: null, childName: "Syntetisk", status: "CANCELLED" }] };
const consent = { barn: [{ id: "syntetisk-a", name: barn[0].navn, email: "syntetisk@example.invalid", prefs: { fotoBruk: false, dataDeling: true, nyhetsbrev: false, thirdParty: false },
  helse: { wearable: false, manuell: false, coachInnsyn: false, coachDetalj: false } }], barnNavn: "Syntetisks", alleAktive: false, parentName: "Syntetisk forelder", sisteSletting: null };

function Mail({ kind }: { kind: "takk" | "oppfolging" }) {
  const { html } = byggCoachingOppfolging(kind, { status: "COMPLETED", fornavn: "Syntetisk", coach: "Syntetisk coach", tjeneste: "Coachingtime", startAt: new Date("2026-10-12T16:30:00Z"),
    coachTekst: "Godkjent syntetisk oppsummering. Ett fokus følger den avtalte planen. Dette er prøveinnhold og ingen ekte spilleropplysninger.", bookingUrl: "https://syntetisk.example/booking" });
  const css = /<style>([\s\S]*?)<\/style>/.exec(html)?.[1] ?? "";
  const body = /<body[^>]*>([\s\S]*)<\/body>/.exec(html)?.[1] ?? "";
  return <div><style>{css}</style><div dangerouslySetInnerHTML={{ __html: body }} /></div>;
}

export const tilstander = {
  forelder_idag: wrap(<ForelderV2 data={home} />),
  forelder_tom: <ForelderSkall><ForelderV2 data={{ ...home, childFirstName: null, dagensOkt: null, okter: [], neste: null }} /></ForelderSkall>,
  forelder_booking: wrap(<ForelderBookingerV2 data={bookings} />),
  forelder_booking_tom: wrap(<ForelderBookingerV2 data={{ ...bookings, kommende: [], tidligere: [] }} />),
  forelder_okonomi: wrap(<ForelderOkonomiV2 data={{ barnAntall: 1, parentName: "Syntetisk forelder", abonnement: [{ childId: "syntetisk-a", fornavn: "Syntetisk", tier: "GRATIS", status: null, nesteTrekk: null, monthlyCredits: 0, creditsRemaining: 0, betaltIAarOre: 95050, utestaaendeOre: 0, appAbonnement: { navn: "PlayerHQ", status: "ACTIVE", periodeTil: "31.10.2026" } }] }} />),
  forelder_samtykke: wrap(<ForelderSamtykkeV2 data={consent} />),
  forelder_coach_tom: wrap(<ForelderCoachV2 data={{ antallBarn: 1, parentName: "Syntetisk forelder", childFirstName: "Syntetisk", coachNavn: null, coachAvatarUrl: null, coachEpost: null, sisteMelding: null, supportEpost: "syntetisk@example.invalid" }} />),
  konto_utlopt: <GuardianConsentV2 state="expired" />,
  stats: <MarkedStatsHubV2 norskeIAksjon={8} kommendeTurneringer={12} sisteSync="12.10.2026" totalBaner={21} />,
  stats_ukjent: <MarkedStatsHubV2 norskeIAksjon={null} kommendeTurneringer={null} sisteSync="" totalBaner={null} />,
  system_offline: <PrecisionTilstand kicker="Uten nett" tittel="Du er frakoblet" tekst="Live-utkast som er lagret på denne enheten beholdes. Koble til nettet for å synkronisere og åpne nye økter." primar={{ label: "Prøv appen igjen", href: "/portal" }} sekundar={{ label: "Til forsiden", href: "/" }} />,
  epost_takk: <Mail kind="takk" />,
  epost_oppfolging: <Mail kind="oppfolging" />,
};
