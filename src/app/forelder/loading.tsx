import {
  SkeletonHero,
  SkeletonKpi,
  SkeletonCard,
} from "@/components/shared/loading-skeleton";

export default function ForelderLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <SkeletonHero />
      <SkeletonKpi count={3} />
      <SkeletonCard />
    </div>
  );
}
