/**
 * /coacher/[slug] — v2. Statisk COACHER-data gjenbrukt 1:1 fra
 * (mlegacy)/coacher/[slug]/page.tsx.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarkedCoachDetaljV2, type CoachProfil } from "@/components/marketing/v2/MarkedCoachDetaljV2";

const COACHER: CoachProfil[] = [
  {
    slug: "anders",
    navn: "Anders Kristiansen",
    tittel: "Head Coach · CEO i AK Golf Group",
    initialer: "AK",
    intro:
      "Anders har bygget Academy rundt én idé: at coaching skal være tydelig, målbar og personlig. Ingen magi, bare struktur og oppfølging.",
    bio: [
      "Anders har coachet golfspillere i mer enn et tiår, fra første time til nasjonale konkurranseutøvere. Bakgrunnen kombinerer egen turneringskarriere med formell trenerutdanning og en stadig læring fra Mac O'Grady, Trackman-data og moderne treningsmetodikk.",
      "I 2024 startet han AK Golf Group AS for å bygge en plattform der personlig coaching og digital oppfølging henger sammen. Resultatet er Academy slik det fungerer i dag: du møter coachen i timene, men jobber strukturert i PlayerHQ mellom dem.",
    ],
    erfaring: [
      "10+ år som golfcoach på alle nivåer",
      "Trener WANG Toppidrett Fredrikstad, golflinjen",
      "PGA-utdanning under arbeid",
      "Trackman-sertifisert (Combine + Performance)",
    ],
    spesialiteter: [
      "Plan- og strukturbygging for ambisiøse spillere",
      "Mental tilnærming og turneringsforberedelse",
      "Datadrevet teknikk: Trackman, video, AimPoint",
      "Junior-utvikling (alder 12–20)",
    ],
  },
  {
    slug: "markus",
    navn: "Markus Røinås Pedersen",
    tittel: "Assistent · Junior-ansvarlig",
    initialer: "MR",
    intro:
      "Markus jobber tett med juniorgruppen og spillere som vil løfte nærspill og putting. Tålmodig, presis, og kompromissløst opptatt av god teknikk.",
    bio: [
      "Markus kombinerer egen spillerbakgrunn med en pedagogisk tilnærming som gjør komplisert stoff enkelt å forstå. Spillerne hans merker forskjellen raskt, særlig på de slagene som teller mest når runden står og vipper.",
      "I Academy har Markus hovedansvaret for juniorprogrammet og driver gruppetreninger på Gamle Fredrikstad og Mulligan Indoor gjennom hele sesongen.",
    ],
    erfaring: [
      "Egen spillerbakgrunn fra junior- og amatørgolf",
      "Co-trener på WANG Toppidrett Fredrikstad",
      "Spesialisert på nærspill og putting",
    ],
    spesialiteter: [
      "Korte slag: wedge under 100 m",
      "Putting-teknikk og lesning av greener",
      "Junior- og nybegynner-coaching",
      "Gruppetreninger med tydelig progresjon",
    ],
  },
];

export function generateStaticParams() {
  return COACHER.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = COACHER.find((x) => x.slug === slug);
  if (!c) return { title: "Coach ikke funnet" };
  return {
    title: `${c.navn} | AK Golf Academy`,
    description: c.intro,
  };
}

export default async function CoachProfilSideV2({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = COACHER.find((x) => x.slug === slug);
  if (!c) notFound();

  return <MarkedCoachDetaljV2 c={c} />;
}
