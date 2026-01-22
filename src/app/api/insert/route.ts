import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/embeddings';
import { getIndex } from '@/lib/pinecone';

export async function POST(req: NextRequest) {
    try {
        const { text, metadata, indexName } = await req.json();
        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const embedding = await generateEmbedding(text);
        const index = getIndex(indexName);
        if (!index) {
            return NextResponse.json({ error: 'Pinecone is not configured' }, { status: 503 });
        }

        await index.upsert([{
            id: Date.now().toString(),
            values: embedding,
            metadata: {
                ...metadata,
                text,
            },
        }]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Insert error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
