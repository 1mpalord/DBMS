'use client';

import React from 'react';

interface TokenizationViewProps {
    tokens: string[];
    className?: string;
}

export const TokenizationView: React.FC<TokenizationViewProps> = ({ tokens, className = "" }) => {
    return (
        <div className={`flex flex-wrap gap-2 p-4 bg-slate-900/50 rounded-lg border border-slate-700 ${className}`}>
            {Array.isArray(tokens) && tokens.map((token, i) => (
                <div
                    key={i}
                    className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-sm text-blue-300 font-mono"
                >
                    {token === ' ' ? '␣' : token}
                </div>
            ))}
            {tokens.length === 0 && (
                <span className="text-slate-500 italic text-sm">Waiting for input...</span>
            )}
        </div>
    );
};
