'use client';

import React, { useState } from 'react';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { Lock, Shield, Zap, TrendingUp, UserMinus, Network, Database, Layers, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Sub-components for Visuals ---

function DimensionalMatrix({ type }: { type: 'dense' | 'sparse' }) {
    const [cells, setCells] = React.useState<number[]>([]);

    React.useEffect(() => {
        // Generate a 100-dimension vector (10x10 grid)
        const dimCount = 100;
        let newCells: number[] = [];

        if (type === 'dense') {
            // Dense: Most dimensions have a non-zero value (represented by opacity 0.2 - 1.0)
            newCells = Array.from({ length: dimCount }).map(() => Math.random() * 0.8 + 0.2);
        } else {
            // Sparse: Most dimensions are 0. Only ~5% are active.
            newCells = new Array(dimCount).fill(0);
            const activeIndices = new Set();
            while (activeIndices.size < 5) {
                activeIndices.add(Math.floor(Math.random() * dimCount));
            }
            activeIndices.forEach(idx => {
                newCells[idx as number] = 1.0;
            });
        }
        setCells(newCells);
    }, [type]);

    return (
        <div className="relative w-full bg-black/40 border border-slate-800 rounded-sm overflow-hidden flex flex-col items-center justify-center py-6">

            {/* The Matrix (10x10 Grid) */}
            <div className="grid grid-cols-10 gap-1 p-4 bg-black/20 rounded border border-slate-800/50">
                {cells.map((opacity, i) => (
                    <motion.div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-sm ${type === 'dense' ? 'bg-[#bef264]' : 'bg-blue-400'}`}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: type === 'dense'
                                ? [opacity, opacity * 0.5, opacity] // Subtle shift for dense
                                : opacity === 0 ? 0.05 : [1, 0.5, 1] // Pulse active ones for sparse
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random()
                        }}
                    />
                ))}
            </div>

            <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-500 uppercase">
                {type}_vector_space [100_DIMS]
            </div>

            {/* Legend/Status */}
            <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-600 font-mono">ACTIVE:</span>
                    <span className={`text-xs font-bold font-mono ${type === 'dense' ? 'text-[#bef264]' : 'text-blue-400'}`}>
                        {type === 'dense' ? '~100%' : '~5%'}
                    </span>
                </div>
            </div>
        </div>
    );
}

function VaultDiagram() {
    return (
        <div className="relative h-48 w-full border-2 border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center gap-4 bg-slate-950/20">
            <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-600 uppercase">Index_Physical_Container</div>
            <div className="flex gap-4 w-full justify-center">
                {['A', 'B', 'C'].map((label) => (
                    <motion.div
                        key={label}
                        whileHover={{ scale: 1.05, borderColor: '#bef264' }}
                        className="w-24 h-24 border border-slate-700 bg-black/40 rounded-lg flex flex-col items-center justify-center gap-2 group cursor-pointer transition-colors"
                    >
                        <Box className="w-6 h-6 text-blue-400 group-hover:text-[#bef264] transition-colors" />
                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-white uppercase tracking-tighter">Vault_{label}</span>
                        <div className="w-8 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-blue-500"
                                animate={{ width: ['20%', '100%', '20%'] }}
                                transition={{ duration: 3, repeat: Infinity, delay: Math.random() * 2 }}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
            <div className="text-[10px] text-slate-500 font-mono"> NAMESPACE ISOLATION ENABLED </div>
        </div>
    );
}

// --- Main Component ---

const BENEFITS = [
    {
        title: 'Tenant Isolation',
        description: 'Hard separation of data using Namespaces ensures that queries never leak across boundaries.',
        icon: <Lock className="w-5 h-5 text-blue-400" />,
        color: 'border-blue-500/30'
    },
    {
        title: 'No Noisy Neighbor',
        description: 'Serverless architecture manages compute auto-scaling, preventing performance degradation from other tenants.',
        icon: <Shield className="w-5 h-5 text-emerald-400" />,
        color: 'border-emerald-500/30'
    },
    {
        title: 'No Maintenance',
        description: 'Avoid the operational overhead of managing multiple indexes; focus on data partitioning logic.',
        icon: <Zap className="w-5 h-5 text-[#bef264]" />,
        color: 'border-[#bef264]/30'
    },
    {
        title: 'Cost Efficiency',
        description: 'Consolidated infrastructure reduces baseline costs compared to maintaining separate small indexes.',
        icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
        color: 'border-purple-500/30'
    },
    {
        title: 'Simple Offboarding',
        description: 'Wipe all data for a specific tenant in a single API call by deleting their namespace.',
        icon: <UserMinus className="w-5 h-5 text-rose-500" />,
        color: 'border-rose-500/30'
    }
];

type Section = 'INDEX' | 'NAMESPACE' | 'THEORY' | null;

export function MultitenancyInfo() {
    const [activeSection, setActiveSection] = useState<Section>(null);

    const toggleSection = (section: Section) => {
        setActiveSection(activeSection === section ? null : section);
    };

    return (
        <div className="mt-16 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">

            {/* Tactical Control Row */}
            <div className="flex gap-4">
                {[
                    { id: 'INDEX', label: '01_PHYSICAL_INDEX', icon: <Database /> },
                    { id: 'NAMESPACE', label: '02_LOGICAL_NAMESPACE', icon: <Layers /> },
                    { id: 'THEORY', label: '03_TENANCY_THEORY', icon: <Network /> }
                ].map((btn) => (
                    <button
                        key={btn.id}
                        onClick={() => toggleSection(btn.id as Section)}
                        className={`flex-1 flex items-center justify-center gap-3 px-4 py-3 border transition-all duration-300 relative group overflow-hidden ${activeSection === btn.id
                            ? 'bg-[#bef264] border-[#bef264] text-black'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-[#bef264]/50 hover:text-white'
                            }`}
                    >
                        {React.cloneElement(btn.icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
                        <span className="text-[10px] font-bold uppercase tracking-widest">{btn.label}</span>
                        {activeSection === btn.id && (
                            <motion.div
                                layoutId="activeBG"
                                className="absolute inset-0 bg-[#bef264] -z-10"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Scale-Out Window Expansion Area */}
            <AnimatePresence mode="wait">
                {activeSection && (
                    <motion.div
                        key={activeSection}
                        initial={{ height: 0, opacity: 0, scaleY: 0.95 }}
                        animate={{ height: 'auto', opacity: 1, scaleY: 1 }}
                        exit={{ height: 0, opacity: 0, scaleY: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                    >
                        <GlassPanel className="p-8 border-[#bef264]/20 bg-slate-900/10">

                            {/* --- INDEX SECTION --- */}
                            {activeSection === 'INDEX' && (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-xl font-light text-white uppercase tracking-tight flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-[#bef264]" />
                                            The index is the primary unit of vector storage
                                        </h2>
                                        <p className="text-xs text-slate-500 max-w-xl">
                                            Hardware-level partitioning where compute and storage are allocated.
                                            Indexes define your dimensionality and distance metric.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest border-l-2 border-[#bef264] pl-2">Dense_Concept</div>
                                            <DimensionalMatrix type="dense" />
                                            <p className="text-[11px] text-slate-500 leading-relaxed italic">
                                                Used for deep semantic understanding where most dimensions carry value.
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest border-l-2 border-blue-400 pl-2">Sparse_Token</div>
                                            <DimensionalMatrix type="sparse" />
                                            <p className="text-[11px] text-slate-500 leading-relaxed italic">
                                                Highly specific keyword retrieval where only a few features are active.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- NAMESPACE SECTION --- */}
                            {activeSection === 'NAMESPACE' && (
                                <div className="space-y-8">
                                    <div className="space-y-2">
                                        <h2 className="text-xl font-light text-white uppercase tracking-tight flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-blue-400" />
                                            Namespace partitioning: Secure Data Isolation
                                        </h2>
                                        <p className="text-xs text-slate-500 max-w-xl">
                                            Namespaces allow you to segment a single Index into virtual silos.
                                            Perfect for multi-tenant applications requiring speed and security.
                                        </p>
                                    </div>
                                    <VaultDiagram />
                                </div>
                            )}

                            {/* --- THEORY SECTION --- */}
                            {activeSection === 'THEORY' && (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-light text-white uppercase tracking-tight flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-[#bef264]" />
                                            Multitenancy: Partitioning the Latent Space
                                        </h2>
                                        <div className="h-0.5 w-16 bg-[#bef264] opacity-50" />
                                        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                                            Multitenancy in Pinecone allows you to isolate data for different users, applications, or departments
                                            within a <span className="text-white font-medium">single Index</span> using
                                            <span className="text-blue-400 font-mono"> Namespaces</span>.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {BENEFITS.map((benefit, idx) => (
                                            <motion.div
                                                key={benefit.title}
                                                whileHover={{ y: -5 }}
                                                transition={{ type: 'spring', stiffness: 300 }}
                                            >
                                                <GlassPanel className={`p-6 h-full flex flex-col gap-4 border ${benefit.color} hover:bg-slate-900/40 transition-colors cursor-default group`}>
                                                    <div className="flex justify-between items-start">
                                                        <div className="p-2 bg-black/40 rounded-lg border border-slate-800 group-hover:border-current transition-colors">
                                                            {benefit.icon}
                                                        </div>
                                                        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">Advantage_0{idx + 1}</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-bold text-white uppercase mb-2">
                                                            {benefit.title}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 leading-relaxed">
                                                            {benefit.description}
                                                        </p>
                                                    </div>
                                                </GlassPanel>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </GlassPanel>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
