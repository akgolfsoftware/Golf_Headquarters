# Popover

Flytende panel forankret til en trigger. Lukkes ved klikk utenfor.

## Bruk
```jsx
<Popover trigger={<Button variant="secondary" iconRight="chevron-down">Filtrer</Button>} side="bottom-start">
  <FilterPills filters={[{value:"fys",label:"FYS"},{value:"tek",label:"TEK"}]} />
</Popover>
```
