/**
 * Inline SVG-sprite for planlegge-v2. Definert én gang per side via <PlanleggeSprite />.
 * Bruk via <svg><use href="#i-foo" /></svg> i resten av treet.
 *
 * Hentet fra Claude Design-handoff (planlegge-arsplan.html linje 13-34).
 */

export function PlanleggeSprite() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="i-home" viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <path d="M9 22V12h6v10" fill="none" stroke="currentColor" strokeWidth="1.75" />
        </symbol>
        <symbol id="i-cal" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.75" />
        </symbol>
        <symbol id="i-play" viewBox="0 0 24 24">
          <polygon points="6 4 20 12 6 20" fill="currentColor" />
        </symbol>
        <symbol id="i-bar" viewBox="0 0 24 24">
          <line x1="12" y1="20" x2="12" y2="10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="18" y1="20" x2="18" y2="4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="6" y1="20" x2="6" y2="16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </symbol>
        <symbol id="i-users" viewBox="0 0 24 24">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.75" />
        </symbol>
        <symbol id="i-user-circle" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="12" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <path d="M6 21a6 6 0 0 1 12 0" fill="none" stroke="currentColor" strokeWidth="1.75" />
        </symbol>
        <symbol id="i-plus" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </symbol>
        <symbol id="i-flag" viewBox="0 0 24 24">
          <path d="M4 22V4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M4 4h11l-2 4 2 4H4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-arrow-right" viewBox="0 0 24 24">
          <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <polyline points="12 5 19 12 12 19" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-arrow-left" viewBox="0 0 24 24">
          <line x1="19" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <polyline points="12 19 5 12 12 5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
        <symbol id="i-route" viewBox="0 0 24 24">
          <circle cx="6" cy="19" r="3" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="18" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="1.75" />
        </symbol>
        <symbol id="i-dumbbell" viewBox="0 0 24 24">
          <path d="M6 4v16M3 7v10M18 4v16M21 7v10M6 12h12" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </symbol>
        <symbol id="i-target" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
        </symbol>
        <symbol id="i-trophy" viewBox="0 0 24 24">
          <path d="M8 21h8M12 17v4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M7 4h10v6a5 5 0 0 1-10 0z" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
          <path d="M7 6H4a3 3 0 0 0 3 3M17 6h3a3 3 0 0 1-3 3" fill="none" stroke="currentColor" strokeWidth="1.75" />
        </symbol>
        <symbol id="i-sparkles" viewBox="0 0 24 24">
          <path
            d="M12 3l1.8 4.7L18 9.5l-4.2 1.8L12 16l-1.8-4.7L6 9.5l4.2-1.8L12 3z M19 14l.9 2.4L22 17l-2.1.6L19 20l-.9-2.4L16 17l2.1-.6L19 14zM5 14l.6 1.6L7 16l-1.4.4L5 18l-.6-1.6L3 16l1.4-.4L5 14z"
            fill="currentColor"
          />
        </symbol>
        <symbol id="i-settings" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82 2 2 0 1 1-2.83 2.83 1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33 2 2 0 1 1-2.83-2.83 1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3.09 14H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82 2 2 0 1 1 2.83-2.83 1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33 2 2 0 1 1 2.83 2.83 1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </symbol>
        <symbol id="i-info" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </symbol>
        <symbol id="i-tournament-pin" viewBox="0 0 24 24">
          <path d="M12 2L3 9l9 12 9-12-9-7z" fill="currentColor" />
        </symbol>
        <symbol id="i-grip" viewBox="0 0 24 24">
          <circle cx="9" cy="5" r="1.5" fill="currentColor" />
          <circle cx="9" cy="12" r="1.5" fill="currentColor" />
          <circle cx="9" cy="19" r="1.5" fill="currentColor" />
          <circle cx="15" cy="5" r="1.5" fill="currentColor" />
          <circle cx="15" cy="12" r="1.5" fill="currentColor" />
          <circle cx="15" cy="19" r="1.5" fill="currentColor" />
        </symbol>
        <symbol id="i-star" viewBox="0 0 24 24">
          <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2" fill="currentColor" />
        </symbol>
        <symbol id="i-clock" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.75" />
          <polyline points="12 6 12 12 16 14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </symbol>
        <symbol id="i-x" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </symbol>
        <symbol id="i-check" viewBox="0 0 24 24">
          <polyline points="20 6 9 17 4 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </symbol>
      </defs>
    </svg>
  );
}

export function I({ name, className }: { name: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor">
      <use href={`#${name}`} />
    </svg>
  );
}
