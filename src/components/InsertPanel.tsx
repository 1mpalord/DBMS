'use client';

import React, { useState } from 'react';
import { Plus, Database, Info, Loader2 } from 'lucide-react';

interface InsertPanelProps {
    onInsert: (text: string) => Promise<void>;
    onSeed: () => Promise<void>;
    isLoading: boolean;
}

export const InsertPanel: React.FC<InsertPanelProps> = ({ onInsert, onSeed, isLoading }) => {
    const [text, setText] = useState('');
    const [isSeeding, setIsSeeding] = useState(false);

    const handleInsert = async () => {
        if (!text) return;
        await onInsert(text);
        setText('');
    };

    const handleSeed = async () => {
        setIsSeeding(true);
        await onSeed();
        setIsSeeding(false);
    };

    return (
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    Knowledge Base
                </h2>
                <button
                    onClick={handleSeed}
                    disabled={isLoading || isSeeding}
                    className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                >
                    {isSeeding ? 'Seeding...' : 'Seed from Wikipedia'}
                </button>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Add new intelligence to the vector index..."
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none text-sm"
                    />
                    <button
                        onClick={handleInsert}
                        disabled={isLoading || !text}
                        className="absolute bottom-3 right-3 p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg transition-all shadow-lg shadow-emerald-900/20"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </button>
                </div>

                <div className="bg-slate-950/50 rounded-xl p-4 border border-slate-800/50 flex gap-3">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-slate-400">
                        Inserting text will asynchronously generate a 384-dimensional embedding using <span className="text-blue-300">MinLM-L6</span> and upsert it into the Pinecone global index.
                    </p>
                </div>
            </div>
        </div>
    );
};
