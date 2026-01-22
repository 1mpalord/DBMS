'use client';

import React, { useState } from 'react';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { Code, Upload } from 'lucide-react';


export function PayloadBuilder() {
    // Data
    const [indexes, setIndexes] = useState<any[]>([]);
    const [namespaceStats, setNamespaceStats] = useState<Record<string, number>>({});

    // Selections
    const [selectedIndex, setSelectedIndex] = useState('');
    const [selectedNamespace, setSelectedNamespace] = useState('');
    const [selectedModel, setSelectedModel] = useState('Xenova/all-MiniLM-L6-v2');

    // Dynamic Form Data
    const [schemaKeys, setSchemaKeys] = useState<string[]>(['title', 'text', 'category']);
    const [formData, setFormData] = useState<Record<string, string>>({
        title: 'Atomic Habits',
        text: 'Small changes, remarkable results.',
        category: 'Self-Help'
    });

    const [logs, setLogs] = useState<string[]>([]);
    const [isUpserting, setIsUpserting] = useState(false);
    const [isLoadingSchema, setIsLoadingSchema] = useState(false);
    const [verifiedRecord, setVerifiedRecord] = useState<any>(null);
    const [previewId, setPreviewId] = useState(() => `vec_${Date.now().toString().slice(-4)}`);

    // 1. Fetch Indexes on Mount
    React.useEffect(() => {
        fetch('/api/pinecone/list-indexes')
            .then(res => res.json())
            .then(data => {
                const list = data.indexes || [];
                setIndexes(list);
                if (list.length > 0) setSelectedIndex(list[0].name);
            });
    }, []);

    // 2. Fetch Namespaces & Stats
    const fetchNamespaces = React.useCallback(() => {
        if (!selectedIndex) return;
        fetch(`/api/pinecone/list-namespaces?indexName=${selectedIndex}`)
            .then(res => res.json())
            .then(data => {
                const stats = data.namespaces || {};
                const names = Object.keys(stats);

                // Map to record valid for counts
                const countMap: Record<string, number> = {};
                names.forEach(n => countMap[n] = stats[n].recordCount || 0);

                // Default 'default' if empty
                if (names.length === 0) countMap['default'] = 0;

                setNamespaceStats(countMap);

                // Auto-select first if none selected or current invalid
                if (!selectedNamespace || !countMap[selectedNamespace]) {
                    setSelectedNamespace(names[0] || 'default');
                }
            });
    }, [selectedIndex]);

    React.useEffect(() => {
        fetchNamespaces();
    }, [fetchNamespaces]);

    // 3. Schema Inference
    React.useEffect(() => {
        if (!selectedIndex) return;
        const ns = selectedNamespace === 'default' ? '' : selectedNamespace;

        setIsLoadingSchema(true);
        fetch(`/api/pinecone/fetch-latest?indexName=${selectedIndex}&namespace=${ns}`)
            .then(res => res.json())
            .then(data => {
                let keys: string[];
                if (data.record && data.record.metadata) {
                    keys = Object.keys(data.record.metadata);
                } else {
                    keys = ['title', 'text', 'category'];
                }
                setSchemaKeys(keys);
                // Reset formData to match new schema
                const newFormData: Record<string, string> = {};
                keys.forEach(k => newFormData[k] = '');
                setFormData(newFormData);
            })
            .finally(() => setIsLoadingSchema(false));
    }, [selectedIndex, selectedNamespace]);

    const handleUpsert = async () => {
        setIsUpserting(true);
        setVerifiedRecord(null); // Clear previous
        const start = Date.now();
        const ns = selectedNamespace === 'default' ? '' : selectedNamespace;
        const textToEmbed = formData.text || JSON.stringify(formData);

        try {
            setLogs(prev => [...prev, `[System] Generating embedding with ${selectedModel}...`]);

            // Step 1: Generate Embedding
            const embedRes = await fetch('/api/embed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToEmbed, model: selectedModel })
            });

            if (!embedRes.ok) {
                const err = await embedRes.json();
                throw new Error(err.error || 'Embedding generation failed');
            }

            const embedData = await embedRes.json();
            setLogs(prev => [...prev, `[System] Embedding generated (${embedData.dimension} dims). Upserting...`]);

            // Step 2: Upsert with embedding
            const payload = {
                id: previewId,
                metadata: formData,
                text: textToEmbed
            };

            const res = await fetch('/api/pinecone/upsert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    indexName: selectedIndex,
                    namespace: ns,
                    record: payload,
                    embedding: embedData.embedding
                })
            });

            if (!res.ok) throw new Error('Upsert failed');

            const latency = Date.now() - start;
            setLogs(prev => [...prev, `[Success] Record ${previewId} indexed in ${latency}ms.`]);

            // Verify the record exists
            setLogs(prev => [...prev, `[System] Verifying record in Pinecone...`]);
            const verifyRes = await fetch(`/api/pinecone/fetch-by-id?indexName=${selectedIndex}&namespace=${ns}&id=${previewId}`);
            const verifyData = await verifyRes.json();

            if (verifyData.found) {
                setLogs(prev => [...prev, `[Verified] ✅ Record ${previewId} confirmed in index!`]);
                // Store for display with truncated values
                const displayRecord = {
                    id: verifyData.record.id,
                    values: [...verifyData.record.values.slice(0, 5), `... (${verifyData.record.values.length} total)`],
                    metadata: verifyData.record.metadata
                };
                setVerifiedRecord(displayRecord);
            } else {
                setLogs(prev => [...prev, `[Warning] Record not immediately visible. May take a moment to propagate.`]);
            }

            // Refresh stats
            fetchNamespaces();

            // New ID
            setPreviewId(`vec_${Date.now().toString().slice(-4)}`);

        } catch (error) {
            setLogs(prev => [...prev, `[Error] ${error}`]);
        } finally {
            setIsUpserting(false);
        }
    };

    const jsonPreview = {
        id: previewId,
        values: [0.03, -0.09, 0.12, "..."],
        metadata: formData
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Control Panel */}
            <GlassPanel className="p-6 space-y-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[#bef264]">Configuration</h3>
                    <span className="text-[9px] bg-[#bef264]/20 text-[#bef264] px-2 py-1 rounded">Live_Connect</span>
                </div>

                <div className="space-y-4">
                    {/* Model Selector */}
                    <div>
                        <label className="text-[10px] uppercase text-slate-500 block mb-1">Embedding Model</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none focus:border-[#bef264]"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                        >
                            <option value="Xenova/all-MiniLM-L6-v2">Xenova/all-MiniLM-L6-v2 (Local Free)</option>
                            <option value="text-embedding-3-small" disabled>OpenAI (text-embedding-3-small) - API Key Required</option>
                            <option value="embed-english-v3.0" disabled>Cohere (embed-english-v3.0) - API Key Required</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Index Selector */}
                        <div>
                            <label className="text-[10px] uppercase text-slate-500 block mb-1">Target Index</label>
                            <select
                                className="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none focus:border-[#bef264]"
                                value={selectedIndex}
                                onChange={(e) => setSelectedIndex(e.target.value)}
                            >
                                {indexes.map(idx => (
                                    <option key={idx.name} value={idx.name}>{idx.name}</option>
                                ))}
                            </select>
                        </div>
                        {/* Namespace Selector */}
                        <div>
                            <div className="flex justify-between">
                                <label className="text-[10px] uppercase text-slate-500 block mb-1">Namespace</label>
                                <span className="text-[9px] text-[#bef264] px-1 bg-slate-800 rounded">{namespaceStats[selectedNamespace] ?? 0} rows</span>
                            </div>
                            <select
                                className="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none focus:border-[#bef264]"
                                value={selectedNamespace}
                                onChange={(e) => setSelectedNamespace(e.target.value)}
                            >
                                {Object.keys(namespaceStats).length === 0 && <option value="default">(Default)</option>}
                                {Object.keys(namespaceStats).map(ns => (
                                    <option key={ns} value={ns}>{ns === 'default' || ns === '' ? '(Default)' : ns}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 my-4 pt-4 relative">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-[#bef264] mb-4">Record_Metadata</h3>
                    {isLoadingSchema ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-2 border-[#bef264] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {schemaKeys.map(key => (
                                <div key={key}>
                                    <label className="text-[10px] uppercase text-slate-500 block mb-1">{key}</label>
                                    <input
                                        type="text"
                                        value={formData[key] || ''}
                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                        className="w-full bg-black border border-slate-800 p-2 text-sm text-white focus:border-[#bef264] outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    onClick={handleUpsert}
                    className="w-full py-3 bg-[#bef264] text-black font-black uppercase tracking-widest text-xs hover:bg-[#bef264]/90 transition-colors flex items-center justify-center gap-2"
                >
                    <Upload className="w-3 h-3" />
                    Upsert_Record
                </button>
            </GlassPanel>

            {/* JSON Preview & Console */}
            <div className="space-y-4">
                <GlassPanel className="p-0 overflow-hidden bg-[#0c0c0c]">
                    <div className="bg-slate-900/50 p-2 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500 pl-2">payload_preview.json</span>
                        <Code className="w-3 h-3 text-slate-600 mr-2" />
                    </div>
                    <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[150px]">
                        {JSON.stringify(jsonPreview, null, 2)}
                    </pre>
                </GlassPanel>

                {verifiedRecord && (
                    <GlassPanel className="p-0 overflow-hidden bg-[#0c0c0c] border-[#bef264]/50">
                        <div className="bg-[#bef264]/10 p-2 border-b border-[#bef264]/30 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-[#bef264] pl-2">✅ verified_record.json</span>
                            <button onClick={() => setVerifiedRecord(null)} className="text-[9px] text-slate-500 hover:text-white mr-2">CLEAR</button>
                        </div>
                        <pre className="p-4 text-xs font-mono text-[#bef264] overflow-x-auto max-h-[180px]">
                            {JSON.stringify(verifiedRecord, null, 2)}
                        </pre>
                    </GlassPanel>
                )}

                <div className="h-48 bg-black border border-slate-800 p-2 font-mono text-[10px] overflow-y-auto">
                    {logs.length === 0 && <span className="text-slate-700 italic">{'// Ready to index...'}</span>}
                    {logs.map((log, i) => (
                        <div key={i} className="text-slate-400 mb-1 border-l-2 border-[#bef264] pl-2">{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
