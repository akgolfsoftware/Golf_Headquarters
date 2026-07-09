import {
  SkeletonHero,
  SkeletonCard,
} from "@/components/shared/loading-skeleton";

export default function NyOktLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHero />
      <SkeletonCard height="h-48" />
      <SkeletonCard />
    </div>
  );
}
