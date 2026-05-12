import {
  SkeletonHero,
  SkeletonCard,
} from "@/components/shared/loading-skeleton";

export default function SessionLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHero />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
