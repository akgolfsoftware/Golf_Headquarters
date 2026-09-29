AgencyOS navigation above 1024 px: 56 px icon rail with tooltips. Groups are separated by hairlines.

```jsx
<NavRail brand={logoMark} groups={NAV} active={page} onSelect={setPage} footer={<Avatar name="Anders Kristiansen" size={32} />} />
```

- Order: Hjem · Innboks · Kalender · Stall · Workbench · Kø · Caddie.
- `count` + `signal: true` gives a rust dot — only for Kø (work waiting for the coach).
- Use through `KIT.KitShell`, which swaps to MenuBar + NavDrawer at ≤ 1024 px.
