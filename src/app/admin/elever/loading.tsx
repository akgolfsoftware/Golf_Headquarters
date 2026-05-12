import {
  SkeletonHero,
  SkeletonKpi,
  SkeletonTable,
} from "@/components/shared/loading-skeleton";

export default function EleverLoading() {
  return (
    <div className="space-y-6 p-8">
      <SkeletonHero />
      <SkeletonKpi count={4} />
      <SkeletonTable rows={8} />
    </div>
  );
}
