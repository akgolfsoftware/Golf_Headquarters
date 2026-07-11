import {
  SkeletonHero,
  SkeletonKpi,
  SkeletonCard,
  SkeletonTable,
} from "@/components/shared/loading-skeleton";

export default function AnalyseLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHero />
      <SkeletonKpi count={4} />
      <SkeletonCard height="h-12" />
      <SkeletonTable rows={8} cols={5} />
      <SkeletonCard />
    </div>
  );
}
