import { NextRequest, NextResponse } from 'next/server';
import { fetchWikipediaArticles } from '@/lib/wikipedia';
import { generateEmbedding } from '@/lib/embeddings';
import { getIndex, ensureIndex } from '@/lib/pinecone';

export async function POST(req: NextRequest) {
    try {
        const { topics, countPerTopic, indexName } = await req.json();
        if (!topics || !Array.isArray(topics)) {
            return NextResponse.json({ error: 'Topics array is required' }, { status: 400 });
        }

        const articles = await fetchWikipediaArticles(topics, countPerTopic || 3);
        await ensureIndex(indexName);
        const index = getIndex(indexName);
        if (!index) {
            return NextResponse.json({ error: 'Pinecone is not configured' }, { status: 503 });
        }

        const vectors = [];
        for (const article of articles) {
            const embedding = await generateEmbedding(article.extract);
            vectors.push({
                id: article.id,
                values: embedding,
                metadata: {
                    title: article.title,
                    text: article.extract,
                    url: article.url,
                },
            });
        }

        // Upsert to Pinecone
        if (vectors.length > 0) {
            await index.upsert(vectors);
        }

        return NextResponse.json({
            success: true,
            count: vectors.length,
            articles: articles.map(a => ({ id: a.id, title: a.title })),
        });
    } catch (error: any) {
        console.error('Wikipedia seeding error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
