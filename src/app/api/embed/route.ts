import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding, generateEmbeddings } from '@/lib/embeddings';

export async function POST(req: NextRequest) {
    try {
        const { text, texts, model } = await req.json();

        if (!text && (!texts || !Array.isArray(texts))) {
            return NextResponse.json({ error: 'Text or texts array is required' }, { status: 400 });
        }

        // For now, only Xenova is supported locally. Others require API keys.
        if (model && !model.startsWith('Xenova/')) {
            return NextResponse.json({
                error: 'Only Xenova models are supported without API key. OpenAI/Cohere coming soon.',
                supported: ['Xenova/all-MiniLM-L6-v2']
            }, { status: 400 });
        }

        if (texts && Array.isArray(texts)) {
            console.log(`[API] Batch generating embeddings for ${texts.length} items`);
            const embeddings = await generateEmbeddings(texts);
            return NextResponse.json({ success: true, embeddings, count: embeddings.length });
        } else {
            console.log(`[API] Generating embedding for text: "${text.substring(0, 50)}..."`);
            const embedding = await generateEmbedding(text);
            console.log(`[API] Embedding generated (dim: ${embedding.length})`);
            return NextResponse.json({ success: true, embedding, dimension: embedding.length });
        }
    } catch (error: any) {
        console.error('[API] Embedding generation failed:', error);
        return NextResponse.json({ error: error.message || 'Embedding generation failed' }, { status: 500 });
    }
}
