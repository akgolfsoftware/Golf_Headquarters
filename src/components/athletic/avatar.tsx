import Image from "next/image";
import { cn } from "@/lib/utils";

type AthleticAvatarProps = {
  src?: string | null;
  alt?: string;
  initials?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "none";
  borderColor?: "white" | "card";
  ring?: "lime" | "none";
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
  ring = "none",
  className,
}: AthleticAvatarProps) {
  const dims = sizeMap[size];

  const inner = (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground",
        ring === "none" && (borderColor === "white" ? "border-2 border-background" : "border-2 border-card"),
        ring === "lime" && "ring-2 ring-offset-1 ring-[var(--lime)]",
        "shadow-md",
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
            "absolute bottom-0.5 right-0.5 rounded-full border-2 border-background bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.45)]",
            dims.status,
          )}
        />
      )}
      {status === "offline" && (
        <span
          aria-hidden
          className={cn(
            "absolute bottom-0.5 right-0.5 rounded-full border-2 border-background bg-muted-foreground",
            dims.status,
          )}
        />
      )}
    </span>
  );

  return inner;
}
