'use client';

import React, { useState } from 'react';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { Upload, Code, Code2, AlertTriangle, Search, Info, Trash2, Globe, Plus, X } from 'lucide-react';

interface PayloadBuilderProps {
    selectedIndex: string;
    globalNamespace: string;
    onNamespaceChange: (ns: string) => void;
}

export function PayloadBuilder({ selectedIndex: initialIndex, globalNamespace, onNamespaceChange }: PayloadBuilderProps) {
    // Data
    const [indexes, setIndexes] = useState<any[]>([]);
    const [namespaceStats, setNamespaceStats] = useState<Record<string, number>>({});

    // Selections
    const [selectedIndex, setSelectedIndex] = useState(initialIndex || '');
    const selectedNamespace = globalNamespace;
    const setSelectedNamespace = onNamespaceChange;
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

    // Bulk States
    const [stagedRecords, setStagedRecords] = useState<any[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [activeMode, setActiveMode] = useState<'single' | 'bulk' | 'verify'>('single');
    const [verifyId, setVerifyId] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    // Advanced Bulk Features
    const [isNewNamespace, setIsNewNamespace] = useState(false);
    const [newNamespaceName, setNewNamespaceName] = useState('');
    const [globalMetadata, setGlobalMetadata] = useState('');
    const [schemaWarning, setSchemaWarning] = useState<string | null>(null);

    // 1. Fetch Indexes (Sync with initialIndex)
    React.useEffect(() => {
        if (initialIndex) setSelectedIndex(initialIndex);

        fetch('/api/pinecone/list-indexes')
            .then(res => res.json())
            .then(data => {
                const list = data.indexes || [];
                setIndexes(list);
                if (list.length > 0 && !selectedIndex) setSelectedIndex(list[0].name);
            });
    }, [initialIndex]);

    // 2. Fetch Namespaces & Stats
    const fetchNamespaces = React.useCallback(() => {
        if (!selectedIndex) return;
        fetch(`/api/pinecone/list-namespaces?indexName=${selectedIndex}`)
            .then(res => res.json())
            .then(data => {
                const stats = data.namespaces || {};
                const names = Object.keys(stats);

                const countMap: Record<string, number> = {};
                names.forEach(n => countMap[n] = stats[n].recordCount || 0);

                if (names.length === 0) countMap[''] = 0;
                setNamespaceStats(countMap);
            });
    }, [selectedIndex]);

    React.useEffect(() => {
        fetchNamespaces();
    }, [fetchNamespaces]);

    // 3. Schema Inference
    const refreshSchema = React.useCallback(async () => {
        if (!selectedIndex) return;
        const ns = selectedNamespace;

        setIsLoadingSchema(true);
        try {
            const res = await fetch(`/api/pinecone/fetch-latest?indexName=${selectedIndex}&namespace=${ns}`);
            const data = await res.json();
            let keys: string[];
            if (data.record && data.record.metadata) {
                keys = Object.keys(data.record.metadata).filter(k => k !== 'text');
                setLogs(prev => [...prev, `[System] Schema detected: [${keys.join(', ')}]`]);
            } else {
                keys = ['title', 'category'];
                setLogs(prev => [...prev, `[System] No records found. Using default schema.`]);
            }
            setSchemaKeys(keys);
            const newFormData: Record<string, string> = { text: '' };
            keys.forEach(k => newFormData[k] = '');
            setFormData(newFormData);
        } catch (err) {
            setLogs(prev => [...prev, `[Error] Failed to fetch schema: ${err}`]);
        } finally {
            setIsLoadingSchema(false);
        }
    }, [selectedIndex, selectedNamespace]);

    React.useEffect(() => {
        refreshSchema();
    }, [refreshSchema]);

    // Sentinel: Check for schema mismatches
    const checkSchemaSentinel = async (firstRecord: any) => {
        const ns = selectedNamespace;
        const res = await fetch(`/api/pinecone/fetch-latest?indexName=${selectedIndex}&namespace=${ns}`);
        const data = await res.json();

        if (data.record && data.record.metadata) {
            const existingKeys = Object.keys(data.record.metadata);
            const incomingKeys = Object.keys(firstRecord);
            const missingInFile = existingKeys.filter(k => !incomingKeys.includes(k) && k !== 'text');
            const newInFile = incomingKeys.filter(k => !existingKeys.includes(k) && k !== 'text' && k !== 'id');

            if (missingInFile.length > 0 || newInFile.length > 0) {
                setSchemaWarning(
                    `Schema mismatch detected! This namespace uses [${existingKeys.join(', ')}], but your file has [${incomingKeys.join(', ')}]. Consider a new namespace for clean data.`
                );
            } else {
                setSchemaWarning(null);
            }
        }
    };

    // Handlers
    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setSchemaWarning(null);
        const file = e.dataTransfer.files[0];
        if (file && (file.name.endsWith('.jsonl') || file.name.endsWith('.json'))) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const text = event.target?.result as string;
                    const lines = text.split('\n').filter(l => l.trim());
                    const parsed = lines.map(l => JSON.parse(l));
                    setStagedRecords(parsed);
                    setLogs(prev => [...prev, `[System] Staged ${parsed.length} records from ${file.name}`]);

                    if (parsed.length > 0) {
                        checkSchemaSentinel(parsed[0]);
                    }
                } catch (err) {
                    setLogs(prev => [...prev, `[Error] Failed to parse JSONL: ${err}`]);
                }
            };
            reader.readAsText(file);
        }
    };

    const handleAddField = () => {
        const key = window.prompt('Enter metadata key name:');
        if (key && !schemaKeys.includes(key)) {
            setSchemaKeys(prev => [...prev, key]);
            setFormData(prev => ({ ...prev, [key]: '' }));
        }
    };

    const handleRemoveField = (key: string) => {
        setSchemaKeys(prev => prev.filter(k => k !== key));
        setFormData(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
    };

    const handleCreateNamespace = () => {
        if (!newNamespaceName) return;
        const name = newNamespaceName.trim().toLowerCase().replace(/ /g, '-');
        setSelectedNamespace(name);
        setIsNewNamespace(false);
        setNewNamespaceName('');
        setLogs(prev => [...prev, `✨ [System] Tenant "${name}" registered. Record an upsert to initialize it in the Cloud Dashboard.`]);
    };

    const handleDeleteNamespace = async (ns: string) => {
        if (!window.confirm(`CRITICAL: Are you sure you want to delete the "${ns}" namespace? This will remove all vectors in this tenant permanently.`)) return;

        try {
            setLogs(prev => [...prev, `🗑️ [System] Deleting tenant isolation zone: ${ns}...`]);
            const res = await fetch(`/api/pinecone/delete-namespace?indexName=${selectedIndex}&namespace=${ns}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Deletion failed');

            setLogs(prev => [...prev, `✅ [System] Tenant "${ns}" successfully offboarded.`]);
            if (selectedNamespace === ns) setSelectedNamespace(''); // Switch to default
            fetchNamespaces();
        } catch (err) {
            setLogs(prev => [...prev, `[Error] Deletion failed: ${err}`]);
        }
    };

    const handleBatchUpsert = async () => {
        if (stagedRecords.length === 0 || !selectedIndex) return;
        setIsUpserting(true);
        setProgress(0);

        const targetNs = selectedNamespace;

        // Parse Global Metadata tags
        let globalTags: Record<string, any> = {};
        if (globalMetadata) {
            globalMetadata.split(',').forEach(tag => {
                const [k, v] = tag.split(':').map(s => s.trim());
                if (k && v) globalTags[k] = v;
            });
        }

        const batchSize = 10;
        const total = stagedRecords.length;

        try {
            for (let i = 0; i < total; i += batchSize) {
                const chunk = stagedRecords.slice(i, i + batchSize);
                setLogs(prev => [...prev, `[Batch] Processing ${i + 1}-${Math.min(i + batchSize, total)} of ${total}...`]);

                // 1. Extract texts for embedding (Heuristic: prioritized "text", fallback to longest string)
                const texts = chunk.map(r => {
                    if (r.text) return r.text;
                    const stringFields = Object.values(r).filter(v => typeof v === 'string') as string[];
                    return stringFields.sort((a, b) => b.length - a.length)[0] || JSON.stringify(r);
                });

                // 2. Get embeddings
                const embedRes = await fetch('/api/embed', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ texts, model: selectedModel })
                });
                const embedData = await embedRes.json();
                if (!embedRes.ok) throw new Error(embedData.error);

                // 3. Prepare Pinecone records
                const pineconeRecords = chunk.map((record, idx) => {
                    const { id, text, ...metadata } = record;
                    return {
                        id: id || `bulk_${Date.now()}_${i + idx}`,
                        values: embedData.embeddings[idx],
                        metadata: {
                            ...metadata,
                            ...globalTags,
                            text: text || texts[idx],
                            _ingested_at: new Date().toISOString(),
                            _batch_id: `batch_${Date.now()}`
                        }
                    };
                });

                // 4. Batch Upsert
                const upsertRes = await fetch('/api/pinecone/upsert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        indexName: selectedIndex,
                        namespace: targetNs,
                        records: pineconeRecords
                    })
                });
                if (!upsertRes.ok) throw new Error('Batch upsert failed');

                setLogs(prev => [...prev, `[Success] Ingested ${pineconeRecords.length} vectors to namespace "${targetNs}"`]);
                setProgress(Math.round(((i + chunk.length) / total) * 100));
            }

            setLogs(prev => [...prev, `[Complete] ✅ All ${total} records indexed.`]);
            setStagedRecords([]);
            setSchemaWarning(null);
            fetchNamespaces();
        } catch (error: any) {
            setLogs(prev => [...prev, `[Critical Error] ${error.message || error}`]);
        } finally {
            setIsUpserting(false);
            setProgress(0);
        }
    };

    const handleUpsert = async () => {
        setIsUpserting(true);
        setVerifiedRecord(null);
        const start = Date.now();
        const ns = selectedNamespace;
        const textToEmbed = formData.text || JSON.stringify(formData);

        try {
            setLogs(prev => [...prev, `[API] Upserting record ${previewId} to ${selectedIndex}::${ns}`]);

            const embedRes = await fetch('/api/embed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToEmbed, model: selectedModel })
            });

            if (!embedRes.ok) throw new Error('Embedding failed');
            const embedData = await embedRes.json();
            setLogs(prev => [...prev, `✅ [Pinecone] Using provided embedding (dim: ${embedData.embedding.length})`]);

            const res = await fetch('/api/pinecone/upsert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    indexName: selectedIndex,
                    namespace: ns,
                    record: { id: previewId, metadata: formData, text: textToEmbed },
                    embedding: embedData.embedding
                })
            });

            if (!res.ok) throw new Error('Upsert failed');
            const duration = ((Date.now() - start) / 1000).toFixed(1);
            setLogs(prev => [...prev, `📥 [Pinecone] Upserted record '${previewId}' to ${selectedIndex}::${ns}`]);
            setLogs(prev => [...prev, `POST /api/pinecone/upsert 200 in ${duration}s (render: ${duration}s)`]);

            fetchNamespaces();
            setPreviewId(`vec_${Date.now().toString().slice(-4)}`);
        } catch (error) {
            setLogs(prev => [...prev, `[Error] ${error}`]);
        } finally {
            setIsUpserting(false);
        }
    };

    const handleVerify = async () => {
        if (!verifyId || !selectedIndex) return;
        setIsVerifying(true);
        const ns = selectedNamespace;
        const start = Date.now();

        try {
            setLogs(prev => [...prev, `[API] Fetching record ${verifyId} from ${selectedIndex}::${ns}`]);
            const res = await fetch(`/api/pinecone/fetch-by-id?indexName=${selectedIndex}&namespace=${ns}&id=${verifyId}`);
            const data = await res.json();
            const duration = ((Date.now() - start) / 1000).toFixed(1);

            if (data.found) {
                setVerifiedRecord(data.record);
                setLogs(prev => [...prev, `[Success] Record ${verifyId} retrieved in ${Date.now() - start}ms.`]);
                setLogs(prev => [...prev, `GET /api/pinecone/fetch-by-id 200 in ${duration}s`]);
            } else {
                setVerifiedRecord(null);
                setLogs(prev => [...prev, `[Error] Record ${verifyId} not found in namespace "${ns || 'default'}"`]);
                setLogs(prev => [...prev, `GET /api/pinecone/fetch-by-id 404 in ${duration}s`]);
            }
        } catch (err) {
            setLogs(prev => [...prev, `[Error] Ping failed: ${err}`]);
        } finally {
            setIsVerifying(false);
        }
    };

    const isUninitialized = selectedNamespace !== '' && (namespaceStats[selectedNamespace] === undefined || namespaceStats[selectedNamespace] === 0);

    const jsonPreview = (activeMode === 'verify' && verifiedRecord) ? {
        ...verifiedRecord,
        values: verifiedRecord.values ? [
            ...verifiedRecord.values.slice(0, 6).map((v: number) => parseFloat(v.toFixed(4))),
            `... (${verifiedRecord.values.length - 6} more entries)`
        ] : undefined
    } : (activeMode === 'bulk' && stagedRecords.length > 0) ? stagedRecords.slice(0, 3) : {
        _SYSTEM_NOTICE: isUninitialized ? {
            status: "PENDING_CLOUD_INITIALIZATION",
            message: `Tenant "${selectedNamespace}" is registered but empty. Upsert data to manifest in Pinecone Dashboard.`
        } : undefined,
        id: previewId,
        metadata: formData
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Control Panel */}
            <div className="space-y-6">
                <GlassPanel className="p-6 space-y-6 flex flex-col h-full">
                    <div className="flex justify-between items-center shrink-0">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-[#bef264]">Configuration</h3>
                        <span className="text-[9px] bg-[#bef264]/20 text-[#bef264] px-2 py-1 rounded">Live_Connect</span>
                    </div>

                    <div className="space-y-4 shrink-0">
                        {/* Mode Toggle */}
                        <div className="flex bg-black/40 p-1 rounded-lg border border-slate-800">
                            <button
                                onClick={() => setActiveMode('single')}
                                className={`flex-1 py-1.5 text-[9px] uppercase font-bold tracking-widest transition-all rounded ${activeMode === 'single' ? 'bg-[#bef264] text-black shadow-lg shadow-[#bef264]/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Single Upsert
                            </button>
                            <button
                                onClick={() => setActiveMode('bulk')}
                                className={`flex-1 py-1.5 text-[9px] uppercase font-bold tracking-widest transition-all rounded ${activeMode === 'bulk' ? 'bg-[#bef264] text-black shadow-lg shadow-[#bef264]/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Bulk Import
                            </button>
                            <button
                                onClick={() => setActiveMode('verify')}
                                className={`flex-1 py-1.5 text-[9px] uppercase font-bold tracking-widest transition-all rounded ${activeMode === 'verify' ? 'bg-[#bef264] text-black shadow-lg shadow-[#bef264]/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Verify ID
                            </button>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase text-slate-500 block mb-1">Embedding Model</label>
                            <select
                                className="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none focus:border-[#bef264]"
                                value={selectedModel}
                                onChange={(e) => setSelectedModel(e.target.value)}
                            >
                                <option value="Xenova/all-MiniLM-L6-v2">Xenova/all-MiniLM-L6-v2 (Local Free)</option>
                                <option value="text-embedding-3-small" disabled>OpenAI (text-embedding-3-small)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
                                        <Globe className="w-3 h-3" />
                                        Tenant_Isolation
                                    </label>
                                    <button
                                        onClick={() => setIsNewNamespace(!isNewNamespace)}
                                        className={`text-[8px] px-2 py-0.5 rounded border transition-all ${isNewNamespace ? 'bg-rose-500 border-rose-500 text-white' : 'border-slate-700 text-[#bef264] hover:border-[#bef264]'}`}
                                    >
                                        {isNewNamespace ? 'CANCEL' : '+ REGISTER_NEW'}
                                    </button>
                                </div>

                                {isNewNamespace ? (
                                    <div className="flex gap-2 animate-in slide-in-from-top-1 duration-200">
                                        <input
                                            type="text"
                                            placeholder="Tenant name..."
                                            value={newNamespaceName}
                                            onChange={(e) => setNewNamespaceName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleCreateNamespace()}
                                            autoFocus
                                            className="flex-1 bg-black border border-[#bef264]/50 p-2 text-xs text-[#bef264] outline-none"
                                        />
                                        <button
                                            onClick={handleCreateNamespace}
                                            className="px-2 bg-[#bef264] text-black font-bold text-[10px] uppercase"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="relative group/ns-sel">
                                            <select
                                                className="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none focus:border-[#bef264] appearance-none"
                                                value={selectedNamespace}
                                                onChange={(e) => setSelectedNamespace(e.target.value)}
                                            >
                                                <option value="">
                                                    DEFAULT {namespaceStats[''] !== undefined ? `(${namespaceStats['']} records)` : namespaceStats['default'] !== undefined ? `(${namespaceStats['default']} records)` : ''}
                                                </option>
                                                {Object.entries(namespaceStats)
                                                    .filter(([ns]) => ns !== '' && ns !== 'default')
                                                    .map(([ns, count]) => (
                                                        <option key={ns} value={ns}>{ns.toUpperCase()} ({count} records)</option>
                                                    ))}
                                            </select>
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover/ns-sel:opacity-100 transition-opacity">
                                                <Code2 className="w-3 h-3" />
                                            </div>
                                        </div>

                                        {selectedNamespace && (
                                            <div className="flex justify-end pr-1">
                                                <button
                                                    onClick={() => handleDeleteNamespace(selectedNamespace)}
                                                    className="text-[8px] text-rose-500 hover:text-rose-400 flex items-center gap-1 uppercase font-black transition-colors"
                                                >
                                                    <Trash2 className="w-2.5 h-2.5" />
                                                    Decommission Zone
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Global Metadata Enrichment */}
                        <div className={activeMode === 'bulk' ? 'block' : 'hidden opacity-50 grayscale pointer-events-none'}>
                            <label className="text-[10px] uppercase text-slate-500 block mb-1">Global Metadata Enrichment (Bulk Only)</label>
                            <input
                                type="text"
                                placeholder="e.g. source: manual, version: 1.0"
                                value={globalMetadata}
                                onChange={(e) => setGlobalMetadata(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 p-2 text-xs text-slate-400 outline-none focus:border-[#bef264]"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 py-4 border-t border-slate-800">
                        {/* Dropzone for Bulk Import */}
                        {activeMode === 'bulk' && (
                            <div className="space-y-4">
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleFileDrop}
                                    className={`relative border-2 border-dashed transition-all duration-200 p-8 flex flex-col items-center justify-center gap-3 ${isDragging ? 'border-[#bef264] bg-[#bef264]/5 scale-[1.02]' : 'border-slate-800 bg-black/40 hover:border-slate-600'
                                        } ${schemaWarning ? 'border-rose-500 bg-rose-500/5' : ''}`}
                                >
                                    <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-[#bef264]' : schemaWarning ? 'text-rose-500' : 'text-slate-600'}`} />
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-white uppercase tracking-wider">Bulk Data Import</p>
                                        <p className="text-[10px] text-slate-500 mt-1">Drag and drop .jsonl file here</p>
                                    </div>
                                    {stagedRecords.length > 0 && (
                                        <div className="absolute top-2 right-2 flex items-center gap-2">
                                            <span className="text-[10px] bg-[#bef264] text-black px-2 py-0.5 font-bold rounded-sm animate-pulse">
                                                {stagedRecords.length} LOADED
                                            </span>
                                            <button onClick={() => { setStagedRecords([]); setSchemaWarning(null); }} className="text-slate-500 hover:text-white">
                                                <Code className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {schemaWarning && (
                                    <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-400 flex flex-col gap-2">
                                        <div className="font-bold flex items-center gap-2 uppercase tracking-widest">
                                            <span className="text-rose-500">⚠️ Schema Warning</span>
                                        </div>
                                        <p>{schemaWarning}</p>
                                        <button
                                            onClick={() => setIsNewNamespace(true)}
                                            className="w-fit px-3 py-1 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/50 rounded text-rose-200 uppercase"
                                        >
                                            Move to New Namespace instead
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Manual Form for Single Upsert */}
                        {activeMode === 'single' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-mono uppercase tracking-widest text-[#bef264]">Manual_Entry</h3>
                                    <button
                                        onClick={refreshSchema}
                                        disabled={isLoadingSchema}
                                        className="text-[9px] text-[#bef264] hover:underline flex items-center gap-1 opacity-70 hover:opacity-100 disabled:opacity-30"
                                    >
                                        {isLoadingSchema ? 'Discovering...' : 'Sync with Namespace'}
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] uppercase text-slate-500 block mb-1">Text / Content</label>
                                        <textarea
                                            value={formData.text || ''}
                                            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                                            className="w-full h-32 bg-black border border-slate-800 p-2 text-sm text-white focus:border-[#bef264] outline-none resize-none"
                                            placeholder="Enter text to embed..."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {schemaKeys.map(key => (
                                            <div key={key} className="relative group/field">
                                                <label className="text-[10px] uppercase text-slate-500 block mb-1">{key}</label>
                                                <div className="flex gap-1">
                                                    <input
                                                        type="text"
                                                        value={formData[key] || ''}
                                                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                                        className="flex-1 bg-black border border-slate-800 p-2 text-sm text-white focus:border-[#bef264] outline-none"
                                                    />
                                                    <button
                                                        onClick={() => handleRemoveField(key)}
                                                        className="px-2 border border-slate-800 hover:border-rose-500 text-slate-700 hover:text-rose-500 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={handleAddField}
                                            className="h-[38px] mt-[17px] border border-dashed border-slate-800 text-slate-600 text-[10px] uppercase font-bold hover:border-[#bef264] hover:text-[#bef264] transition-all flex items-center justify-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" />
                                            Add_Metadata
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Verification Hub */}
                        {activeMode === 'verify' && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-xs font-mono uppercase tracking-widest text-[#bef264]">Verification_Hub</h3>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">
                                        Input a vector ID to fetch its full payload and confirm indexing status directly from the Cloud Index.
                                    </p>
                                </div>

                                <div className="relative group/verify">
                                    <label className="text-[10px] uppercase text-slate-500 block mb-1">Target ID</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={verifyId}
                                            onChange={(e) => setVerifyId(e.target.value)}
                                            className="w-full bg-black border border-slate-800 p-3 text-sm text-[#bef264] font-mono outline-none group-hover/verify:border-[#bef264]/30 focus:border-[#bef264] transition-all"
                                            placeholder="e.g. vec_5469"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 opacity-40 group-focus-within/verify:opacity-100">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-pulse" />
                                            <span className="text-[8px] font-mono text-[#bef264]">READY</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-lg space-y-3">
                                    <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-slate-500 border-b border-slate-800 pb-2">
                                        <span>Status Check</span>
                                        <span className={verifiedRecord ? 'text-[#bef264]' : 'text-slate-600'}>
                                            {verifiedRecord ? 'INDEXED' : 'PENDING'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-[8px] text-slate-600 uppercase mb-0.5">Namespace</p>
                                            <p className="text-[10px] text-white font-mono truncate">{selectedNamespace || '(Default)'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] text-slate-600 uppercase mb-0.5">Index</p>
                                            <p className="text-[10px] text-white font-mono truncate">{selectedIndex}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 shrink-0">
                        {activeMode === 'bulk' && stagedRecords.length > 0 ? (
                            <div className="space-y-4">
                                {isUpserting && (
                                    <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#bef264] transition-all duration-300"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                )}
                                <button
                                    onClick={handleBatchUpsert}
                                    disabled={isUpserting}
                                    className="w-full py-4 bg-[#bef264] text-black font-black uppercase tracking-widest text-xs hover:bg-[#bef264]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isUpserting ? `Processing Batch... ${progress}%` : `Embed & Ingest ${stagedRecords.length} Records`}
                                </button>
                            </div>
                        ) : activeMode === 'single' ? (
                            <button
                                onClick={handleUpsert}
                                disabled={isUpserting || !formData.text}
                                className={`w-full py-4 bg-[#bef264] text-black font-black uppercase tracking-widest text-xs hover:bg-[#bef264]/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 ${isUninitialized && !isUpserting ? 'animate-pulse ring-2 ring-[#bef264]/50' : ''}`}
                            >
                                <Upload className="w-3 h-3" />
                                Upsert_Record
                            </button>
                        ) : activeMode === 'verify' ? (
                            <button
                                onClick={handleVerify}
                                disabled={isVerifying || !verifyId}
                                className="w-full py-4 bg-[#bef264] text-black font-black uppercase tracking-widest text-xs hover:bg-[#bef264]/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Search className="w-3 h-3" />
                                {isVerifying ? 'Pinging Cloud...' : 'Ping Record ID'}
                            </button>
                        ) : (
                            <div className="py-4 text-center text-slate-600 text-[10px] uppercase tracking-widest border border-dashed border-slate-800 rounded">
                                Drop a file to enable ingestion
                            </div>
                        )}
                    </div>
                </GlassPanel>
            </div>

            {/* Preview & Console */}
            <div className="space-y-4 flex flex-col h-full min-h-0">
                <GlassPanel className="p-0 overflow-hidden bg-[#0c0c0c] flex-1 flex flex-col min-h-0">
                    <div className="bg-slate-900/50 p-2 border-b border-slate-800 flex items-center justify-between shrink-0">
                        <span className="text-[10px] font-mono text-slate-500 pl-2">
                            {activeMode === 'verify' ? 'fetch_response.json' : (activeMode === 'bulk' && stagedRecords.length > 0) ? 'ingestion_preview.jsonl (20 rows)' : 'payload_preview.json'}
                        </span>
                        <Code className="w-3 h-3 text-slate-600 mr-2" />
                    </div>
                    <div className="flex-1 overflow-auto">
                        {activeMode === 'bulk' && stagedRecords.length > 0 ? (
                            <table className="w-full text-left border-collapse min-w-[400px]">
                                <thead className="sticky top-0 bg-[#0c0c0c] z-10 shadow-md">
                                    <tr className="border-b border-slate-800">
                                        <th className="p-3 text-[9px] font-mono text-slate-500 uppercase">id</th>
                                        <th className="p-3 text-[9px] font-mono text-slate-500 uppercase">text</th>
                                        <th className="p-3 text-[9px] font-mono text-slate-500 uppercase">metadata</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stagedRecords.slice(0, 20).map((r, i) => (
                                        <tr key={i} className="border-b border-slate-900 hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-[10px] font-mono text-[#bef264] border-r border-slate-900/50">{r.id || `idx_${i}`}</td>
                                            <td className="p-3 text-[10px] text-slate-400 truncate max-w-[200px]">{r.text || '-'}</td>
                                            <td className="p-3 text-[10px] text-slate-500 font-mono truncate max-w-[150px]">
                                                {JSON.stringify(Object.keys(r).filter(k => k !== 'text' && k !== 'id'))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <pre className="p-4 text-xs font-mono text-emerald-400 leading-relaxed">
                                {JSON.stringify(jsonPreview, null, 2)}
                            </pre>
                        )}
                    </div>
                </GlassPanel>

                <div className="h-64 bg-black border border-slate-800 p-3 font-mono text-[10px] overflow-y-auto flex flex-col-reverse shadow-inner shrink-0">
                    <div className="space-y-1">
                        {logs.length === 0 && <span className="text-slate-700 italic">{'// Ingestion Console Ready...'}</span>}
                        {logs.map((log, i) => {
                            const isSuccess = log.includes('[Success]');
                            const isError = log.includes('[Error]') || log.includes('[Critical]');
                            const isBatch = log.includes('[Batch]');
                            return (
                                <div key={i} className={`mb-1 pl-3 border-l-2 transition-colors ${isSuccess ? 'border-[#bef264] text-[#bef264]' :
                                    isError ? 'border-rose-500 text-rose-400' :
                                        isBatch ? 'border-blue-500 text-blue-400' :
                                            'border-slate-800 text-slate-400'
                                    }`}>
                                    <span className="opacity-30 mr-2">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                                    {log}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
