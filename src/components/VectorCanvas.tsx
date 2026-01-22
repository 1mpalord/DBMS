'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Billboard, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { VisualNode } from '@/types';

interface VectorNodeProps {
    position: [number, number, number];
    color: string;
    label: string;
    score?: number;
    metadata?: Record<string, unknown>;
    isSelected?: boolean;
    isTopRanked?: boolean;
    onClick?: () => void;
}

const VectorNode: React.FC<VectorNodeProps> = ({ position, color, label, score = 0, metadata, isSelected, isTopRanked, onClick }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { camera } = useThree();
    const [isZoomedIn, setIsZoomedIn] = useState(false);

    // Check camera distance each frame for zoom-based label visibility
    useFrame(() => {
        if (meshRef.current) {
            const nodePos = new THREE.Vector3(...position);
            const distance = camera.position.distanceTo(nodePos);
            setIsZoomedIn(distance < 12); // Show labels when camera is close
        }
    });

    // Fallback labels
    const displayLabel = (metadata?.label as string) || (metadata?.title as string) || label || '';

    // Dynamic glow intensity based on score (0-1 maps to 1-8)
    const glowIntensity = useMemo(() => {
        if (isTopRanked || isSelected) {
            return 2 + (score * 6); // Range 2-8 for top results
        }
        return 0.5 + (score * 2); // Range 0.5-2.5 for others
    }, [score, isTopRanked, isSelected]);

    // Node size scales slightly with score
    const nodeSize = useMemo(() => {
        if (isTopRanked || isSelected) return 0.15 + (score * 0.15); // 0.15 - 0.30
        return 0.08 + (score * 0.06); // 0.08 - 0.14
    }, [score, isTopRanked, isSelected]);

    // Show label if: selected, top-ranked, OR zoomed in close to this node
    const showLabel = isSelected || isTopRanked || (isZoomedIn && score > 0.3);

    return (
        <group position={position} onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[nodeSize, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={glowIntensity}
                    toneMapped={false}
                />
            </mesh>

            {displayLabel && showLabel && (
                <Billboard
                    follow={true}
                    position={[0, nodeSize + 0.2, 0]}
                >
                    <Text
                        fontSize={0.18}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.02}
                        outlineColor="#000000"
                        renderOrder={1000}
                        material-depthTest={false}
                        material-depthWrite={false}
                    >
                        {displayLabel}
                    </Text>
                </Billboard>
            )}
        </group>
    );
};

const PCAGrid = () => {
    return (
        <group>
            {/* Bounding Box Grid */}
            <mesh>
                <boxGeometry args={[20, 20, 20]} />
                <meshBasicMaterial color="#334155" wireframe transparent opacity={0.05} />
            </mesh>

            {/* Axis Lines */}
            <group>
                {/* X Axis */}
                <line>
                    <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-10, -10, -10), new THREE.Vector3(10, -10, -10)])} />
                    <lineBasicMaterial attach="material" color="#64748b" linewidth={1} transparent opacity={0.3} />
                </line>
                {/* Y Axis */}
                <line>
                    <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-10, -10, -10), new THREE.Vector3(-10, 10, -10)])} />
                    <lineBasicMaterial attach="material" color="#64748b" linewidth={1} transparent opacity={0.3} />
                </line>
                {/* Z Axis */}
                <line>
                    <bufferGeometry attach="geometry" {...new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-10, -10, -10), new THREE.Vector3(-10, -10, 10)])} />
                    <lineBasicMaterial attach="material" color="#64748b" linewidth={1} transparent opacity={0.3} />
                </line>
            </group>

            {/* Axis Labels */}
            <Billboard position={[0, -11, -10]}>
                <Text fontSize={0.5} color="#475569">PC1</Text>
            </Billboard>
            <Billboard position={[-11, 0, -10]} rotation={[0, 0, Math.PI / 2]}>
                <Text fontSize={0.5} color="#475569">PC2</Text>
            </Billboard>
            <Billboard position={[-11, -11, 0]}>
                <Text fontSize={0.5} color="#475569">PC3</Text>
            </Billboard>
        </group>
    );
};

const NodeDetailPanel: React.FC<{ node: VisualNode; onClose: () => void }> = ({ node, onClose }) => {
    if (!node) return null;

    return (
        <Html position={[0, 0, 0]} center style={{ pointerEvents: 'none' }}>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-black/90 border border-[#bef264] p-6 text-[#e2e8f0] font-mono z-50 pointer-events-auto shadow-[0_0_50px_rgba(190,242,100,0.2)] backdrop-blur-md">
                <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-2">
                    <h3 className="text-[#bef264] font-black uppercase text-sm tracking-widest">{(node.metadata?.title as string) || node.id.substring(0, 8)}</h3>
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-slate-500 hover:text-white text-xs">[CLOSE]</button>
                </div>

                <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-[80px_1fr] gap-2">
                        <span className="text-slate-500 uppercase tracking-wider">Score</span>
                        <span className="text-[#bef264] font-bold">{((node.score || 0) * 100).toFixed(2)}%</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-2">
                        <span className="text-slate-500 uppercase tracking-wider">ID</span>
                        <span className="text-slate-300 break-all">{node.id}</span>
                    </div>
                    {typeof node.metadata?.text === 'string' && (
                        <div className="mt-4 pt-4 border-t border-slate-800">
                            <span className="text-slate-500 uppercase tracking-wider block mb-2">Content Payload</span>
                            <p className="text-slate-300 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                &quot;{(node.metadata.text as string)}&quot;
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Html>
    );
};

const MagnetLinkVisualization: React.FC<{ nodes: VisualNode[] }> = ({ nodes }) => {
    const markerGroupRef = useRef<THREE.Group>(null);
    const pulseRef = useRef<THREE.Group>(null);
    const queryPosRef = useRef(new THREE.Vector3(0, 12, 0)); // Start from top
    const [animState, setAnimState] = useState<'WAITING' | 'FLYING' | 'EXTENDING' | 'COMPLETE'>('WAITING');
    const [lineProgress, setLineProgress] = useState(0);
    const prevNodesLenRef = useRef(0);

    // 1. Find Top 5 Nodes (no threshold - always show top 5 if available)
    const topNodes = useMemo(() => {
        return [...nodes]
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 5); // Always take top 5, no score threshold
    }, [nodes]);

    // 2. Calculate Target Centroid
    const targetCentroid = useMemo(() => {
        if (topNodes.length === 0) return new THREE.Vector3(0, 0, 0);

        let x = 0, y = 0, z = 0;
        topNodes.forEach(node => {
            x += node.position[0];
            y += node.position[1];
            z += node.position[2];
        });

        return new THREE.Vector3(x / topNodes.length, y / topNodes.length, z / topNodes.length);
    }, [topNodes]);

    // Trigger Animation Sequence when NEW results arrive (2 second delay)
    useEffect(() => {
        // Only trigger on new results (nodes length changed from 0 to >0, or new search)
        if (nodes.length > 0 && prevNodesLenRef.current !== nodes.length) {
            // Reset position to start point
            queryPosRef.current.set(0, 12, 0);
            setLineProgress(0);
            setAnimState('WAITING');

            // After 2s delay, start flying
            const timeout = setTimeout(() => {
                setAnimState('FLYING');
            }, 2000);

            prevNodesLenRef.current = nodes.length;
            return () => clearTimeout(timeout);
        } else if (nodes.length === 0) {
            setAnimState('WAITING');
            prevNodesLenRef.current = 0;
        }
    }, [nodes.length, nodes]);

    useFrame(({ clock }, delta) => {
        const queryPos = queryPosRef.current;

        if (animState === 'FLYING') {
            const speed = 3.0 * delta; // Smooth flight speed
            queryPos.lerp(targetCentroid, speed);

            // Check if close enough to target
            if (queryPos.distanceTo(targetCentroid) < 0.1) {
                queryPos.copy(targetCentroid);
                setAnimState('EXTENDING');
            }
        }
        else if (animState === 'EXTENDING') {
            setLineProgress(prev => {
                const newVal = Math.min(prev + (delta * 1.2), 1);
                if (newVal >= 1) setAnimState('COMPLETE');
                return newVal;
            });
        }

        // Update the marker group position directly
        if (markerGroupRef.current) {
            markerGroupRef.current.position.copy(queryPos);
        }

        // Pulse animation (always active)
        if (pulseRef.current) {
            const t = clock.getElapsedTime();
            const scale = 1 + Math.sin(t * 4) * 0.2;
            pulseRef.current.scale.setScalar(scale);
        }
    });

    // No results - show faded X at origin
    if (topNodes.length === 0) {
        return (
            <Billboard position={[0, 0, 0]}>
                <Text fontSize={0.8} color="#ef4444" anchorX="center" anchorY="middle" fillOpacity={0.2}>×</Text>
            </Billboard>
        );
    }

    return (
        <group>
            {/* Dynamic Query Marker (Animated Position) */}
            <group ref={markerGroupRef}>
                {/* Main Sphere */}
                <mesh>
                    <sphereGeometry args={[0.4, 32, 32]} />
                    <meshStandardMaterial
                        color="#ef4444"
                        emissive="#ef4444"
                        emissiveIntensity={animState === 'FLYING' ? 5 : 3}
                        toneMapped={false}
                    />
                </mesh>

                {/* Pulsing outer ring */}
                <group ref={pulseRef}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.55, 0.7, 32]} />
                        <meshBasicMaterial color="#ef4444" transparent opacity={0.5} side={THREE.DoubleSide} />
                    </mesh>
                </group>

                {/* Label */}
                <Billboard position={[0, 1, 0]}>
                    <Text fontSize={0.3} color="#ef4444" outlineWidth={0.02} outlineColor="#000">
                        {animState === 'WAITING' ? 'SCANNING...' : animState === 'FLYING' ? 'LOCATING...' : 'QUERY'}
                    </Text>
                </Billboard>
            </group>

            {/* Glowing Connection Lines - show during EXTENDING and COMPLETE */}
            {(animState === 'EXTENDING' || animState === 'COMPLETE') && topNodes.map((node, i) => (
                <Line
                    key={`link-${i}`}
                    points={[
                        targetCentroid,
                        new THREE.Vector3().lerpVectors(targetCentroid, new THREE.Vector3(...node.position), lineProgress)
                    ]}
                    color="#ef4444"
                    lineWidth={2}
                    dashed={true}
                    dashScale={2}
                    dashSize={1}
                    gapSize={0.5}
                    transparent
                    opacity={0.6 * lineProgress}
                />
            ))}
        </group>
    );
};

const DebugConsole: React.FC<{ topNodes: VisualNode[]; totalResults: number }> = ({ topNodes, totalResults }) => {
    return (
        <div className="absolute top-24 left-6 z-30 font-mono text-[10px] bg-black/40 backdrop-blur-3xl border border-white/10 p-4 w-72 text-[#bef264] pointer-events-none shadow-2xl rounded-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
                <span className="uppercase font-black tracking-[0.2em] text-slate-400">System_Trace</span>
                <div className="flex gap-1.5 opacity-50">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                </div>
            </div>

            <div className="space-y-1 opacity-80">
                <p className="text-slate-500">{'>'} initializing stream...</p>
                <p className="text-slate-500">{'>'} listening for vector events</p>

                {topNodes.length > 0 ? (
                    <>
                        <p className="text-white mt-2 border-l-2 border-[#bef264] pl-2 font-bold">{'>'} MATCH_FOUND ({topNodes.length})</p>
                        {topNodes.map((node, i) => (
                            <div key={node.id} className="pl-4 text-xs">
                                <span className="text-slate-500">#{i + 1}</span> <span className="text-white">{(node.metadata?.title as string) || node.id}</span>
                                <span className="block text-slate-600 ml-4">CONFIDENCE: {((node.score || 0) * 100).toFixed(1)}%</span>
                            </div>
                        ))}
                    </>
                ) : totalResults === 0 ? (
                    <p className="text-red-500 mt-2 border-l-2 border-red-500 pl-2 font-bold animate-pulse">{'>'} NO_RESULTS_FOUND</p>
                ) : (
                    <p className="text-slate-600 mt-2">{'>'} waiting for query input...</p>
                )}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800 text-[8px] text-slate-600 flex justify-between">
                <span>MEM: 24MB</span>
                <span>T: {new Date().toLocaleTimeString()}</span>
            </div>
        </div>
    );
};
interface VectorCanvasProps {
    nodes: VisualNode[];
}

export const VectorCanvas: React.FC<VectorCanvasProps> = ({ nodes }) => {
    const [selectedNode, setSelectedNode] = useState<VisualNode | null>(null);

    // Calculate top nodes at top level to pass to both Visualization and Console (no threshold)
    const topNodes = useMemo(() => {
        return [...nodes]
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 5); // Always take top 5
    }, [nodes]);

    const topNodeIds = useMemo(() => new Set(topNodes.map(n => n.id)), [topNodes]);

    return (
        <div className="w-full h-full bg-[#05070a] overflow-hidden border border-slate-800 relative group/canvas flex flex-col">
            <div className="absolute inset-0 grain-overlay z-10 pointer-events-none" />

            {/* Debug Console Overlay */}
            <DebugConsole topNodes={topNodes} totalResults={nodes.length} />

            {/* Interactive Legend Overlay (Top Right) */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 bg-black/40 border border-white/10 p-3 md:p-4 space-y-2 pointer-events-none backdrop-blur-3xl rounded-lg shadow-2xl">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-slate-500 shadow-[0_0_10px_rgba(148,163,184,0.5)]" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Node</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-2 h-2 md:w-3 md:h-3 text-[#ef4444] font-black text-[10px] md:text-xs flex items-center justify-center">×</div>
                    <span className="text-[10px] font-bold text-[#ef4444] uppercase tracking-widest">Query</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 border-t border-white/10 pt-2 mt-1">
                    <div className="w-8 h-0.5 bg-gradient-to-r from-[#ef4444] to-transparent" />
                    <span className="text-[10px] font-bold text-[#ef4444] opacity-80 uppercase tracking-widest">Link</span>
                </div>
            </div>

            {/* Color Gradient Legend (Right Center) */}
            <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 h-48 md:h-64 flex items-center gap-2 md:gap-4 pointer-events-none">
                <div className="flex flex-col justify-between h-full py-2">
                    <span className="text-[6px] md:text-[8px] font-bold text-slate-600">HIGH</span>
                    <span className="text-[6px] md:text-[8px] font-bold text-slate-600">LOW</span>
                </div>
                <div className="w-2 md:w-4 h-full bg-gradient-to-t from-slate-900 via-green-600 to-[#bef264] border border-slate-800 relative">
                    <div className="absolute -left-10 md:-left-12 top-0 text-[6px] md:text-[8px] font-bold text-[#bef264]">MATCH</div>
                    <div className="absolute -left-10 md:-left-12 bottom-0 text-[6px] md:text-[8px] font-bold text-slate-700">VOID</div>
                </div>
                <div className="flex flex-col justify-between h-full py-2">
                    <span className="text-[6px] md:text-[8px] font-bold text-slate-500 tracking-tighter [writing-mode:vertical-rl] rotate-180 uppercase">Sim_Score</span>
                </div>
            </div>

            <Canvas camera={{ position: [15, 15, 15], fov: 45 }} gl={{ antialias: true }}>
                <color attach="background" args={['#05070a']} />
                <fog attach="fog" args={['#05070a', 5, 50]} />
                <ambientLight intensity={0.4} />
                <pointLight position={[20, 20, 20]} intensity={1} />

                <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

                <PCAGrid />

                <MagnetLinkVisualization nodes={nodes} />

                {selectedNode && <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />}

                <group>
                    {Array.isArray(nodes) && nodes.map((node) => {
                        let color = '#334155'; // Background
                        let isSelected = false;
                        if (node.score !== undefined) {
                            if (node.score > 0.8) {
                                color = '#bef264'; // High
                                isSelected = true;
                            }
                            else if (node.score > 0.5) color = '#84cc16'; // Med
                            else if (node.score > 0.2) color = '#475569'; // Low
                        }

                        return (
                            <VectorNode
                                key={node.id}
                                position={node.position}
                                color={color}
                                label={(node.metadata?.title as string) || (node.metadata?.label as string) || ''}
                                score={node.score}
                                metadata={node.metadata}
                                isSelected={isSelected}
                                isTopRanked={topNodeIds.has(node.id)}
                                onClick={() => setSelectedNode(node)}
                            />
                        );
                    })}
                </group>

                <EffectComposer>
                    <Bloom luminanceThreshold={1} intensity={0.8} radius={0.3} />
                    <Noise opacity={0.02} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>

                <OrbitControls enableDamping dampingFactor={0.05} minDistance={5} maxDistance={40} />
            </Canvas>

            <div className="absolute bottom-6 left-6 pointer-events-none z-20">
                <p className="text-[10px] font-mono text-[#bef264] uppercase tracking-widest opacity-40">
                    Source: PCA Dimension Reduction<br />
                    Kernel: all-MiniLM-L6-v2
                </p>
            </div>
        </div>
    );
};
