export type TabId =
    | 'introduction'
    | 'embedding'
    | 'organization'
    | 'data-model'
    | 'query'
    | 'architecture';

export interface TabItem {
    id: TabId;
    label: string;
    icon: React.ReactNode;
}

// ALGORITHM CORRECTNESS: Must match Pinecone/API response structure
export interface SearchResult {
    id: string;
    score: number;
    metadata: Record<string, unknown>;
}

export interface SearchResponse {
    results: SearchResult[];
    matches?: SearchResult[]; // Legacy support
    timeMs: number;
}

export interface VisualNode {
    id: string;
    position: [number, number, number];
    score?: number;
    metadata?: Record<string, unknown>;
    color?: string; // For cluster visualization
}

export interface PerformanceMetrics {
    timeMs: number;
    semanticTime?: number;
    lexicalTime?: number;
    hybridTime?: number;
}
