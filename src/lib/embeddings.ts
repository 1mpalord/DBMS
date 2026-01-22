import { pipeline, env } from '@xenova/transformers';

// Disable local models for server-side if needed, though Xenova works fine
env.allowLocalModels = false;

let extractor: any = null;

export const getExtractor = async () => {
    if (!extractor) {
        extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }
    return extractor;
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
    const extract = await getExtractor();
    const output = await extract(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
};

export const tokenize = async (text: string): Promise<string[]> => {
    const extract = await getExtractor();
    const tokens = extract.tokenizer(text);
    // Return the actual token strings
    return Array.from(tokens.input_ids.data).map((id: any) => extract.tokenizer.decode([Number(id)]));
};
