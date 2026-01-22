'use client';

import React from 'react';
import { VectorCanvas } from '@/components/VectorCanvas';
import { VisualNode } from '@/types';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { AnimatePresence, motion } from 'framer-motion';

interface ResultsCanvasProps {
    nodes: VisualNode[];
    active: boolean;
}

export function ResultsCanvas({ nodes, active }: ResultsCanvasProps) {
    if (!active) return null;

    return (
        <GlassPanel className="w-full h-[500px] relative bg-black/80">
            <div className="absolute top-4 left-4 z-10">
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#bef264]">Vector_Space_Renderer</h3>
                <p className="text-[10px] text-slate-500">WebGL 2.0 • 3D Scatter Plot</p>
            </div>

            {nodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="text-xs font-mono text-slate-600 uppercase tracking-widest">[Waiting for Query...]</span>
                </div>
            )}

            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full"
                >
                    <VectorCanvas nodes={nodes} />
                </motion.div>
            </AnimatePresence>
        </GlassPanel>
    );
}
