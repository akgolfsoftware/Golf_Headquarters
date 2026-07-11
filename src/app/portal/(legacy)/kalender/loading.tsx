import {
  SkeletonHero,
  SkeletonCard,
} from "@/components/shared/loading-skeleton";

export default function KalenderLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHero />
      <SkeletonCard height="h-12" />
      <SkeletonCard height="h-[480px]" />
    </div>
  );
}
