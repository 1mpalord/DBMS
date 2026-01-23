'use client';

import React from 'react';
import { VectorCanvas } from '@/components/VectorCanvas';
import { VisualNode } from '@/types';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchPanel } from '@/components/SearchPanel';
import { FormulaOverlay } from './FormulaOverlay';
import { useState, useRef } from 'react';

interface ResultsCanvasProps {
    nodes: VisualNode[];
    active: boolean;
    onSearch: (query: string, type: 'semantic' | 'lexical' | 'hybrid', indexName: string, alpha?: number, ns?: string) => void;
    isLoading: boolean;
    performance?: { timeMs: number };
    selectedIndex: string;
    availableIndexes: string[];
    onIndexChange: (index: string) => void;
    selectedNamespace: string;
    onNamespaceChange: (ns: string) => void;
    queryVector?: number[] | null;
    indexDimensions?: number;
    showLogic: boolean;
    setShowLogic: (show: boolean) => void;
    showPerformance: boolean;
}

export function ResultsCanvas({
    nodes,
    active,
    onSearch,
    isLoading,
    performance,
    selectedIndex,
    availableIndexes,
    onIndexChange,
    selectedNamespace,
    onNamespaceChange,
    queryVector,
    indexDimensions,
    showLogic,
    setShowLogic,
    showPerformance
}: ResultsCanvasProps) {
    // Internal Animation State Only
    const [searchId, setSearchId] = useState(0);
    const [pendingSearch, setPendingSearch] = useState<{
        query: string;
        type: 'semantic' | 'lexical' | 'hybrid';
        indexName: string;
        alpha?: number;
        ns?: string;
    } | null>(null);
    const lastSearchRef = useRef<{ query: string; type: string; alpha?: number } | null>(null);
    const waitingSearchRef = useRef<{ query: string; type: 'semantic' | 'lexical' | 'hybrid'; indexName: string; alpha?: number; ns?: string } | null>(null);
    const triggerSyncRef = useRef<'IDLE' | 'PENDING' | 'LOADING'>('IDLE');

    // Strict Protocol: Only trigger animation AFTER query results arrive
    React.useEffect(() => {
        // 1. Capture transition to LOADING from parent state
        if (isLoading && triggerSyncRef.current === 'PENDING') {
            triggerSyncRef.current = 'LOADING';
        }

        // 2. Resolve visualization only when Loading finishes AND we were in the middle of a handshake
        if (!isLoading && triggerSyncRef.current === 'LOADING' && waitingSearchRef.current) {
            const { query, type, indexName, alpha, ns } = waitingSearchRef.current;

            // Now that data is here, trigger the systematic visual reset (HUD + Canvas)
            setSearchId(Date.now());

            if (showLogic) {
                setPendingSearch({ query, type, indexName, alpha, ns });
            }

            // Cleanup: Return to idle
            triggerSyncRef.current = 'IDLE';
            waitingSearchRef.current = null;
        }
    }, [isLoading, nodes, showLogic]);

    if (!active) return null;

    const handleSearchInterceptor = (query: string, type: 'semantic' | 'lexical' | 'hybrid', indexName: string, alpha?: number, ns?: string) => {
        // 1. Check if configuration is identical to last search (Tab 5 specific)
        const isDuplicate =
            lastSearchRef.current?.query === query &&
            lastSearchRef.current?.type === type &&
            (type !== 'hybrid' || lastSearchRef.current?.alpha === alpha);

        if (isDuplicate) return; // Protocol: Ignore redundant clicks

        // 2. Prepare handshake (HOLD visual reset until results arrive)
        setPendingSearch(null); // Clear old logic overlay
        triggerSyncRef.current = 'PENDING';
        waitingSearchRef.current = { query, type, indexName, alpha, ns };
        lastSearchRef.current = { query, type, alpha };

        // 3. Initiate network request
        onSearch(query, type, indexName, alpha, ns);
    };

    const handleLogicComplete = () => {
        // Just clear the overlay state
        setPendingSearch(null);
    };

    return (
        <div className="w-full h-full relative flex flex-col min-h-[500px] lg:min-h-[750px] overflow-hidden rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm shadow-2xl">
            {/* Semantic Logic Layer */}
            <FormulaOverlay
                key={searchId}
                visible={!!pendingSearch && showLogic}
                mode={pendingSearch?.type || 'semantic'}
                query={pendingSearch?.query || ''}
                alpha={pendingSearch?.alpha}
                onComplete={handleLogicComplete}
                searchResults={nodes}
                queryVector={queryVector}
                indexDimensions={indexDimensions}
            />

            {/* HUD Overlays (Top Bar, Bottom Dock) */}
            <SearchPanel
                onSearch={handleSearchInterceptor}
                isLoading={isLoading}
                performance={performance}
                floating={true}
                selectedIndex={selectedIndex}
                availableIndexes={availableIndexes}
                onIndexChange={onIndexChange}
                selectedNamespace={selectedNamespace}
                onNamespaceChange={onNamespaceChange}
            />

            {/* Bottom HUD: Global Context & Stats */}
            <div className="absolute bottom-6 left-6 z-30 pointer-events-none hidden md:block">
                <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-4 rounded-lg flex items-center gap-6">
                    <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active_Node_Pool</p>
                        <p className="text-sm font-mono text-[#bef264]">{nodes.length} VECTORS</p>
                    </div>
                </div>
            </div>

            {/* Center Background: 3D Visualization */}
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-0"
                >
                    <VectorCanvas nodes={nodes} searchId={searchId} />
                </motion.div>
            </AnimatePresence>

            {/* Empty State Overlay */}
            {nodes.length === 0 && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 flex-col gap-2">
                    <span className="text-[9px] font-mono text-[#bef264]/40 uppercase tracking-[0.6em] font-black">[ READY_FOR_SCAN ]</span>
                    <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">Select target and initiate protocol</span>
                </div>
            )}
        </div>
    );
}
