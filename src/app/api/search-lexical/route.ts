import { NextRequest, NextResponse } from 'next/server';
import { getIndex, ensureIndex } from '@/lib/pinecone';
import { BM25 } from '@/lib/bm25';

export async function POST(req: NextRequest) {
    try {
        const { query, topK = 10, indexName } = await req.json();
        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        const start = performance.now();
        await ensureIndex(indexName);
        const index = getIndex(indexName);
        if (!index) {
            return NextResponse.json({ error: 'Pinecone is not configured' }, { status: 503 });
        }

        // Fetch corpus for BM25
        // Note: For a demo, we assume the index is small (<1000 nodes)
        const queryResponse = await index.query({
            vector: Array(384).fill(0), // Dummy vector to get nodes
            topK: 1000,
            includeMetadata: true,
        });

        const docs = queryResponse.matches
            .filter((m: any) => m.metadata && m.metadata.text)
            .map((m: any) => ({
                id: m.id,
                text: (m.metadata!.text as string),
            }));

        if (docs.length === 0) {
            return NextResponse.json({ results: [], timeMs: performance.now() - start });
        }

        const bm25 = new BM25(docs);
        const lexicalResults = bm25.search(query, topK);

        // Map back to include metadata
        const results = lexicalResults.map((res: any) => {
            const match = queryResponse.matches.find((m: any) => m.id === res.id);
            return {
                id: res.id,
                score: res.score,
                metadata: match?.metadata,
            };
        });

        const end = performance.now();

        return NextResponse.json({
            results,
            timeMs: end - start,
        });
    } catch (error: any) {
        console.error('Lexical search error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
