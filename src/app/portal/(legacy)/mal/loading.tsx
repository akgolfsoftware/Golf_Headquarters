import {
  SkeletonHero,
  SkeletonKpi,
  SkeletonCard,
} from "@/components/shared/loading-skeleton";

export default function MalLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHero />
      <SkeletonKpi count={4} />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
