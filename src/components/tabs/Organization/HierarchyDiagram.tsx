'use client';

import React from 'react';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { Database, Folder, FileText } from 'lucide-react';

export function HierarchyDiagram() {
    const [viewLevel, setViewLevel] = React.useState<'ORG' | 'DB' | 'INDEXES' | 'NAMESPACES'>('ORG');
    const [selectedIndex, setSelectedIndex] = React.useState<string | null>(null);
    const [indexes, setIndexes] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);

    // Auto-Refresh Logic
    const fetchIndexes = React.useCallback(() => {
        setIsLoading(true);
        fetch('/api/pinecone/list-indexes')
            .then(res => res.json())
            .then(data => setIndexes(data.indexes || []))
            .catch(e => console.error("Hierarchy fetch error:", e))
            .finally(() => setIsLoading(false));
    }, []);

    React.useEffect(() => {
        fetchIndexes();
        const interval = setInterval(fetchIndexes, 10000); // 10s Poll
        return () => clearInterval(interval);
    }, [fetchIndexes]);

    const handleBack = () => {
        if (viewLevel === 'NAMESPACES') setViewLevel('INDEXES');
        else if (viewLevel === 'INDEXES') setViewLevel('DB');
        else if (viewLevel === 'DB') setViewLevel('ORG');
    };

    const handleDelete = async (e: React.MouseEvent, name: string) => {
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete index '${name}'? This cannot be undone.`)) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/pinecone/delete-index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ indexName: name })
            });
            if (res.ok) {
                alert(`Index '${name}' deleted.`);
                fetchIndexes(); // Immediate refresh
            } else {
                const err = await res.json();
                alert("Delete failed: " + err.error);
            }
        } catch (error) {
            alert("Network Error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-8">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#bef264]" />
                    Hierarchy_Visualizer
                </h3>
                {viewLevel !== 'ORG' && (
                    <button onClick={handleBack} className="text-[10px] text-[#bef264] hover:underline uppercase tracking-widest">
                        [← Return Up]
                    </button>
                )}
            </div>

            <GlassPanel className="p-8 border-[#bef264]/30 min-h-[300px] flex items-center justify-center relative transition-all duration-500">
                {/* Loading Overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50">
                        <div className="w-8 h-8 border-2 border-[#bef264] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
                {/* Level 1: Organization */}
                {viewLevel === 'ORG' && (
                    <div
                        onClick={() => setViewLevel('DB')}
                        className="cursor-pointer group text-center space-y-4 hover:scale-105 transition-transform"
                    >
                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center bg-slate-900 group-hover:border-[#bef264] group-hover:bg-[#bef264]/10 transition-colors">
                            <Folder className="w-10 h-10 text-slate-500 group-hover:text-[#bef264]" />
                        </div>
                        <div>
                            <div className="text-white font-bold uppercase tracking-widest">My_Organization</div>
                            <div className="text-[10px] text-slate-500">1 Database</div>
                        </div>
                    </div>
                )}

                {/* Level 2: Database */}
                {viewLevel === 'DB' && (
                    <div
                        onClick={() => setViewLevel('INDEXES')}
                        className="cursor-pointer group text-center space-y-4 hover:scale-105 transition-transform animate-in fade-in zoom-in-95"
                    >
                        <div className="w-24 h-24 rounded-full border-2 border-slate-700 flex items-center justify-center bg-slate-900 group-hover:border-blue-400 group-hover:bg-blue-400/10 transition-colors">
                            <Database className="w-10 h-10 text-slate-500 group-hover:text-blue-400" />
                        </div>
                        <div>
                            <div className="text-white font-bold uppercase tracking-widest">Default Database</div>
                            <div className="text-[10px] text-slate-500">{indexes.length} Indexes</div>
                        </div>
                    </div>
                )}

                {/* Level 3: Indexes List */}
                {viewLevel === 'INDEXES' && (
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in zoom-in-95">
                        {indexes.map(idx => (
                            <div
                                key={idx.name}
                                onClick={() => { setSelectedIndex(idx.name); setViewLevel('NAMESPACES'); }}
                                className="border border-slate-700 bg-slate-900/50 p-6 cursor-pointer hover:border-[#bef264] hover:bg-slate-800 transition-all group relative"
                            >
                                <button
                                    onClick={(e) => handleDelete(e, idx.name)}
                                    className="absolute top-2 right-2 text-slate-600 hover:text-red-500 p-1"
                                    title="Delete Index"
                                >
                                    ✕
                                </button>
                                <div className="flex justify-between items-start mb-4">
                                    <Database className="w-5 h-5 text-slate-500 group-hover:text-[#bef264]" />
                                    <span className="text-[9px] text-slate-600 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">Ready</span>
                                </div>
                                <div className="text-sm font-bold text-white mb-1">{idx.name}</div>
                                <div className="text-[10px] text-slate-500">{idx.dimension || 384} dims • {idx.metric || 'cosine'}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Level 4: Namespaces (Simulated Detail View) */}
                {viewLevel === 'NAMESPACES' && (
                    <div className="w-full space-y-6 animate-in fade-in zoom-in-95">
                        <div className="text-center mb-4">
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Index Detail:</span>
                            <span className="text-[#bef264] font-bold ml-2">{selectedIndex}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['default'].map((ns, i) => (
                                <div key={ns} className="border border-slate-800 bg-black/40 p-4 hover:border-blue-500/50 transition-colors">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Folder className="w-4 h-4 text-blue-400" />
                                        <span className="text-xs font-mono text-slate-300 uppercase">NS: {ns}</span>
                                    </div>
                                    <div className="space-y-1 pl-6 border-l border-slate-800 ml-2">
                                        <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2">
                                            <FileText className="w-3 h-3 opacity-50" />
                                            <span>vectors...</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </GlassPanel>
        </div>
    );
}
