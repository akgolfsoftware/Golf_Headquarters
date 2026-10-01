Navigation drawer for ≤ 1024 px, same `groups` as NavRail. 48 px rows, group labels in kicker caps.

```jsx
<NavDrawer open={open} onClose={() => setOpen(false)} brand={logoFull} groups={NAV} active={page} onSelect={setPage} footer={<Who name="Anders Kristiansen" role="HOVEDCOACH" />} />
```

- Only navigation. Details and quick edits use Sheet.
