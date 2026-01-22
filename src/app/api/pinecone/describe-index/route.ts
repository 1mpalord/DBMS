import { NextRequest, NextResponse } from 'next/server';
import { describeIndex } from '@/lib/pinecone';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const name = searchParams.get('name');

    if (!name) {
        return NextResponse.json({ error: 'Index name is required' }, { status: 400 });
    }

    try {
        console.log(`[API] Pinging index status: ${name}`);
        const info = await describeIndex(name);

        if (!info) {
            return NextResponse.json({ error: 'Index not found or API unavailable' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            info: {
                name: info.name,
                status: info.status,
                dimension: info.dimension,
                metric: info.metric,
                host: info.host
            }
        });
    } catch (error: any) {
        console.error('[API] Failed to describe index:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
