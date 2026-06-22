/**
 * Foreldreportal · /forelder/samtykke — GDPR samtykke-administrasjon.
 * Hybrid design: editorial header + terminal data cards.
 * Light theme, no .dark. Tokens only.
 */

import {
  Activity,
  Check,
  Mail,
  Package,
  Shield,
  Video,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { SamtykkeForm } from "./samtykke-form";
import { DataActions } from "./data-actions";

// Detailed form fields (existing server action expects these keys)
const SAMTYKKER_FORM = [
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

  // Siste slette-forespørsel for kvittering på data-handlinger.
  const sisteSletting = await prisma.dataExportRequest.findFirst({
    where: { userId: user.id, type: "DELETE" },
    orderBy: { createdAt: "desc" },
    select: { type: true, status: true, createdAt: true },
  });

  // Check if all required consents are active
  const requiredKeys = ["dataDeling", "fotoBruk", "thirdParty"];
  const alleAktive =
    relasjoner.length > 0 &&
    relasjoner.every((r) => {
      const prefs =
        (r.child.preferences as Record<string, boolean> | null) ?? {};
      return requiredKeys.every((k) => prefs[k] !== false);
    });

  const barnNavn =
    relasjoner.length === 1
      ? (relasjoner[0]?.child.name.split(" ")[0] ?? "barnet") + "s"
      : "barnas";

  const visualItems = [
    { key: "dataDeling", tittel: "Treningsdata", beskrivelse: "Øktlogg, SG, HCP-utvikling", Icon: Activity, iconBg: "bg-primary/10", iconFg: "text-primary", defaultOn: true },
    { key: "fotoBruk", tittel: "Video-opptak", beskrivelse: "Svinganalyse fra treningsøkter", Icon: Video, iconBg: "bg-primary/10", iconFg: "text-primary", defaultOn: true },
    { key: "nyhetsbrev", tittel: "Markedsføring", beskrivelse: "Nyheter og tilbud fra AK Golf", Icon: Mail, iconBg: "bg-secondary", iconFg: "text-muted-foreground", defaultOn: false },
    { key: "thirdParty", tittel: "Analysedata til NGF", beskrivelse: "Deling med Norges Golfforbund", Icon: Package, iconBg: "bg-info/10", iconFg: "text-info", defaultOn: true },
  ] as const;

  return (
    <div className="mx-auto max-w-[480px] space-y-4 px-4 pb-24 pt-6">
      <h1 className="font-display text-[26px] font-bold tracking-[-0.03em] text-foreground">
        Personvern &amp;{" "}
        <em className="font-medium italic text-primary">samtykke</em>
      </h1>
      <p className="-mt-2 text-[13.5px] leading-[1.55] text-muted-foreground">
        Her administrerer du samtykker for {barnNavn} data i AK Golf HQ.
      </p>

      {alleAktive && (
        <div
          className="flex items-center gap-[10px] rounded-xl p-3"
          style={{ background: "rgba(26,125,86,0.08)", border: "1px solid rgba(26,125,86,0.2)" }}
        >
          <Check className="h-[18px] w-[18px] flex-shrink-0 text-success" strokeWidth={1.5} aria-hidden />
          <span className="text-[13.5px] font-semibold text-foreground">
            Alle samtykker aktive og oppdatert
          </span>
        </div>
      )}

      {/* Visual consent overview */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-secondary px-4 py-[9px] font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          Datatillatelser
        </div>
        <ul className="divide-y divide-border">
          {visualItems.map((s) => {
            const Icon = s.Icon;
            return (
              <li key={s.key} className="flex items-center gap-3 px-4 py-[13px]">
                <div className={`flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-lg ${s.iconBg} ${s.iconFg}`}>
                  <Icon className="h-[14px] w-[14px]" strokeWidth={1.5} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-medium text-foreground">{s.tittel}</div>
                  <div className="mt-[1px] text-[12px] text-muted-foreground">{s.beskrivelse}</div>
                </div>
                <div
                  className={`relative h-[22px] w-[38px] flex-shrink-0 rounded-full ${s.defaultOn ? "bg-primary" : "bg-border"}`}
                  aria-hidden
                >
                  <span className={`absolute top-[3px] left-[3px] h-[16px] w-[16px] rounded-full bg-card shadow-sm transition-transform ${s.defaultOn ? "translate-x-4" : ""}`} />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Guardian info */}
      <div
        className="flex items-start gap-4 rounded-xl p-4"
        style={{ background: "rgba(0,88,64,0.05)", border: "1px solid rgba(0,88,64,0.2)" }}
      >
        <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
        <div className="text-sm">
          <p className="font-semibold text-foreground">
            Du er ansvarlig for samtykkene på vegne av barnet inntil 18 år
          </p>
          <p className="mt-1 text-muted-foreground">
            For barn over 13 år bør samtykker diskuteres sammen. Etter fylte 18 år tar barnet over kontrollen.
          </p>
        </div>
      </div>

      {/* Per-child forms */}
      {relasjoner.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-5 py-12 text-center">
          <p className="font-display text-[16px] font-semibold text-foreground">Ingen tilknyttede barn</p>
          <p className="mt-1.5 text-[13.5px] leading-[1.5] text-muted-foreground">
            Når barn er koblet via invitasjon, vises samtykke-skjemaer her.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {relasjoner.map((r) => (
            <section key={r.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <header className="border-b border-border px-4 py-3">
                <div className="font-display text-[15px] font-bold text-foreground">{r.child.name}</div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">{r.child.email}</div>
              </header>
              <SamtykkeForm
                childId={r.child.id}
                samtykker={SAMTYKKER_FORM}
                eksisterende={(r.child.preferences as Record<string, boolean> | null) ?? {}}
              />
            </section>
          ))}
        </div>
      )}

      {/* Data actions */}
      <DataActions
        sisteSletting={
          sisteSletting
            ? {
                type: sisteSletting.type,
                status: sisteSletting.status,
                createdAt: sisteSletting.createdAt.toISOString(),
              }
            : null
        }
      />

      {/* Data policy */}
      <section className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <h3 className="mb-2 font-display text-[15px] font-semibold text-foreground">Slik håndterer vi data</h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>Data lagres innenfor EU/EØS via Supabase (Frankfurt-region).</li>
          <li>Vi deler aldri persondata med tredjepart uten eksplisitt samtykke.</li>
          <li>
            Du kan be om full dataeksport eller sletting når som helst via{" "}
            <a href="mailto:personvern@akgolf.no" className="text-primary hover:underline">personvern@akgolf.no</a>.
          </li>
          <li>Endringer i samtykker logges i AuditLog og er sporbare.</li>
        </ul>
      </section>
    </div>
  );
}
