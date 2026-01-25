'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface CoverViewProps {
    onStart: () => void;
}

export function CoverView({ onStart }: CoverViewProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-8">
            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-4xl bg-black/40 border border-[#bef264]/20 p-8 rounded-lg backdrop-blur-sm group cursor-pointer hover:border-[#bef264]/50 transition-colors"
                onClick={onStart}
            >
                {/* Decorators */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#bef264]" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#bef264]" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#bef264]" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#bef264]" />

                <div className="flex gap-8">
                    {/* Left Info */}
                    <div className="flex-1 space-y-4">
                        <div className="inline-block bg-[#bef264] text-black text-xs font-bold px-2 py-0.5 mb-4">
                            VERSION 2.0.1
                        </div>
                        <h1 className="text-6xl font-bold tracking-tighter text-[#bef264]">
                            VECTOR<br />
                            DATABASE<br />
                            <span className="opacity-50">_PINECONE</span>
                        </h1>
                        <p className="text-[#bef264] font-mono mt-8">
                            Database Management Systems // Project
                        </p>
                        <div className="text-xs text-[#bef264]/60 font-mono mt-4 border-t border-[#bef264]/20 pt-4">
                            DATE: Jan 25th, 2026 | GROUP 4 | STATUS: ACTIVE
                        </div>
                        <p className="text-sm text-gray-400 mt-6 max-w-md">
                            Experience the next generation of searching and AI model.
                            High-dimensional vector embeddings for AI-native applications.
                        </p>
                    </div>

                    {/* Right Graphic Placeholder (Pinecone 3D concept) */}
                    <div className="flex-1 border border-[#bef264]/20 rounded bg-black/20 flex items-center justify-center relative overflow-hidden h-[400px]">
                        <div className="absolute inset-2 border border-dashed border-[#bef264]/20" />
                        {/* Visual representation of vector space (simplified for UI) */}
                        <div className="relative z-10 text-[#bef264]/40 font-mono text-center space-y-2">
                            <div className="absolute top-10 right-10 flex flex-col items-end">
                                <span className="text-xs">[0.34, 2.35, 8.34, ...]</span>
                                <span className="text-xs">300 dimensions</span>
                            </div>
                            {/* Abstract dots */}
                            <div className="w-full h-full p-12 grid grid-cols-3 gap-8 opacity-50">
                                {[...Array(9)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="w-2 h-2 rounded-full bg-[#bef264]"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.3, 0.7, 0.3],
                                        }}
                                        transition={{
                                            duration: 2 + Math.random(),
                                            repeat: Infinity,
                                            delay: Math.random() * 2,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Click Prompt */}
                <div className="absolute bottom-4 right-4 text-[#bef264] text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity animate-pulse">
                    [ CLICK TO START ]
                </div>
            </motion.div>
        </div>
    );
}
