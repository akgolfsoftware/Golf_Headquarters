import {
  SkeletonHero,
  SkeletonList,
} from "@/components/shared/loading-skeleton";

export default function UtfordringerLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHero />
      <SkeletonList rows={5} />
    </div>
  );
}
