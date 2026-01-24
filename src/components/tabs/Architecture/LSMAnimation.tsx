'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { Layers, ArrowDown, ArrowUp, Database, ChevronRight, RotateCcw, Search, PenLine, Flame, RefreshCw, Activity } from 'lucide-react';

type AnimationMode = 'idle' | 'write' | 'read';

interface Step {
    memtable: number[];
    disk: number[][];
    wal: number[];
    target?: number;
    path?: string[];
    title: string;
    desc: string;
    color: string;
}

export function LSMAnimation() {
    const [mode, setMode] = useState<AnimationMode>('idle');
    const [stepIndex, setStepIndex] = useState(0);
    const [isCrashed, setIsCrashed] = useState(false);
    const [isRecovering, setIsRecovering] = useState(false);
    const [tempMemtable, setTempMemtable] = useState<number[]>([]);

    // WRITE animation steps (Updated with WAL-first theory)
    const writeSteps: Step[] = [
        { memtable: [], disk: [], wal: [], title: 'Initial State', desc: 'Empty database ready for writes', color: 'text-slate-400' },
        { memtable: [], disk: [], wal: [1, 2], title: 'Step 1.1: WAL Log', desc: 'DURABILITY FIRST: Append to WAL on disk', color: 'text-orange-400' },
        { memtable: [1, 2], disk: [], wal: [1, 2], title: 'Step 1.2: Memtable', desc: 'Data now safely in RAM after WAL sync', color: 'text-[#bef264]' },
        { memtable: [1, 2], disk: [], wal: [1, 2, 3, 4], title: 'Step 2.1: More WAL', desc: 'New batch hits Disk (WAL) first', color: 'text-orange-400' },
        { memtable: [1, 2, 3, 4], disk: [], wal: [1, 2, 3, 4], title: 'Step 2.2: Memtable Sync', desc: 'Memtable updated with new data', color: 'text-[#bef264]' },
        { memtable: [], disk: [[1, 2, 3, 4]], wal: [], title: 'Step 3: Flush & Purge', desc: 'Flush to SSTable + Purge WAL (durability shifts to L0)', color: 'text-blue-400' },
        { memtable: [], disk: [[1, 2, 3, 4], [5, 6]], wal: [], title: 'Step 4: Compaction', desc: 'Merge into sorted L1', color: 'text-rose-400' },
    ];

    // READ animation steps  
    const readSteps: Step[] = [
        { memtable: [7, 8], disk: [[1, 2, 3, 4, 5, 6]], wal: [], target: 3, path: [], title: 'Query Arrives', desc: 'Looking for key [3]', color: 'text-cyan-400' },
        { memtable: [7, 8], disk: [[1, 2, 3, 4, 5, 6]], wal: [], target: 3, path: ['memtable'], title: 'Check Memtable', desc: 'Fastest lookup → MISS', color: 'text-yellow-400' },
        { memtable: [7, 8], disk: [[1, 2, 3, 4, 5, 6]], wal: [], target: 3, path: ['memtable', 'l0'], title: 'Check L0', desc: 'No L0 segments → Skip', color: 'text-orange-400' },
        { memtable: [7, 8], disk: [[1, 2, 3, 4, 5, 6]], wal: [], target: 3, path: ['memtable', 'l0', 'l1'], title: 'Check L1', desc: 'Found in compacted data → HIT!', color: 'text-green-400' },
        { memtable: [7, 8], disk: [[1, 2, 3, 4, 5, 6]], wal: [], target: 3, path: ['memtable', 'l0', 'l1', 'return'], title: 'Return Value', desc: 'Value returned to client', color: 'text-[#bef264]' },
    ];

    const currentSteps = mode === 'write' ? writeSteps : mode === 'read' ? readSteps : [];
    const currentStep = currentSteps[stepIndex] || null;

    // Derived memtable to simulate crash
    const displayMemtable = isRecovering ? tempMemtable : (isCrashed ? [] : (currentStep?.memtable || []));

    const selectMode = useCallback((newMode: AnimationMode) => {
        setMode(newMode);
        setStepIndex(0);
        setIsCrashed(false);
        setIsRecovering(false);
    }, []);

    const nextStep = useCallback(() => {
        if (stepIndex < currentSteps.length - 1) {
            setStepIndex(prev => prev + 1);
            setIsCrashed(false);
            setIsRecovering(false);
        }
    }, [stepIndex, currentSteps.length]);

    const prevStep = useCallback(() => {
        if (stepIndex > 0) {
            setStepIndex(prev => prev - 1);
            setIsCrashed(false);
            setIsRecovering(false);
        }
    }, [stepIndex]);

    const reset = useCallback(() => {
        setStepIndex(0);
        setIsCrashed(false);
        setIsRecovering(false);
    }, []);

    const simulateCrash = () => {
        setIsCrashed(true);
        setIsRecovering(false);
    };

    const recoverData = () => {
        if (!isCrashed || !currentStep?.wal.length) return;
        setIsRecovering(true);
        setTempMemtable([]);

        // Sequential recovery animation logic
        const items = [...currentStep.wal];
        let i = 0;
        const interval = setInterval(() => {
            if (i < items.length) {
                setTempMemtable(prev => [...prev, items[i]]);
                i++;
            } else {
                clearInterval(interval);
                setIsRecovering(false);
                setIsCrashed(false);
            }
        }, 400);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[500px]">
            {/* Control Panel */}
            <GlassPanel className="p-8 flex flex-col">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                    <Layers className="w-4 h-4 text-[#bef264]" />
                    LSM-Tree + WAL Architecture
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

                {/* Step List */}
                {mode !== 'idle' && (
                    <div className="flex-1 space-y-2 border-l border-slate-800 pl-4 ml-2 overflow-y-auto max-h-[300px]">
                        {currentSteps.map((step, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setStepIndex(idx);
                                    setIsCrashed(false);
                                    setIsRecovering(false);
                                }}
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

                {/* Recovery Tools */}
                {mode === 'write' && currentStep && currentStep.wal.length > 0 && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-red-400 uppercase tracking-tighter">Disaster Recovery</span>
                                <span className="text-[9px] text-slate-500">Simulate losing RAM power</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={simulateCrash}
                                    disabled={isCrashed || isRecovering}
                                    className="p-2 bg-red-600 text-white rounded hover:bg-red-500 transition-all disabled:opacity-30"
                                    title="Simulate Crash"
                                >
                                    <Flame className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={recoverData}
                                    disabled={!isCrashed || isRecovering}
                                    className={`p-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-all disabled:opacity-30 ${isRecovering ? 'animate-spin' : ''}`}
                                    title="Recover from WAL"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
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
                <div className={`w-full flex-none border border-dashed rounded-lg p-4 relative mb-6 transition-all duration-300 ${isCrashed ? 'border-red-500 bg-red-950/20' :
                    isRecovering ? 'border-blue-500 bg-blue-500/5' :
                        currentStep?.path?.includes('memtable') ? 'border-yellow-500 bg-yellow-500/5' : 'border-slate-700 bg-black/40'
                    }`}>
                    <span className={`absolute -top-3 left-4 text-black text-[10px] font-bold px-2 uppercase transition-colors ${isCrashed ? 'bg-red-500' : 'bg-[#bef264]'
                        }`}>
                        RAM (Memtable)
                        {isCrashed && " - DATA LOST"}
                    </span>

                    <div className="flex gap-2 flex-wrap min-h-[40px] items-center">
                        <AnimatePresence mode="popLayout">
                            {displayMemtable.map((item, idx) => (
                                <motion.div
                                    key={`mem-${item}-${idx}`}
                                    initial={{ scale: 0, opacity: 0, y: isRecovering ? 40 : 0 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
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
                        {displayMemtable.length === 0 && !isRecovering && (
                            <span className="text-slate-600 text-xs italic">
                                {isCrashed ? 'Volatile storage cleared after crash' : 'Empty'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Disk Section - WAL + SSTables */}
                <div className="w-full flex-1 flex flex-col gap-4">
                    <div className="grid grid-cols-12 gap-3 h-full">
                        {/* WAL Column */}
                        <div className="col-span-4 border border-orange-500/30 bg-black/60 rounded-lg p-3 relative h-fit min-h-[120px]">
                            <span className="absolute -top-3 left-3 bg-orange-500 text-white text-[9px] font-black px-2 uppercase tracking-tight flex items-center gap-1">
                                <Activity className="w-3 h-3" /> Disk (WAL)
                            </span>

                            <div className="flex flex-col gap-1 mt-2">
                                <AnimatePresence mode="popLayout">
                                    {(currentStep?.wal || []).map((val, idx) => (
                                        <motion.div
                                            key={`wal-${val}-${idx}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded flex justify-between items-center"
                                        >
                                            <span className="text-[10px] font-mono text-orange-400">LOG APPEND</span>
                                            <span className="text-[10px] font-bold text-white">[{val}]</span>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {(currentStep?.wal || []).length === 0 && (
                                    <span className="text-slate-700 text-[10px] italic text-center mt-4">No active log</span>
                                )}
                            </div>
                        </div>

                        {/* SSTable Column */}
                        <div className={`col-span-8 border rounded-lg p-3 relative transition-all duration-300 ${currentStep?.path?.includes('l1') ? 'border-green-500 bg-green-500/5' :
                            currentStep?.path?.includes('l0') ? 'border-orange-500 bg-orange-500/5' :
                                'border-slate-700 bg-black/80'
                            }`}>
                            <span className="absolute -top-3 left-4 bg-blue-500 text-white text-[10px] font-bold px-2 uppercase">
                                Disk (SSTables)
                            </span>

                            <div className="space-y-2 min-h-[120px]">
                                <AnimatePresence mode="popLayout">
                                    {(currentStep?.disk || []).map((segment, idx) => {
                                        const isL1 = segment.length > 4;
                                        const levelLabel = isL1 ? 'L1' : `L0-${idx}`;
                                        const hasHit = currentStep?.path?.includes('l1') && isL1 && segment.includes(currentStep?.target || -1);

                                        return (
                                            <motion.div
                                                key={`disk-${segment.join(',')}-${idx}`}
                                                initial={{ opacity: 0, scaleX: 0 }}
                                                animate={{ opacity: 1, scaleX: 1 }}
                                                exit={{ opacity: 0, scaleX: 0 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                                className={`w-full h-10 border rounded flex items-center gap-2 px-3 transition-all ${hasHit
                                                    ? 'bg-green-500/20 border-green-500'
                                                    : 'bg-slate-800 border-slate-600'
                                                    }`}
                                            >
                                                <Database className={`w-3 h-3 ${hasHit ? 'text-green-400' : 'text-blue-400'}`} />
                                                <span className="text-[9px] font-bold text-slate-500 min-w-[25px]">{levelLabel}</span>
                                                <div className="flex gap-1 flex-wrap flex-1">
                                                    {segment.map((i, sIdx) => (
                                                        <span
                                                            key={`${i}-${sIdx}`}
                                                            className={`text-[10px] px-1.5 py-0.5 rounded ${currentStep?.target === i && hasHit
                                                                ? 'bg-green-500 text-white font-bold'
                                                                : 'bg-slate-700 text-slate-300'
                                                                }`}
                                                        >
                                                            {i}
                                                        </span>
                                                    ))}
                                                </div>
                                                {hasHit && (
                                                    <span className="text-[10px] font-bold text-green-400 uppercase animate-pulse">HIT!</span>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                                {(currentStep?.disk || []).length === 0 && (
                                    <div className="h-full flex items-center justify-center">
                                        <span className="text-slate-600 text-[10px] italic">No persistent SSTables</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Legend/Recovery Status */}
                {isRecovering && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-16 bg-blue-500/20 border border-blue-500 px-4 py-2 rounded-full flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                        <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">Replaying WAL into Memtable...</span>
                    </motion.div>
                )}

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
