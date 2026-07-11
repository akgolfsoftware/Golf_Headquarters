import {
  SkeletonHero,
  SkeletonKpi,
  SkeletonCard,
} from "@/components/shared/loading-skeleton";

export default function PortalLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SkeletonHero />
      <SkeletonKpi count={4} />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
