'use client';

import React from 'react';
import { Loader2, Database, Terminal } from 'lucide-react';

interface SystemConsoleProps {
    logs: string[];
    showLogic: boolean;
    onToggleLogic: () => void;
    showPerformance: boolean;
    onTogglePerformance: () => void;
    active: boolean;
}

export const SystemConsole: React.FC<SystemConsoleProps> = ({
    logs,
    showLogic,
    onToggleLogic,
    showPerformance,
    onTogglePerformance,
    active
}) => {
    // Only verify appearance in correct context (but logic is controlled by parent active prop)
    if (!active) return null;

    return (
        <div className="absolute bottom-12 right-8 z-50 flex flex-col gap-4 pointer-events-auto animate-in slide-in-from-right-10 duration-700">
            <div className="bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded-lg shadow-2xl w-[260px] flex flex-col gap-4">

                {/* Header */}
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold tracking-widest uppercase border-b border-white/5 pb-2">
                    <Terminal className="w-3 h-3 text-[#bef264]" />
                    <span>SYSTEM_CONSOLE</span>
                </div>

                {/* Toggles */}
                <div className="space-y-2">
                    <button
                        type="button"
                        onClick={onToggleLogic}
                        className={`w-full p-2 rounded border transition-all flex items-center justify-between group ${showLogic ? 'bg-[#bef264]/10 border-[#bef264]/30' : 'bg-transparent border-white/5 hover:border-white/20'}`}
                    >
                        <span className={`text-[10px] font-mono tracking-wider ${showLogic ? 'text-[#bef264]' : 'text-slate-400'}`}>LOGIC_OVERLAY</span>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${showLogic ? 'bg-[#bef264]' : 'bg-slate-800'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-black transition-all ${showLogic ? 'left-[18px]' : 'left-0.5'}`} />
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={onTogglePerformance}
                        className={`w-full p-2 rounded border transition-all flex items-center justify-between group ${showPerformance ? 'bg-blue-500/10 border-blue-500/30' : 'bg-transparent border-white/5 hover:border-white/20'}`}
                    >
                        <span className={`text-[10px] font-mono tracking-wider ${showPerformance ? 'text-blue-400' : 'text-slate-400'}`}>PERF_MONITOR</span>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${showPerformance ? 'bg-blue-500' : 'bg-slate-800'}`}>
                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-black transition-all ${showPerformance ? 'left-[18px]' : 'left-0.5'}`} />
                        </div>
                    </button>
                </div>

                {/* Real-time Log Stream */}
                <div className="bg-black/50 rounded border border-white/5 p-2 h-[120px] overflow-y-auto font-mono text-[9px] flex flex-col-reverse gap-1 shadow-inner">
                    {logs.length === 0 && <span className="text-slate-700 italic">No system events...</span>}
                    {logs.map((log, i) => (
                        <div key={i} className="text-slate-300 break-words leading-tight">
                            <span className="text-slate-600 mr-1 opacity-50">{log.split(']')[0]}]</span>
                            <span className={log.includes('ERROR') ? 'text-red-400' : log.includes('INIT') ? 'text-blue-400' : 'text-slate-300'}>
                                {log.split(']').slice(1).join(']')}
                            </span>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};
