'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Server } from 'lucide-react';
import { GlassPanel } from '@/components/shared/GlassPanel';


interface HealthStats {
    readiness: string;
    totalVectorCount: string;
    indexCount: number;
    metric: string;
}

export function HealthCheck() {
    const [stats, setStats] = useState<HealthStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [indexes, setIndexes] = useState<any[]>([]);

    // Creation State
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        indexName: `new-index-${Date.now().toString().slice(-4)}`,
        dimension: 384,
        metric: 'cosine'
    });
    const [submitting, setSubmitting] = useState(false);

    // Ping State
    const [isPinging, setIsPinging] = useState(false);
    const [selectedPingIndex, setSelectedPingIndex] = useState('');
    const [pingResult, setPingResult] = useState<any>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/pinecone/list-indexes');
            const data = await res.json();
            const idxList = data.indexes || [];

            setIndexes(idxList);
            setStats({
                readiness: 'READY',
                totalVectorCount: 'Dynamic',
                indexCount: idxList.length,
                metric: 'Multi-Modal'
            });
            if (idxList.length > 0) setSelectedPingIndex(idxList[0].name);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/pinecone/create-index', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('API Failed');

            const data = await res.json();
            alert(data.message || 'Index creation initiated!');
            setIsCreating(false);
            // Refresh list after a delay to allow propagation (in real scenario)
            setTimeout(loadData, 2000);
        } catch (error) {
            console.error(error);
            alert("Creation failed. Check console.");
        } finally {
            setSubmitting(false);
        }
    };

    const executePing = async () => {
        if (!selectedPingIndex) return;
        try {
            const res = await fetch(`/api/pinecone/describe-index?name=${selectedPingIndex}`);
            const data = await res.json();
            if (data.success) {
                setPingResult(data.info);
                // Don't auto-close, let user read
            } else {
                alert("Ping Failed: " + data.error);
            }
        } catch (e) {
            alert("Network Error");
        }
    };

    if (isCreating) {
        // ... existing Form UI (Use same code as before but updated inside this context if needed, 
        // for brevity assume it's the same return block as previous step but utilizing new handlers)
        return (
            <GlassPanel className="p-6 h-full flex flex-col gap-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#bef264] mb-2">Configure_Index</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase block mb-1">Index Name</label>
                        <input
                            type="text"
                            className="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none focus:border-[#bef264]"
                            value={formData.indexName}
                            onChange={(e) => {
                                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
                                setFormData({ ...formData, indexName: val });
                            }}
                        />
                    </div>
                    {/* ... (Dimensions/Metric Selects - Same as before) */}
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase block mb-1">Dimension</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none focus:border-[#bef264]"
                            value={formData.dimension}
                            onChange={(e) => setFormData({ ...formData, dimension: Number(e.target.value) })}
                        >
                            <option value={384}>384 (Default)</option>
                            <option value={1024}>1024 (Cohere)</option>
                            <option value={1536}>1536 (OpenAI)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase block mb-1">Metric</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none focus:border-[#bef264]"
                            value={formData.metric}
                            onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                        >
                            <option value="cosine">Cosine</option>
                            <option value="euclidean">Euclidean</option>
                            <option value="dotproduct">Dot Product</option>
                        </select>
                    </div>
                </div>
                <div className="mt-auto flex gap-2">
                    <button onClick={() => setIsCreating(false)} className="flex-1 bg-slate-800 text-xs py-2 text-slate-300 hover:bg-slate-700 transition-colors">Cancel</button>
                    <button onClick={handleCreateSubmit} disabled={submitting} className="flex-1 bg-[#bef264] text-xs py-2 text-black font-bold hover:opacity-90 transition-opacity">{submitting ? 'Creating...' : 'Launch Spec'}</button>
                </div>
            </GlassPanel>
        );
    }

    if (isPinging) {
        return (
            <GlassPanel className="p-6 h-full flex flex-col gap-4">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#bef264] mb-2">Select Target</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] text-slate-500 uppercase block mb-1">Target Index</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none focus:border-[#bef264]"
                            value={selectedPingIndex}
                            onChange={(e) => setSelectedPingIndex(e.target.value)}
                        >
                            {indexes.map(idx => (
                                <option key={idx.name} value={idx.name}>{idx.name}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={executePing} className="w-full bg-[#bef264] text-black font-bold text-xs py-2 hover:opacity-90">
                        SEND PING
                    </button>
                    {pingResult && (
                        <div className="bg-black/40 p-2 border border-slate-800 rounded">
                            <pre className="text-[9px] text-slate-300 font-mono overflow-auto max-h-[100px]">{JSON.stringify(pingResult, null, 2)}</pre>
                        </div>
                    )}
                </div>
                <button onClick={() => { setIsPinging(false); setPingResult(null); }} className="mt-auto w-full bg-slate-800 text-xs py-2 text-slate-400 hover:text-white">Back to Monitor</button>
            </GlassPanel>
        );
    }

    return (
        <GlassPanel className="p-6 h-full flex flex-col justify-between relative">
            {/* Same Main View */}
            <div className="flex justify-between items-start">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#bef264] flex items-center gap-2 mb-4">
                    <Activity className="w-4 h-4" />
                    Cluster_Health
                </h3>
                <div className="flex gap-2">
                    <button onClick={() => setIsPinging(true)} className="text-[9px] bg-slate-800 hover:bg-blue-500 hover:text-white transition-colors px-2 py-1 uppercase font-bold border border-slate-700">PING</button>
                    <button onClick={() => setIsCreating(true)} className="text-[9px] bg-slate-800 hover:bg-[#bef264] hover:text-black transition-colors px-2 py-1 uppercase font-bold border border-slate-700">+ NEW</button>
                </div>
            </div>

            {loading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                        <span className="text-xs text-slate-500 uppercase">Status</span>
                        <span className="text-sm font-black text-emerald-400">{stats?.readiness}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                        <span className="text-xs text-slate-500 uppercase">Active Indexes</span>
                        <span className="text-sm font-mono text-white">{stats?.indexCount}</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-slate-800 pb-2">
                        <span className="text-xs text-slate-500 uppercase">Total_Vectors</span>
                        <span className="text-sm font-mono text-white">{stats?.totalVectorCount}</span>
                    </div>
                </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center gap-2 opacity-50">
                <Server className="w-3 h-3 text-slate-500" />
                <span className="text-[10px] text-slate-600 uppercase">us-east-1-aws</span>
            </div>
        </GlassPanel>
    )
}
