import {
  SkeletonCard,
  SkeletonHero,
} from "@/components/shared/loading-skeleton";

export default function CalendarLoading() {
  return (
    <div className="space-y-6 p-8">
      <SkeletonHero />
      <SkeletonCard height="h-96" />
    </div>
  );
}
