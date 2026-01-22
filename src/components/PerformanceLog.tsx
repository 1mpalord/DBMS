'use client';

import React from 'react';
import { BarChart3, Clock, Zap, TrendingUp } from 'lucide-react';

interface PerformanceLogProps {
    semanticTime?: number;
    lexicalTime?: number;
    hybridTime?: number;
    className?: string;
}

export const PerformanceLog: React.FC<PerformanceLogProps> = ({
    semanticTime = 0,
    lexicalTime = 0,
    hybridTime = 0,
    className = ""
}) => {
    const maxTime = Math.max(semanticTime, lexicalTime, hybridTime, 1);

    const getWidth = (time: number) => `${Math.max(5, (time / maxTime) * 100)}%`;

    return (
        <div className={`bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-6 ${className}`}>
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                    Latency Analysis
                </h2>
                <TrendingUp className="w-4 h-4 text-slate-500" />
            </div>

            <div className="space-y-4">
                {/* Semantic */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                        <span>Semantic Search</span>
                        <span className="text-blue-400 font-mono">{(semanticTime || 0).toFixed(1)}ms</span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                            className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-1000 ease-out"
                            style={{ width: getWidth(semanticTime || 0) }}
                        />
                    </div>
                </div>

                {/* Lexical */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                        <span>Lexical Search</span>
                        <span className="text-emerald-400 font-mono">{(lexicalTime || 0).toFixed(1)}ms</span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                            className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out"
                            style={{ width: getWidth(lexicalTime || 0) }}
                        />
                    </div>
                </div>

                {/* Hybrid */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-1.5">
                            Hybrid Search
                            <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        </span>
                        <span className="text-purple-400 font-mono">{(hybridTime || 0).toFixed(1)}ms</span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                            className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000 ease-out"
                            style={{ width: getWidth(hybridTime || 0) }}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-800 bg-slate-950/30 -mx-6 -mb-6 p-4 rounded-b-2xl">
                <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed text-slate-500 uppercase font-bold tracking-tight">
                        Hybrid search incurs overhead by running two visual pipelines and re-ranking,
                        but often yields higher precision than either technique alone.
                    </p>
                </div>
            </div>
        </div>
    );
};
