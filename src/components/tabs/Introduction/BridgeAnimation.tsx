'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileImage, FileText, Music } from 'lucide-react';
import { GlassPanel } from '@/components/shared/GlassPanel';

export function BridgeAnimation() {
    return (
        <GlassPanel className="w-full h-[400px] flex items-center justify-center p-8 bg-black/60">
            <div className="flex items-center gap-12 max-w-4xl w-full justify-between">

                {/* LEFT: Raw Data (Unstructured) */}
                <div className="flex flex-col gap-6">
                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-4 text-slate-400"
                    >
                        <div className="p-4 border border-slate-700 bg-slate-900/50">
                            <FileText className="w-8 h-8 text-rose-400" />
                        </div>
                        <div className="text-xs font-mono uppercase tracking-widest">Unstructured_Text</div>
                    </motion.div>

                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center gap-4 text-slate-400"
                    >
                        <div className="p-4 border border-slate-700 bg-slate-900/50">
                            <FileImage className="w-8 h-8 text-blue-400" />
                        </div>
                        <div className="text-xs font-mono uppercase tracking-widest">Raw_Pixels</div>
                    </motion.div>

                    <motion.div
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-4 text-slate-400"
                    >
                        <div className="p-4 border border-slate-700 bg-slate-900/50">
                            <Music className="w-8 h-8 text-amber-400" />
                        </div>
                        <div className="text-xs font-mono uppercase tracking-widest">Audio_Waveforms</div>
                    </motion.div>
                </div>

                {/* MIDDLE: The Bridge (Embedding Model) */}
                <div className="relative flex-1 flex items-center justify-center px-8">
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            borderColor: ['#334155', '#bef264', '#334155']
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full h-1 bg-slate-700 relative overflow-hidden"
                    >
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-[#bef264] w-20 blur-md"
                            animate={{ x: [-100, 400] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                    </motion.div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-[#bef264] px-4 py-2 z-10">
                        <span className="text-xs font-black text-[#bef264] uppercase tracking-widest">Embedding_Model</span>
                    </div>
                </div>

                {/* RIGHT: Vectors (Structured) */}
                <div className="flex flex-col gap-4">
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.8 + (i * 0.2) }}
                            className="font-mono text-xs text-[#bef264]"
                        >
                            [0.{(i * 123) % 9}, 0.{(i * 456) % 9}, -0.{(i * 789) % 9}...]
                        </motion.div>
                    ))}
                    <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mt-2 text-right">High-Dim_Space</div>
                </div>

            </div>
        </GlassPanel>
    );
}
