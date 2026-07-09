import {
  SkeletonCard,
  SkeletonHero,
} from "@/components/shared/loading-skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 p-8">
      <SkeletonHero />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
