// components/Island.jsx — Train-lock v3 «Warm» / v3.1 «Liv»
// Fasit: DESIGN-SYSTEM.md §5 + KODEFASIT §4/§8. Alle verdier er var(--token).
// Porteres til src/components/train-lock/Island.tsx. Se Island.prompt.md for reglene.

const ICON = {
  idag: 'M12 4v8l5 3M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0',
  plan: 'M4 6h16v14H4zM8 3v4M16 3v4M8 13h4',
  analyse: 'M4 19V9M10 19V5M16 19v-7M22 19H2',
  meg: 'M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1',
  cockpit: 'M3 12l9-8 9 8M5 10v10h14V10',
  innboks: 'M4 5h16v14H4zM4 9l8 5 8-5',
  kalender: 'M4 6h16v14H4zM8 3v4M16 3v4M4 11h16',
  stall: 'M8 7a3 3 0 1 0 6 0 3 3 0 0 0-6 0M4 20v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1',
  workbench: 'M4 5h7v7H4zM13 5h7v4h-7zM13 13h7v6h-7zM4 15h7v4H4z',
  mic: 'M12 19v3M9 2h6v12H9zM5 10a7 7 0 0 0 14 0',
};

export const ISLAND_DEST = {
  player: [
    { id: 'idag', label: 'I dag' },
    { id: 'plan', label: 'Plan' },
    { id: 'analyse', label: 'Analyse' },
    { id: 'meg', label: 'Meg' },
  ],
  agency: [
    { id: 'cockpit', label: 'Cockpit' },
    { id: 'innboks', label: 'Innboks' },
    { id: 'kalender', label: 'Kalender' },
    { id: 'stall', label: 'Stall' },
    { id: 'workbench', label: 'Workbench' },
  ],
};

export function Island({ variant = 'player', active, onSelect, onMic }) {
  const items = ISLAND_DEST[variant];
  const idx = Math.max(0, items.findIndex((d) => d.id === active));
  const SLOT = 48, GAP = 4, PAD = 8;

  return (
    <nav
      aria-label={variant === 'agency' ? 'AgencyOS' : 'PlayerHQ'}
      style={{
        position: 'fixed', left: '50%', bottom: 'calc(var(--island-lift) + env(safe-area-inset-bottom, 0px))',
        transform: 'translateX(-50%)', zIndex: 40,
        height: 'var(--island-h)', display: 'flex', alignItems: 'center',
        gap: GAP, padding: PAD, borderRadius: 'var(--radius-island)',
        background: 'var(--dock)', boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Pillen ligger bak sirklene og glir. Den forteller hvor du kom fra. */}
      <span
        data-island-pill="1"
        aria-hidden="true"
        style={{
          position: 'absolute', left: PAD, top: PAD,
          width: SLOT, height: SLOT, borderRadius: '50%',
          background: 'var(--warm-tint)',
          transform: 'translateX(' + idx * (SLOT + GAP) + 'px)',
          transition: 'transform var(--dur-island) var(--ease-in-out)',
        }}
      />
      {items.map((it) => {
        const on = it.id === active;
        return (
          <button
            key={it.id}
            type="button"
            data-press="1"
            aria-label={it.label}
            aria-current={on ? 'page' : undefined}
            onClick={() => onSelect && onSelect(it.id)}
            style={{
              position: 'relative', width: SLOT, height: SLOT, flexShrink: 0,
              border: 0, borderRadius: '50%', background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke={on ? 'var(--warm-ink)' : 'var(--mute)'}
              strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d={ICON[it.id]} />
            </svg>
          </button>
        );
      })}

      {/* Mikrofonen er fill-sirkel, ikke en fane — den har ingen aktiv tilstand. */}
      <button
        type="button" data-press="1" aria-label="Spør Caddie" onClick={onMic}
        style={{
          position: 'relative', width: SLOT, height: SLOT, flexShrink: 0,
          border: 0, borderRadius: '50%', background: 'var(--fill)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--onfill)"
          strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={ICON.mic} /></svg>
      </button>
    </nav>
  );
}
