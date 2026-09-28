Only in AgencyOS drill-downs (Stall › gruppe › spiller, År › Periode › Uke). PlayerHQ uses TopBar back.

```jsx
<Breadcrumb items={[{ label: "Stall", onClick: () => go("stall") }, { label: "Junior elite", onClick: … }, { label: "Ida Berg" }]} />
```

- Wraps to a second line on narrow widths; middle items may ellipsize, current page never.
