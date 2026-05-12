import {
  SkeletonHero,
  SkeletonKpi,
  SkeletonList,
} from "@/components/shared/loading-skeleton";

export default function TrenLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHero />
      <SkeletonKpi count={4} />
      <SkeletonList rows={5} />
    </div>
  );
}
