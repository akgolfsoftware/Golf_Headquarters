import { cn } from "@/lib/utils";

type CategoryKey =
  | "putting"
  | "naerspill"
  | "jernslag"
  | "driver"
  | "strategi"
  | "fys"
  | "default";

/**
 * Skill-area → CSS-klasse-mapper.
 * Sluttbruker av denne komponenten passer en streng (norsk skill-area-navn),
 * og vi normaliserer.
 */
function normalize(skillArea?: string): CategoryKey {
  if (!skillArea) return "default";
  const s = skillArea.toLowerCase();
  if (s.includes("putt")) return "putting";
  if (s.includes("nær") || s.includes("naer")) return "naerspill";
  if (s.includes("jern") || s.includes("approach")) return "jernslag";
  if (s.includes("driver") || s.includes("lang")) return "driver";
  if (s.includes("strateg") || s.includes("course")) return "strategi";
  if (s.includes("fys") || s.includes("styrke")) return "fys";
  return "default";
}

export function DrillCategoryDot({
  skillArea,
  className,
}: {
  skillArea?: string;
  className?: string;
}) {
  const cat = normalize(skillArea);
  return <span className={cn("drill-cat-dot", `cat-${cat}`, className)} aria-hidden />;
}
