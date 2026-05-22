import { Shield, AlertCircle } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ForelderHero } from "@/components/forelder/forelder-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { SamtykkeForm } from "./samtykke-form";

const SAMTYKKER = [
  {
    key: "fotoBruk",
    tittel: "Foto- og video-bruk",
    beskrivelse:
      "Tillater at AK Golf bruker bilder/video av barnet i interne plan- og fremgangs-rapporter, samt i marketing-materiale (anonymisert hvis annet ikke avtales).",
  },
  {
    key: "dataDeling",
    tittel: "Deling av treningsdata med coach",
    beskrivelse:
      "Tillater at runde-statistikk, Trackman-data og helse-data deles med tilknyttede coacher i AK Golf for å lage bedre treningsplaner.",
  },
  {
    key: "nyhetsbrev",
    tittel: "Nyhetsbrev og oppdateringer",
    beskrivelse:
      "Sender e-post med tips, kurs-informasjon og nyheter relevant for juniorgolf. Du kan melde deg av når som helst.",
  },
  {
    key: "thirdParty",
    tittel: "Dataeksport til tredjepartsverktøy",
    beskrivelse:
      "Tillater eksport av anonymisert data til WAGR, NGF og talent-databaser hvis barnet kvalifiserer for elite-tracking.",
  },
];

export default async function SamtykkePage() {
  const user = await requirePortalUser({ allow: ["PARENT"] });

  const relasjoner = await prisma.parentRelation.findMany({
    where: { parentId: user.id, approved: true },
    include: {
      child: {
        select: {
          id: true,
          name: true,
          email: true,
          preferences: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <ForelderHero
        eyebrow="Foreldreportal · Samtykker"
        titleLead="GDPR-samtykker"
        titleItalic="per barn"
        sub="Du kan endre samtykker når som helst. Endringer logges i revisjonsloggen."
      />

      <div className="flex items-start gap-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <Shield className="h-5 w-5 flex-shrink-0 text-primary" strokeWidth={1.75} />
        <div className="text-sm">
          <p className="font-semibold text-foreground">
            Du er ansvarlig for samtykkene på vegne av barnet inntil 18 år
          </p>
          <p className="mt-1 text-muted-foreground">
            For barn over 13 år bør samtykker diskuteres sammen. Etter fylte
            18 år tar barnet over kontrollen.
          </p>
        </div>
      </div>

      {relasjoner.length === 0 ? (
        <EmptyState
          icon={AlertCircle}
          titleItalic="Ingen tilknyttede"
          titleTrail="barn"
          sub="Når barn er koblet via invitasjon, vises samtykke-skjemaer her."
        />
      ) : (
        <div className="space-y-4">
          {relasjoner.map((r) => (
            <section
              key={r.id}
              className="rounded-lg border border-border bg-card"
            >
              <header className="border-b border-border px-6 py-4">
                <h2 className="font-display text-base font-semibold tracking-tight">
                  {r.child.name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {r.child.email}
                </p>
              </header>
              <SamtykkeForm
                childId={r.child.id}
                samtykker={SAMTYKKER}
                eksisterende={
                  (r.child.preferences as Record<string, boolean> | null) ?? {}
                }
              />
            </section>
          ))}
        </div>
      )}

      <section className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        <h3 className="mb-2 font-display text-base font-semibold tracking-tight text-foreground">
          Slik håndterer vi data
        </h3>
        <ul className="space-y-2 list-disc pl-6">
          <li>
            Data lagres innenfor EU/EØS via Supabase (Frankfurt-region).
          </li>
          <li>
            Vi deler aldri persondata med tredjepart uten eksplisitt samtykke.
          </li>
          <li>
            Du kan be om full dataeksport eller sletting når som helst via
            <a
              href="mailto:personvern@akgolf.no"
              className="ml-1 text-primary hover:underline"
            >
              personvern@akgolf.no
            </a>
            .
          </li>
          <li>
            Endringer i samtykker logges i AuditLog og er sporbare.
          </li>
        </ul>
      </section>
    </div>
  );
}
