'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Billboard, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, Noise, Vignette, Scanline } from '@react-three/postprocessing';

interface VectorNodeProps {
    position: [number, number, number];
    color: string;
    label: string;
    score?: number;
    metadata?: any;
    isSelected?: boolean;
    isTopRanked?: boolean;
    onClick?: () => void;
}

const VectorNode: React.FC<VectorNodeProps> = ({ position, color, label, score, metadata, isSelected, isTopRanked, onClick }) => {
    // Fallback labels
    const displayLabel = metadata?.label || metadata?.title || label || '';

    // Show label if selected (high score) OR if it's one of the top ranked search results
    const showLabel = isSelected || isTopRanked;

    return (
        <group position={position} onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
            <mesh>
                <sphereGeometry args={[showLabel ? 0.25 : 0.12, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={showLabel ? 5 : 1}
                    toneMapped={false}
                />
            </mesh>

            {displayLabel && showLabel && (
                <Billboard
                    follow={true}
                    position={[0, 0.4, 0]}
                >
                    <Text
                        fontSize={0.2}
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

const NodeDetailPanel: React.FC<{ node: any; onClose: () => void }> = ({ node, onClose }) => {
    if (!node) return null;

    return (
        <Html position={[0, 0, 0]} center style={{ pointerEvents: 'none' }}>
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-black/90 border border-[#bef264] p-6 text-[#e2e8f0] font-mono z-50 pointer-events-auto shadow-[0_0_50px_rgba(190,242,100,0.2)] backdrop-blur-md">
                <div className="flex justify-between items-start mb-4 border-b border-slate-800 pb-2">
                    <h3 className="text-[#bef264] font-black uppercase text-sm tracking-widest">{node.metadata?.title || node.id.substring(0, 8)}</h3>
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-slate-500 hover:text-white text-xs">[CLOSE]</button>
                </div>

                <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-[80px_1fr] gap-2">
                        <span className="text-slate-500 uppercase tracking-wider">Score</span>
                        <span className="text-[#bef264] font-bold">{(node.score * 100).toFixed(2)}%</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-2">
                        <span className="text-slate-500 uppercase tracking-wider">ID</span>
                        <span className="text-slate-300 break-all">{node.id}</span>
                    </div>
                    {node.metadata?.text && (
                        <div className="mt-4 pt-4 border-t border-slate-800">
                            <span className="text-slate-500 uppercase tracking-wider block mb-2">Content Payload</span>
                            <p className="text-slate-300 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                "{node.metadata.text}"
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Html>
    );
};

const MagnetLinkVisualization: React.FC<{ nodes: any[] }> = ({ nodes }) => {
    const markerGroupRef = useRef<THREE.Group>(null);
    const pulseRef = useRef<THREE.Group>(null);
    const queryPosRef = useRef(new THREE.Vector3(0, 0, 0));
    const [animState, setAnimState] = useState<'IDLE' | 'FLYING' | 'EXTENDING'>('IDLE');
    const [lineProgress, setLineProgress] = useState(0);

    // 1. Find Top 3 Nodes
    const topNodes = useMemo(() => {
        return [...nodes]
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 3)
            .filter(n => (n.score || 0) > 0.5);
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

    // Trigger Animation Sequence when Target Changes
    useEffect(() => {
        if (topNodes.length > 0) {
            setAnimState('FLYING');
            setLineProgress(0);
        } else {
            setAnimState('IDLE');
        }
    }, [targetCentroid]);

    useFrame(({ clock }, delta) => {
        const queryPos = queryPosRef.current;

        if (animState === 'FLYING') {
            const speed = 5.0 * delta; // Faster flight
            queryPos.lerp(targetCentroid, speed);
            if (queryPos.distanceTo(targetCentroid) < 0.1) {
                queryPos.copy(targetCentroid);
                setAnimState('EXTENDING');
            }
        }
        else if (animState === 'EXTENDING') {
            setLineProgress(prev => Math.min(prev + (delta * 1.5), 1));
        }

        // Update the marker group position directly
        if (markerGroupRef.current) {
            markerGroupRef.current.position.copy(queryPos);
        }

        // Pulse animation
        if (pulseRef.current) {
            const t = clock.getElapsedTime();
            const scale = 1 + Math.sin(t * 4) * 0.15;
            pulseRef.current.scale.setScalar(scale);
        }
    });

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
                    <sphereGeometry args={[0.35, 32, 32]} />
                    <meshStandardMaterial
                        color="#ef4444"
                        emissive="#ef4444"
                        emissiveIntensity={3}
                        toneMapped={false}
                    />
                </mesh>

                {/* Pulsing outer ring */}
                <group ref={pulseRef}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.5, 0.6, 32]} />
                        <meshBasicMaterial color="#ef4444" transparent opacity={0.4} side={THREE.DoubleSide} />
                    </mesh>
                </group>

                {/* Label */}
                <Billboard position={[0, 0.8, 0]}>
                    <Text fontSize={0.25} color="#ef4444">QUERY</Text>
                </Billboard>
            </group>

            {/* Glowing Connection Lines */}
            {animState !== 'FLYING' && topNodes.map((node, i) => (
                <Line
                    key={`link-${i}`}
                    points={[
                        queryPosRef.current,
                        new THREE.Vector3().lerpVectors(queryPosRef.current, new THREE.Vector3(...node.position), lineProgress)
                    ]}
                    color="#ef4444"
                    lineWidth={2}
                    dashed={true}
                    dashScale={2}
                    dashSize={1}
                    gapSize={0.5}
                    transparent
                    opacity={0.4 * lineProgress}
                />
            ))}
        </group>
    );
};

const DebugConsole: React.FC<{ topNodes: any[] }> = ({ topNodes }) => {
    return (
        <div className="absolute top-2 left-2 z-30 font-mono text-[10px] bg-black/80 border border-slate-800 p-3 w-64 text-[#bef264] pointer-events-none backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-2">
                <span className="uppercase font-black tracking-widest">Sys_Console</span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
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
                                <span className="text-slate-500">#{i + 1}</span> <span className="text-white">{node.metadata?.title || node.id}</span>
                                <span className="block text-slate-600 ml-4">CONFIDENCE: {(node.score * 100).toFixed(1)}%</span>
                            </div>
                        ))}
                    </>
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
    nodes: { id: string; position: [number, number, number]; metadata?: any; score?: number }[];
}

export const VectorCanvas: React.FC<VectorCanvasProps> = ({ nodes }) => {
    const [selectedNode, setSelectedNode] = useState<any>(null);

    // Calculate top nodes at top level to pass to both Visualization and Console
    const topNodes = useMemo(() => {
        return [...nodes]
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 3)
            .filter(n => (n.score || 0) > 0.5);
    }, [nodes]);

    const topNodeIds = useMemo(() => new Set(topNodes.map(n => n.id)), [topNodes]);

    return (
        <div className="w-full h-full bg-[#05070a] overflow-hidden border border-slate-800 relative group/canvas flex flex-col">
            <div className="absolute inset-0 grain-overlay z-10 pointer-events-none" />

            {/* Debug Console Overlay */}
            <DebugConsole topNodes={topNodes} />

            {/* PCA Title Overlay */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.3em]">3D Embedding Visualization</h3>
            </div>

            {/* Interactive Legend Overlay (Top Right) */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 bg-black/80 border border-slate-800 p-3 md:p-4 space-y-2 pointer-events-none backdrop-blur-sm shadow-xl">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-slate-500 shadow-[0_0_10px_rgba(148,163,184,0.5)]" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Node</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-2 h-2 md:w-3 md:h-3 text-[#ef4444] font-black text-[10px] md:text-xs flex items-center justify-center">×</div>
                    <span className="text-[10px] font-bold text-[#ef4444] uppercase tracking-widest">Query</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 border-t border-slate-800 pt-2 mt-1">
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
                                label={node.metadata?.title || node.metadata?.label || ''}
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
