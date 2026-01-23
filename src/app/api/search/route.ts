import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { generateEmbedding } from '@/lib/embeddings';
import { BM25 } from '@/lib/bm25';

// Remove top-level init to prevent cold-start crashes
// const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

export async function POST(req: NextRequest) {
    console.log('[Search API] HIT - Request received. Function started.');
    try {
        const { indexName, namespace, query, searchType, alpha = 0.7, topK = 5 } = await req.json();

        if (!indexName || !query) {
            return NextResponse.json({ error: 'Index name and query are required' }, { status: 400 });
        }

        const ns = namespace || '';
        const start = Date.now();
        console.log(`[Search API] ${searchType} search on ${indexName}::${ns} for "${query}"`);

        if (!process.env.PINECONE_API_KEY) {
            throw new Error('PINECONE_API_KEY is not defined in environment variables');
        }

        const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
        const idx = pinecone.index(indexName).namespace(ns);
        let results: { id: string; score: number; metadata?: any }[] = [];
        let queryVector: number[] | null = null;

        if (searchType === 'semantic') {
            // Pure semantic search via Pinecone
            console.log('[Search API] Starting vector generation...');
            const embedding = await generateEmbedding(query);
            console.log('[Search API] Vector generated successfully.');
            queryVector = embedding;

            const queryResult = await idx.query({
                vector: embedding,
                topK: topK,
                includeMetadata: true
            });
            results = (queryResult.matches || []).map((m: any) => ({
                id: m.id,
                score: m.score || 0,
                metadata: m.metadata
            }));
        }
        else if (searchType === 'lexical') {
            // BM25 Lexical Search
            // Fetch documents to build corpus (limited for demo)
            const stats = await idx.describeIndexStats();
            const vectorCount = stats.namespaces?.[ns]?.recordCount || 0;

            if (vectorCount === 0) {
                return NextResponse.json({ success: true, results: [], timeMs: Date.now() - start, queryVector: null });
            }

            // Fetch sample vectors (up to 100 for BM25)
            // Note: Pinecone doesn't have a "list all" - we use query with random vector
            const dummyVector = Array(384).fill(0.1);
            const allDocs = await idx.query({
                vector: dummyVector,
                topK: Math.min(vectorCount, 100),
                includeMetadata: true
            });

            const corpus = (allDocs.matches || [])
                .filter(m => m.metadata?.text)
                .map(m => ({ id: m.id, text: String(m.metadata?.text || ''), metadata: m.metadata }));

            if (corpus.length === 0) {
                return NextResponse.json({ success: true, results: [], timeMs: Date.now() - start, queryVector: null });
            }

            const bm25 = new BM25(corpus);
            const bm25Results = bm25.search(query, topK);

            results = bm25Results.map(r => ({
                id: r.id,
                score: Math.min(r.score / 10, 1), // Normalize BM25 score to 0-1
                metadata: corpus.find(c => c.id === r.id)?.metadata
            }));
        }
        else if (searchType === 'hybrid') {
            // Hybrid: Combine Semantic + BM25
            const embedding = await generateEmbedding(query);
            queryVector = embedding;

            // Step 1: Semantic results
            const semanticResult = await idx.query({
                vector: embedding,
                topK: topK * 2,
                includeMetadata: true
            });
            const semanticScores = new Map<string, { score: number; metadata?: any }>();
            (semanticResult.matches || []).forEach(m => {
                semanticScores.set(m.id, { score: m.score || 0, metadata: m.metadata });
            });

            // Step 2: BM25 results
            const corpus = (semanticResult.matches || [])
                .filter(m => m.metadata?.text)
                .map(m => ({ id: m.id, text: String(m.metadata?.text || ''), metadata: m.metadata }));

            const bm25 = new BM25(corpus);
            const bm25Results = bm25.search(query, topK * 2);
            const bm25Scores = new Map<string, number>();
            bm25Results.forEach(r => bm25Scores.set(r.id, Math.min(r.score / 10, 1)));

            // Step 3: Combine with alpha
            const combined = new Map<string, { score: number; metadata?: any }>();
            const allIds = new Set([...semanticScores.keys(), ...bm25Scores.keys()]);

            allIds.forEach(id => {
                const semScore = semanticScores.get(id)?.score || 0;
                const lexScore = bm25Scores.get(id) || 0;
                const hybridScore = alpha * semScore + (1 - alpha) * lexScore;
                combined.set(id, {
                    score: hybridScore,
                    metadata: semanticScores.get(id)?.metadata || corpus.find(c => c.id === id)?.metadata
                });
            });

            results = Array.from(combined.entries())
                .map(([id, data]) => ({ id, score: data.score, metadata: data.metadata }))
                .sort((a, b) => b.score - a.score)
                .slice(0, topK);
        }

        const timeMs = Date.now() - start;
        console.log(`[Search API] Found ${results.length} results in ${timeMs}ms`);

        return NextResponse.json({ success: true, results, timeMs, queryVector });
    } catch (error: any) {
        console.error('[Search API] Error:', error);
        return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
    }
}
