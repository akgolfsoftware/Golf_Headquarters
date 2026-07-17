/**
 * PlayerHQ · Meg · Hjelp · Artikkel (/portal/meg/help/artikkel/[slug]) — v2.
 * v2-port 17. juli 2026 (Team D4a): MegHelpArtikkelV2 erstatter Tailwind-siden
 * (del-knapp.tsx + feedback.tsx er nå subkomponenter i V2-komponenten).
 * Auth, artikkel-oppslaget, fallbacken for artikler uten redaksjonelt innhold
 * og notFound-oppførselen er uendret — kun presentasjonslaget er nytt.
 *
 * NB: Innholdet i hjelpe-artiklene (brødtekst + eventuelle eksempeltall) er
 * redaksjonelt illustrasjonsmateriale for hjelpesenteret — ikke spillerens
 * egne data. Det er bevisst statisk og skal ikke forveksles med ekte tall.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke, TomTilstand, Kort, CTAPill } from "@/components/v2";
import {
  MegHelpArtikkelV2,
  type MegHelpArtikkelData,
} from "@/components/portal/v2/MegHelpArtikkelV2";
import { HJELP_ARTIKLER } from "../../data";

const ARTIKLER: Record<string, MegHelpArtikkelData & { slug: string }> = {
  "pyramide-systemet": {
    slug: "pyramide-systemet",
    tittelLead: "Hva er",
    tittelItalic: "pyramide-systemet",
    eyebrow: "Trening · Artikkel · 5 min lesetid",
    forfatter: {
      initialer: "AK",
      navn: "Anders Kristiansen",
      rolle: "Head Coach · AK Golf",
    },
    oppdatert: "12. mai 2026",
    lesetid: 5,
    toc: [
      { id: "h1", tittel: "Hvorfor en pyramide?" },
      { id: "h2", tittel: "De fem disiplinene" },
      { id: "h3", tittel: "Slik balanseres uka" },
      { id: "h4", tittel: "Når balansen tipper" },
    ],
  },
};

export default async function ArtikkelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await requirePortalUser();
  const { slug } = await params;
  const a = ARTIKLER[slug];

  // Fallback for artikler som finnes i help-hub-lista (data.ts) men ennå ikke har
  // fått fullt redaksjonelt innhold her — unngår dødlenke fra MegHelpV2/kategori-sidene.
  // Ærlig tomrom: ingen fabrikkert brødtekst, kun metadata som faktisk finnes.
  if (!a) {
    const meta = HJELP_ARTIKLER.find((x) => x.slug === slug);
    if (!meta) notFound();
    return (
      <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/portal/meg/help">Hjelp-hub</TilbakeLenke>
        <Kort eyebrow={`${meta.kategori} · Artikkel · ${meta.lesetid} min lesetid`}>
          <TomTilstand
            icon="file-text"
            title={meta.tittel}
            sub="Denne artikkelen er ikke skrevet ferdig ennå. Ta kontakt med coach-teamet, så hjelper de deg direkte i mellomtiden."
          />
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            <Link href="/portal/coach/melding/ny" style={{ textDecoration: "none" }}>
              <CTAPill icon="message-square">Send melding til coach</CTAPill>
            </Link>
            <Link href="/portal/meg/help" style={{ textDecoration: "none" }}>
              <CTAPill ghost>Tilbake til hjelp-hub</CTAPill>
            </Link>
          </div>
        </Kort>
      </V2Shell>
    );
  }

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg/help">Hjelp-hub</TilbakeLenke>
      <MegHelpArtikkelV2 data={a} />
    </V2Shell>
  );
}
