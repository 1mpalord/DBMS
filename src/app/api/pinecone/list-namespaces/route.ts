import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getNamespaceStats } from '@/lib/pinecone';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const indexName = searchParams.get('indexName');

    if (!indexName) {
        return NextResponse.json({ error: 'Index name is required' }, { status: 400 });
    }

    try {
        const namespaces = await getNamespaceStats(indexName);
        return NextResponse.json({ success: true, namespaces });
    } catch (error: any) {
        console.error('[API] Failed to get namespaces:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch namespaces' }, { status: 500 });
    }
}
