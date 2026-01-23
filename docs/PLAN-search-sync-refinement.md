# PLAN: Search Sync Refinement

## 🔍 Context & Problem
The system currently has a race condition in the search animation sequence:
1.  Animations occasionally refresh before new query results arrive (showing stale data).
2.  Duplicate searches for identical keywords/settings trigger unnecessary network calls or visual jitter.
3.  The 3D query marker relocation logic is insensitive to small shifts in result centroids (common in Hybrid search).

## 🛠 Proposed Solution
Implement a **Strict Synchronous Handshake** between the Search API and the Visualization Layers.

### Phase 1: Strict Deduplication (ResultsCanvas.tsx)
- Compare current `{ query, type, alpha }` with `lastSearchRef`.
- If identical → **Exit early** (no API call, no visual reset).

### Phase 2: Deferred Visualization Trigger (ResultsCanvas.tsx)
- Initiate `onSearch` but **HOLD** the `searchId` update.
- Wait for the state transition: `isLoading: true` (request started) → `isLoading: false` (results arrived).
- Only then update `searchId`, forcing the HUD and 3D Canvas to reset with guaranteed fresh data.

### Phase 3: Fluid Link Origin Sync (VectorCanvas.tsx)
- Ensure the red query marker **always** lerps from its previous known position to the new `targetCentroid`.
- Make the relocation trigger sensitive to `searchId` changes alone, ignoring result content checks to ensure responsiveness to every unique user action.

## 📋 Task Breakdown
- [ ] **ResultsCanvas.tsx**: Implement `triggerSyncRef` handshake logic.
- [ ] **ResultsCanvas.tsx**: Update `handleSearchInterceptor` to enforce strict deduplication.
- [ ] **VectorCanvas.tsx**: Refine `MagnetLinkVisualization` to always sync on `searchId` update.
- [ ] **VectorCanvas.tsx**: Verify centroid sensitivity for Hybrid alpha shifts.

## ✅ Verification Checklist
- [ ] Search "A" -> Search "B" -> Verify no "ghost" reset before data arrives.
- [ ] Search "A" -> Search "A" -> Verify zero network activity and zero visual jitter.
- [ ] Hybrid Mode: Change Alpha from 0.5 to 0.6 -> Verify query node moves even if Top 5 IDs are same.
