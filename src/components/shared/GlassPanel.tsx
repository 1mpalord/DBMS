import { cn } from '@/lib/utils';
import React from 'react';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    intensity?: 'low' | 'medium' | 'high';
}

export function GlassPanel({ children, className, ...props }: GlassPanelProps) {
    return (
        <div
            className={cn(
                'border border-slate-800 bg-slate-950/50 backdrop-blur-sm relative overflow-hidden',
                // Technical accents - Corner markers can be added via CSS if needed
                className
            )}
            {...props}
        >
            {/* Top-Left Corner Marker */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#bef264]/30" />
            {/* Bottom-Right Corner Marker */}
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#bef264]/30" />

            {children}
        </div>
    );
}
