import { pipeline, env } from '@xenova/transformers';

// Disable local models for server-side if needed, though Xenova works fine
// Configure Xenova to use /tmp for caching (required for Vercel/Lambda readonly FS)
env.allowLocalModels = false;
env.useBrowserCache = false;
// ts-expect-error - env.cacheDir is valid in Node runtime but types might differ
env.cacheDir = '/tmp/.cache';

// Define a more specific type if possible, or use unknown with type guards. 
// For now, we'll use a functional type alias for the pipeline to avoid 'any'.
type FeatureExtractionPipeline = (text: string, options?: { pooling: string; normalize: boolean }) => Promise<{ data: Float32Array }>;
type Tokenizer = { decode: (ids: number[]) => string };
type Pipeline = FeatureExtractionPipeline & { tokenizer: Tokenizer };

let extractor: Pipeline | null = null;

export const getExtractor = async () => {
    if (!extractor) {
        // @ts-expect-error - Xenova types are loose
        // Using all-MiniLM-L6-v2 as requested. NOTE: This requires 'next.config.ts' serverExternalPackages fix to work on Vercel.
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', { quantized: true });
    }
    return extractor!;
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
    console.log('[Embeddings] generateEmbedding called for text length:', text.length);
    const extract = await getExtractor();
    console.log('[Embeddings] Pipeline ready, running feature extraction...');
    const output = await extract(text, { pooling: 'mean', normalize: true });
    console.log('[Embeddings] Feature extraction complete.');
    return Array.from(output.data);
};

export const generateEmbeddings = async (texts: string[]): Promise<number[][]> => {
    const extract = await getExtractor();
    const results: number[][] = [];

    // Xenova/Transformers.js can handle arrays directly in some versions, 
    // but for stability and progress tracking potential, we loop or use Promise.all
    // Here we'll do them sequentially or in small chunks if needed, but for local miniLM, sequential is fast enough.
    for (const text of texts) {
        const output = await extract(text, { pooling: 'mean', normalize: true });
        results.push(Array.from(output.data));
    }
    return results;
};

export const tokenize = async (text: string): Promise<string[]> => {
    const extract = await getExtractor();
    // @ts-expect-error - Accessing internal tokenizer properties
    const tokens = extract.tokenizer(text);
    // Return the actual token strings
    return Array.from(tokens.input_ids.data).map((id: unknown) => extract.tokenizer.decode([Number(id)]));
};
