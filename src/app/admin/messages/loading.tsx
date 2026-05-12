import {
  SkeletonHero,
  SkeletonList,
} from "@/components/shared/loading-skeleton";

export default function MessagesLoading() {
  return (
    <div className="space-y-6 p-8">
      <SkeletonHero />
      <SkeletonList rows={8} />
    </div>
  );
}
