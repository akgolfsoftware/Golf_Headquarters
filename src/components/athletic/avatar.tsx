import Image from "next/image";
import { cn } from "@/lib/utils";

type AthleticAvatarProps = {
  src?: string | null;
  alt?: string;
  initials?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "none";
  borderColor?: "white" | "card";
  className?: string;
};

const sizeMap: Record<NonNullable<AthleticAvatarProps["size"]>, { wrap: string; status: string; text: string }> = {
  sm: { wrap: "h-10 w-10", status: "h-2.5 w-2.5", text: "text-xs" },
  md: { wrap: "h-14 w-14", status: "h-3 w-3", text: "text-sm" },
  lg: { wrap: "h-16 w-16", status: "h-3.5 w-3.5", text: "text-base" },
  xl: { wrap: "h-18 w-18", status: "h-4 w-4", text: "text-lg" },
};

export function AthleticAvatar({
  src,
  alt = "Avatar",
  initials,
  size = "md",
  status = "none",
  borderColor = "white",
  className,
}: AthleticAvatarProps) {
  const dims = sizeMap[size];
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-accent",
        borderColor === "white" ? "border-2 border-white" : "border-2 border-card",
        "shadow-[0_4px_14px_rgba(0,0,0,0.12)]",
        dims.wrap,
        className,
      )}
    >
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes="80px" />
      ) : (
        <span className={cn("font-display font-bold uppercase", dims.text)}>
          {initials ?? "—"}
        </span>
      )}
      {status === "online" && (
        <span
          aria-hidden
          className={cn(
            "absolute bottom-0.5 right-0.5 rounded-full border-2 border-white bg-accent shadow-[0_0_6px_rgba(209,248,67,0.45)]",
            dims.status,
          )}
        />
      )}
      {status === "offline" && (
        <span
          aria-hidden
          className={cn(
            "absolute bottom-0.5 right-0.5 rounded-full border-2 border-white bg-muted-foreground",
            dims.status,
          )}
        />
      )}
    </span>
  );
}
