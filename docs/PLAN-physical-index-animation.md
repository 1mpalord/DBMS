# PLAN: Fix & Enhance Physical Index Animation

## Context
User reported broken animations for "Sparse" and "Dense" visualizations in Tab 3 (Physical Index).
**Diagnosis**: The current implementation generates random positions (`Math.random()`) directly in the render body. This causes **React Hydration Mismatch** errors because the server-rendered HTML (random A) differs from the client's first render (random B).

## Goal
Fix the hydration issue and enhance the "Dense" vs "Sparse" visual storytelling.

## Proposed Changes

### 1. Component: `ParticleVisual` in `MultitenancyInfo.tsx`
- **Fix**: Move particle generation into `useEffect` to ensure it only runs on the client.
- **Enhancement**:
    - **Dense**: Show a "cloud" of many small points moving slightly (Brownian motion), representing a dense embedding vector space.
    - **Sparse**: Show a grid or fixed field where only specific points "light up" (pulse) periodically, representing sparse keyword activations.

### 2. Animation Logic
`framer-motion` will be used for smooth transitions.

**Dense (Concept: Continuously Active):**
- Count: ~50 particles
- Motion: Slow drift
- Color: Green (`#bef264`)

**Sparse (Concept: Rare Activation):**
- Count: ~15 fixed positions (grid-like or scattered)
- Motion: Static position, but `opacity` and `scale` spike randomly.
- Color: Blue (`blue-400`)

## Task Breakdown
- [ ] Refactor `ParticleVisual` to use `useState` for particles.
- [ ] Implement `useEffect` to generate seed/positions on mount.
- [ ] Update `motion.div` variants for distinct Dense vs Sparse behaviors.

## Verification
- [ ] Verify no console errors (Hydration mismatch).
- [ ] Visually confirm "Dense" looks like a swarm.
- [ ] Visually confirm "Sparse" looks like sporadic blinking lights.
