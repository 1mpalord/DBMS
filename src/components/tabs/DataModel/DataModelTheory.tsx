'use client';

import React from 'react';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { TheoryVisualization } from './TheoryVisualization';
import { Info, HelpCircle, Layers } from 'lucide-react';

export function DataModelTheory() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Header Section */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-2xl font-light text-white tracking-tight flex items-center gap-3">
                        <Layers className="w-5 h-5 text-[#bef264]" />
                        Conceptual Architecture
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                        A <span className="text-white font-medium">Record</span> is the fundamental unit of storage in a vector database.
                        It contains an embedding, a unique ID, and optional metadata for search-time filtering.
                    </p>
                </div>
            </div>

            {/* Main Visualization */}
            <TheoryVisualization />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                {/* Record Structure */}
                <GlassPanel className="p-6 space-y-4">
                    <h4 className="text-xs font-bold text-[#bef264] uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Record Anatomy
                    </h4>
                    <ul className="space-y-3 text-sm">
                        <li className="flex gap-3">
                            <span className="text-slate-500 font-mono">01.</span>
                            <div>
                                <span className="text-white font-medium">Unique ID</span>
                                <p className="text-[11px] text-slate-500 mt-0.5">A string identifier used for lookup and deletion operations.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-slate-500 font-mono">02.</span>
                            <div>
                                <span className="text-white font-medium">Values (Vector)</span>
                                <p className="text-[11px] text-slate-500 mt-0.5">The high-dimensional numerical array representing the data's meaning.</p>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-slate-500 font-mono">03.</span>
                            <div>
                                <span className="text-white font-medium">Metadata (Optional)</span>
                                <p className="text-[11px] text-slate-500 mt-0.5">A flat JSON object for key-value pairs used in advanced filtering.</p>
                            </div>
                        </li>
                    </ul>
                </GlassPanel>

                {/* Metadata Philosophy */}
                <GlassPanel className="p-6 space-y-4 border-l-2 border-l-blue-500/30">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Metadata Implementation
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Why need Metadata?</span>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                Crucial for <span className="text-blue-400">Advanced Filtering</span>, <span className="text-blue-400">Multi-Tenancy</span>, and data isolation within a single index.
                            </p>
                        </div>
                        <div className="pt-2 border-t border-slate-800">
                            <span className="text-[11px] text-slate-500 uppercase tracking-wider block mb-1">Why Flat JSON?</span>
                            <p className="text-xs text-slate-300 leading-relaxed italic">
                                "A deliberate trade-off between query performance and architectural simplicity."
                            </p>
                        </div>
                    </div>
                </GlassPanel>
            </div>
        </div>
    );
}
