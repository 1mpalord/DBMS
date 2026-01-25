# PLAN: Tab Zero Implementation

## Overview
Implement a new "introduction" tab (Tab 0) featuring a cinematic team presentation and a global timer that persists across the application. This plan follows the "Cinematic Flow" approach (Option A).

## Project Type
**WEB** (Next.js/React)

## Success Criteria
- [ ] Tab 0 acts as the default landing tab.
- [ ] Tab 0 has two states: "Pre Intro" (Cover) and "Team Members".
- [ ] "Start Presentation" transition has a 0.5-1s delay and animation.
- [ ] Team members have hover effects.
- [ ] **Global Timer** persists across all navigation without resetting.
- [ ] **Failsafe**: Timer logic does not break other pages; defaults gracefully if context is missing.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **State**: React Context (for global timer)

## File Structure
```
src/
├── context/
│   └── TimerContext.tsx       # [NEW] Global timer provider
├── components/
│   ├── tabs/
│   │   └── Introduction/      # [NEW] Tab 0 Container
│   │       ├── IntroContainer.tsx
│   │       ├── CoverView.tsx
│   │       └── TeamView.tsx
│   └── shared/
│       └── TimerDisplay.tsx   # [NEW] Small timer UI
└── app/
    ├── layout.tsx             # [MODIFY] Wrap with TimerProvider
    └── page.tsx               # [MODIFY] Add Tab 0 to configuration
```

## Task Breakdown

### Phase 1: Foundation (Global Timer)
**Agent**: `frontend-specialist`

- [ ] **Task 1: Create Timer Context**
    - **Input**: `src/context/TimerContext.tsx`
    - **Logic**: Provider with `time` (ms) and `isRunning` state. functions: `start()`, `pause()`, `reset()`.
    - **Failsafe**: Export a custom hook `useGlobalTimer()` that throws a helpful warning (or returns dummy data) if used outside provider.
    - **Verify**: Component using the hook receives updates.

- [ ] **Task 2: Global Integration**
    - **Input**: `src/app/layout.tsx` (or `page.tsx` if strictly single-page app structure)
    - **Logic**: Wrap existing content with `<TimerProvider>`.
    - **Verify**: No visual regression, app loads without errors.

- [ ] **Task 3: Timer Display Component**
    - **Input**: `src/components/shared/TimerDisplay.tsx`
    - **Design**: Small, top-middle placement.
    - **Verify**: Shows time incrementing when active.

### Phase 2: Tab 0 Components
**Agent**: `frontend-specialist`

- [ ] **Task 4: Create Cover View**
    - **Input**: `src/components/tabs/Introduction/CoverView.tsx`
    - **Design**: Matches "Pre Intro" vector DB style (dark mode, green accents).
    - **Interaction**: "Table One" click triggers `onStart` prop.
    - **Verify**: Renders static cover.

- [ ] **Task 5: Create Team View**
    - **Input**: `src/components/tabs/Introduction/TeamView.tsx`
    - **Design**: Grid of member cards (Name, Role, Task).
    - **Animation**: Hover effects (glow/scale).
    - **Verify**: Hover states work smoothly.

- [ ] **Task 6: Create Intro Container**
    - **Input**: `src/components/tabs/Introduction/IntroContainer.tsx`
    - **Logic**: Manages local state `viewState` ('cover' | 'team'). Handle transition delay (0.5-1s) using `setTimeout` on start.
    - **Verify**: Click triggers delay -> transitions to Team View.

### Phase 3: Integration
**Agent**: `frontend-specialist`

- [ ] **Task 7: Register Tab 0**
    - **Input**: `src/app/page.tsx`
    - **Logic**: Add "Introduction" to `TABS` array at index 0. Map id to `IntroContainer`.
    - **Verify**: "Introduction" appears first in TabNav.

## Phase X: Verification Checklist
- [ ] **Manual**: Global timer continues running while switching between Tab 0 and other tabs.
- [ ] **Manual**: "Start Presentation" delay feels correct (approx 0.5-1s).
- [ ] **Manual**: Hover effects on team members are responsive.
- [ ] **Code**: `TimerContext` is isolated and does not cause re-renders in unrelated components (optimize with `useMemo` if needed).
- [ ] **Lint**: `npm run lint` passes.
