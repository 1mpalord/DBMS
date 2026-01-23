'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sigma, Scale, Calculator, BrainCircuit } from 'lucide-react';

interface FormulaOverlayProps {
    visible: boolean;
    mode: 'semantic' | 'lexical' | 'hybrid';
    query: string;
    alpha?: number;
    onComplete: () => void;
    searchResults?: any[];
    queryVector?: number[] | null;
    indexDimensions?: number;
}

export const FormulaOverlay: React.FC<FormulaOverlayProps> = ({
    visible,
    mode,
    query,
    alpha = 0.5,
    onComplete,
    searchResults,
    queryVector,
    indexDimensions
}) => {
    const [step, setStep] = useState(0);

    // Generate stable random values for visualization to prevent hydration mismatch/impurity
    const randomStats = React.useMemo(() => ({
        tf: Array.from({ length: 10 }, () => Math.random()),
        idf: Array.from({ length: 10 }, () => Math.random()),
        vectors: Array.from({ length: 16 }, () => Math.random()),
        lexical: Math.random()
    }), [query, mode]); // Change randoms only when input changes

    // Reset step to 0 whenever the search overlay is triggered
    React.useEffect(() => {
        if (visible) {
            setStep(0);
        }
    }, [visible]);

    if (!visible) return null;

    const tokens = query.split(' ').filter(t => t.length > 0);
    const maxSteps = 3;

    const handleNext = () => {
        // ALWAYS allow navigation to prevent "stuck" UI; Step 2 will use dummy data if needed
        if (step === maxSteps) {
            onComplete();
        } else {
            setStep(s => s + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(s => s - 1);
    };

    // Concrete Vector Samples for Step 2
    const sampleQ = queryVector
        ? `[${queryVector.slice(0, 3).map(v => v.toFixed(2)).join(', ')}, ...]`
        : '[0.12, -0.45, 0.88, ...]';

    // Attempt to get real vector data from results if possible
    const sampleD = searchResults?.[0]?.metadata?.vector
        ? `[${searchResults[0].metadata.vector.slice(0, 3).map((v: number) => v.toFixed(2)).join(', ')}, ...]`
        : '[0.09, -0.41, 0.76, ...]';

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#020617]/95 backdrop-blur-2xl pointer-events-auto overflow-hidden" >
            {/* Cyberpunk Scanlines */}
            < div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none" >
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
            </div >

            <div className="w-full max-w-4xl p-8 relative flex flex-col items-center">

                {/* Steps Progress HUD */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-20 flex gap-3 items-center">
                    {[0, 1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center gap-1">
                            <div className={`h-1 duration-500 rounded-full ${step >= s ? 'w-12 bg-[#bef264] shadow-[0_0_10px_#bef264]' : 'w-8 bg-slate-800'}`} />
                            {s < 3 && <div className="text-[8px] font-mono text-slate-700 select-none">{">>"}</div>}
                        </div>
                    ))}
                </div>

                <div className="w-full min-h-[400px] flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {/* STEP 0: TOKENIZATION */}
                        {step === 0 && (
                            <motion.div
                                key="tokenize"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                                className="flex flex-col items-center gap-8"
                            >
                                <div className="space-y-2 text-center">
                                    <h3 className="text-sm font-mono text-slate-500 tracking-[0.4em] uppercase">SYSTEM_DECONSTRUCTION</h3>
                                    <p className="text-xs text-slate-600 font-mono italic">Parsing query sequence into semantic atoms...</p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-4">
                                    {tokens.map((token, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="px-6 py-3 bg-black/40 border border-white/10 text-[#bef264] font-mono text-xl rounded shadow-[0_0_30px_rgba(190,242,100,0.05)]"
                                        >
                                            &quot;{token.toUpperCase()}&quot;
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 1: EMBEDDING GENERATION / TERM ANALYSIS */}
                        {step === 1 && (
                            <motion.div
                                key="embedding"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, filter: 'blur(10px)' }}
                                className="flex flex-col items-center gap-8 w-full max-w-2xl"
                            >
                                <div className="flex items-center gap-3 text-[#bef264]">
                                    <BrainCircuit className="w-5 h-5 animate-pulse" />
                                    <span className="font-mono text-xs tracking-[0.3em] uppercase">
                                        {mode === 'lexical' ? 'Keyword_Weight_Analysis' : 'Vector_Embedding_Active'}
                                    </span>
                                </div>

                                <div className="w-full p-6 bg-black/40 border border-[#bef264]/20 rounded font-mono text-[10px] space-y-4">
                                    <div className="flex justify-between border-b border-white/5 pb-2">
                                        <span className="text-slate-500 uppercase">
                                            {mode === 'lexical' ? 'Sparse_Vector_Map' : 'Neural_Layer_Projection'}
                                        </span>
                                        <span className="text-[#bef264]">
                                            {mode === 'lexical' ? `${tokens.length} KEYWORDS` : `${indexDimensions || '384'} DIMS`}
                                        </span>
                                    </div>

                                    {mode === 'lexical' ? (
                                        <div className="space-y-3">
                                            {tokens.map((token, i) => (
                                                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-1 last:border-0 opacity-80">
                                                    <div className="flex gap-4">
                                                        <span className="text-slate-600">TOKEN_{i.toString().padStart(2, '0')}</span>
                                                        <span className="text-white">&quot;{token.toLowerCase()}&quot;</span>
                                                    </div>
                                                    <div className="flex gap-4 text-[#bef264]">
                                                        <span>TF: {(0.5 + randomStats.tf[i % 10] * 0.5).toFixed(2)}</span>
                                                        <span>IDF: {(1.2 + randomStats.idf[i % 10] * 2.5).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="text-center pt-2 text-[#bef264] text-[8px] tracking-[0.2em] font-black opacity-50 uppercase italic">
                                                [ Statistical_Weights_Computed ]
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-4 gap-2 text-slate-400 opacity-40 relative overflow-hidden">
                                            {/* Static/Dummy Visualization for immediate feedback */}
                                            {Array.from({ length: 16 }).map((_, i) => (
                                                <div key={i} className="flex gap-1 animate-pulse" style={{ animationDelay: `${i * 0.05}s` }}>
                                                    <span className="text-slate-700">{i.toString().padStart(2, '0')}</span>
                                                    <span className="text-[#bef264]/60">{(randomStats.vectors[i] * 2 - 1).toFixed(4)}</span>
                                                </div>
                                            ))}
                                            <div className="col-span-4 text-center pt-4 text-slate-500 text-[8px] tracking-[0.3em] uppercase italic">
                                                [ Neural_Projection_Simulated ]
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: CALCULATION */}
                        {step === 2 && (
                            <motion.div
                                key="calc"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex flex-col items-center gap-8 w-full"
                            >
                                <div className="space-y-2 text-center mb-4">
                                    <h3 className="text-xs font-mono text-[#bef264] tracking-[0.4em] uppercase">
                                        Logic_Protocol: {mode.toUpperCase()}
                                    </h3>
                                </div>

                                <div className="bg-black/60 border border-white/5 p-10 rounded-xl w-full max-w-3xl relative">
                                    {mode === 'lexical' && (
                                        <div className="space-y-8 text-center font-mono">
                                            <div className="flex items-center justify-center gap-4 text-3xl flex-wrap">
                                                <span className="text-white">score</span>
                                                <span className="text-slate-600">=</span>
                                                <span className="text-slate-400">Σ IDF(t) · </span>
                                                <span className="text-[#bef264]">f(t, d)</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 space-y-1 bg-black/40 p-4 rounded border border-white/5">
                                                <p className="tracking-widest opacity-50"># BM25_CALCULATION_ENGINE</p>
                                                <p className="text-[#bef264]/80">INPUT_MATCH: &quot;{tokens[0] || 'term'}&quot; → TF: 1.42 | IDF: 2.88</p>
                                            </div>
                                        </div>
                                    )}

                                    {mode === 'semantic' && (
                                        <div className="space-y-8 font-mono">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="flex items-center justify-center gap-4 text-sm md:text-base flex-wrap">
                                                    <span className="px-3 py-1 bg-[#bef264]/10 border border-[#bef264]/30 text-[#bef264] rounded">
                                                        {sampleQ}
                                                    </span>
                                                    <span className="text-[#bef264] text-xl">·</span>
                                                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded">
                                                        {sampleD}
                                                    </span>
                                                    <span className="text-slate-600 text-xl">=</span>
                                                    <span className="text-[#bef264] text-xl font-bold bg-[#bef264]/10 px-4 py-1 border border-[#bef264]/50 rounded shadow-[0_0_15px_rgba(190,242,100,0.2)]">
                                                        {(searchResults?.[0]?.score || 0.8924).toFixed(4)}
                                                    </span>
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-bold tracking-widest flex items-center gap-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className="border-b border-slate-700 pb-1 px-4">A · B</span>
                                                        <span className="pt-1 px-4">||A|| ||B||</span>
                                                    </div>
                                                    <span className="text-slate-600">=</span>
                                                    <span className="text-[#bef264]/80">cos(θ)</span>
                                                </div>
                                            </div>

                                            <div className="text-center pt-3 opacity-30">
                                                <p className="text-[7px] text-slate-600 tracking-widest italic uppercase">Calculation_Model: Cosine_Normalized_Dot_Product</p>
                                            </div>
                                        </div>
                                    )}

                                    {mode === 'hybrid' && (
                                        <div className="space-y-6 text-center font-mono">
                                            <div className="grid grid-cols-3 items-center gap-4 opacity-80">
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="text-[10px] text-blue-400">SEMANTIC_SCORE</span>
                                                    <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs rounded">
                                                        {(searchResults?.[0]?.score || 0.88).toFixed(4)}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-slate-600 text-xs px-2 py-1 bg-white/5 rounded">WEIGHTED_FUSION</span>
                                                    <div className="h-px bg-white/10 w-full my-2" />
                                                    <span className="text-[10px] text-slate-500">α = {alpha.toFixed(2)}</span>
                                                </div>
                                                <div className="flex flex-col items-start gap-2">
                                                    <span className="text-[10px] text-[#bef264]">LEXICAL_SCORE</span>
                                                    <div className="px-3 py-1 bg-[#bef264]/10 border border-[#bef264]/30 text-[#bef264] text-xs rounded">
                                                        {(0.45 + randomStats.lexical * 0.3).toFixed(4)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-lg text-white pt-4 border-t border-white/5">
                                                <span className="text-slate-500">Final_Rank</span> =
                                                <span className="mx-2 text-blue-400">({alpha.toFixed(2)} · S)</span> +
                                                <span className="mx-2 text-[#bef264]">({(1 - alpha).toFixed(2)} · L)</span>
                                            </div>

                                            <p className="text-[9px] text-slate-600 uppercase tracking-widest italic pt-2"># COARSE_TO_FINE_RE-RANKING_PROTOCOL</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: RECONSTRUCTION */}
                        {step === 3 && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center"
                            >
                                <div className="text-[120px] font-black text-white/5 leading-none select-none tracking-tighter">
                                    TOP_K
                                </div>
                                <div className="absolute flex flex-col items-center gap-2">
                                    <div className="w-16 h-1 bg-[#bef264] mb-4 shadow-[0_0_20px_#bef264]" />
                                    <div className="text-[#bef264] font-mono text-xl tracking-[0.5em] uppercase">
                                        Protocol_Success
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mt-2 bg-black/40 px-3 py-1 rounded">
                                        Projecting {searchResults?.length || 0} relative neighbors...
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation HUD */}
                <div className="mt-20 flex items-center gap-12 pt-8 border-t border-white/5 pointer-events-auto">
                    <button
                        onClick={handleBack}
                        disabled={step === 0}
                        className={`px-8 py-3 rounded uppercase font-mono text-[10px] tracking-widest transition-all min-w-[120px] min-h-[44px] flex items-center justify-center gap-2 
                            ${step === 0 ? 'opacity-20 cursor-not-allowed grayscale' : 'bg-black/40 border border-white/10 text-slate-400 hover:text-white hover:border-white/30 cursor-pointer'}`}
                    >
                        <span>[</span> PREV <span>]</span>
                    </button>

                    <div className="text-[10px] font-mono text-slate-700 tracking-[0.5em] select-none">
                        {step + 1} / 4
                    </div>

                    <button
                        onClick={handleNext}
                        className="bg-[#bef264]/10 border border-[#bef264]/40 text-[#bef264] hover:bg-[#bef264]/20 hover:border-[#bef264] cursor-pointer shadow-[0_0_20px_rgba(190,242,100,0.1)] px-8 py-3 rounded uppercase font-mono text-[10px] tracking-widest transition-all min-w-[120px] min-h-[44px] flex items-center justify-center gap-2"
                    >
                        <span>[</span> {step === 3 ? 'FINISH' : 'NEXT'} <span>]</span>
                    </button>
                </div>

            </div>
        </div >
    );
};
