'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileImage, FileText, Music, Database } from 'lucide-react';
import { GlassPanel } from '@/components/shared/GlassPanel';

export function BridgeAnimation() {
    return (
        <GlassPanel className="w-full h-[450px] flex items-center justify-center p-6 bg-black/60 overflow-hidden">
            <div className="flex items-center gap-4 w-full max-w-6xl justify-between">

                {/* 1. Raw Data (Unstructured) */}
                <div className="flex flex-col gap-4 shrink-0">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-2">01_Unstructured</div>
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3 text-slate-400"
                    >
                        <div className="p-3 border border-slate-800 bg-slate-900/50">
                            <FileText className="w-6 h-6 text-rose-400" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-3 text-slate-400"
                    >
                        <div className="p-3 border border-slate-800 bg-slate-900/50">
                            <FileImage className="w-6 h-6 text-blue-400" />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-3 text-slate-400"
                    >
                        <div className="p-3 border border-slate-800 bg-slate-900/50">
                            <Music className="w-6 h-6 text-amber-400" />
                        </div>
                    </motion.div>
                </div>

                {/* CONNECTOR 1: Embedding Bridge */}
                <div className="relative flex-1 flex items-center justify-center min-w-[60px]">
                    <motion.div
                        animate={{
                            scale: [1, 1.02, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full h-[2px] bg-slate-800 relative overflow-hidden"
                    >
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-[#bef264] w-12 blur-sm"
                            animate={{ x: [-50, 200] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                    </motion.div>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span className="text-[9px] font-bold text-[#bef264] uppercase tracking-tighter opacity-70">Embed_Model</span>
                    </div>
                </div>

                {/* 2. Vectors (High-Dim Space) */}
                <div className="flex flex-col gap-3 shrink-0 items-center">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-2 text-center">02_Vectors</div>
                    <div className="p-4 border border-slate-800 bg-black/40 backdrop-blur-sm space-y-2 min-w-[140px]">
                        {[1, 2, 3].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 + (i * 0.2) }}
                                className="font-mono text-[9px] text-[#bef264] whitespace-nowrap overflow-hidden"
                            >
                                [{(i * 0.12).toFixed(2)}, {(i * 0.45).toFixed(2)}, -{(i * 0.78).toFixed(2)}...]
                            </motion.div>
                        ))}
                    </div>
                    <div className="text-[9px] font-mono text-slate-600 uppercase mt-1">High-Dim_Space</div>
                </div>

                {/* CONNECTOR 2: Storage Bridge */}
                <div className="relative flex-1 flex items-center justify-center min-w-[60px]">
                    <motion.div
                        animate={{
                            scale: [1, 1.02, 1],
                            opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="w-full h-[2px] bg-slate-800 relative overflow-hidden"
                    >
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-blue-400 w-12 blur-sm"
                            animate={{ x: [-50, 200] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 1 }}
                        />
                    </motion.div>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter opacity-70">Indexing</span>
                    </div>
                </div>

                {/* 3. Vector DB */}
                <div className="flex flex-col gap-4 shrink-0 items-end">
                    <div className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em] mb-2 text-right">03_Vector_DB</div>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.5, type: "spring", stiffness: 100 }}
                        className="relative"
                    >
                        <GlassPanel className="p-6 border-[#bef264]/30 bg-[#bef264]/5 relative group overflow-hidden">
                            <Database className="w-12 h-12 text-[#bef264] relative z-10" />
                            <motion.div
                                className="absolute inset-0 bg-[#bef264]/10"
                                animate={{ opacity: [0, 0.2, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </GlassPanel>

                        {/* Decorative Particles */}
                        <div className="absolute -top-2 -right-2 w-2 h-2 bg-[#bef264] rounded-full blur-[2px] animate-pulse" />
                        <div className="absolute -bottom-2 -left-2 w-1.5 h-1.5 bg-blue-400 rounded-full blur-[1px] animate-pulse" />
                    </motion.div>
                    <div className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.1em] text-right mt-2">
                        Atomic_Kernel_VDB
                    </div>
                </div>

            </div>
        </GlassPanel>
    );
}
