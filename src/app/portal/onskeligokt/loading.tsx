import {
  SkeletonHero,
  SkeletonCard,
} from "@/components/shared/loading-skeleton";

export default function OnskeligOktLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHero />
      <SkeletonCard height="h-64" />
    </div>
  );
}
