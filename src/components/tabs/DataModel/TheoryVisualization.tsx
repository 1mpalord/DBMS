'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Database, FileText, Binary, ArrowDown } from 'lucide-react';

export function TheoryVisualization() {
    return (
        <div className="w-full bg-black/20 border border-slate-800 rounded-lg p-8 relative overflow-hidden">
            <h4 className="text-center text-xs font-mono uppercase tracking-[0.2em] text-slate-500 mb-12">
                Two Ingestion Paths, One Destination
            </h4>

            <div className="grid grid-cols-2 gap-12 relative">
                {/* Vertical Divider */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-800 to-transparent" />

                {/* Path A: Integrated */}
                <div className="flex flex-col items-center space-y-8 z-10">
                    <div className="text-center space-y-2">
                        <span className="text-[10px] font-bold text-[#bef264] uppercase tracking-wider">Path A</span>
                        <h5 className="text-sm font-medium text-white">Integrated Embedding</h5>
                    </div>

                    {/* Input Box */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-40 bg-slate-900 border border-slate-700 p-3 rounded flex flex-col items-center gap-2 shadow-xl"
                    >
                        <div className="text-[9px] uppercase text-slate-500 font-mono">Text Input</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-300">
                            <FileText className="w-3 h-3 text-blue-400" />
                            ID + Text + Metadata
                        </div>
                    </motion.div>

                    {/* Arrow & Particle */}
                    <div className="relative h-12 flex flex-col items-center">
                        <ArrowDown className="text-slate-700 w-4 h-4" />
                        <motion.div
                            animate={{ y: [0, 48], opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 w-1 h-1 bg-blue-400 rounded-full"
                        />
                    </div>

                    {/* Inference Gear */}
                    <div className="relative group">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="bg-slate-900 border border-slate-700 p-3 rounded-full"
                        >
                            <Settings className="w-6 h-6 text-[#bef264]" />
                        </motion.div>
                        <div className="absolute -right-24 top-1/2 -translate-y-1/2 text-[9px] font-mono text-slate-500 whitespace-nowrap">
                            Pinecone Inference
                        </div>
                    </div>

                    {/* Arrow & Particle (Post-Inference) */}
                    <div className="relative h-12 flex flex-col items-center">
                        <ArrowDown className="text-slate-700 w-4 h-4" />
                        <motion.div
                            animate={{ y: [0, 48], opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                            className="absolute top-0 w-1 h-1 bg-[#bef264] rounded-full"
                        />
                    </div>
                </div>

                {/* Path B: BYO */}
                <div className="flex flex-col items-center space-y-8 z-10">
                    <div className="text-center space-y-2">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Path B</span>
                        <h5 className="text-sm font-medium text-white">Pre-generated Vectors</h5>
                    </div>

                    {/* Input Box */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="w-40 bg-slate-900 border border-slate-700 p-3 rounded flex flex-col items-center gap-2 shadow-xl"
                    >
                        <div className="text-[9px] uppercase text-slate-500 font-mono">Vector Input</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-300">
                            <Binary className="w-3 h-3 text-[#bef264]" />
                            ID + Vector + Metadata
                        </div>
                    </motion.div>

                    {/* Long Arrow for Path B */}
                    <div className="relative h-[124px] flex flex-col items-center justify-between">
                        <ArrowDown className="text-slate-700 w-4 h-4" />
                        <motion.div
                            animate={{ y: [0, 124], opacity: [0, 1, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 w-1 h-1 bg-[#bef264] rounded-full"
                        />
                        <div className="h-full w-px bg-slate-800 absolute top-4 bottom-4" />
                        <ArrowDown className="text-slate-700 w-4 h-4" />
                    </div>

                    <div className="h-12" /> {/* Spacer to align with Path A */}
                </div>
            </div>

            {/* Destination Vector Store */}
            <div className="mt-8 flex flex-col items-center relative z-20">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-slate-900 border border-[#bef264]/30 p-4 rounded-lg flex flex-col items-center gap-2 shadow-[0_0_20px_rgba(190,242,100,0.1)]"
                >
                    <Database className="w-8 h-8 text-[#bef264]" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Vector Store</span>
                </motion.div>

                {/* Takeaway Box */}
                <div className="mt-12 bg-[#bef264]/5 border border-[#bef264]/20 p-3 rounded max-w-lg text-center">
                    <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-wide">
                        <strong className="text-[#bef264]">Takeaway:</strong> Regardless of input method, the modeling strategy for <span className="text-white">IDs and Metadata</span> remains identical.
                    </p>
                </div>
            </div>
        </div>
    );
}
