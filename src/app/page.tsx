'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layers, Binary, FolderTree, Database, Search, Cpu, Component } from 'lucide-react';
import { TabNav } from '@/components/shared/TabNav';
import { GlassPanel } from '@/components/shared/GlassPanel';
import { BridgeAnimation } from '@/components/tabs/Introduction/BridgeAnimation';
import { TokenizationLab } from '@/components/tabs/Embedding/TokenizationLab';
import { HierarchyDiagram } from '@/components/tabs/Organization/HierarchyDiagram';
import { HealthCheck } from '@/components/tabs/Organization/HealthCheck';
import { PayloadBuilder } from '@/components/tabs/DataModel/PayloadBuilder';
import { ResultsCanvas } from '@/components/tabs/Query/ResultsCanvas';
import { SearchPanel } from '@/components/SearchPanel';
import { LSMAnimation } from '@/components/tabs/Architecture/LSMAnimation';
import { SystemConsole } from '@/components/SystemConsole';
import type { TabItem, TabId, VisualNode, SearchResult } from '@/types';

// Tab Configuration
const TABS: TabItem[] = [
  { id: 'introduction', label: '01_Introduction', icon: <Layers className="w-4 h-4" /> },
  { id: 'embedding', label: '02_Embedding', icon: <Binary className="w-4 h-4" /> },
  { id: 'organization', label: '03_Log_Org', icon: <FolderTree className="w-4 h-4" /> },
  { id: 'data-model', label: '04_Data_Model', icon: <Database className="w-4 h-4" /> },
  { id: 'query', label: '05_Query_Mech', icon: <Search className="w-4 h-4" /> },
  { id: 'architecture', label: '06_Architecture', icon: <Cpu className="w-4 h-4" /> },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('introduction');
  const [selectedIndex, setSelectedIndex] = useState<string>('vector-demo');

  // Global Multi-Tenancy State
  const [selectedNamespace, setSelectedNamespace] = useState<string>('');
  const [availableIndexes, setAvailableIndexes] = useState<string[]>(['vector-demo']); // Default fallback
  const [nodes, setNodes] = useState<VisualNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [performance, setPerformance] = useState<{ timeMs: number } | undefined>();
  const [queryVector, setQueryVector] = useState<number[] | null>(null);

  // System State
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogic, setShowLogic] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);
  const [indexSpec, setIndexSpec] = useState<any>(null); // Store full index spec

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 50));
  };

  // UseEffect to fetch indexes
  React.useEffect(() => {
    fetch('/api/pinecone/list-indexes')
      .then(res => res.json())
      .then(data => {
        if (data.indexes) {
          const names = data.indexes.map((idx: { name: string }) => idx.name);
          setAvailableIndexes(names);
          if (names.length > 0 && !names.includes(selectedIndex)) {
            setSelectedIndex(names[0]);
          }
        }
      })
      .catch(err => console.error('Failed to fetch indexes:', err));
  }, [selectedIndex]);

  const handleIndexChange = (newIndex: string) => {
    setSelectedIndex(newIndex);
    setSelectedNamespace(''); // Reset namespace when index changes
    setIndexSpec(null); // Reset spec while fetching
  };

  // Fetch Index Spec on change
  React.useEffect(() => {
    if (!selectedIndex) return;
    addLog(`INDEX_SWITCH: ${selectedIndex}`);

    fetch(`/api/pinecone/describe-index?name=${selectedIndex}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIndexSpec(data.info);
          addLog(`INDEX_SPEC: ${data.info.dimension} dims, ${data.info.metric}`);
        } else {
          addLog(`INDEX_ERROR: ${data.error}`);
        }
      })
      .catch(err => addLog(`INDEX_NET_ERR: ${err}`));
  }, [selectedIndex]);

  const handleSearch = async (query: string, type: 'semantic' | 'lexical' | 'hybrid', indexName: string, alpha?: number, ns?: string) => {
    setIsLoading(true);
    setPerformance(undefined);
    addLog(`SEARCH_INIT: "${query}" [${type}]`);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          searchType: type,
          alpha,
          topK: 100,
          indexName,
          namespace: ns || selectedNamespace
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Search failed: ${res.statusText}`);
      }
      if (data && data.results && Array.isArray(data.results)) {
        setPerformance({ timeMs: data.timeMs });
        setQueryVector(data.queryVector || null);
        addLog(`SEARCH_COMPLETE:Found ${data.results.length} results (${data.timeMs}ms)`);

        const newNodes: VisualNode[] = data.results.map((res: SearchResult) => {
          const existing = nodes.find(n => n.id === res.id);
          return {
            id: res.id,
            position: existing ? existing.position : [
              (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 10,
              (Math.random() - 0.5) * 10
            ],
            score: res.score,
            metadata: res.metadata
          };
        });
        setNodes(newNodes);
      }
    } catch (error: any) {
      console.error('Search error:', error);
      addLog(`SEARCH_ERROR: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-slate-200 flex overflow-hidden font-sans selection:bg-[#bef264] selection:text-black">

      {/* Dynamic Background Noise */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Left Sidebar Navigation */}
      <aside className="w-72 border-r border-slate-900 bg-black/40 backdrop-blur-md flex flex-col justify-between p-6 z-20">
        <div className="space-y-12">
          {/* Brand Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tighter uppercase text-white">
              Atomic<span className="text-[#bef264]">Kernel</span>
            </h1>
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-1">
              Vector_Database_Sim
            </div>
          </div>

          {/* Navigation */}
          <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Footer info */}
        <div className="space-y-4">
          <div className="h-px w-full bg-slate-900" />
          <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-slate-500">
            <div>
              <div className="uppercase tracking-wider opacity-50">Latency</div>
              <div className="text-[#bef264]">12ms</div>
            </div>
            <div>
              <div className="uppercase tracking-wider opacity-50">Status</div>
              <div className="text-[#bef264]">ONLINE</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto p-8 lg:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12 shrink-0">
          <div>
            <h2 className="text-4xl font-light text-white tracking-tight">
              {TABS.find(t => t.id === activeTab)?.label.split('_')[1]}
            </h2>
            <div className="h-1 w-12 bg-[#bef264] mt-2" />
          </div>

          {/* Global Index Selector (Available on all tabs) */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-500 uppercase">Active Index</span>
            <select
              value={selectedIndex}
              onChange={(e) => handleIndexChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-[#bef264] text-xs font-mono py-2 px-4 outline-none hover:border-[#bef264] transition-colors cursor-pointer uppercase"
            >
              {availableIndexes.map(idx => (
                <option key={idx} value={idx}>{idx}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Content Transition Wrapper */}
        <div className="flex-1 relative min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {activeTab === 'introduction' && (
                <div className="space-y-8">
                  <div className="max-w-3xl space-y-4">
                    <p className="text-lg text-slate-400 font-light leading-relaxed">
                      A Vector Database is a specialized system that stores data as
                      <span className="text-white font-medium"> &quot;Vector Embeddings&quot;</span>—numerical arrays that capture the
                      <span className="text-[#bef264]"> contextual significance</span> and
                      <span className="text-[#bef264]"> semantic meaning</span> of data.
                    </p>
                  </div>

                  {/* The Bridge Visualization */}
                  <BridgeAnimation />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <GlassPanel className="p-6">
                      <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
                        <Component className="w-4 h-4 text-[#bef264]" />
                        Advantages
                      </h3>
                      <ul className="space-y-2 text-sm text-slate-400">
                        <li className="flex gap-2">
                          <span className="text-[#bef264]">+</span> Semantic Richness (Meaning over keywords)
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#bef264]">+</span> Robust to typos and synonyms
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#bef264]">+</span> High-speed similarity search
                        </li>
                      </ul>
                    </GlassPanel>

                    <GlassPanel className="p-6">
                      <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
                        <Component className="w-4 h-4 text-rose-500" />
                        Challenges
                      </h3>
                      <ul className="space-y-2 text-sm text-slate-400">
                        <li className="flex gap-2">
                          <span className="text-rose-500">-</span> Curse of Dimensionality
                        </li>
                        <li className="flex gap-2">
                          <span className="text-rose-500">-</span> Requires specialized ANN algorithms
                        </li>
                      </ul>
                    </GlassPanel>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                    <GlassPanel className="p-6">
                      <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
                        <Database className="w-4 h-4 text-blue-400" />
                        Core Use Cases
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {['RAG Pipelines', 'Semantic Search', 'Recommendation Sys', 'Anomaly Detection', 'Image Search', 'Long-term Memory'].map((useCase) => (
                          <span key={useCase} className="px-2 py-1 bg-slate-800 text-xs text-slate-300 border border-slate-700 rounded-sm">
                            {useCase}
                          </span>
                        ))}
                      </div>
                    </GlassPanel>

                    <GlassPanel className="p-6">
                      <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        Market Standard Models
                      </h3>
                      <ul className="space-y-3 text-xs">
                        <li className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-slate-300">OpenAI text-embedding-3</span>
                          <span className="text-[#bef264] font-mono">1536/3072 dims</span>
                        </li>
                        <li className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <span className="text-slate-300">Cohere Embed v3</span>
                          <span className="text-[#bef264] font-mono">1024 dims</span>
                        </li>
                        <li className="flex justify-between items-center">
                          <span className="text-slate-300">HuggingFace (BERT/MiniLM)</span>
                          <span className="text-[#bef264] font-mono">384 dims</span>
                        </li>
                      </ul>
                    </GlassPanel>
                  </div>
                </div>
              )}
              {activeTab === 'embedding' && (
                <div className="space-y-8">
                  <div className="max-w-3xl space-y-4">
                    <p className="text-lg text-slate-400 font-light leading-relaxed">
                      Before storage, an <span className="text-[#bef264]">Embedding Model</span> must translate raw data into numbers.
                      Similar concepts end up with similar numerical vectors.
                    </p>
                  </div>
                  <TokenizationLab />

                  <GlassPanel className="p-6 mt-8">
                    <h3 className="text-sm font-bold text-white uppercase mb-4">The Mathematics of Meaning</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4 text-sm text-slate-400">
                        <p>
                          Vectors place concepts in a multi-dimensional space (e.g., 1536 dimensions).
                          The distance between two points represents their <span className="text-[#bef264]">Semantic Similarity</span>.
                        </p>
                        <p>
                          This allows for algebraic operations on meaning:
                        </p>
                        <div className="font-mono text-xs bg-black/40 p-3 border border-slate-800 text-center">
                          <span className="text-blue-400">vec</span>(&quot;King&quot;) - <span className="text-blue-400">vec</span>(&quot;Man&quot;) + <span className="text-blue-400">vec</span>(&quot;Woman&quot;) ≈ <span className="text-[#bef264]">vec</span>(&quot;Queen&quot;)
                        </div>
                      </div>

                      <div className="relative h-32 border-l border-b border-slate-700 mx-4">
                        {/* Simple 2D Visualization Hint */}
                        <div className="absolute left-2 bottom-4 w-2 h-2 bg-blue-500 rounded-full"></div> <span className="absolute left-4 bottom-4 text-[10px] text-slate-500">Man</span>
                        <div className="absolute right-8 top-8 w-2 h-2 bg-rose-500 rounded-full"></div> <span className="absolute right-10 top-8 text-[10px] text-slate-500">Woman</span>
                        <div className="absolute right-2 bottom-6 w-2 h-2 bg-[#bef264] rounded-full"></div> <span className="absolute right-4 bottom-6 text-[10px] text-slate-500">Queen</span>
                        <div className="absolute left-4 top-2 w-2 h-2 bg-slate-200 rounded-full"></div> <span className="absolute left-6 top-2 text-[10px] text-slate-500">King</span>

                        <div className="absolute right-0 bottom-0 text-[9px] text-slate-600 p-1">SIMPLIFIED 2D PROJECTION</div>
                      </div>
                    </div>
                  </GlassPanel>
                </div>
              )}
              {activeTab === 'organization' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xl font-light text-white">Logical Hierarchy</h3>
                    <p className="text-sm text-slate-400 max-w-lg">
                      Data in Pinecone is organized into <span className="text-[#bef264]">Indexes</span>.
                      Within an index, you can partition data into <span className="text-blue-400">Namespaces</span> for multi-tenancy.
                    </p>
                    <HierarchyDiagram />
                  </div>
                  <div className="lg:col-span-1">
                    <HealthCheck />
                  </div>
                </div>
              )}
              {activeTab === 'data-model' && (
                <div className="space-y-8">
                  <div className="max-w-3xl space-y-4">
                    <h3 className="text-xl font-light text-white">Integrated vs BYO Vectors</h3>
                    <p className="text-sm text-slate-400">
                      You can send raw text and let the database embed it (Integrated),
                      or generate vectors yourself and send them (Bring Your Own).
                    </p>
                  </div>
                  <PayloadBuilder
                    selectedIndex={selectedIndex}
                    globalNamespace={selectedNamespace}
                    onNamespaceChange={setSelectedNamespace}
                  />
                </div>
              )}
              {activeTab === 'query' && (
                <div className="h-full flex flex-col min-h-0 relative">
                  <div className="space-y-2 mb-8 shrink-0">
                    <h3 className="text-3xl font-light text-white tracking-tight">NEURAL_DECK</h3>
                    <p className="text-sm font-mono text-slate-500 uppercase tracking-widest">
                      Multi-modal Retrieval • <span className="text-[#bef264]">Active Latent Session</span>
                    </p>
                  </div>

                  <div className="flex-1 min-h-0 relative">
                    <ResultsCanvas
                      nodes={nodes}
                      active={activeTab === 'query'}
                      onSearch={handleSearch}
                      isLoading={isLoading}
                      performance={performance}
                      selectedIndex={selectedIndex}
                      availableIndexes={availableIndexes}
                      onIndexChange={handleIndexChange}
                      selectedNamespace={selectedNamespace}
                      onNamespaceChange={setSelectedNamespace}
                      queryVector={queryVector}
                      indexDimensions={indexSpec?.dimension}

                      // Pass Logic Props for Overlay to control Logic animation visibility inside Canvas
                      showLogic={showLogic}
                      setShowLogic={setShowLogic}
                      showPerformance={showPerformance}
                    />
                  </div>
                </div>
              )}
              {activeTab === 'architecture' && (
                <div className="space-y-8">
                  <div className="max-w-3xl space-y-4">
                    <h3 className="text-xl font-light text-white">Log-Structured Merge-Tree (LSM)</h3>
                    <p className="text-sm text-slate-400">
                      Vector databases prioritize write throughput using LSM trees. Data is buffered in RAM
                      and sequentially flushed to immutable disk segments, enabling high-speed ingestion.
                    </p>
                  </div>
                  <LSMAnimation />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <SystemConsole
        logs={logs}
        showLogic={showLogic}
        onToggleLogic={() => { setShowLogic(!showLogic); addLog(`TOGGLE_LOGIC: ${!showLogic}`); }}
        showPerformance={showPerformance}
        onTogglePerformance={() => { setShowPerformance(!showPerformance); addLog(`TOGGLE_PERF: ${!showPerformance}`); }}
        active={activeTab === 'query'}
      />
    </main>
  );
}
