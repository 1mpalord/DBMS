import { NextRequest, NextResponse } from 'next/server';
import { deleteIndex } from '@/lib/pinecone';

export async function POST(req: NextRequest) {
    try {
        const { indexName } = await req.json();

        if (!indexName) {
            return NextResponse.json({ error: 'Index name is required' }, { status: 400 });
        }

        console.log(`[API] Request received to delete index: ${indexName}`);
        await deleteIndex(indexName);
        console.log(`[API] Index '${indexName}' deleted successfully.`);

        return NextResponse.json({ success: true, message: `Index '${indexName}' deleted.` });
    } catch (error: any) {
        console.error('[API] Failed to delete index:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
