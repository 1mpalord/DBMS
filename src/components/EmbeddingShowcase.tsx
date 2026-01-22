'use client';

import React, { useState } from 'react';
import { EmbeddingHeatmap } from './EmbeddingHeatmap';
import { TokenizationView } from './TokenizationView';
import { Loader2, Zap } from 'lucide-react';

export const EmbeddingShowcase: React.FC = () => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<{ embedding: number[]; tokens: string[]; timeMs: number } | null>(null);

    const handleGenerate = async () => {
        if (!text) return;
        setIsLoading(true);
        try {
            const res = await fetch('/api/embed', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!res.ok) {
                throw new Error('Failed to generate embedding');
            }

            const result = await res.json();

            // Defensive assignment
            if (result && Array.isArray(result.embedding) && Array.isArray(result.tokens)) {
                setData(result);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            console.error('Embedding error:', error);
            alert('Failed to generate embedding. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="atomic-card p-8 space-y-8 relative overflow-hidden">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                            <Zap className="w-5 h-5 text-[#bef264]" />
                            Atomic_Encoder
                        </h2>
                        <div className="h-0.5 w-8 bg-[#bef264] opacity-50" />
                    </div>
                    {data && (
                        <div className="font-mono text-[10px] text-[#bef264] border border-[#bef264]/20 px-2 py-1">
                            COMPUTE_SUCCESS
                        </div>
                    )}
                </div>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    Real-time high-dimensional vector transformation
                </p>
            </div>

            <div className="flex gap-0">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="ENTER TEXT STRING..."
                    className="tech-input flex-1 uppercase font-mono text-sm tracking-widest placeholder:opacity-30"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !text}
                    className="tech-button bg-[#bef264] !text-black font-black border-l-0"
                >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'GENERATE_VEC'}
                </button>
            </div>

            {data && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 border-t border-slate-800 pt-8 mt-4">
                    <div className="space-y-3">
                        <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Tokenization_Map</h3>
                        <TokenizationView tokens={data.tokens} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                384D_Latent_Tensor
                            </h3>
                            {typeof data.timeMs === 'number' && (
                                <span className="text-[9px] text-[#bef264] font-mono border-l border-[#bef264]/20 pl-3">
                                    SIG_TIME: {data.timeMs.toFixed(2)}MS
                                </span>
                            )}
                        </div>
                        <div className="bg-black/50 p-4 border border-slate-900">
                            <EmbeddingHeatmap embedding={data.embedding} className="justify-center scale-y-125" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

