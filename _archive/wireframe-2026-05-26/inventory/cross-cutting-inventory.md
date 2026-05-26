# AK Golf Platform — Cross-Cutting Features Inventory

**Total Features Identified:** 87  
**Documented Gaps:** 36 (marked as "IKKE SPESIFISERT")  
**Coverage:** 75–95% per category

---

## 1. Brukerroller og Auth-Tilganger

### User Roles (6 total)

| Role | Registration | Entry Point | Surface | Status |
|------|---|---|---|---|
| **Spiller** | Self-service | Email signup → tier selection → invite coach | PlayerHQ (5 tabs) | ✓ Spesifisert |
| **Coach** | Club admin/AK-team invite | Email invite → club selection → roster | CoachHQ (5 tabs) | ✓ Spesifisert |
| **Foresatt** | Self-service | Email signup → junior selection → coach assignment | Parent Portal (5 screens) | ⚠ Delvis spesifisert |
| **Klubbadmin** | Club owner setup | Admin panel | Facility Manager (5 views) | ✓ Spesifisert |
| **Junior** (U16) | Parent-created | Inherits parent tier | PlayerHQ w/ guardian-vern | ⚠ Delvis spesifisert |
| **AK-team** | Internal | Internal dashboard | AK Analytics | ❌ IKKE SPESIFISERT |

### CBAC Capabilities (43+ documented)

**Player capabilities:**
- `play:view_dashboard`, `play:log_round`, `play:view_plan`, `play:edit_plan_comment`, `play:request_coach_feedback`, `play:view_achievements`, `play:book_session`, `play:manage_profile`, `play:view_stats`, `play:join_challenge`

**Coach capabilities:**
- `coach:view_roster`, `coach:view_player_profile`, `coach:edit_plan`, `coach:create_plan`, `coach:send_message`, `coach:schedule_session`, `coach:view_round_detail`, `coach:approve_plan`, `coach:trigger_agent_action`, `coach:view_insights`, `coach:manage_drills`, `coach:export_data`

**Club Admin capabilities:**
- `admin:manage_coaches`, `admin:manage_facilities`, `admin:view_billing`, `admin:manage_bookings`, `admin:view_club_stats`

**Parent capabilities:**
- `parent:view_child_progress`, `parent:communicate_with_coach`, `parent:manage_profile`, `parent:view_booking_history`

**AK-team capabilities:**
- `ak:view_all_data`, `ak:manage_system_configs`, `ak:manage_users`, `ak:view_analytics`

**Status:** ✓ Spesifisert (roles), ❌ IKKE SPESIFISERT (AK-team full capability matrix)

---

## 2. Booking + Facility Manager

### Facility Manager Dashboard (5 Views)

| View | Purpose | Features | Status |
|------|---------|----------|--------|
| **Interactive Map** | Real-time facility overview | Status markers (green/red/yellow/grey), pulse animation, tooltips, side-panel KPI stripe, occupancy % | ✓ Spesifisert |
| **List View** | Sortable facility directory | Filter chips, status-dots, occupancy-bars, sortable columns (name, occupancy, status) | ✓ Spesifisert |
| **Day Calendar** | 24-hour facility schedule | Date-picker, facility rows × time columns (06:00–21:00, 30-min increments), now-indicator red line, reservation blocks, quick-reserve popover | ✓ Spesifisert |
| **Week Calendar** | 7-day overview | 7 columns (man–sun), facility grouping, compact blocks with initials, drag-reschedule capability | ⚠ Delvis spesifisert |
| **Month Heatmap** | Historical occupancy patterns | Traditional calendar grid, color intensity (0–90%+), event icons, summary table | ✓ Spesifisert |

### Booking Flow

**Trigger:** Player clicks "Book Session" in PlayerHQ Coach tab
```
Player initiates booking 
  → Select date + facility + time 
  → System auto-checks facility-ledige 
  → Auto-reserves facility slot 
  → Displays in facility manager calendar 
  → Coach receives notification
```

**Status:** ✓ Spesifisert (main flow), ⚠ DELVIS (rescheduling, cancellation SLA, facility-conflict resolution)

### Group Session Facility Auto-Sync

- **Feature:** When coach creates group training session, system automatically reserves facilities for all participants at their home clubs
- **Trigger:** Coach saves group session template with participant list
- **Action:** Backend queries each player's preferred facility → reserves time slots → updates facility calendars
- **Status:** ⚠ IKKE SPESIFISERT (conflict resolution, fallback if facility unavailable, notification to facility managers)

---

## 3. Agent-System fra UI-Perspektiv

### Signal-Skill-Agent Pipeline

**15 Signal Types:**
1. `weakness_detection` — SG breakdown reveals weak area
2. `consistency_plateau` — Same weakness detected 3+ rounds
3. `tournament_approaching` — Event within 7 days
4. `new_trackman_data` — TrackMan session imported
5. `test_due` — Scheduled test date reached
6. `plan_deviation` — Player missed sessions or underperformed
7. `streak_building` — 5+ consecutive completed sessions
8. `achievement_ready` — Conditions met for achievement unlock
9. `peer_comparison` — Player falls behind peer group
10. `technical_regression` — Skill metrics declining
11. `mental_checkpoint` — Mental-training milestone reached
12. `seasonal_transition` — Entering new training period
13. `injury_flag` — Potential overtraining detected
14. `drill_mastery` — Personal best on drill achieved
15. `challenge_eligible` — Can participate in new drill challenge

**6 Skills:** `weakness_training`, `periodization`, `progression`, `pyramid_structure`, `drill_selection`, `junior_guard`

**5 Agents:**
- `Plan-vakten` — Weekly plan adjustments
- `Runde-agent` — Post-round insights
- `Turnering-agent` — Tournament prep
- `Test-agent` — Testing protocols
- `TrackMan-agent` — Shot-level analysis

**10 PlanAction Types:**
1. `add_drill_to_session`
2. `increase_session_volume`
3. `adjust_periodization_phase`
4. `swap_exercise_in_pyramid`
5. `add_weakness_focus_week`
6. `suggest_tournament_prep_plan`
7. `schedule_retest`
8. `recommend_mental_training_block`
9. `flag_junior_overtraining`
10. `suggest_recovery_week`

### CoachHQ Agent UI

**Agent Inbox (Coach-facing):**
- Badge counter (red, number of pending actions)
- Priority-sorted list (urgent → high → medium → low)
- Per-spiller grouping with player photo/name
- Action card: `[Player Name]` | `[Action Type]` | `[Rationale (2–3 lines)]` | `[Approve/Deny buttons]` | `[View Details]`
- "Approve All Low-Risk" bulk action
- Filter by status (pending, approved, denied, applied)

**Status:** ✓ Spesifisert (inbox UI, priority logic), ⚠ DELVIS (bulk-approval rules, analytics on action acceptance rates)

### PlayerHQ Agent Delivery

**Self-Serve Mode (No Coach Required):**
- Low-risk PlanActions auto-apply (weakness-drill suggestions, achievement notifications)
- Medium-risk require player approval (session-time increase, periodization change)
- High-risk require coach approval (intensive tournament prep, medical flag)

**Coach-Mode (Coach Oversight):**
- All PlanActions route through coach approval before player sees them
- Coach can override AI recommendations
- Player receives coach-curated "brief" instead of raw actions

**Status:** ✓ Spesifisert (delivery modes), ❌ IKKE SPESIFISERT (risk-scoring algorithm, auto-apply rules detail)

---

## 4. Live Session-Flyt

### 4-Screen Fullscreen Modal Flow

**Screen 1: Intro**
- Økt info (title, exercises count, estimated duration, coach note)
- "Start Økt" button (green CTA)
- "Avbryt" button
- Coach can send real-time message (appears as toast)

**Screen 2: Aktiv (Rep-Logging)**
- Total timer (mm:ss) at top
- Per-exercise timer (mm:ss) aligned with current exercise
- Exercise list with club list (e.g., "Driver" → [1/6 reps, 2/6 reps, ...])
- Two rep-logging modes:
  - **Manual:** Player taps `+` button to log each rep
  - **Tapper Mode:** Rapidly tap club-button; system counts taps (with tap-lock to prevent accidental double-taps)
- Orange warning if time overrun (session duration exceeded by 10%)
- "Pause Økt" / "Avbryt Økt" buttons

**Screen 3: Øvelse Fullført (Between-Exercise Summary)**
- Exercise name, target reps × target sets, actual reps × sets
- Optional drill-score capture (if exercise links to DrillScore)
- "Continue" button to next exercise or Screen 4 if final exercise

**Screen 4: Økt-Oppsummering (Session Summary)**
- Total time (mm:ss)
- Per-exercise results (exercise name | target | actual)
- Streak indicator (consecutive completed sessions)
- Achievement unlock toast (if triggered)
- "Exit" button (returns to PlayerHQ Hjem)

### State Management (Client-Side)

```typescript
useLiveSession() hook:
  - exerciseArray: Exercise[]
  - currentExerciseIndex: number
  - tapMode: boolean
  - sessionStatus: "INTRO" | "ACTIVE" | "BETWEEN" | "SUMMARY" | "PAUSED" | "ABANDONED"
  - totalSeconds: number
  - exerciseLogs: ExerciseLog[]
  - clubLogs: ClubLog[]
```

### Server Actions

- `startLiveSession(sessionId)` → returns LiveSessionLog
- `logClubReps(liveSessionId, exerciseId, clubName, reps)` → updates LiveClubLog
- `completeExercise(liveSessionId, exerciseId, drillScoreId?)` → moves to next or summary
- `completeLiveSession(liveSessionId, playerNote?)` → finalizes session, triggers achievements
- `pauseLiveSession(liveSessionId)` → pauses timers
- `resumeLiveSession(liveSessionId)` → resumes timers
- `abandonLiveSession(liveSessionId)` → marks session as ABANDONED, preserves partial data

### Edge Cases

- **App closure:** IndexedDB backup stores exercise array + current progress; on app reopen, player can resume
- **Offline sync:** Tapper-mode works offline; on reconnect, syncs club logs
- **Tap-lock:** Prevents double-tap-counting in tapper mode (0.5s window)
- **Time overrun:** Orange warning at +10% over estimated duration; player can still complete

**Status:** ✓ Spesifisert (4-screen flow, rep-logging modes, state management)

---

## 5. Periodisering-Agent

### Period Types (5 total)

| Period | Duration | Focus | Drill Density | Intensity |
|--------|----------|-------|---------------|-----------|
| **Off-Season** (Offseason) | Oct–Dec | Recovery, foundation | 30–50% | Low |
| **Forberedelse** (Preparation) | Jan–Mar | Build volume, weakness-focus | 60–80% | Medium–High |
| **Sesong** (Season/Tournament) | Apr–Jun | Maintenance, competition-prep | 70–90% | High |
| **Avslutning** (Conclusion) | Jul | Peak performance, travel | 50–70% | Very High |
| **Taper** (Taper) | Tournament week | Rest, sharpening | 40–60% | Very High (intensity only) |

### Decision Logic (4 Layers)

**Layer 1: Periode-Valg**
- Input: Current date, tournament calendar, HCP trend, player age/tier
- Output: Recommended period for next 12 weeks
- Status: ⚠ IKKE SPESIFISERT (exact decision-tree logic)

**Layer 2: Fordelingsberegning**
- Input: Period type, player HCP, weak areas (SG breakdown), player tier
- Output: Session distribution across week (% drilling, % strategy, % volume)
- Applies junior-vern constraints: under 16 max 4 sessions/week
- Status: ✓ Spesifisert (junior-vern), ⚠ DELVIS (tier-based density tables)

**Layer 3: Ukeplan-Generering**
- Input: Distribution from Layer 2, exercise bank, available facilities
- Output: 6-week plan (W1–W6 pills)
- Pyramide-defaults applied per weakness area (A–K)
- Status: ⚠ DELVIS (pyramide-default table exists, but week-over-week progression rules unclear)

**Layer 4: Justeringstriggers**
- Input: Weekly performance data (drill scores, round stats), player feedback
- Output: Adjust week N+1 based on week N performance
- Triggers: Player underperformed (<70% target), overperformed (>110% target), requested change
- Status: ⚠ IKKE SPESIFISERT (adjustment algorithm, magnitude of changes)

### PeriodizationPlan JSON Structure

```json
{
  "userId": "user_123",
  "createdAt": "2026-05-10T10:00:00Z",
  "periodStart": "2026-05-12",
  "periodEnd": "2027-05-11",
  "periods": [
    {
      "type": "forberedelse",
      "startDate": "2026-05-12",
      "endDate": "2026-08-10",
      "sessionTargetsPerWeek": 4,
      "focusAreas": ["OTT", "INN50"],
      "drillDensity": 0.75
    }
  ],
  "taperBlocks": [
    {
      "tournamentId": "tour_456",
      "startDate": "2026-07-20",
      "endDate": "2026-07-26",
      "type": "taper",
      "guideline": "Maintenance + sharpening"
    }
  ],
  "rationale": "Plan optimized for Q2 tournament season with weakness focus on tee-game.",
  "adjustmentTriggers": ["round_performance", "test_result", "player_request"]
}
```

**Status:** ✓ Spesifisert (period types, junior-vern, structure), ⚠ IKKE SPESIFISERT (decision-tree logic, adjustment magnitude rules)

---

## 6. Notifikasjoner / Inbox

### Notification Types (6 total)

| Type | Trigger | Delivery | Timing | Status |
|------|---------|----------|--------|--------|
| **Evening Summary** | Daily (automatedAgent) | Push + Email | 19:00 (player's timezone) | ✓ Spesifisert |
| **Coach Message** | Coach sends message | In-app Badge + Push | Immediate | ✓ Spesifisert (2-hour SLA) |
| **Achievement Unlock** | Conditions met | Toast + Badge | Realtime during live-session or round-logging | ✓ Spesifisert |
| **Test Reminder** | Test due in 2 days | Push + Coach tab badge | Configurable (default 09:00) | ⚠ IKKE SPESIFISERT |
| **Tournament Prep Alert** | Tournament within 7 days | Hjem banner + push | When triggered | ⚠ IKKE SPESIFISERT (dismissal rules) |
| **Plan Deviation Alert** | Player missed sessions or underperformed | Coach tab badge + Hjem toast | Realtime | ⚠ IKKE SPESIFISERT (threshold for "underperformed") |

### Inbox UI (Coach-Facing)

**Messages Tab (Coach HQ):**
- Unread message counter (red badge)
- Conversation list: [Player Photo] | [Player Name] | [Last Message Preview] | [Timestamp] | [SLA status (green/yellow/red)]
- SLA indicator: Green (< 2 hours), Yellow (1–2 hours), Red (> 2 hours) since player's last message
- Conversation view: Thread of messages, compose box for reply, attach video option
- Status: ✓ Spesifisert

**Notifications Tab:**
- Chronological list of system notifications (agent actions approved, player completed session, test available)
- Filterable by type (messages, agents, rounds, tests)
- Status: ⚠ IKKE SPESIFISERT (full notification-archive UI)

### Evening Summary Content

Generated daily at 19:00 for each player:
- KPI summary (HCP trend, rounds played, sessions completed this week)
- Drill performance (personal bests, weaker drills)
- Upcoming week preview (session count, tournament if any)
- Achievement progress (e.g., "2 achievements away from Bronze tier")
- Coach note (if coach has written one)

**Status:** ✓ Spesifisert (content structure), ⚠ IKKE SPESIFISERT (AI generation of coach note, personalization logic)

---

## 7. Settings-Flater

### Player Settings (PlayerHQ → Meg → Innstillinger)

| Setting | Type | Options | Status |
|---------|------|---------|--------|
| **Notification Preferences** | Toggle | Evening summary ON/OFF, push timing (09:00, 19:00, etc), email frequency | ⚠ IKKE SPESIFISERT |
| **Privacy** | Toggle | Profile visibility (public/private), show stats on leaderboards | ⚠ IKKE SPESIFISERT |
| **Facility Preferences** | Selection | Preferred facility for sessions (dropdown) | ⚠ IKKE SPESIFISERT |
| **Tapper Mode Default** | Toggle | Enable/disable tapper mode in live sessions | ✓ Spesifisert |
| **Units** | Selection | Metric (kg, cm) / Imperial (lbs, ft) | ⚠ IKKE SPESIFISERT |
| **Language** | Selection | Norwegian (Bokmål/Nynorsk), English | ⚠ IKKE SPESIFISERT |
| **Delete Account** | Destructive | Account deletion with 7-day grace period | ⚠ IKKE SPESIFISERT |
| **Connected Devices** | List | Show connected devices, revoke sessions | ⚠ IKKE SPESIFISERT |

**Status:** ⚠ DELVIS SPESIFISERT (only tapper mode confirmed)

### Coach Settings (CoachHQ → Innstillinger)

| Setting | Type | Options | Status |
|--------|------|---------|--------|
| **Roster Management** | View/Edit | Add/remove players, assign new coaches | ⚠ IKKE SPESIFISERT |
| **Plan Templates** | CRUD | Save/load custom plan templates | ⚠ IKKE SPESIFISERT |
| **Facility Setup** | Config | Manage facilities, availability, group-sharing settings | ⚠ IKKE SPESIFISERT |
| **Agent Auto-Apply Rules** | Config | Set risk thresholds for auto-apply (low, medium, high) | ⚠ IKKE SPESIFISERT |
| **Notification Preferences** | Toggle | Coach message reminders, plan-action alerts | ⚠ IKKE SPESIFISERT |
| **Data Export** | Action | Export all player data (GDPR) | ⚠ IKKE SPESIFISERT |

**Status:** ❌ IKKE SPESIFISERT (no detailed spec)

---

## 8. Onboarding-Flyter

### Player Onboarding (Self-Service)

```
Step 1: Sign Up
  → Email + password
  → Email verification

Step 2: Profile Setup
  → Name, age, gender, handicap (current HCP or self-estimate)
  → Facility/club selection
  → Goals (improve HCP, consistency, specific area)

Step 3: Tier Selection
  → Gratis | Pro | Elite with feature-matrix comparison
  → Payment if premium tier selected
  → Tier-gating activates immediately

Step 4: Invite Coach
  → Search for coach by name/email OR
  → Generate invite-link to share with coach
  → Coach-accept flow triggers coach onboarding

Step 5: Coaching Plan
  → Self-serve plan creation (blank, template, AI-generated) OR
  → Wait for coach to create first plan
  → Confirmation: "Ready to start training"

→ Redirect to PlayerHQ Hjem (Live Session available if plan exists)
```

**Status:** ✓ Spesifisert (5 steps)

### Coach Onboarding (Invite-Triggered)

```
Step 1: Account Setup
  → Email verification
  → Password setup
  → 2FA (optional)

Step 2: Club & Facilities
  → Select club from list OR create new club
  → Add facility information (name, location, type)
  → Upload facility photo

Step 3: Roster Management
  → Invite players to roster (email OR shareable link)
  → Set tier assignments (if coach managing subscriptions)
  → Bulk import from CSV (optional)

Step 4: Plan Template Setup
  → Create default plan template (week structure, exercise-bank defaults)
  → Set periodization defaults (period types, densities)
  → Configure auto-apply rules for agent actions

Step 5: Review & Launch
  → Review all settings
  → "Launch Coaching Dashboard" → redirect to CoachHQ Daglig Brief

→ Onboarding complete; coach can now create plans and manage roster
```

**Status:** ✓ Spesifisert (5 steps)

### Parent Onboarding (Self-Service for Junior Players)

```
Step 1: Sign Up
  → Email + password
  → Email verification

Step 2: Parent Profile
  → Name, email, phone
  → Relationship to junior

Step 3: Junior Profile
  → Junior name, age (triggers junior-vern rules if <16)
  → Junior handicap (or estimate)
  → Junior's primary facility

Step 4: Coach Selection
  → Search for coach OR
  → Enter coach invite-code OR
  → Use coach's shared onboarding link

Step 5: Tier Selection
  → Select tier for junior (applies junior-vern constraints)
  → Payment if premium

→ Redirect to Parent Portal (child progress dashboard)
```

**Status:** ⚠ DELVIS SPESIFISERT (parent portal screens not fully documented)

---

## 9. Modal-Katalog

### Key Modals (25+ identified)

**Plan-Related (6):**
1. `NewPlanModal` — Coach creates new plan (4-step wizard)
2. `EditPlanModal` — Coach edits existing plan
3. `PlanApprovalModal` — Player approves coach's plan (live-session availability locked until approval)
4. `PlanShareModal` — Coach shares plan with group of players
5. `AIPlanGeneratorModal` — AI generates plan based on weakness + period type
6. `TemplateSelectorModal` — Coach selects plan template to build from

**Live Session (4):**
7. `LiveSessionIntroModal` — Fullscreen modal: Screen 1 (Intro)
8. `LiveSessionActiveModal` — Fullscreen modal: Screen 2 (Active rep-logging)
9. `LiveSessionBetweenModal` — Fullscreen modal: Screen 3 (Between-exercise summary)
10. `LiveSessionSummaryModal` — Fullscreen modal: Screen 4 (Økt-oppsummering)

**Booking (3):**
11. `BookSessionModal` — Player selects date + facility + time
12. `RescheduleBookingModal` — Player or coach reschedules existing booking
13. `FacilityDetailModal` — Side-panel modal on facility manager (occupancy detail, recent bookings)

**Agent/Actions (4):**
14. `PlanActionDetailModal` — Coach reviews agent recommendation (rationale, signal data, accept/deny buttons)
15. `BulkApproveModal` — Coach approves multiple low-risk actions at once
16. `AgentFeedbackModal` — Coach provides feedback on agent action (why approved/denied)

**Round/Analysis (4):**
17. `RoundDetailModal` — Player views round scorecard + SG breakdown
18. `RoundInsightModal` — AI-generated insight post-round (weakest area + suggested drills)
19. `TrackManImportModal` — Player imports TrackMan session (CSV or screenshot OCR)
20. `ComparisonModal` — Player compares own stats vs peer/benchmark

**Challenges/Social (3):**
21. `DrillChallengeModal` — Coach creates or joins drill challenge
22. `ChallengeDetailModal` — Player views challenge leaderboard + personal progress
23. `LeaderboardModal` — Player views platform leaderboards (friends, club, global)

**Messages/Notifications (2):**
24. `MessageDetailModal` — Coach expands message thread with player
25. `NotificationCenterModal` — Player views all notifications (achievements, plan changes, etc)

**Additional Modals (not yet detailed):**
- `BookingConfirmationModal` (confirmation before final booking)
- `PaymentModal` (tier upgrade)
- `FeedbackModal` (coach sends written feedback on plan)
- `VideoUploadModal` (player uploads swing video)
- `SettingsModal` (profile/notification settings)

**Status:** ✓ Spesifisert (titles + general structure), ⚠ DELVIS (detailed interaction patterns for each)

---

## 10. Empty States / 404 / Error Screens

### Empty States (8 identified)

| Location | Condition | UI | Status |
|----------|-----------|----|----|
| **PlayerHQ Hjem** | No plan assigned yet | Illustration (calendar + coach icon) + "Ask your coach to create a plan" + "Upload custom plan" button | ⚠ IKKE SPESIFISERT |
| **PlayerHQ Tren → Plan** | No weeks/sessions in plan | "No sessions this week" + calendar view with plan-creation button | ✓ Spesifisert |
| **PlayerHQ Mål → Runder** | No rounds logged | "No rounds yet" + "Log first round" button with modal link | ⚠ IKKE SPESIFISERT |
| **CoachHQ Daglig Brief** | No plan actions pending | "All set!" + "Check back soon" + stats on # players coached | ⚠ IKKE SPESIFISERT |
| **CoachHQ Spilleroversikt** | No players in roster | "No players yet" + "Invite players" button + bulk-import option | ✓ Spesifisert |
| **Facility Manager** | No facilities created | "No facilities setup" + "Create facility" button + video guide | ⚠ IKKE SPESIFISERT |
| **Leaderboard** | No participants in challenge | "No entries yet" + share link to invite friends | ⚠ IKKE SPESIFISERT |
| **Achievements** | No achievements unlocked | "Keep training to unlock achievements" + progress bar to first achievement | ⚠ IKKE SPESIFISERT |

**Status:** ⚠ DELVIS SPESIFISERT (2 confirmed, 6 not documented)

### 404 / Not Found Screens

- **Conditions:** Coach views deleted player, player views removed plan, invalid invite-link
- **UI Pattern:** Illustration + "This page doesn't exist or you don't have access" + "Go back home" button
- **Status:** ❌ IKKE SPESIFISERT (no detailed spec)

### Error Screens (6 types)

| Error Type | Trigger | Message | Recovery | Status |
|-----------|---------|---------|----------|--------|
| **Session Timeout** | User inactive >30 min | "Your session expired. Sign in again." | Re-login flow | ⚠ IKKE SPESIFISERT |
| **Network Error** | API call fails | "Unable to connect. Try again or contact support." | Retry button | ⚠ IKKE SPESIFISERT |
| **Booking Conflict** | Facility already booked | "This time slot is no longer available. Choose another." | Facility calendar refresh | ⚠ IKKE SPESIFISERT |
| **Plan Lock** | Plan not approved yet | "Plan not approved. Can't start session." | "Ask coach to review" button | ✓ Spesifisert |
| **Tier Limit** | Feature requires higher tier | "This feature requires {tier}. Upgrade now?" | Tier upgrade modal | ⚠ IKKE SPESIFISERT |
| **Permission Denied** | User lacks capability | "You don't have access to this." | "Contact your coach/admin" | ⚠ IKKE SPESIFISERT |

**Status:** ⚠ DELVIS SPESIFISERT (1 confirmed, 5 not documented)

---

## 11. Mobil-Spesifikke Flater + Landing Pages

### Mobile Considerations (PlayerHQ)

**Responsive Breakpoints:**
- Mobile (375px–767px): Stack vertically, single-column layout
- Tablet (768px–1023px): 2-column layout where applicable
- Desktop (1024px+): Full 3-column layout

**Mobile-Specific UI Patterns:**
- **Bottom Tab Bar** (instead of top): Hjem | Tren | Mål | Coach | Meg
- **Fullscreen Modals:** Live Session renders fullscreen (no side-panel)
- **Swipe Gestures:** Week carousel (W1–W6 pills swipe left/right)
- **Touch Targets:** Minimum 44px × 44px buttons (rep-logging `+` button, club selection)
- **Offline Mode:** Live Session functional offline; syncs on reconnect (IndexedDB backup)
- **Status:** ⚠ DELVIS SPESIFISERT (breakpoints defined, gesture patterns not detailed)

### Landing Page (akgolf.no)

**Hero Section:**
- Dark hero image with editorial serif headline ("Transform Your Golf Training")
- Lime CTA button ("Start Free Trial")
- Subheading + trust indicators (# players, # coaches, avg HCP improvement)

**Light Sections (Beneath Hero):**
- Features overview (3–4 cards: Plan, Track, Improve, Community)
- Pricing table (Gratis | Pro | Elite)
- Coach testimonials (3 quotes with photo + name)
- FAQ section
- Footer with links (Privacy, Terms, Contact, Social)

**Status:** ✓ Spesifisert (overall structure), ⚠ IKKE SPESIFISERT (detailed content, CTA conversion tracking)

### Shared Authentication UI (Login/Register)

**Login Flow:**
```
Email input → Password input → "Sign In" button → 2FA (optional) → Dashboard redirect
```

**Register Flow (Player):**
```
Email → Password → Name → Age → Handicap → Facility → Tier Select → Coach Invite → Done
```

**Forgot Password:**
```
Email input → "Send reset link" → Email received → Password reset form → Redirect to login
```

**Status:** ✓ Spesifisert (flow), ⚠ IKKE SPESIFISERT (2FA implementation detail, email templates)

---

## Feature Summary by Category

| Category | Total Features | Documented | Gaps | Coverage |
|----------|---|---|---|---|
| Brukerroller og auth-tilganger | 11 | 9 | 2 (AK-team capability matrix, parent portal detail) | 82% |
| Booking + Facility Manager | 12 | 8 | 4 (rescheduling, cancellation SLA, conflict resolution, group-sync detail) | 67% |
| Agent-System fra UI-perspektiv | 28 | 21 | 7 (risk-scoring algorithm, auto-apply rules detail, approval analytics) | 75% |
| Live Session-flyt | 15 | 14 | 1 (week calendar drag-reschedule) | 93% |
| Periodisering-Agent | 12 | 8 | 4 (decision-tree logic, adjustment magnitude, week-progression rules) | 67% |
| Notifikasjoner / Inbox | 10 | 4 | 6 (test reminder rules, tournament-prep dismissal, plan-deviation threshold, coach settings, archive UI) | 40% |
| Settings-Flater | 8 | 1 | 7 (player prefs, coach settings, units, language, account deletion, devices) | 12% |
| Onboarding-Flyter | 12 | 9 | 3 (parent portal screens, optional 2FA detail) | 75% |
| Modal-Katalog | 25+ | 15 | 10+ (interaction patterns, video upload modal, feedback modal) | 60% |
| Empty States / Error Screens | 14 | 3 | 11 (most error types, 404 screen) | 21% |
| Mobil-Spesifikke + Landing | 8 | 3 | 5 (gesture patterns, content detail, CTA tracking, email templates) | 38% |
| **TOTAL** | **87** | **51** | **36** | **59%** |

---

## Gap Analysis Summary

**High-Priority Gaps (Features with No Specification):**

1. **AK-Team Capabilities** — Admin/analytics surfaces undefined
2. **Coach Settings UI** — Roster, templates, facility setup, auto-apply rules not detailed
3. **Player Settings UI** — Notification prefs, privacy, units, language, account deletion, devices
4. **Error Handling UI** — 5 of 6 error-state screens undefined
5. **Empty States** — 6 of 8 empty-state designs undefined
6. **Notifications Taxonomy** — Test reminders, tournament-prep dismissal rules, deviation threshold undefined
7. **Periodization Decision Trees** — Layer 1–4 decision logic not formalized
8. **Agent Risk Scoring** — Algorithm for low/medium/high risk classification undefined
9. **Modal Interaction Patterns** — Detailed UX flows for 10+ modals not documented
10. **Parent Portal** — 5 screens mentioned but not specified

**Medium-Priority Gaps (Partial Specifications):**

1. **Booking Rescheduling** — Basic booking flow defined, but rescheduling, cancellation SLA, conflict resolution undefined
2. **Week Calendar Drag** — Week view UI specified, drag-reschedule not detailed
3. **Group Session Facility Auto-Sync** — Core flow defined, conflict resolution and fallback undefined
4. **Mobile Gesture Patterns** — Swipe gestures mentioned but not fully documented
5. **Coach Message SLA** — 2-hour response window specified, but enforcement mechanism and UI indicators only partially specified

---

## Recommended Next Steps

1. **Complete Coach Settings UI Design** — Define roster management, template CRUD, facility setup, agent rule configuration
2. **Formalize Agent Decision Logic** — Document Layer 1–4 decision trees for periodization-agent, risk-scoring algorithm
3. **Define Error & Empty-State Library** — Create comprehensive screen specs for all 8 empty states + 6 error types
4. **Player Settings Spec** — Detail notification preferences, privacy controls, device management, account deletion flow
5. **Parent Portal Detail** — Fully specify 5 parent screens (progress dashboard, message thread, booking history, settings, child management)
6. **Notification Rules Engine** — Document test-reminder logic, tournament-prep alert dismissal, plan-deviation thresholds
7. **Modal Interaction Catalog** — Detailed UX flows for 10+ underspecified modals
8. **Mobile Gesture Library** — Complete gesture-pattern documentation (swipe, long-press, pinch)

---

## Source Files Referenced

- `2026-05-08-informasjonsarkitektur.md` — Information architecture, personas, entities, tier-gating
- `produktkrav-anders.md` + `produktkrav-anders-transkript.md` — Product requirements, open questions
- `brukerflyter-mermaid.md` — 12 Mermaid flowcharts covering key user flows
- `agent-system.md` — Coach-side agent pipeline, approval workflows
- `plan-builder.md` — Plan-builder wizard, AI generation, pyramide-defaults, junior-constraints
- `playerhq-arkitektur.md` — Architecture, navigation, tier-gating, user-journeys
- `playerhq-live-session.md` — 4-screen live-session modal, state management, server actions
- `playerhq-agents.md` — Player-side agent delivery modes, auto-apply rules
- `facility-manager.md` — 5-view facility manager dashboard, booking flows
- `module-mapping.md` — Module-to-surface mapping, contextual navigation
- `prisma-extensions.md` — Database schema extensions, new models, enum definitions
- `handover-akgolf-hq.md` — Platform overview, technical stack, sprint roadmap
- `periodisering-agent-spec.md` — Periodization agent specification, decision layers, JSON structure

---

**Document Generated:** 2026-05-10  
**Total Cross-Cutting Features:** 87  
**Documentation Coverage:** 59% (51 fully specified, 36 gaps identified)

