# PLAN: Refine Physical Index Visuals (Matrix Grid)

## Context
User feedback: "Dense: Used for deep semantic understanding where most dimensions carry value. Sparse: Highly specific keyword retrieval where only a few features are active."
Current abstract particle cloud does not convey "dimensions" clearly.

## Solution
Replace `ParticleVisual` with `DimensionalGrid`.
Visualize the vectors as a **10x10 Matrix (100 dimensions)**.

### Visual Theory
1. **Dense Vector**:
    - **Visual**: A grid where **~90% of cells** are lit up.
    - **Animation**: Cells gently pulse in opacity (representing floating point values).
    - **Meaning**: "Most dimensions carry value."

2. **Sparse Vector**:
    - **Visual**: A grid where **~5% of cells** (5 out of 100) are lit up. The rest are dark/empty.
    - **Animation**: The few active cells pulse brightly. The dark cells remain 0.
    - **Meaning**: "Only a few features are active."

## Implementation
- **File**: `src/components/tabs/Organization/MultitenancyInfo.tsx`
- **Component**: Rewrite `ParticleVisual` (or rename to `VectorMatrix`).
- **Logic**:
    - Generate an array of 100 items.
    - **Dense**: Random opacity `0.2` to `1.0` for all cells.
    - **Sparse**: Initialize all to `0`. Pick 5 random indices to have opacity `1.0`.

## Verification
- Visually confirm the grid structure.
- Verify the "Full vs Empty" contrast matches the definitions.
