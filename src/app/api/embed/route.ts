import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/embeddings';

export async function POST(req: NextRequest) {
    try {
        const { text, model } = await req.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // For now, only Xenova is supported locally. Others require API keys.
        if (model && !model.startsWith('Xenova/')) {
            return NextResponse.json({
                error: 'Only Xenova models are supported without API key. OpenAI/Cohere coming soon.',
                supported: ['Xenova/all-MiniLM-L6-v2']
            }, { status: 400 });
        }

        console.log(`[API] Generating embedding for text: "${text.substring(0, 50)}..."`);
        const embedding = await generateEmbedding(text);
        console.log(`[API] Embedding generated (dim: ${embedding.length})`);

        return NextResponse.json({ success: true, embedding, dimension: embedding.length });
    } catch (error: any) {
        console.error('[API] Embedding generation failed:', error);
        return NextResponse.json({ error: error.message || 'Embedding generation failed' }, { status: 500 });
    }
}
