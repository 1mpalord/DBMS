import { NextRequest, NextResponse } from 'next/server';
import { upsertRecord, upsertRecords } from '@/lib/pinecone';

export async function POST(req: NextRequest) {
    try {
        const { indexName, namespace, record, embedding, records } = await req.json();

        if (!indexName) {
            return NextResponse.json({ error: 'Index Name is required' }, { status: 400 });
        }

        const ns = namespace || '';

        if (records && Array.isArray(records)) {
            console.log(`[API] Batch upserting ${records.length} records to ${indexName}::${ns}`);
            await upsertRecords(indexName, ns, records);
            return NextResponse.json({ success: true, message: `${records.length} records upserted.` });
        } else if (record) {
            if (!record.id) {
                return NextResponse.json({ error: 'Record ID is required for single upsert' }, { status: 400 });
            }
            console.log(`[API] Upserting record ${record.id} to ${indexName}::${ns}`);
            await upsertRecord(indexName, ns, record, embedding);
            return NextResponse.json({ success: true, message: `Record upserted.` });
        } else {
            return NextResponse.json({ error: 'Either record or records array is required' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('[API] Failed to upsert record:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
