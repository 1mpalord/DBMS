import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const indexName = searchParams.get('indexName');
    const namespace = searchParams.get('namespace') || '';
    const id = searchParams.get('id');

    if (!indexName || !id) {
        return NextResponse.json({ error: 'Index name and ID are required' }, { status: 400 });
    }

    try {
        console.log(`[API] Fetching record ${id} from ${indexName}::${namespace}`);
        const idx = pinecone.index(indexName).namespace(namespace);
        const result = await idx.fetch([id]);

        if (result.records && result.records[id]) {
            return NextResponse.json({
                success: true,
                found: true,
                record: result.records[id]
            });
        } else {
            return NextResponse.json({ success: true, found: false });
        }
    } catch (error: any) {
        console.error('[API] Fetch by ID failed:', error);
        return NextResponse.json({ error: error.message || 'Fetch failed' }, { status: 500 });
    }
}
