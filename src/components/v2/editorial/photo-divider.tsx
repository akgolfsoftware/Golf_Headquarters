export type PhotoDividerProps = {
  /** Image number from /images/akgolf/{img}.webp */
  img: number;
  /** Small uppercase kicker text */
  kicker: string;
  /** Main italic quote line */
  line: string;
  /** Optional date label shown bottom-right */
  dateLabel?: string;
};

export default function PhotoDivider({
  img,
  kicker,
  line,
  dateLabel = "AK GOLF ACADEMY · 26/05/26",
}: PhotoDividerProps) {
  return (
    <div
      className="relative flex items-center justify-between overflow-hidden"
      style={{
        height: 200,
        margin: "8px -32px",
        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.2)), url(/images/akgolf/${img}.webp)`,
        backgroundSize: "cover",
        backgroundPosition: "center 40%",
        padding: "0 48px",
      }}
      aria-hidden
    >
      <div>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
          {kicker}
        </span>
        <p
          className="m-0 mt-2 font-display font-medium italic text-[24px] tracking-[-0.01em]"
          style={{
            color: "#FAFAF7",
            maxWidth: 520,
            textWrap: "balance",
          } as React.CSSProperties}
        >
          {line}
        </p>
      </div>
      <span
        className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] self-end pb-[18px]"
        style={{ color: "rgba(250,250,247,0.6)" }}
      >
        {dateLabel}
      </span>
    </div>
  );
}
