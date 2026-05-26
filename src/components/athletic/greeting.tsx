import { cn } from "@/lib/utils";
import { AthleticAvatar } from "./avatar";

type AthleticGreetingProps = {
  italicEyebrow?: string;
  title: string;
  lede?: string;
  metaItems?: React.ReactNode[];
  avatar?: {
    src?: string | null;
    initials?: string;
    alt?: string;
    status?: "online" | "offline" | "none";
  };
  size?: "md" | "lg";
  align?: "left" | "stack";
  className?: string;
};

export function AthleticGreeting({
  italicEyebrow,
  title,
  lede,
  metaItems,
  avatar,
  size = "lg",
  align = "left",
  className,
}: AthleticGreetingProps) {
  const titleClass = cn(
    "font-display font-bold leading-[1.05] tracking-[-0.025em] text-foreground",
    size === "lg" ? "text-3xl md:text-4xl" : "text-2xl",
  );

  const inner = (
    <>
      {italicEyebrow && (
        <span className="font-display block text-base italic font-medium tracking-[-0.005em] text-primary md:text-lg">
          {italicEyebrow}
        </span>
      )}
      <h1 className={titleClass}>{title}</h1>
      {lede && (
        <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-muted-foreground md:text-base">
          {lede}
        </p>
      )}
      {metaItems && metaItems.length > 0 && (
        <ul className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {metaItems.map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              {i > 0 && <span className="h-[3px] w-[3px] rounded-full bg-muted-foreground/60" />}
              {item}
            </li>
          ))}
        </ul>
      )}
    </>
  );

  if (!avatar) {
    return <div className={cn("min-w-0", className)}>{inner}</div>;
  }

  if (align === "stack") {
    return (
      <div className={cn("flex flex-col items-start gap-2", className)}>
        <AthleticAvatar
          src={avatar.src}
          alt={avatar.alt}
          initials={avatar.initials}
          status={avatar.status ?? "none"}
          size="lg"
        />
        <div className="min-w-0">{inner}</div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-start gap-4", className)}>
      <AthleticAvatar
        src={avatar.src}
        alt={avatar.alt}
        initials={avatar.initials}
        status={avatar.status ?? "none"}
        size="lg"
      />
      <div className="min-w-0">{inner}</div>
    </div>
  );
}
