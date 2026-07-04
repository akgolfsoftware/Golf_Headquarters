# KommandoPalett

Kanonisk ⌘K-palett (promotert fra `ui_kits/`): søk + grupperte hurtighandlinger + hopp-til-navigasjon. Kontrollert overlay.

## Bruk
```jsx
const [open, setOpen] = React.useState(false);
// kalleren binder ⌘K:
React.useEffect(() => {
  const h = (e) => { if ((e.metaKey||e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen(true); } };
  addEventListener("keydown", h); return () => removeEventListener("keydown", h);
}, []);

<KommandoPalett open={open} onClose={() => setOpen(false)} grupper={[
  { tittel: "Spillere", elementer: [{ id:"p1", ikon:"circle-user", tittel:"Øyvind Rohjan", undertekst:"Kategori A", onVelg: aapneSpiller }] },
  { tittel: "Handlinger", elementer: [{ ikon:"plus", tittel:"Ny økt", snarvei:"⌘N", onVelg: nyOkt }] },
  { tittel: "Hopp til", elementer: [{ ikon:"git-branch", tittel:"Workbench", onVelg: () => go("workbench") }] },
]} />
```

## Tastatur & tilstander
↑/↓ flytter aktiv rad · Enter velger · Esc/klikk-utenfor lukker · fokus settes i input ved åpning. Tomt søk = «Ingen treff». Animasjon respekterer `prefers-reduced-motion`.

## Domenefasit
Kalleren eier ⌘K-trigger, søkedata og `onVelg`-handlingene (i AgencyOS: postMessage til shell for modul-nav). Norsk placeholder, aldri emoji.
