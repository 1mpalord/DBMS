'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TabItem, TabId } from '@/types';

interface TabNavProps {
    tabs: TabItem[];
    activeTab: TabId;
    onTabChange: (id: TabId) => void;
    className?: string;
}

export function TabNav({ tabs, activeTab, onTabChange, className }: TabNavProps) {
    return (
        <nav className={cn('flex flex-col gap-1 w-64 shrink-0', className)}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            'relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-200 text-left outline-none group',
                            isActive ? 'text-[#bef264]' : 'text-slate-500 hover:text-slate-300'
                        )}
                    >
                        {/* Active Indicator - Spring Animation */}
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-y-0 left-0 w-1 bg-[#bef264]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}

                        {/* Background Hover Effect */}
                        <div className={cn(
                            "absolute inset-0 bg-white/5 opacity-0 transition-opacity duration-200",
                            isActive ? "opacity-10" : "group-hover:opacity-5"
                        )} />

                        <span className="relative z-10">{tab.icon}</span>
                        <span className="relative z-10 uppercase tracking-widest text-xs font-bold">
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}
