56 px top bar at ≤ 1024 px: logo left, menu button right. Opens NavDrawer.

```jsx
<MenuBar brand={logoFull} onMenu={() => setOpen(true)} open={open} />
```

- No page actions here — they belong in PageHeader.
