'use client';

import React from 'react';
import { VectorCanvas } from '@/components/VectorCanvas';
import { VisualNode } from '@/types';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchPanel } from '@/components/SearchPanel';

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
    onNamespaceChange
}: ResultsCanvasProps) {
    if (!active) return null;

    return (
        <div className="w-full h-full relative flex flex-col min-h-[500px] lg:min-h-[750px] overflow-hidden rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm shadow-2xl">
            {/* HUD Overlays (Top Bar, Bottom Dock) */}
            <SearchPanel
                onSearch={onSearch}
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
                    <VectorCanvas nodes={nodes} />
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
