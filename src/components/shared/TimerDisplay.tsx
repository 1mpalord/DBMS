'use client';

import React from 'react';
import { useGlobalTimer } from '@/context/TimerContext';
import { cn } from '@/lib/utils';

interface TimerDisplayProps {
    className?: string;
}

export function TimerDisplay({ className }: TimerDisplayProps) {
    const { time } = useGlobalTimer();

    // Format time as MM:SS:ms
    const minutes = Math.floor((time / 60000) % 60);
    const seconds = Math.floor((time / 1000) % 60);
    const milliseconds = Math.floor((time / 10) % 100);

    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    return (
        <div className={cn("font-mono text-sm tracking-widest text-[#bef264]/80", className)}>
            {formatNumber(minutes)}:{formatNumber(seconds)}:{formatNumber(milliseconds)}
        </div>
    );
}
