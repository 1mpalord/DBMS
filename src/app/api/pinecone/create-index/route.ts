import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { ensureIndex } from '@/lib/pinecone';

export async function POST(req: NextRequest) {
    try {
        const { indexName, dimension, metric } = await req.json();

        if (!indexName) {
            return NextResponse.json({ error: 'Index name is required' }, { status: 400 });
        }

        if (!/^[a-z0-9-]+$/.test(indexName)) {
            return NextResponse.json({ error: 'Invalid name. Lowercase a-z, 0-9, hyphen only.' }, { status: 400 });
        }

        console.log(`[API] Request received to create index: ${indexName} (Dim: ${dimension}, Metric: ${metric})`);
        await ensureIndex(indexName, { dimension: Number(dimension), metric });
        console.log(`[API] Index creation process completed for: ${indexName}`);

        return NextResponse.json({ success: true, message: `Index '${indexName}' creation initiated.` });
    } catch (error: any) {
        console.error('[API] Failed to create index:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
