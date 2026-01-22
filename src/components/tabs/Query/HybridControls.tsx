'use client';

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface HybridControlsProps {
    onSearch: (query: string, type: 'semantic' | 'lexical' | 'hybrid', alpha?: number) => void;
    isLoading: boolean;
    performance?: { timeMs: number };
}

export function HybridControls({ onSearch, isLoading, performance }: HybridControlsProps) {
    const [query, setQuery] = useState('');
    const [alpha, setAlpha] = useState(0.5);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query, 'hybrid', alpha);
    };

    return (
        <GlassPanel className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="flex gap-4">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#bef264] transition-colors" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search corpus..."
                        className="w-full bg-black border border-slate-800 py-3 pl-12 pr-4 text-sm text-white focus:border-[#bef264] outline-none transition-colors font-mono"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="px-8 bg-[#bef264] text-black font-black uppercase tracking-widest text-xs hover:bg-[#bef264]/90 disabled:opacity-50 transition-colors"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'EXECUTE'}
                </button>
            </form>

            {/* Alpha Slider */}
            <div className="space-y-4 pt-4 border-t border-slate-900">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest">
                    <span className={cn(alpha < 0.5 ? "text-[#bef264]" : "text-slate-500")}>Dense (Semantic)</span>
                    <span className="text-white">Alpha: {alpha.toFixed(1)}</span>
                    <span className={cn(alpha > 0.5 ? "text-[#bef264]" : "text-slate-500")}>Sparse (Lexical)</span>
                </div>

                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={alpha}
                    onChange={(e) => setAlpha(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#bef264]"
                />
            </div>

            {performance && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-[10px] font-mono text-[#bef264]"
                >
                    <div className="w-2 h-2 bg-[#bef264] rounded-full animate-pulse" />
                    Query completed in {performance.timeMs}ms
                </motion.div>
            )}
        </GlassPanel>
    );
}
