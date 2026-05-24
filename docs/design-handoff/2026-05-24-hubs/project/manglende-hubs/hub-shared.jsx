// Shared hub chrome + card primitive for the 7 missing hub screens.
// Loaded before each hN-*.jsx file.

// Icon set — Lucide-style line icons, 1.75 stroke
const HI = {
  // generic / nav
  Home:        () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/></svg>,
  Bell:        () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  Search:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Settings:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  MsgSquare:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Check:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Plus:        () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Arrow:       () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Download:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Users:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  User:        () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Clipboard:   () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
  // hub card icons (20×20)
  CalendarRange: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M17 14h-6"/><path d="M13 18H7"/><path d="M7 14h.01"/><path d="M17 18h.01"/></svg>,
  FileText:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>,
  Target:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Dumbbell:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14.4 14.4 9.6 9.6"/><path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z"/><path d="m21.5 21.5-1.4-1.4"/><path d="M3.9 3.9 2.5 2.5"/><path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829z"/></svg>,
  Trophy:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  Calendar:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Video:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>,
  CalendarCheck:()=> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>,
  MapPin:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Clock:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Gauge:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>,
  CreditCard:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>,
  Radio:       () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>,
  Activity:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  PlayCircle:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="currentColor"/></svg>,
  BarChart3:   () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16V9"/><path d="M12 16V6"/><path d="M17 16v-5"/></svg>,
  TrendUp:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  Flag:        () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4"/><path d="M4 4h13l-3 4 3 4H4"/></svg>,
  ClipboardCheck:()=> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><polyline points="9 14 11 16 15 12"/></svg>,
  CheckCheck:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>,
  FileBarChart:()=> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-4"/><path d="M8 18v-2"/><path d="M16 18v-6"/></svg>,
  Wallet:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2"/><path d="M22 12V8h-4a2 2 0 0 0 0 4Z"/></svg>,
  Sparkles:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>,
  Map:         () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  Briefcase:   () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  HeartPulse:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/></svg>,
  Shield:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  HelpCircle:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Building:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>,
  Plug:        () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22v-5"/><path d="M9 8V2"/><path d="M15 8V2"/><path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/></svg>,
  Bot:         () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>,
  Mail:        () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/></svg>,
  ShieldLg:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  UserLg:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  UsersLg:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
};
window.HI = HI;

// ============================================================
// Chrome (sidebar + topbar) — same as pr1-chrome but self-contained
// so each artboard can stamp its own.
// ============================================================
function HubSidebar({ role, active, name, role_meta, av_initials, av_meta, badges = {} }) {
  // role: 'coach' | 'player'
  const isCoach = role === 'coach';
  const groups = isCoach ? [
    { label: 'Hjem',      items: [
      { id:'home',      ic: HI.Home,       nm:'Hjem' },
      { id:'innboks',   ic: HI.MsgSquare,  nm:'Innboks', b: badges.innboks },
    ]},
    { label: 'Planlegge', items: [
      { id:'plan-treningsplaner', ic: HI.Clipboard, nm:'Treningsplaner' },
      { id:'plan-maler',          ic: HI.FileText,  nm:'Plan-maler' },
      { id:'plan-tekn',           ic: HI.Target,    nm:'Teknisk plan' },
      { id:'plan-drill',          ic: HI.Dumbbell,  nm:'Drill-bibliotek' },
    ]},
    { label: 'Gjennomføre', items: [
      { id:'gj-kalender',  ic: HI.Calendar,      nm:'Kalender' },
      { id:'gj-bookinger', ic: HI.CalendarCheck, nm:'Bookinger', b: badges.bookinger },
      { id:'gj-anlegg',    ic: HI.MapPin,        nm:'Anlegg' },
    ]},
    { label: 'Innsikt', items: [
      { id:'in-lag',           ic: HI.BarChart3,      nm:'Lag-snitt' },
      { id:'in-tester',        ic: HI.ClipboardCheck, nm:'Tester' },
      { id:'in-godkjenninger', ic: HI.CheckCheck,     nm:'Godkjenninger', b: badges.godkjenninger },
      { id:'in-rapporter',     ic: HI.FileBarChart,   nm:'Rapporter' },
    ]},
    { label: 'Admin', items: [
      { id:'ad-klubb',          ic: HI.Building, nm:'Klubb' },
      { id:'ad-team',           ic: HI.UsersLg,  nm:'Team' },
      { id:'ad-integrasjoner',  ic: HI.Plug,     nm:'Integrasjoner' },
    ]},
  ] : [
    { label: 'Hjem', items: [
      { id:'home',    ic: HI.Home,      nm:'Hjem' },
      { id:'varsler', ic: HI.Bell,      nm:'Varsler', b: badges.varsler },
    ]},
    { label: 'Gjennomføre', items: [
      { id:'gj-idag',     ic: HI.PlayCircle,    nm:'I dag' },
      { id:'gj-kalender', ic: HI.Calendar,      nm:'Kalender' },
      { id:'gj-live',     ic: HI.Activity,      nm:'Live-økt' },
      { id:'gj-booking',  ic: HI.CalendarCheck, nm:'Booking' },
    ]},
    { label: 'Analysere', items: [
      { id:'an-stat',    ic: HI.BarChart3,      nm:'Statistikk' },
      { id:'an-runder',  ic: HI.Flag,           nm:'Runder' },
      { id:'an-tester',  ic: HI.ClipboardCheck, nm:'Tester' },
      { id:'an-ai',      ic: HI.Sparkles,       nm:'AI-Innsikt' },
    ]},
    { label: 'Meg', items: [
      { id:'me-profil',     ic: HI.UserLg,     nm:'Profil' },
      { id:'me-abo',        ic: HI.CreditCard, nm:'Abonnement' },
      { id:'me-utstyr',     ic: HI.Briefcase,  nm:'Utstyrsbag' },
      { id:'me-innst',      ic: HI.Settings,   nm:'Innstillinger' },
    ]},
  ];

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <img src="assets/logo-white-on-green.svg" alt="AK Golf" />
        <div className="name">AK GOLF</div>
        <div className="meta">{role_meta}</div>
      </div>
      <div className="sb-profile">
        <div className="av">{av_initials}</div>
        <div>
          <div className="nm">{name}</div>
          <div className="meta">{av_meta}</div>
        </div>
      </div>
      <div style={{ overflowY:'auto', display:'flex', flexDirection:'column', gap:14, flex:1, minHeight:0, paddingRight:2 }}>
        {groups.map(g => (
          <div className="sb-group" key={g.label}>
            <div className="sb-glabel">{g.label}</div>
            {g.items.map(it => (
              <button key={it.id} className={"sb-item" + (active === it.id ? ' active' : '')}>
                <it.ic /> <span>{it.nm}</span>
                {it.b ? <span className="badge">{it.b}</span> : null}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="sb-group" style={{ marginTop:'auto' }}>
        <button className="sb-item"><HI.Settings/>Innstillinger</button>
      </div>
    </aside>
  );
}

function HubTopbar({ crumbs }) {
  return (
    <header className="topbar">
      <div className="search">
        <HI.Search/>
        <input placeholder="Søk drill, plan, spiller…" readOnly />
        <span className="kbd">⌘K</span>
      </div>
      <div className="breadcrumb">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 ? <span> / </span> : null}
            <span className={i === crumbs.length - 1 ? 'current' : ''}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div style={{ marginLeft:'auto', display:'flex', gap:2 }}>
        <button className="top-icon"><HI.MsgSquare/><span className="dot"></span></button>
        <button className="top-icon"><HI.Bell/></button>
        <button className="top-icon"><HI.UserLg/></button>
      </div>
    </header>
  );
}

// ============================================================
// Page header — eyebrow → italic title → sub → actions
// ============================================================
function HubHeader({ eyebrow, title, titleItalic, sub, actions, children }) {
  return (
    <header className="hub-head">
      <div className="hub-head-left">
        <div className="eyebrow">{eyebrow}</div>
        <h1>
          {title}{' '}
          {titleItalic ? <em>{titleItalic}</em> : null}
        </h1>
        {sub ? <div className="hub-sub">{sub}</div> : null}
        {children}
      </div>
      <div className="hub-head-actions">{actions}</div>
    </header>
  );
}

// ============================================================
// HubCard — the canonical card primitive
// ============================================================
function HubCard({ Ic, eyebrow, title, data, sub, statusPill, visual, cta = 'Åpne →', tone = 'default' }) {
  return (
    <article className={"hub-card tone-" + tone}>
      <div className="hub-card-top">
        <div className="hub-card-icon">{Ic ? <Ic/> : null}</div>
        {statusPill}
      </div>
      <div className="hub-card-body">
        <div className="eyebrow">{eyebrow}</div>
        <h3 className="hub-card-title">{title}</h3>
      </div>
      <div className="hub-card-divider" />
      <div className="hub-card-data">
        <div className="hub-card-prim">{data}</div>
        {sub ? <div className="hub-card-sub">{sub}</div> : null}
        {visual}
      </div>
      <div className="hub-card-cta">
        <span>{cta}</span>
      </div>
    </article>
  );
}

// Status pills
function Pill({ kind, dot, children }) {
  return (
    <span className={`hub-pill p-${kind}`}>
      {dot ? <span className={`hub-pill-dot ${dot}`} /> : null}
      {children}
    </span>
  );
}

// KPI mini-bar (e.g. "2% used capacity")
function KpiBar({ pct, tone = 'ok' }) {
  return (
    <div className="kpi-bar">
      <div className="kpi-bar-track">
        <div className={`kpi-bar-fill t-${tone}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="kpi-bar-label">{pct}%</span>
    </div>
  );
}

// Mini pyramid visual (for Lag-snitt)
function PyramidViz() {
  const bars = [
    { lbl:'Fys', pct: 18, c: '#1A4D2E' },
    { lbl:'Tek', pct: 32, c: '#005840' },
    { lbl:'Slag', pct: 28, c: '#2C7D52' },
    { lbl:'Spill', pct: 14, c: '#88B45A' },
    { lbl:'Turn', pct: 8,  c: '#C8B72A' },
  ];
  return (
    <div className="pyr-mini">
      {bars.map(b => (
        <div className="pyr-mini-row" key={b.lbl}>
          <span className="pyr-mini-lbl">{b.lbl}</span>
          <span className="pyr-mini-bar"><span style={{ width:`${b.pct*2.4}%`, background:b.c }}/></span>
          <span className="pyr-mini-pct">{b.pct}%</span>
        </div>
      ))}
    </div>
  );
}

// Progress bar (for Tester 12/36 etc.)
function Progress({ done, total, tone='ok' }) {
  const pct = Math.round((done/total)*100);
  return (
    <div className="hubprog">
      <div className="hubprog-row">
        <span className="hubprog-fig">{done}<span>/{total}</span></span>
        <span className="hubprog-pct">{pct}%</span>
      </div>
      <div className="hubprog-track"><div className={`hubprog-fill t-${tone}`} style={{ width: `${pct}%` }}/></div>
    </div>
  );
}

Object.assign(window, { HubSidebar, HubTopbar, HubHeader, HubCard, Pill, KpiBar, PyramidViz, Progress });
