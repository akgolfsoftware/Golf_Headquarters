import {
  SkeletonHero,
  SkeletonList,
  SkeletonCard,
} from "@/components/shared/loading-skeleton";

export default function AgentPipelineLoading() {
  return (
    <div className="space-y-6">
      <SkeletonHero />
      <SkeletonCard height="h-12" />
      <SkeletonList rows={6} />
    </div>
  );
}
