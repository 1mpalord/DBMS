'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CoverView } from './CoverView';
import { TeamView } from './TeamView';
import { useGlobalTimer } from '@/context/TimerContext';

export function TeamIntroContainer() {
    const [viewState, setViewState] = useState<'cover' | 'team'>('cover');
    const { start, reset } = useGlobalTimer();

    const handleStart = () => {
        // 1. Reset and Start Timer
        reset();

        // 2. Delay before switching view (simulating "processing" or "booting")
        // User requested 0.5s - 1s delay
        setTimeout(() => {
            start();
            setViewState('team');
        }, 800);
    };

    return (
        <div className="w-full h-full relative overflow-hidden bg-black/90">
            <AnimatePresence mode="wait">
                {viewState === 'cover' ? (
                    <motion.div
                        key="cover"
                        className="w-full h-full"
                        exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                        transition={{ duration: 0.5 }}
                    >
                        <CoverView onStart={handleStart} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="team"
                        className="w-full h-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <TeamView />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
