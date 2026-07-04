Week day-strip for calendars and the player home; use above a day's agenda.

```jsx
const [day, setDay] = React.useState(20);
<DayStrip
  value={day}
  onChange={setDay}
  days={[
    { dow:"M", date:17, state:"done" },
    { dow:"T", date:18, state:"done" },
    { dow:"O", date:19, state:"done" },
    { dow:"T", date:20, today:true },
    { dow:"F", date:21 },
    { dow:"L", date:22 },
    { dow:"S", date:23 },
  ]}
/>
```

- Selected day = white pill (dark text); **today** = lime dot; **state:"done"** = faint dot.
- Norwegian week, Monday-first. Pair with `AgendaRow`s below.
