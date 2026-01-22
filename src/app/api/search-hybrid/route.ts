import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/embeddings';
import { getIndex, ensureIndex } from '@/lib/pinecone';
import { BM25 } from '@/lib/bm25';

export async function POST(req: NextRequest) {
    try {
        const { query, topK = 10, alpha = 0.7, indexName } = await req.json();
        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        const start = performance.now();
        await ensureIndex(indexName);
        const index = getIndex(indexName);
        if (!index) {
            return NextResponse.json({ error: 'Pinecone is not configured' }, { status: 503 });
        }

        // 1. Semantic Search
        const embedding = await generateEmbedding(query);
        const semanticResponse = await index.query({
            vector: embedding,
            topK: 100, // Get more for re-ranking
            includeMetadata: true,
        });

        // 2. Lexical Search
        // Get all docs for BM25 (reusing semantic matches as a base or fetch all)
        // For full hybrid, we should fetch all, but for demo we can optimize
        const queryResponse = await index.query({
            vector: Array(384).fill(0),
            topK: 1000,
            includeMetadata: true,
        });

        const docs = queryResponse.matches
            .filter((m: any) => m.metadata && m.metadata.text)
            .map((m: any) => ({
                id: m.id,
                text: (m.metadata!.text as string),
            }));

        const bm25 = new BM25(docs);
        const lexicalResults = bm25.search(query, 100);

        // 3. Score Normalization & Combination
        const semanticScores: Record<string, number> = {};
        semanticResponse.matches.forEach((m: any) => {
            semanticScores[m.id] = m.score || 0;
        });

        const lexicalScores: Record<string, number> = {};
        const maxLexical = Math.max(...lexicalResults.map((r: any) => r.score), 1);
        lexicalResults.forEach((r: any) => {
            lexicalScores[r.id] = r.score / maxLexical; // Normalize to [0, 1]
        });

        // Combine IDs
        const allIds = new Set([...Object.keys(semanticScores), ...Object.keys(lexicalScores)]);
        const hybridResults = Array.from(allIds).map((id: string) => {
            const sScore = semanticScores[id] || 0;
            const lScore = lexicalScores[id] || 0;
            const score = alpha * sScore + (1 - alpha) * lScore;

            const match = queryResponse.matches.find((m: any) => m.id === id);
            return {
                id,
                score,
                metadata: match?.metadata,
                details: { semantic: sScore, lexical: lScore }
            };
        });

        const results = hybridResults
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);

        const end = performance.now();

        return NextResponse.json({
            results,
            timeMs: end - start,
            semanticTime: 0, // Could split if needed
            lexicalTime: 0
        });
    } catch (error: any) {
        console.error('Hybrid search error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
