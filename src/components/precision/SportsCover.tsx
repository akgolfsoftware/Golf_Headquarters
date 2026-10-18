import Image from "next/image";

/** Originalt anonymt sportsfoto. Atmosfære, aldri spillerportrett eller faglig instruksjon. */
const coverSources = {
  green: "/images/precision/practice-green-2026-10.png",
  range: "/images/precision/practice-range-2026-10.png",
  physical: "/images/precision/physical-training-2026-10.png",
} as const;
export function SportsCover({ compact = true, priority = false, scene = "green" }: { compact?: boolean; priority?: boolean; scene?: keyof typeof coverSources }) {
  return <div className="pa-sports-cover" data-compact={compact} aria-hidden="true">
    <Image src={coverSources[scene]} alt="" fill
      sizes="(max-width: 768px) 100vw, 900px" priority={priority}
      style={{ objectFit: "cover", objectPosition: "center 62%" }} />
  </div>;
}
