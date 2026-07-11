import {
  SkeletonHero,
  SkeletonList,
} from "@/components/shared/loading-skeleton";

export default function VarslerLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHero />
      <SkeletonList rows={8} />
    </div>
  );
}
