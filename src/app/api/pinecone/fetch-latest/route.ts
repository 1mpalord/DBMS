import { NextRequest, NextResponse } from 'next/server';
import { fetchSampleRecord, describeIndex } from '@/lib/pinecone';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const indexName = searchParams.get('indexName');
    const namespace = searchParams.get('namespace') || '';

    if (!indexName) {
        return NextResponse.json({ error: 'Index name is required' }, { status: 400 });
    }

    try {
        // First check dim to maybe help query? No, just passed to query
        // We'll rely on the valid index being passed.

        const record = await fetchSampleRecord(indexName, namespace);

        if (!record) {
            // Return success with empty schema if no record found (new namespace)
            return NextResponse.json({ success: true, empty: true });
        }

        return NextResponse.json({ success: true, record });
    } catch (error: any) {
        console.error('[API] Failed to fetch latest record:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch record' }, { status: 500 });
    }
}
