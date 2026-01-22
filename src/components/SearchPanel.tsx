'use client';

import React, { useState } from 'react';
import { Search, Globe, Filter, Timer, Loader2 } from 'lucide-react';

interface SearchPanelProps {
    onSearch: (query: string, type: 'semantic' | 'lexical' | 'hybrid', alpha?: number) => void;
    isLoading: boolean;
    performance?: { timeMs: number };
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch, isLoading, performance }) => {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState<'semantic' | 'lexical' | 'hybrid'>('semantic');
    const [alpha, setAlpha] = useState(0.7);

    const handleSearch = () => {
        if (!query) return;
        onSearch(query, searchType, searchType === 'hybrid' ? alpha : undefined);
    };

    return (
        <div className="atomic-card p-8 space-y-8 relative overflow-hidden group">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        <Search className="w-5 h-5 text-[#bef264]" />
                        Neural Retrieval
                    </h2>
                    <div className="h-0.5 w-8 bg-[#bef264] opacity-50" />
                </div>
                {performance && typeof performance.timeMs === 'number' && (
                    <div className="font-mono text-[10px] text-[#bef264] bg-[#bef264]/5 px-3 py-1 border border-[#bef264]/20 tabular-nums">
                        LATENCY: {performance.timeMs.toFixed(1)}MS
                    </div>
                )}
            </div>

            <div className="space-y-6">
                <div className="flex gap-0">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="SCAN LATENT SPACE..."
                        className="tech-input flex-1 uppercase font-mono text-sm tracking-widest placeholder:opacity-30"
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isLoading || !query}
                        className="tech-button border-l-0 bg-[#bef264] !text-black font-black"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'EXEC_SEARCH'}
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-0 border border-slate-800">
                    {(['semantic', 'lexical', 'hybrid'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setSearchType(type)}
                            className={`py-3 px-3 text-[10px] font-black uppercase tracking-widest transition-all border-r last:border-r-0 border-slate-800 ${searchType === type
                                ? 'bg-[#bef264] text-black'
                                : 'bg-transparent text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {searchType === 'hybrid' && (
                    <div className="space-y-4 pt-2 border-t border-slate-800 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                            <span className="text-slate-500">Lexical_Bias</span>
                            <span className="text-[#bef264]">Alpha: {alpha.toFixed(2)}</span>
                            <span className="text-slate-500">Semantic_Bias</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={alpha}
                            onChange={(e) => setAlpha(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-800 appearance-none cursor-crosshair accent-[#bef264]"
                        />
                    </div>
                )}
            </div>

            <div className="pt-6 flex items-center justify-between text-[9px] text-slate-600 uppercase tracking-[0.2em] font-black border-t border-slate-800/50">
                <div className="flex items-center gap-2">
                    <Globe className="w-3 h-3" />
                    Global_Corpus
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-3 h-3" />
                    Top_100_Rank
                </div>
            </div>
        </div>
    );
};

