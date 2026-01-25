'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface TimerContextType {
    time: number;
    isRunning: boolean;
    start: () => void;
    pause: () => void;
    reset: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning) {
            interval = setInterval(() => {
                setTime((prevTime) => prevTime + 10); // Update every 10ms for smooth display if needed
            }, 10);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning]);

    const start = useCallback(() => setIsRunning(true), []);
    const pause = useCallback(() => setIsRunning(false), []);
    const reset = useCallback(() => {
        setIsRunning(false);
        setTime(0);
    }, []);

    return (
        <TimerContext.Provider value={{ time, isRunning, start, pause, reset }}>
            {children}
        </TimerContext.Provider>
    );
}

export function useGlobalTimer() {
    const context = useContext(TimerContext);
    if (context === undefined) {
        // Failsafe: return dummy data if used outside provider
        console.warn('useGlobalTimer must be used within a TimerProvider');
        return {
            time: 0,
            isRunning: false,
            start: () => { },
            pause: () => { },
            reset: () => { },
        };
    }
    return context;
}
