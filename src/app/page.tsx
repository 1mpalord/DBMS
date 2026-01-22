'use client';

import React, { useState } from 'react';
import { VectorCanvas } from '@/components/VectorCanvas';
import { EmbeddingShowcase } from '@/components/EmbeddingShowcase';
import { SearchPanel } from '@/components/SearchPanel';
import { InsertPanel } from '@/components/InsertPanel';
import { PerformanceLog } from '@/components/PerformanceLog';
import { Brain, Database, Layers, Activity, Cpu } from 'lucide-react';

export default function Home() {
  const [nodes, setNodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [indexes, setIndexes] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>('vector-demo');
  const [performance, setPerformance] = useState<{
    timeMs: number;
    semanticTime?: number;
    lexicalTime?: number;
    hybridTime?: number;
  } | undefined>();

  React.useEffect(() => {
    fetch('/api/pinecone/list-indexes')
      .then(res => res.json())
      .then(data => {
        if (data.indexes) {
          const names = data.indexes.map((idx: any) => idx.name);
          setIndexes(names);
          // Only auto-select if current one isn't in the list
          if (names.length > 0 && !names.includes(selectedIndex)) {
            setSelectedIndex(names[0]);
          }
        }
      })
      .catch(err => console.error('Failed to fetch indexes:', err));
  }, []);

  const handleIndexChange = (newIndex: string) => {
    setSelectedIndex(newIndex);
    setNodes([]); // Clear nodes when switching index
    setPerformance(undefined);
  };

  const handleSearch = async (query: string, type: 'semantic' | 'lexical' | 'hybrid', alpha?: number) => {
    setIsLoading(true);
    try {
      const endpoint = `/api/search-${type}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, alpha, topK: 100, indexName: selectedIndex }),
      });

      if (!res.ok) {
        throw new Error(`Search failed: ${res.statusText}`);
      }

      const data = await res.json();

      if (data && data.results && Array.isArray(data.results)) {
        setPerformance({
          timeMs: data.timeMs,
          semanticTime: type === 'semantic' ? data.timeMs : (type === 'hybrid' ? data.timeMs * 0.4 : 0),
          lexicalTime: type === 'lexical' ? data.timeMs : (type === 'hybrid' ? data.timeMs * 0.5 : 0),
          hybridTime: type === 'hybrid' ? data.timeMs : 0
        });

        const newNodes = data.results.map((res: any) => {
          const existing = nodes.find(n => n.id === res.id);
          const position = existing ? existing.position : [
            (Math.random() - 0.5) * 18,
            (Math.random() - 0.5) * 18,
            (Math.random() - 0.5) * 18
          ];

          return {
            id: res.id,
            position,
            score: res.score,
            metadata: res.metadata
          };
        });

        setNodes(newNodes);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = async (text: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, metadata: { title: 'User Input' }, indexName: selectedIndex }),
      });

      if (!res.ok) {
        throw new Error(`Insert failed: ${res.statusText}`);
      }
    } catch (error) {
      console.error('Insert error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeed = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/wikipedia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: ['Fruit', 'Tropical fruits', 'Apple', 'Banana', 'Orange'],
          countPerTopic: 5,
          indexName: selectedIndex
        }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0c10] text-[#e2e8f0] flex relative overflow-hidden font-mono">
      <div className="absolute inset-0 grain-overlay opacity-5 z-50 pointer-events-none" />

      {/* Dynamic Background Element */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#bef264] opacity-[0.03] blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[#bef264] opacity-[0.02] blur-[100px] rounded-full" />

      {/* Extreme Left: Vertical Branding - Hidden on small screens */}
      <div className="hidden md:flex w-16 border-r border-[#bef264]/10 flex-col justify-between py-12 items-center bg-black/20 shrink-0">
        <div className="rotate-[-90deg] whitespace-nowrap">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-30">
            Latent.Space.Protocol.v3
          </span>
        </div>
        <div className="space-y-4">
          <div className="w-0.5 h-12 bg-[#bef264]/20 mx-auto" />
          <Activity className="w-4 h-4 text-[#bef264] opacity-50" />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Staggered Asymmetric */}
        <header className="p-4 md:p-8 lg:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0 relative z-50 pointer-events-none">
          <div className="space-y-1 pointer-events-auto">
            <div className="flex items-baseline gap-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-none text-white">
                ATOMIC<br />
                <span className="text-[#bef264] ml-6 md:ml-12">KERNEL</span>
              </h1>
              <div className="px-2 py-0.5 border border-[#bef264] text-[9px] font-black text-[#bef264] uppercase tracking-widest leading-none">
                Dev_Rel.0
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 md:gap-12 pr-0 md:pr-12 items-center pointer-events-auto">
            <div className="text-right">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Active_Index</span>
              <div className="relative group z-30 flex items-center">
                <select
                  value={selectedIndex}
                  onChange={(e) => handleIndexChange(e.target.value)}
                  className="bg-black border border-[#bef264]/40 text-[#bef264] text-xs font-black pl-4 pr-10 py-1 appearance-none cursor-pointer hover:border-[#bef264] transition-colors uppercase tracking-widest outline-none relative z-40 h-8 focus:ring-1 focus:ring-[#bef264]"
                >
                  {indexes.map(idx => (
                    <option key={idx} value={idx}>{idx}</option>
                  ))}
                  {indexes.length === 0 && <option value="vector-demo">vector-demo</option>}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#bef264] z-50 flex items-center gap-2">
                  <Database className="w-3 h-3 opacity-50" />
                  <div className="w-0.5 h-3 bg-[#bef264]/20" />
                  <Activity className="w-3 h-3 animate-pulse" />
                </div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Environmental_Node</span>
              <p className="text-sm font-black text-[#bef264]">US-EAST-SERVERLESS</p>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Cluster_Uptime</span>
              <p className="text-sm font-black text-[#bef264]">99.98%</p>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-8 lg:p-12 pt-0 gap-6 lg:gap-16 min-h-0">
          {/* Main Stage: 3D Visualization (Dominant) */}
          <div className="flex-1 h-[400px] lg:h-auto min-h-[400px] relative border border-[#bef264]/10 bg-black/40 order-2 lg:order-1">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#bef264]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#bef264]" />
            <VectorCanvas nodes={nodes} />
          </div>

          {/* Right Control Column (Staggered Offset) */}
          <div className="w-full lg:w-[480px] space-y-8 lg:space-y-12 shrink-0 overflow-y-auto pr-2 custom-scrollbar lg:mt-24 order-1 lg:order-2 max-h-[400px] lg:max-h-full">

            {/* System Monitor Section */}
            {performance && (
              <div className="bg-[#bef264]/5 border border-[#bef264]/20 p-6 space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#bef264]" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-[#bef264]">System_Performance_Audit</h3>
                </div>
                <PerformanceLog
                  semanticTime={performance.semanticTime}
                  lexicalTime={performance.lexicalTime}
                  hybridTime={performance.hybridTime}
                />
              </div>
            )}

            <div className="space-y-8 lg:space-y-12">
              <SearchPanel onSearch={handleSearch} isLoading={isLoading} performance={performance} />
              <div className="grid grid-cols-1 gap-6">
                <EmbeddingShowcase />
                <InsertPanel onInsert={handleInsert} onSeed={handleSeed} isLoading={isLoading} />
              </div>
            </div>

            {/* Atomic Footer Technical Specs */}
            <div className="grid grid-cols-3 gap-1 pt-8 border-t border-slate-900">
              <div className="bg-black p-4 border border-slate-900 space-y-2">
                <h4 className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Kernel_ID</h4>
                <p className="text-[10px] font-black text-[#bef264]">L6_384D</p>
              </div>
              <div className="bg-black p-4 border border-slate-900 space-y-2">
                <h4 className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Access_Lvl</h4>
                <p className="text-[10px] font-black text-[#bef264]">PRO_ROOT</p>
              </div>
              <div className="bg-black p-4 border border-slate-900 space-y-2">
                <h4 className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Protocol</h4>
                <p className="text-[10px] font-black text-[#bef264]">LS_SIM_H</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
