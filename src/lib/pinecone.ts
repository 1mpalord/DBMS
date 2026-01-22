import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const indexName = process.env.PINECONE_INDEX_NAME || 'vector-demo';

export const getIndex = (name?: string) => {
  if (!process.env.PINECONE_API_KEY) {
    console.warn('PINECONE_API_KEY is not defined. Vector operations will fail.');
    return null as any;
  }
  return pinecone.index(name || indexName);
};

export const listIndexes = async () => {
  return await pinecone.listIndexes();
};

export const ensureIndex = async (name?: string) => {
  if (!process.env.PINECONE_API_KEY) return;
  const target = name || indexName;

  try {
    const indexes = await pinecone.listIndexes();
    const exists = indexes.indexes?.some(idx => idx.name === target);

    if (!exists) {
      console.log(`Index ${target} not found. Creating...`);
      await pinecone.createIndex({
        name: target,
        dimension: 384,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });
      console.log(`Index ${indexName} creation initiated.`);
      // Optional: Wait for index to be ready. 
      // For simplified demo, we trust the next calls might retry or wait.
    }
  } catch (err) {
    console.error('Error ensuring Pinecone index:', err);
  }
};
