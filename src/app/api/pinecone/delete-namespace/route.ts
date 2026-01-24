import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { deleteNamespace } from '@/lib/pinecone';

export async function DELETE(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const indexName = searchParams.get('indexName');
    const namespace = searchParams.get('namespace');

    if (!indexName || !namespace) {
        return NextResponse.json({ error: 'Index name and namespace are required' }, { status: 400 });
    }

    try {
        console.log(`[API] Deleting namespace ${namespace} from ${indexName}`);
        await deleteNamespace(indexName, namespace);
        return NextResponse.json({ success: true, message: `Namespace ${namespace} deleted` });
    } catch (error: any) {
        console.error('[API] Delete namespace failed:', error);
        return NextResponse.json({ error: error.message || 'Deletion failed' }, { status: 500 });
    }
}
