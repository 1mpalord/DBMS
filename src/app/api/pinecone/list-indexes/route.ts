import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { listIndexes } from '@/lib/pinecone';

export async function GET() {
    try {
        const indexes = await listIndexes();
        return NextResponse.json({ indexes: indexes.indexes || [] });
    } catch (error) {
        console.error('Error listing indexes:', error);
        return NextResponse.json({ error: 'Failed to list indexes' }, { status: 500 });
    }
}
