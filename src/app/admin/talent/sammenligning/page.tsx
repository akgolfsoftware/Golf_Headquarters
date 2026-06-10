/**
 * AgencyOS — Talent · Sammenligning (TALENT · SAMMENLIGNING)
 *
 * Port av fasit `agencyos-app/screens-stable.jsx` → ComparisonScreen (mørkt, desktop).
 * Datakilde: loadMultiCompare (Prisma) — samme loader som tidligere versjon av
 * siden. Verdiene per akse er ANTALL ØKTER per pyramide-akse i spillerens
 * treningsplaner; søylene normaliseres mot største økt-antall i utvalget.
 * Ingen oppdiktede tall — mangler data vises «—»/tom søyle.
 *
 * Valgte spillere styres av ?ids=id1,id2,... (inntil 4). Uten ?ids= vises de tre
 * øverste fra kohort-rangeringen (siste SG-total) som standardutvalg.
 *
 * Roller: COACH, ADMIN.
 */

import Link from "next/link";
import { Plus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadMultiCompare } from "@/lib/admin-compare/multi-compare-data";
import { AgAvatar, AgPage, AgPageHead, agBtnClass } from "@/components/admin/agencyos/ui";

export const dynamic = "force-dynamic";

const AKSER = [
  { label: "Fysisk", bar: "bg-pyr-fys" },
  { label: "Teknisk", bar: "bg-pyr-tek" },
  { label: "Golfslag", bar: "bg-pyr-slag" },
  { label: "Spill", bar: "bg-pyr-spill" },
  { label: "Turnering", bar: "bg-pyr-turn" },
] as const;

const TALLORD = ["Ingen", "Én", "To", "Tre", "Fire", "Fem", "Seks", "Sju", "Åtte", "Ni", "Ti"];

function hcpTekst(hcp: number | null): string {
  if (hcp == null) return "—";
  return hcp.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

type Search = Promise<{ ids?: string }>;

export default async function TalentSammenligningPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const sp = await searchParams;
  const ids = (sp.ids ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let data = await loadMultiCompare(ids);
  // Uten valgte spillere: standardutvalg = topp 3 fra kohort-rangeringen.
  if (data.players.length === 0) {
    const standard = data.cohort.slice(0, 3).map((c) => c.userId);
    if (standard.length > 0) data = await loadMultiCompare(standard);
  }

  const spillere = data.players;
  const n = spillere.length;
  const maksOkter = Math.max(0, ...spillere.flatMap((p) => p.pyramide.map((a) => a.count)));
  const kolonner = { gridTemplateColumns: `120px repeat(${Math.max(n, 1)}, minmax(0, 1fr))` };
  const tittel = n === 1 ? "Én profil," : `${TALLORD[n] ?? n} profiler,`;

  return (
    <AgPage>
      <AgPageHead
        eyebrow="Talent · Sammenligning"
        title={tittel}
        italic="side om side."
        lead="Pyramide-aksene per spiller. Nyttig for å sette sammen treningsgrupper eller velge lag-uttak."
        actions={
          <Link href="/admin/spillere" className={agBtnClass("ghost")}>
            <Plus size={16} aria-hidden /> Legg til
          </Link>
        }
      />
      <div className="rounded-xl border border-border bg-card p-[18px]">
        {n === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Ingen spillere å sammenligne ennå — legg til spillere fra stallen.
          </div>
        ) : (
          <>
            <div className="grid items-center gap-3 border-b border-border pb-3" style={kolonner}>
              <span />
              {spillere.map((p) => (
                <div key={p.userId} className="text-center">
                  <AgAvatar initials={p.initials} size={40} tone="neu" />
                  <div className="mt-[6px] text-[13px] font-bold text-foreground">{p.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {p.klubb ?? p.niva ?? "—"} · HCP {hcpTekst(p.hcp)}
                  </div>
                </div>
              ))}
            </div>
            {AKSER.map((akse, ai) => (
              <div
                key={akse.label}
                className="grid items-center gap-3 border-b border-border py-[13px] leading-none"
                style={kolonner}
              >
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
                  {akse.label}
                </span>
                {spillere.map((p) => {
                  const verdi = p.pyramide[ai]?.count ?? 0;
                  const pct = maksOkter > 0 ? Math.round((verdi / maksOkter) * 100) : 0;
                  return (
                    <div key={p.userId} className="flex items-center gap-2">
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <span
                          className={`block h-full rounded-full ${akse.bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="w-7 text-right font-mono text-[11px] font-semibold text-foreground">
                        {verdi}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </>
        )}
      </div>
    </AgPage>
  );
}
