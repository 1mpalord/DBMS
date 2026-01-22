'use client';

import React, { useMemo } from 'react';

interface HeatmapProps {
    embedding: number[];
    className?: string;
}

export const EmbeddingHeatmap: React.FC<HeatmapProps> = ({ embedding, className = "" }) => {
    const cells = useMemo(() => {
        if (!Array.isArray(embedding)) return null;
        return embedding.map((val, i) => {
            // Normalize value to 0-1 range for color. 
            // Embeddings from mean pooling are often small, so we might need to scale for visibility.
            const normalized = (val + 0.1) * 5;
            const opacity = Math.max(0.1, Math.min(1, Math.abs(normalized)));
            const color = val > 0 ? `rgba(239, 68, 68, ${opacity})` : `rgba(59, 130, 246, ${opacity})`;

            return (
                <div
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: color }}
                    title={`Dim ${i}: ${val.toFixed(4)}`}
                />
            );
        });
    }, [embedding]);

    return (
        <div className={`grid grid-cols-16 gap-1 p-2 bg-slate-900/50 rounded-lg border border-slate-700 ${className}`}>
            {cells}
        </div>
    );
};
