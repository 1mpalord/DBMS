import { pipeline, env } from '@xenova/transformers';

// Disable local models for server-side if needed, though Xenova works fine
env.allowLocalModels = false;

// Define a more specific type if possible, or use unknown with type guards. 
// For now, we'll use a functional type alias for the pipeline to avoid 'any'.
type FeatureExtractionPipeline = (text: string, options?: { pooling: string; normalize: boolean }) => Promise<{ data: Float32Array }>;
type Tokenizer = { decode: (ids: number[]) => string };
type Pipeline = FeatureExtractionPipeline & { tokenizer: Tokenizer };

let extractor: Pipeline | null = null;

export const getExtractor = async () => {
    if (!extractor) {
        // @ts-expect-error - Xenova types are loose
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractor!;
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
    const extract = await getExtractor();
    const output = await extract(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
};

export const tokenize = async (text: string): Promise<string[]> => {
    const extract = await getExtractor();
    // @ts-expect-error - Accessing internal tokenizer properties
    const tokens = extract.tokenizer(text);
    // Return the actual token strings
    return Array.from(tokens.input_ids.data).map((id: unknown) => extract.tokenizer.decode([Number(id)]));
};
