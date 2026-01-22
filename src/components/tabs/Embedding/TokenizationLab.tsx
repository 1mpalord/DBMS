'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ArrowRight, Brain } from 'lucide-react';
import { GlassPanel } from '@/components/shared/GlassPanel';


export function TokenizationLab() {
    const [input, setInput] = useState('Apple banana fruit');
    const [tokens, setTokens] = useState<string[]>([]);
    const [vectors, setVectors] = useState<number[][]>([]);
    const [processing, setProcessing] = useState(false);

    // Simulation: Text -> Tokens -> Vectors
    const processEmbedding = React.useCallback(async () => {
        setProcessing(true);
        setTokens([]);
        setVectors([]);

        // 1. Tokenize (Simulated)
        const rawTokens = input.trim().split(/\s+/).filter(Boolean);

        // Simulate staggered processing
        for (let i = 0; i < rawTokens.length; i++) {
            await new Promise(r => setTimeout(r, 200)); // Delay per token
            setTokens(prev => [...prev, rawTokens[i]]);

            // 2. Vectorize (Simulated)
            const mockVector = Array.from({ length: 3 }, () => parseFloat(Math.random().toFixed(3)));
            setVectors(prev => [...prev, mockVector]);
        }

        setProcessing(false);
    }, [input]);

    useEffect(() => {
        processEmbedding();
    }, [processEmbedding]);

    return (
        <div className="space-y-8">

            {/* Input Section */}
            <GlassPanel className="p-6">
                <label className="text-xs font-mono uppercase tracking-widest text-[#bef264] mb-3 block">
                    Input_Text_Stream
                </label>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 bg-black border border-slate-800 p-4 text-white font-mono focus:border-[#bef264] outline-none transition-colors"
                        placeholder="Type something to embed..."
                    />
                    <button
                        onClick={processEmbedding}
                        disabled={processing}
                        className="px-6 bg-[#bef264] text-black font-bold uppercase tracking-widest hover:bg-[#bef264]/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                        Embed
                    </button>
                </div>
            </GlassPanel>

            {/* Visualization Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start relative">

                {/* Stage 1: Tokens */}
                <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500">Stage_1: Tokenization</h3>
                    <div className="flex flex-wrap gap-2 min-h-[100px] content-start">
                        <AnimatePresence>
                            {tokens.map((token, idx) => (
                                <motion.div
                                    key={`${token}-${idx}`}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="px-3 py-2 bg-slate-800 text-slate-200 font-mono text-sm border border-slate-700"
                                >
                                    {token}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Arrow Connector (Desktop) */}
                <div className="hidden lg:flex absolute left-1/2 top-10 -translate-x-1/2 text-slate-700">
                    <ArrowRight className="w-8 h-8 opacity-50" />
                </div>

                {/* Stage 2: Vectors */}
                <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500">Stage_2: Vectorization</h3>
                    <div className="flex flex-col gap-2 min-h-[100px]">
                        <AnimatePresence>
                            {vectors.map((vec, idx) => (
                                <motion.div
                                    key={`vec-${idx}`}
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="font-mono text-xs text-[#bef264] flex items-center gap-2"
                                >
                                    <span className="text-slate-600 w-8">#{idx}:</span>
                                    [{vec.join(', ')}...]
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </div>
    );
}
