import {
  SkeletonHero,
  SkeletonCard,
} from "@/components/shared/loading-skeleton";

export default function MegLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHero />
      <SkeletonCard height="h-96" />
    </div>
  );
}
