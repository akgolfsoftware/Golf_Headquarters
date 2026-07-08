/**
 * PlayerHQ Hull-detalj (/portal/baneguide/[baneId]/hull/[nr]) — skjerm 3 (fase 5).
 * Signaturskjerm: satellitt + din spredning + KPI fra dispersion-motoren + innsikt.
 * Segment Utslag/Innspill/Putt via ?type=. Lyst tema.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Lightbulb } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getHoleDetail } from "@/lib/baneguide/queries";
import { CourseMap } from "@/components/baneguide/course-map";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { KpiCard } from "@/components/athletic/kpi";
import type { ShotType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const SEGMENTS: { key: string; label: string; type: ShotType }[] = [
  { key: "utslag", label: "Utslag", type: "DRIVE" },
  { key: "innspill", label: "Innspill", type: "APPROACH" },
  { key: "putt", label: "Putt", type: "PUTT" },
];

const fmt = (n: number, d = 1) => n.toFixed(d);
const signed = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(1);

export default async function HoleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ baneId: string; nr: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { baneId, nr } = await params;
  const { type } = await searchParams;
  const holeNumber = parseInt(nr, 10);
  const segment = SEGMENTS.find((s) => s.key === type) ?? SEGMENTS[0];

  const user = await requirePortalUser();
  const data = await getHoleDetail(baneId, holeNumber, user.id, segment.type);
  if (!data) notFound();
  const { bane, hole, tee, green, landings, stats } = data;

  const center =
    tee && green
      ? { lat: (tee.lat + green.lat) / 2, lng: (tee.lng + green.lng) / 2 }
      : bane.latitude != null && bane.longitude != null
        ? { lat: bane.latitude, lng: bane.longitude }
        : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <Link
        href={`/portal/baneguide/${bane.id}`}
        className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} /> Banekart
      </Link>

      <div className="mt-3">
        <AthleticEyebrow tone="lime">Baneguide · {bane.navn}</AthleticEyebrow>
        <h1 className="mt-1.5 font-display text-3xl font-bold tracking-[-0.02em] text-foreground">
          Hull {hole.holeNumber}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {hole.par ? `par ${hole.par}` : "par –"}
          {hole.lengthMeter ? ` · ${hole.lengthMeter} m` : ""}
        </p>
      </div>

      {center && (
        <CourseMap
          center={center}
          zoom={16.5}
          geojson={bane.geojson as unknown as GeoJSON.FeatureCollection}
          holes={tee ? [{ holeNumber: hole.holeNumber, par: hole.par, teeLat: hole.teeLat, teeLng: hole.teeLng, greenLat: hole.greenLat, greenLng: hole.greenLng }] : []}
          shotPoints={landings}
          aimLine={tee && green ? { tee, green } : null}
          className="mt-4 h-[320px] w-full overflow-hidden rounded-xl border border-border"
        />
      )}

      <div className="mt-4 flex gap-1.5">
        {SEGMENTS.map((s) => {
          const active = s.key === segment.key;
          return (
            <Link
              key={s.key}
              href={`/portal/baneguide/${bane.id}/hull/${hole.holeNumber}?type=${s.key}`}
              className={`flex-1 rounded-full py-2 text-center font-mono text-[11px] font-bold uppercase tracking-[0.08em] ${
                active ? "bg-accent text-primary" : "bg-secondary text-muted-foreground"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      {stats ? (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <KpiCard label="σ side" value={fmt(stats.std.lateral)} unit="m" />
            <KpiCard label="σ lengde" value={fmt(stats.std.distance)} unit="m" />
            <KpiCard label="Bias" value={`${signed(stats.bias.lateral)}`} unit={`m ${stats.bias.side === "høyre" ? "H" : stats.bias.side === "venstre" ? "V" : ""}`.trim()} />
            <KpiCard label="N slag" value={stats.n} />
          </div>

          {stats.bias.side !== "rett" && (
            <div className="mt-4 rounded-xl bg-primary p-4">
              <div className="flex items-center gap-2 text-accent">
                <Lightbulb className="h-4 w-4" strokeWidth={1.5} />
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em]">Innsikt</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-primary-foreground">
                Du misser{" "}
                <em className="font-display font-normal italic text-accent">
                  {fmt(Math.abs(stats.bias.lateral))} m {stats.bias.side}
                </em>{" "}
                i snitt på dette hullet. Sikt mot {stats.bias.side === "høyre" ? "venstre" : "høyre"} halvdel av fairwayen.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="mt-4 rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Ingen {segment.label.toLowerCase()} plottet på dette hullet ennå. Plott slag for å se spredningen din.
        </div>
      )}
    </div>
  );
}
