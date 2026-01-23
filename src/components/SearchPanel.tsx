'use client';

import React, { useState, useEffect } from 'react';
import { Search, Globe, Filter, Loader2, Database } from 'lucide-react';

interface SearchPanelProps {
    onSearch: (query: string, type: 'semantic' | 'lexical' | 'hybrid', indexName: string, alpha?: number, ns?: string) => void;
    isLoading: boolean;
    performance?: { timeMs: number };
    floating?: boolean;
    selectedIndex: string;
    selectedNamespace: string;
    onNamespaceChange: (ns: string) => void;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({
    onSearch,
    isLoading,
    performance,
    floating,
    selectedIndex,
    selectedNamespace,
    onNamespaceChange
}) => {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState<'semantic' | 'lexical' | 'hybrid'>('semantic');
    const [alpha, setAlpha] = useState(0.7);

    // Namespaces
    const [namespaces, setNamespaces] = useState<Record<string, number>>({});

    // Fetch available namespaces for the selected index
    useEffect(() => {
        if (!selectedIndex) return;
        fetch(`/api/pinecone/list-namespaces?indexName=${selectedIndex}`)
            .then(res => res.json())
            .then(data => {
                const stats = data.namespaces || {};
                setNamespaces(stats);
            })
            .catch(err => console.error('Error fetching namespaces:', err));
    }, [selectedIndex]);

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query || !selectedIndex) return;
        onSearch(query, searchType, selectedIndex, searchType === 'hybrid' ? alpha : undefined, selectedNamespace);
    };

    if (!floating) return null;

    return (
        <>
            {/* TOP HUD: Command Bar */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 pointer-events-none">
                <form
                    onSubmit={handleSearch}
                    className="relative bg-black/40 backdrop-blur-2xl border border-white/5 rounded-full px-6 py-2 shadow-2xl flex items-center gap-4 group hover:border-[#bef264]/20 transition-all duration-500 pointer-events-auto"
                >
                    <Search className="w-5 h-5 text-slate-500 group-hover:text-[#bef264] transition-colors" />

                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="SCAN LATENT SPACE..."
                        className="bg-transparent flex-1 outline-none text-sm font-mono text-white tracking-widest uppercase placeholder:text-slate-700 py-2"
                    />

                    <div className="flex items-center gap-2">
                        <Database className="w-3 h-3 text-[#bef264]/40" />
                        <span className="bg-transparent text-[10px] font-mono text-[#bef264] outline-none uppercase tracking-wider max-w-[120px] truncate">
                            {selectedIndex.toUpperCase()}
                        </span>
                    </div>

                    <div className="h-4 w-px bg-white/10" />

                    <div className="flex items-center gap-2 group/ns">
                        <Globe className={`w-3 h-3 transition-colors ${selectedNamespace ? 'text-[#bef264]' : 'text-slate-500'}`} />
                        <select
                            className="bg-transparent text-[10px] font-mono text-white/70 hover:text-white outline-none cursor-pointer uppercase tracking-wider max-w-[100px] truncate"
                            value={selectedNamespace}
                            onChange={(e) => onNamespaceChange(e.target.value)}
                        >
                            <option value="" className="bg-[#0f172a] text-white underline">
                                DEFAULT {namespaces[''] !== undefined ? `(${namespaces['']} records)` : namespaces['default'] !== undefined ? `(${namespaces['default']} records)` : ''}
                            </option>
                            {Object.entries(namespaces)
                                .filter(([ns]) => ns !== '' && ns !== 'default')
                                .map(([ns, count]) => (
                                    <option key={ns} value={ns} className="bg-[#0f172a] text-white underline">
                                        {ns.toUpperCase()} ({count} records)
                                    </option>
                                ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !query || !selectedIndex}
                        className={`p-2 rounded-full transition-all ${isLoading ? 'opacity-50' : 'hover:bg-[#bef264]/10 text-slate-400 hover:text-[#bef264]'
                            }`}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Filter className="w-5 h-5" />}
                    </button>

                    {/* Latency HUD Integrated */}
                    {performance && (
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full ml-4 hidden lg:block">
                            <div className="bg-black/60 backdrop-blur-xl border border-[#bef264]/20 px-3 py-1.5 rounded text-[9px] font-mono text-[#bef264] whitespace-nowrap">
                                PING: {performance.timeMs.toFixed(0)}MS
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* BOTTOM HUD: Mode Dock */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4 pointer-events-none">
                <div className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 shadow-3xl flex flex-col gap-4 pointer-events-auto">
                    <div className="flex gap-2">
                        {(['semantic', 'lexical', 'hybrid'] as const).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setSearchType(type)}
                                className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all ${searchType === type
                                    ? 'bg-[#bef264] text-black shadow-[0_0_15px_rgba(190,242,100,0.3)]'
                                    : 'text-slate-500 hover:bg-white/5'
                                    }`}
                            >
                                {type === 'semantic' ? 'Cosine' : type === 'lexical' ? 'BM25' : 'Hybrid'}
                            </button>
                        ))}
                    </div>

                    {searchType === 'hybrid' && (
                        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex justify-between text-[8px] font-black tracking-[0.2em] text-slate-500 uppercase">
                                <span>Lexical</span>
                                <span className="text-[#bef264]">Alpha: {alpha.toFixed(2)}</span>
                                <span>Semantic</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={alpha}
                                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                                className="w-full h-1 bg-slate-800 appearance-none cursor-pointer accent-[#bef264] rounded-full"
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

