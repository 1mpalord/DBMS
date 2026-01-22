import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/embeddings';
import { getIndex, ensureIndex } from '@/lib/pinecone';

export async function POST(req: NextRequest) {
    try {
        const { query, topK = 10, indexName } = await req.json();
        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        const start = performance.now();
        const embedding = await generateEmbedding(query);
        await ensureIndex(indexName);
        const index = getIndex(indexName);
        if (!index) {
            return NextResponse.json({ error: 'Pinecone is not configured' }, { status: 503 });
        }

        const queryResponse = await index.query({
            vector: embedding,
            topK: topK,
            includeMetadata: true,
        });

        const end = performance.now();

        return NextResponse.json({
            results: queryResponse.matches.map((m: any) => ({
                id: m.id,
                score: m.score,
                metadata: m.metadata,
            })),
            timeMs: end - start,
        });
    } catch (error: any) {
        console.error('Semantic search error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
