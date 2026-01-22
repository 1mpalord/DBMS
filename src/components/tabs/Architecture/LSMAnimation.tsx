'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { Layers, ArrowDown, Database } from 'lucide-react';

export function LSMAnimation() {
    const [step, setStep] = useState(0);
    const [memtable, setMemtable] = useState<number[]>([]);
    const [diskSegments, setDiskSegments] = useState<number[][]>([]);

    // Animation Loop
    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => {
                const nextStep = (prev + 1) % 5;

                // Update specific states based on the *next* step directly
                if (nextStep === 0) {
                    setMemtable([]);
                    setDiskSegments([]);
                } else if (nextStep === 1) {
                    setMemtable([1, 2, 3, 4]);
                } else if (nextStep === 2) {
                    setMemtable([]);
                    setDiskSegments([[1, 2, 3, 4]]);
                } else if (nextStep === 3) {
                    setMemtable([5, 6]);
                    setDiskSegments([[1, 2, 3, 4], [5, 6]]);
                } else if (nextStep === 4) {
                    setMemtable([]);
                    setDiskSegments([[1, 2, 3, 4, 5, 6]]);
                }

                return nextStep;
            });
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[400px]">
            {/* Description Panel */}
            <GlassPanel className="p-8 flex flex-col justify-center space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#bef264]" />
                    Write_Path_Architecture
                </h3>

                <div className="space-y-6 relative border-l border-slate-800 pl-6 ml-2">
                    <div className={`transition-opacity duration-300 ${step === 1 ? 'opacity-100' : 'opacity-30'}`}>
                        <h4 className="text-xs font-bold text-[#bef264] uppercase mb-1">Step 1: In-Memory Write</h4>
                        <p className="text-sm text-slate-400">Data is first written to a mutable <span className="text-white">Memtable</span> (RAM) for speed.</p>
                    </div>
                    <div className={`transition-opacity duration-300 ${step === 2 ? 'opacity-100' : 'opacity-30'}`}>
                        <h4 className="text-xs font-bold text-blue-400 uppercase mb-1">Step 2: Flush to Disk</h4>
                        <p className="text-sm text-slate-400">When full, Memtable is flushed to an immutable <span className="text-white">SSTable</span> (L0) on disk.</p>
                    </div>
                    <div className={`transition-opacity duration-300 ${step === 3 ? 'opacity-100' : 'opacity-30'}`}>
                        <h4 className="text-xs font-bold text-purple-400 uppercase mb-1">Step 3: Accumulation</h4>
                        <p className="text-sm text-slate-400">New flushes create overlapping L0 segments. Reads become slower.</p>
                    </div>
                    <div className={`transition-opacity duration-300 ${step === 4 ? 'opacity-100' : 'opacity-30'}`}>
                        <h4 className="text-xs font-bold text-rose-400 uppercase mb-1">Step 4: Compaction / Merge</h4>
                        <p className="text-sm text-slate-400">Background process merges segments into a sorted, non-overlapping L1 segment.</p>
                    </div>
                </div>
            </GlassPanel>

            {/* Animation Stage */}
            <GlassPanel className="p-6 relative bg-slate-900/50 flex flex-col items-center">
                {/* RAM Section */}
                <div className="w-full flex-1 border border-dashed border-slate-700 bg-black/40 rounded-lg p-4 relative mb-12">
                    <span className="absolute -top-3 left-4 bg-[#bef264] text-black text-[10px] font-bold px-2 uppercase">RAM (Memtable)</span>

                    <div className="flex gap-2 flex-wrap">
                        <AnimatePresence>
                            {memtable.map((item) => (
                                <motion.div
                                    key={`mem-${item}`}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ y: 100, opacity: 0 }}
                                    className="w-8 h-8 bg-[#bef264] rounded flex items-center justify-center text-black font-bold text-xs"
                                >
                                    {item}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Flush Arrow */}
                <ArrowDown className={`w-8 h-8 text-slate-600 absolute top-[43%] transition-colors duration-300 ${step === 2 ? 'text-blue-400 animate-bounce' : ''}`} />

                {/* Disk Section */}
                <div className="w-full flex-1 border border-slate-700 bg-black/80 rounded-lg p-4 relative mt-4">
                    <span className="absolute -top-3 left-4 bg-blue-500 text-white text-[10px] font-bold px-2 uppercase">Disk (SSTable)</span>

                    <div className="space-y-2">
                        <AnimatePresence>
                            {diskSegments.map((segment, idx) => (
                                <motion.div
                                    key={`disk-${idx}`}
                                    initial={{ opacity: 0, scaleX: 0 }}
                                    animate={{ opacity: 1, scaleX: 1 }}
                                    className="w-full h-8 bg-slate-800 border border-slate-600 rounded flex items-center gap-2 px-2"
                                >
                                    <Database className="w-3 h-3 text-blue-400" />
                                    <div className="flex gap-1">
                                        {segment.map(i => (
                                            <span key={i} className="text-[10px] text-slate-400">[{i}]</span>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </GlassPanel>
        </div>
    );
}
