Inbox / queue / task row; use for notification lists, approval queues and task feeds.

```jsx
<ListRow icon="bell" iconTone="signal" title="Ny øktforespørsel" subtitle="Øyvind Rohjan · Putting" meta="2t" unread chevron onClick={open} />
<ListRow icon="circle-check" iconTone="up" title="Plan fullført" subtitle="Uke 24" meta="i går" />
```

- **icon** + **iconTone** (`neutral` / `signal` / `up` / `down`) sets the leading chip.
- **meta** is right-aligned (time, count, a Tag); **unread** adds a lime dot; **chevron** for navigational rows.
- Becomes interactive (hover) when given `onClick` or `href`.
