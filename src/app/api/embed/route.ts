import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding, tokenize } from '@/lib/embeddings';

export async function POST(req: NextRequest) {
    try {
        const { text } = await req.json();
        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const start = performance.now();
        const embedding = await generateEmbedding(text);
        const tokens = await tokenize(text);
        const end = performance.now();

        return NextResponse.json({
            embedding,
            tokens,
            timeMs: end - start,
        });
    } catch (error: any) {
        console.error('Embedding error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
