'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { Layers, ArrowDown, ArrowUp, Database, ChevronRight, RotateCcw, Search, PenLine } from 'lucide-react';

type AnimationMode = 'idle' | 'write' | 'read';

interface Step {
    memtable: number[];
    disk: number[][];
    target?: number;
    path?: string[];
    title: string;
    desc: string;
    color: string;
}

export function LSMAnimation() {
    const [mode, setMode] = useState<AnimationMode>('idle');
    const [stepIndex, setStepIndex] = useState(0);

    // WRITE animation steps
    const writeSteps: Step[] = [
        { memtable: [], disk: [], title: 'Initial State', desc: 'Empty database ready for writes', color: 'text-slate-400' },
        { memtable: [1, 2, 3, 4], disk: [], title: 'Step 1: Write to RAM', desc: 'Data written to Memtable (fast!)', color: 'text-[#bef264]' },
        { memtable: [], disk: [[1, 2, 3, 4]], title: 'Step 2: Flush to Disk', desc: 'Memtable → SSTable L0', color: 'text-blue-400' },
        { memtable: [5, 6], disk: [[1, 2, 3, 4]], title: 'Step 3: More Writes', desc: 'New data arrives in Memtable', color: 'text-purple-400' },
        { memtable: [], disk: [[1, 2, 3, 4], [5, 6]], title: 'Step 4: Second Flush', desc: 'Another SSTable created', color: 'text-orange-400' },
        { memtable: [], disk: [[1, 2, 3, 4, 5, 6]], title: 'Step 5: Compaction', desc: 'Merge into sorted L1', color: 'text-rose-400' },
    ];

    // READ animation steps  
    const readSteps: Step[] = [
        { memtable: [7, 8], disk: [[1, 2, 3, 4, 5, 6]], target: 3, path: [], title: 'Query Arrives', desc: 'Looking for key [3]', color: 'text-cyan-400' },
        { memtable: [7, 8], disk: [[1, 2, 3, 4, 5, 6]], target: 3, path: ['memtable'], title: 'Check Memtable', desc: 'Fastest lookup → MISS', color: 'text-yellow-400' },
        { memtable: [7, 8], disk: [[1, 2, 3, 4, 5, 6]], target: 3, path: ['memtable', 'l0'], title: 'Check L0', desc: 'No L0 segments → Skip', color: 'text-orange-400' },
        { memtable: [7, 8], disk: [[1, 2, 3, 4, 5, 6]], target: 3, path: ['memtable', 'l0', 'l1'], title: 'Check L1', desc: 'Found in compacted data → HIT!', color: 'text-green-400' },
        { memtable: [7, 8], disk: [[1, 2, 3, 4, 5, 6]], target: 3, path: ['memtable', 'l0', 'l1', 'return'], title: 'Return Value', desc: 'Value returned to client', color: 'text-[#bef264]' },
    ];

    const currentSteps = mode === 'write' ? writeSteps : mode === 'read' ? readSteps : [];
    const currentStep = currentSteps[stepIndex] || null;

    const selectMode = useCallback((newMode: AnimationMode) => {
        setMode(newMode);
        setStepIndex(0);
    }, []);

    const nextStep = useCallback(() => {
        if (stepIndex < currentSteps.length - 1) {
            setStepIndex(prev => prev + 1);
        }
    }, [stepIndex, currentSteps.length]);

    const prevStep = useCallback(() => {
        if (stepIndex > 0) {
            setStepIndex(prev => prev - 1);
        }
    }, [stepIndex]);

    const reset = useCallback(() => {
        setStepIndex(0);
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[450px]">
            {/* Control Panel */}
            <GlassPanel className="p-8 flex flex-col">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                    <Layers className="w-4 h-4 text-[#bef264]" />
                    LSM-Tree Architecture
                </h3>

                {/* Mode Selection */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => selectMode('write')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all flex-1 justify-center ${mode === 'write'
                                ? 'bg-[#bef264] text-black'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        <PenLine className="w-4 h-4" />
                        Write Path
                    </button>
                    <button
                        onClick={() => selectMode('read')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all flex-1 justify-center ${mode === 'read'
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                    >
                        <Search className="w-4 h-4" />
                        Read Path
                    </button>
                </div>

                {/* Step List - Clickable */}
                {mode !== 'idle' && (
                    <div className="flex-1 space-y-2 border-l border-slate-800 pl-4 ml-2">
                        {currentSteps.map((step, idx) => (
                            <button
                                key={idx}
                                onClick={() => setStepIndex(idx)}
                                className={`w-full text-left p-3 rounded transition-all ${stepIndex === idx
                                        ? 'bg-slate-800 border-l-2 border-[#bef264]'
                                        : 'hover:bg-slate-900 opacity-50 hover:opacity-80'
                                    }`}
                            >
                                <div className={`text-xs font-bold uppercase ${step.color}`}>
                                    {step.title}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-1">
                                    {step.desc}
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {mode === 'idle' && (
                    <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                        Select <span className="text-[#bef264] mx-1">Write</span> or <span className="text-blue-400 mx-1">Read</span> to explore
                    </div>
                )}

                {/* Navigation Controls */}
                {mode !== 'idle' && (
                    <div className="flex gap-2 mt-6 pt-4 border-t border-slate-800">
                        <button
                            onClick={prevStep}
                            disabled={stepIndex === 0}
                            className="flex-1 py-2 text-xs font-bold uppercase bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            ← Prev
                        </button>
                        <button
                            onClick={reset}
                            className="px-4 py-2 text-xs font-bold uppercase bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={nextStep}
                            disabled={stepIndex === currentSteps.length - 1}
                            className="flex-1 py-2 text-xs font-bold uppercase bg-[#bef264] text-black hover:bg-[#a8d84f] disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </GlassPanel>

            {/* Visualization Stage */}
            <GlassPanel className="p-6 relative bg-slate-900/50 flex flex-col items-center">
                {/* Query Badge for Read Mode */}
                {mode === 'read' && currentStep?.target && (
                    <motion.div
                        key="query-badge"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-2 right-4 bg-cyan-500/20 border border-cyan-500 px-3 py-1 rounded"
                    >
                        <span className="text-xs font-mono text-cyan-400">QUERY: key=[{currentStep.target}]</span>
                    </motion.div>
                )}

                {/* RAM Section */}
                <div className={`w-full flex-1 border border-dashed rounded-lg p-4 relative mb-10 transition-all duration-300 ${currentStep?.path?.includes('memtable') ? 'border-yellow-500 bg-yellow-500/5' : 'border-slate-700 bg-black/40'
                    }`}>
                    <span className="absolute -top-3 left-4 bg-[#bef264] text-black text-[10px] font-bold px-2 uppercase">
                        RAM (Memtable)
                    </span>
                    {currentStep?.path?.includes('memtable') && !currentStep?.path?.includes('l0') && (
                        <span className="absolute -top-3 right-4 bg-red-500 text-white text-[8px] font-bold px-2 uppercase animate-pulse">
                            MISS
                        </span>
                    )}

                    <div className="flex gap-2 flex-wrap min-h-[40px] items-center">
                        <AnimatePresence mode="popLayout">
                            {(currentStep?.memtable || []).map((item) => (
                                <motion.div
                                    key={`mem-${item}`}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ y: 60, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className={`w-10 h-10 rounded flex items-center justify-center font-bold text-sm ${currentStep?.target === item
                                            ? 'bg-cyan-500 text-white ring-2 ring-cyan-300'
                                            : 'bg-[#bef264] text-black'
                                        }`}
                                >
                                    {item}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {(currentStep?.memtable || []).length === 0 && (
                            <span className="text-slate-600 text-xs italic">Empty</span>
                        )}
                    </div>
                </div>

                {/* Arrow */}
                <div className="absolute top-[42%]">
                    {mode === 'write' && stepIndex === 2 && (
                        <ArrowDown className="w-8 h-8 text-blue-400 animate-bounce" />
                    )}
                    {mode === 'read' && currentStep?.path?.includes('return') && (
                        <ArrowUp className="w-8 h-8 text-green-400 animate-bounce" />
                    )}
                    {!(mode === 'write' && stepIndex === 2) && !(mode === 'read' && currentStep?.path?.includes('return')) && (
                        <ArrowDown className="w-8 h-8 text-slate-700" />
                    )}
                </div>

                {/* Disk Section */}
                <div className={`w-full flex-1 border rounded-lg p-4 relative mt-2 transition-all duration-300 ${currentStep?.path?.includes('l1') ? 'border-green-500 bg-green-500/5' :
                        currentStep?.path?.includes('l0') ? 'border-orange-500 bg-orange-500/5' :
                            'border-slate-700 bg-black/80'
                    }`}>
                    <span className="absolute -top-3 left-4 bg-blue-500 text-white text-[10px] font-bold px-2 uppercase">
                        Disk (SSTable)
                    </span>

                    <div className="space-y-2 min-h-[80px]">
                        <AnimatePresence mode="popLayout">
                            {(currentStep?.disk || []).map((segment, idx) => {
                                const isL1 = segment.length > 4;
                                const levelLabel = isL1 ? 'L1' : `L0-${idx}`;
                                const hasHit = currentStep?.path?.includes('l1') && isL1 && segment.includes(currentStep?.target || -1);

                                return (
                                    <motion.div
                                        key={`disk-${segment.join(',')}`}
                                        initial={{ opacity: 0, scaleX: 0 }}
                                        animate={{ opacity: 1, scaleX: 1 }}
                                        exit={{ opacity: 0, scaleX: 0 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                        className={`w-full h-12 border rounded flex items-center gap-3 px-4 transition-all ${hasHit
                                                ? 'bg-green-500/20 border-green-500'
                                                : 'bg-slate-800 border-slate-600'
                                            }`}
                                    >
                                        <Database className={`w-4 h-4 ${hasHit ? 'text-green-400' : 'text-blue-400'}`} />
                                        <span className="text-[10px] font-bold text-slate-500 min-w-[30px]">{levelLabel}</span>
                                        <div className="flex gap-1 flex-wrap flex-1">
                                            {segment.map(i => (
                                                <span
                                                    key={i}
                                                    className={`text-xs px-2 py-0.5 rounded ${currentStep?.target === i && hasHit
                                                            ? 'bg-green-500 text-white font-bold'
                                                            : 'bg-slate-700 text-slate-300'
                                                        }`}
                                                >
                                                    {i}
                                                </span>
                                            ))}
                                        </div>
                                        {hasHit && (
                                            <span className="text-xs font-bold text-green-400 uppercase animate-pulse">HIT!</span>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                        {(currentStep?.disk || []).length === 0 && (
                            <span className="text-slate-600 text-xs italic">No segments on disk</span>
                        )}
                    </div>
                </div>

                {/* Return Value */}
                {mode === 'read' && currentStep?.path?.includes('return') && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute bottom-4 right-4 bg-green-500/20 border border-green-500 px-4 py-2 rounded"
                    >
                        <span className="text-sm font-mono text-green-400">✓ FOUND: [{currentStep.target}]</span>
                    </motion.div>
                )}

                {/* Step Indicator */}
                <div className="absolute bottom-4 left-4 text-[10px] font-mono text-slate-500">
                    {mode !== 'idle' && `Step ${stepIndex + 1} / ${currentSteps.length}`}
                </div>
            </GlassPanel>
        </div>
    );
}
