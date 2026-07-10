import {
  SkeletonCard,
  SkeletonHero,
  SkeletonKpi,
} from "@/components/shared/loading-skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6 p-8">
      <SkeletonHero />
      <SkeletonKpi count={4} />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
