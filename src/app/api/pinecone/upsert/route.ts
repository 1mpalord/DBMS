import { NextRequest, NextResponse } from 'next/server';
import { upsertRecord } from '@/lib/pinecone';

export async function POST(req: NextRequest) {
    try {
        const { indexName, namespace, record, embedding } = await req.json();

        if (!indexName || !record || !record.id) {
            return NextResponse.json({ error: 'Index Name and Record ID are required' }, { status: 400 });
        }

        const ns = namespace || ''; // Handle default empty string

        console.log(`[API] Upserting record ${record.id} to ${indexName}::${ns}`);
        await upsertRecord(indexName, ns, record, embedding);

        return NextResponse.json({ success: true, message: `Record upserted.` });
    } catch (error: any) {
        console.error('[API] Failed to upsert record:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
