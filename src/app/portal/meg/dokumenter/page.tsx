/**
 * PlayerHQ · Meg · Dokumenter (/portal/meg/dokumenter).
 *
 * Portet fra fersk Claude Design-fasit (ph-screens.jsx · DokumenterScreen):
 * MeSub-skall ("Avtaler & dokumenter.") → ÉN liste med dokument-rader
 * (ikon-chip per kind + tittel + mono-meta «dato · type» + status-chip +
 * chevron). Rad åpner dokumentets url.
 *
 * EKTE Prisma-data (Document: globale + egne). Modellen har ikke status-felt —
 * status-chip vises kun der kind impliserer status (kontrakt i arkivet =
 * signert, kvittering = betalt osv.); ellers ingen chip. Tomstate når lista
 * er tom. Server component, auth-guard beholdt.
 */
import {
  ChevronRight,
  FileBadge,
  FileLock2,
  FileSignature,
  FileText,
  Receipt,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { MeSub } from "@/components/portal/meg/meg-sub";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticBadge } from "@/components/athletic/badge";

// Document.kind er fri streng (CONTRACT | GUIDE | RECEIPT | OTHER i bruk i dag;
// CONSENT/PRIVACY/GDPR/LICENSE støttes for fremtidige dokumenttyper).
const KIND_ICON: Record<string, LucideIcon> = {
  CONTRACT: FileSignature,
  CONSENT: ShieldCheck,
  PRIVACY: FileLock2,
  GDPR: FileLock2,
  RECEIPT: Receipt,
  LICENSE: FileBadge,
  GUIDE: FileBadge,
};

const KIND_LABEL: Record<string, string> = {
  CONTRACT: "Kontrakt",
  CONSENT: "Samtykke",
  PRIVACY: "Personvern",
  GDPR: "Personvern",
  RECEIPT: "Kvittering",
  LICENSE: "Lisens",
  GUIDE: "Veiledning",
  OTHER: "Annet",
};

// Status-chip kun der dokumenttypen impliserer status (ingen status-felt i modellen).
const KIND_CHIP: Record<string, { tekst: string; variant: "ok" | "lime" | "neutral" }> = {
  CONTRACT: { tekst: "Signert", variant: "ok" },
  CONSENT: { tekst: "Godkjent", variant: "ok" },
  RECEIPT: { tekst: "Betalt", variant: "ok" },
  LICENSE: { tekst: "Gyldig", variant: "ok" },
  PRIVACY: { tekst: "Aktiv", variant: "ok" },
  GDPR: { tekst: "Aktiv", variant: "ok" },
};

function formatDato(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function DokumenterPage() {
  const user = await requirePortalUser();

  const documents = await prisma.document.findMany({
    where: { OR: [{ userId: null }, { userId: user.id }] },
    orderBy: { createdAt: "desc" },
  });

  return (
    <MeSub
      eyebrow="MEG · DOKUMENTER"
      title="Avtaler &"
      italic="dokumenter."
      lead="Signerte avtaler, samtykker og fakturaer samlet."
    >
      {documents.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-[15px] text-sm italic text-muted-foreground sm:px-[18px]">
          Ingen dokumenter ennå.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card px-4 py-0.5">
          {documents.map((d) => {
            const Icon = KIND_ICON[d.kind] ?? FileText;
            const chip = KIND_CHIP[d.kind];
            return (
              <a
                key={d.id}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center gap-3.5 border-b border-border py-3.5 text-left transition-opacity last:border-b-0 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[11px] bg-secondary text-primary">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold tracking-[-0.005em] text-foreground">
                    {d.title}
                  </span>
                  <span className="mt-[3px] block font-mono text-[10px] text-muted-foreground">
                    {formatDato(d.createdAt)} · {KIND_LABEL[d.kind] ?? "Dokument"}
                  </span>
                </span>
                {chip && (
                  <AthleticBadge variant={chip.variant} className="shrink-0">
                    {chip.tekst}
                  </AthleticBadge>
                )}
                <ChevronRight
                  className="h-[18px] w-[18px] shrink-0 text-muted-foreground"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </a>
            );
          })}
        </div>
      )}
    </MeSub>
  );
}
