import {
  SkeletonHero,
  SkeletonCard,
  SkeletonList,
} from "@/components/shared/loading-skeleton";

export default function CoachLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHero />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonList rows={4} />
    </div>
  );
}
