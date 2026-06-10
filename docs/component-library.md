# Komponentbibliotek — registrering av nye komponenter

> Register over komponenter lagt til etter at denne fila ble opprettet (2026-06-10).
> Hovedbibliotekene er beskrevet i CLAUDE.md: `src/components/athletic/` (branded),
> `src/components/ui/` (shadcn-primitiver), `src/components/shared/` (utilities).
> Nye komponenter registreres her med plassering, formål og hvem som bruker dem.

| Komponent | Fil | Formål | Brukes av |
|---|---|---|---|
| `NivaaBadge` | `src/components/admin/tester/nivaa-badge.tsx` | Kompakt nivå-chip i Tester-matrisens målte celler. Viser beste oppnådde tour-nivå mot DataGolf-fasit ("PGA", "DPW/KFT", "CHA", "NOR", "JR", "SCR", evt. "U/SCR" under Scratch). Tooltip (title) viser hele nivåstigen. Kun DS-tokens. | `TesterOversikt` (`/admin/tester`) |
