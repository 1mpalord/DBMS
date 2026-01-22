'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { Layers, ArrowDown, ArrowUp, Database, Play, RotateCcw, Search } from 'lucide-react';

type AnimationMode = 'idle' | 'write' | 'read';

export function LSMAnimation() {
    const [mode, setMode] = useState<AnimationMode>('idle');
    const [step, setStep] = useState(0);
    const [isLooping, setIsLooping] = useState(false);
    const [memtable, setMemtable] = useState<number[]>([]);
    const [diskSegments, setDiskSegments] = useState<number[][]>([]);
    const [readTarget, setReadTarget] = useState<number | null>(null);
    const [readPath, setReadPath] = useState<string[]>([]);

    // WRITE animation steps
    const writeSteps = [
        { memtable: [1, 2, 3, 4], disk: [], desc: 'Writing to Memtable' },
        { memtable: [], disk: [[1, 2, 3, 4]], desc: 'Flushing to SSTable L0' },
        { memtable: [5, 6], disk: [[1, 2, 3, 4]], desc: 'New writes arrive' },
        { memtable: [], disk: [[1, 2, 3, 4], [5, 6]], desc: 'Second flush to L0' },
        { memtable: [], disk: [[1, 2, 3, 4, 5, 6]], desc: 'Compaction to L1' },
    ];

    // READ animation steps
    const readSteps = [
        { target: 3, path: ['query'], desc: 'Query arrives for key [3]' },
        { target: 3, path: ['query', 'memtable'], desc: 'Check Memtable first (MISS)' },
        { target: 3, path: ['query', 'memtable', 'l0'], desc: 'Check L0 SSTable (MISS)' },
        { target: 3, path: ['query', 'memtable', 'l0', 'l1'], desc: 'Check L1 SSTable (HIT!)' },
        { target: 3, path: ['query', 'memtable', 'l0', 'l1', 'return'], desc: 'Return value to client' },
    ];

    // Animation loop controller
    useEffect(() => {
        if (mode === 'idle') return;

        const maxSteps = mode === 'write' ? writeSteps.length : readSteps.length;

        const timer = setInterval(() => {
            setStep(prev => {
                const next = prev + 1;

                if (next >= maxSteps) {
                    if (isLooping) {
                        return 0; // Loop back
                    } else {
                        setMode('idle');
                        return 0;
                    }
                }
                return next;
            });
        }, 2000);

        return () => clearInterval(timer);
    }, [mode, isLooping]);

    // Apply step state changes
    useEffect(() => {
        if (mode === 'write' && writeSteps[step]) {
            const s = writeSteps[step];
            setMemtable(s.memtable);
            setDiskSegments(s.disk);
            setReadTarget(null);
            setReadPath([]);
        } else if (mode === 'read' && readSteps[step]) {
            const s = readSteps[step];
            setReadTarget(s.target);
            setReadPath(s.path);
            // Set up initial state for read demo
            setMemtable([7, 8]);
            setDiskSegments([[1, 2, 3, 4, 5, 6]]);
        }
    }, [mode, step]);

    const startWrite = useCallback(() => {
        setStep(0);
        setMemtable([]);
        setDiskSegments([]);
        setReadTarget(null);
        setReadPath([]);
        setMode('write');
    }, []);

    const startRead = useCallback(() => {
        setStep(0);
        setMemtable([7, 8]);
        setDiskSegments([[1, 2, 3, 4, 5, 6]]);
        setReadTarget(null);
        setReadPath([]);
        setMode('read');
    }, []);

    const getStepDescription = () => {
        if (mode === 'write' && writeSteps[step]) return writeSteps[step].desc;
        if (mode === 'read' && readSteps[step]) return readSteps[step].desc;
        return 'Click a button to start animation';
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[450px]">
            {/* Description Panel */}
            <GlassPanel className="p-8 flex flex-col justify-between">
                <div className="space-y-4">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#bef264]" />
                        LSM-Tree Architecture
                    </h3>

                    {/* Control Buttons */}
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={startWrite}
                            disabled={mode !== 'idle'}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${mode === 'write'
                                    ? 'bg-[#bef264] text-black'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                } ${mode !== 'idle' && mode !== 'write' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <ArrowDown className="w-4 h-4" />
                            Write Path
                        </button>
                        <button
                            onClick={startRead}
                            disabled={mode !== 'idle'}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${mode === 'read'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                } ${mode !== 'idle' && mode !== 'read' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Search className="w-4 h-4" />
                            Read Path
                        </button>
                        <button
                            onClick={() => setIsLooping(!isLooping)}
                            className={`flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all ${isLooping
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                        >
                            <RotateCcw className={`w-4 h-4 ${isLooping ? 'animate-spin' : ''}`} />
                            {isLooping ? 'Looping' : 'Loop'}
                        </button>
                    </div>
                </div>

                {/* Step Descriptions */}
                <div className="space-y-6 relative border-l border-slate-800 pl-6 ml-2 mt-6">
                    {mode === 'write' && (
                        <>
                            <div className={`transition-opacity duration-300 ${step === 0 ? 'opacity-100' : 'opacity-30'}`}>
                                <h4 className="text-xs font-bold text-[#bef264] uppercase mb-1">Step 1: In-Memory Write</h4>
                                <p className="text-sm text-slate-400">Data → <span className="text-white">Memtable</span> (RAM)</p>
                            </div>
                            <div className={`transition-opacity duration-300 ${step === 1 ? 'opacity-100' : 'opacity-30'}`}>
                                <h4 className="text-xs font-bold text-blue-400 uppercase mb-1">Step 2: Flush to Disk</h4>
                                <p className="text-sm text-slate-400">Memtable → <span className="text-white">SSTable L0</span></p>
                            </div>
                            <div className={`transition-opacity duration-300 ${step === 2 || step === 3 ? 'opacity-100' : 'opacity-30'}`}>
                                <h4 className="text-xs font-bold text-purple-400 uppercase mb-1">Step 3: Accumulation</h4>
                                <p className="text-sm text-slate-400">More flushes create overlapping segments</p>
                            </div>
                            <div className={`transition-opacity duration-300 ${step === 4 ? 'opacity-100' : 'opacity-30'}`}>
                                <h4 className="text-xs font-bold text-rose-400 uppercase mb-1">Step 4: Compaction</h4>
                                <p className="text-sm text-slate-400">Merge into sorted L1 segment</p>
                            </div>
                        </>
                    )}
                    {mode === 'read' && (
                        <>
                            <div className={`transition-opacity duration-300 ${step === 0 ? 'opacity-100' : 'opacity-30'}`}>
                                <h4 className="text-xs font-bold text-cyan-400 uppercase mb-1">Step 1: Query Arrives</h4>
                                <p className="text-sm text-slate-400">Looking for key <span className="text-white">[3]</span></p>
                            </div>
                            <div className={`transition-opacity duration-300 ${step === 1 ? 'opacity-100' : 'opacity-30'}`}>
                                <h4 className="text-xs font-bold text-yellow-400 uppercase mb-1">Step 2: Check Memtable</h4>
                                <p className="text-sm text-slate-400">Fastest lookup → <span className="text-red-400">MISS</span></p>
                            </div>
                            <div className={`transition-opacity duration-300 ${step === 2 ? 'opacity-100' : 'opacity-30'}`}>
                                <h4 className="text-xs font-bold text-orange-400 uppercase mb-1">Step 3: Check L0</h4>
                                <p className="text-sm text-slate-400">Newest on-disk → <span className="text-red-400">MISS</span></p>
                            </div>
                            <div className={`transition-opacity duration-300 ${step >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                                <h4 className="text-xs font-bold text-green-400 uppercase mb-1">Step 4: Check L1</h4>
                                <p className="text-sm text-slate-400">Compacted data → <span className="text-[#bef264]">HIT!</span></p>
                            </div>
                        </>
                    )}
                    {mode === 'idle' && (
                        <div className="text-slate-500 text-sm italic">
                            Click <span className="text-[#bef264]">Write Path</span> or <span className="text-blue-400">Read Path</span> to see the animation.
                        </div>
                    )}
                </div>

                {/* Current Step Indicator */}
                <div className="mt-6 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <Play className={`w-4 h-4 ${mode !== 'idle' ? 'text-[#bef264] animate-pulse' : 'text-slate-600'}`} />
                        <span className="text-sm font-mono text-slate-300">{getStepDescription()}</span>
                    </div>
                </div>
            </GlassPanel>

            {/* Animation Stage */}
            <GlassPanel className="p-6 relative bg-slate-900/50 flex flex-col items-center">
                {/* Query Indicator (for Read mode) */}
                {mode === 'read' && readTarget !== null && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-2 right-4 bg-cyan-500/20 border border-cyan-500 px-3 py-1 rounded"
                    >
                        <span className="text-xs font-mono text-cyan-400">QUERY: key=[{readTarget}]</span>
                    </motion.div>
                )}

                {/* RAM Section */}
                <div className={`w-full flex-1 border border-dashed rounded-lg p-4 relative mb-10 transition-all duration-300 ${readPath.includes('memtable') ? 'border-yellow-500 bg-yellow-500/5' : 'border-slate-700 bg-black/40'
                    }`}>
                    <span className="absolute -top-3 left-4 bg-[#bef264] text-black text-[10px] font-bold px-2 uppercase">
                        RAM (Memtable)
                    </span>
                    {readPath.includes('memtable') && !readPath.includes('l0') && (
                        <span className="absolute -top-3 right-4 bg-red-500 text-white text-[8px] font-bold px-2 uppercase animate-pulse">
                            MISS
                        </span>
                    )}

                    <div className="flex gap-2 flex-wrap min-h-[40px]">
                        <AnimatePresence>
                            {memtable.map((item) => (
                                <motion.div
                                    key={`mem-${item}`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ y: 80, opacity: 0 }}
                                    className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs ${readTarget === item
                                            ? 'bg-cyan-500 text-white ring-2 ring-cyan-300'
                                            : 'bg-[#bef264] text-black'
                                        }`}
                                >
                                    {item}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Arrow Indicator */}
                {mode === 'write' && step === 1 && (
                    <ArrowDown className="w-8 h-8 text-blue-400 absolute top-[40%] animate-bounce" />
                )}
                {mode === 'read' && (
                    <ArrowUp className={`w-8 h-8 absolute top-[40%] transition-colors ${readPath.includes('return') ? 'text-green-400 animate-bounce' : 'text-slate-600'
                        }`} />
                )}

                {/* Disk Section */}
                <div className={`w-full flex-1 border rounded-lg p-4 relative mt-2 transition-all duration-300 ${readPath.includes('l0') || readPath.includes('l1') ? 'border-blue-500 bg-blue-500/5' : 'border-slate-700 bg-black/80'
                    }`}>
                    <span className="absolute -top-3 left-4 bg-blue-500 text-white text-[10px] font-bold px-2 uppercase">
                        Disk (SSTable)
                    </span>

                    <div className="space-y-2 min-h-[60px]">
                        <AnimatePresence>
                            {diskSegments.map((segment, idx) => {
                                const isL1 = segment.length > 4;
                                const levelLabel = isL1 ? 'L1' : `L0-${idx}`;
                                const isSearching = (readPath.includes('l0') && !isL1) || (readPath.includes('l1') && isL1);
                                const hasHit = readPath.includes('l1') && isL1 && segment.includes(readTarget || -1);

                                return (
                                    <motion.div
                                        key={`disk-${idx}-${segment.join(',')}`}
                                        initial={{ opacity: 0, scaleX: 0 }}
                                        animate={{ opacity: 1, scaleX: 1 }}
                                        className={`w-full h-10 border rounded flex items-center gap-2 px-3 transition-all ${hasHit
                                                ? 'bg-green-500/20 border-green-500'
                                                : isSearching
                                                    ? 'bg-orange-500/10 border-orange-500'
                                                    : 'bg-slate-800 border-slate-600'
                                            }`}
                                    >
                                        <Database className={`w-3 h-3 ${hasHit ? 'text-green-400' : 'text-blue-400'}`} />
                                        <span className="text-[9px] font-bold text-slate-500 mr-2">{levelLabel}</span>
                                        <div className="flex gap-1 flex-wrap">
                                            {segment.map(i => (
                                                <span
                                                    key={i}
                                                    className={`text-[10px] px-1 rounded ${readTarget === i && hasHit
                                                            ? 'bg-green-500 text-white font-bold animate-pulse'
                                                            : 'text-slate-400'
                                                        }`}
                                                >
                                                    [{i}]
                                                </span>
                                            ))}
                                        </div>
                                        {hasHit && (
                                            <span className="ml-auto text-[8px] font-bold text-green-400 uppercase">HIT!</span>
                                        )}
                                        {isSearching && !hasHit && readPath.includes('l0') && !isL1 && (
                                            <span className="ml-auto text-[8px] font-bold text-red-400 uppercase">MISS</span>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Return Value Indicator */}
                {mode === 'read' && readPath.includes('return') && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute bottom-4 right-4 bg-green-500/20 border border-green-500 px-4 py-2 rounded"
                    >
                        <span className="text-sm font-mono text-green-400">✓ RETURNED: value=[{readTarget}]</span>
                    </motion.div>
                )}
            </GlassPanel>
        </div>
    );
}
