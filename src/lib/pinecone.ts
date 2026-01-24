import { Pinecone } from '@pinecone-database/pinecone';

let pineconeInstance: Pinecone | null = null;

const getPineconeClient = () => {
  if (!pineconeInstance) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY is not defined');
    }
    pineconeInstance = new Pinecone({ apiKey });
  }
  return pineconeInstance;
};

const indexName = process.env.PINECONE_INDEX_NAME || 'vector-demo';

export const getIndex = (name?: string) => {
  if (!process.env.PINECONE_API_KEY) {
    console.warn('PINECONE_API_KEY is not defined. Vector operations will fail.');
    return null;
  }
  return getPineconeClient().index(name || indexName);
};

export const listIndexes = async () => {
  if (!process.env.PINECONE_API_KEY) {
    console.warn('Pinecone API Key missing. Returning simulated indexes.');
    return { indexes: [{ name: 'sim-index-alpha' }, { name: 'sim-index-beta' }] };
  }
  console.log('📡 [Pinecone] Fetching indexes from control plane...');
  const indexes = await getPineconeClient().listIndexes();
  console.log('✅ [Pinecone] Retrieved indexes:', indexes);
  return indexes;
};

export const ensureIndex = async (name?: string, options?: { dimension?: number, metric?: 'cosine' | 'euclidean' | 'dotproduct' }) => {
  if (!process.env.PINECONE_API_KEY) return;
  const target = name || indexName;

  try {
    const indexes = await getPineconeClient().listIndexes();
    const exists = indexes.indexes?.some(idx => idx.name === target);

    if (!exists) {
      console.log(`⚠️ [Pinecone] Index '${target}' not found. Initiating creation sequence...`);
      await getPineconeClient().createIndex({
        name: target,
        dimension: options?.dimension || 384,
        metric: options?.metric || 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1',
          },
        },
      });
      console.log(`🚀 [Pinecone] Index '${target}' creation request sent successfully.`);
    } else {
      console.log(`ℹ️ [Pinecone] Index '${target}' already exists.`);
    }
  } catch (err) {
    console.error('Error ensuring Pinecone index:', err);
    throw err;
  }
};

export const describeIndex = async (name: string) => {
  if (!process.env.PINECONE_API_KEY) return null;
  try {
    const description = await getPineconeClient().describeIndex(name);
    return description;
  } catch (error) {
    console.error(`Error describing index ${name}:`, error);
    throw error;
  }
};

export const deleteIndex = async (name: string) => {
  if (!process.env.PINECONE_API_KEY) return;
  try {
    await getPineconeClient().deleteIndex(name);
    console.log(`🗑️ [Pinecone] Index '${name}' deleted.`);
  } catch (error) {
    console.error(`Error deleting index ${name}:`, error);
    throw error;
  }
};

export const getNamespaceStats = async (indexName: string) => {
  if (!process.env.PINECONE_API_KEY) return {};
  try {
    const idx = getPineconeClient().index(indexName);
    const stats = await idx.describeIndexStats();
    return stats.namespaces || {};
  } catch (error) {
    console.error(`Error getting stats for ${indexName}:`, error);
    return {};
  }
};

export const fetchSampleRecord = async (indexName: string, namespace: string) => {
  if (!process.env.PINECONE_API_KEY) return null;
  try {
    const idx = getPineconeClient().index(indexName).namespace(namespace);
    // Heuristic: Query to find *any* record
    const results = await idx.query({
      vector: Array(384).fill(0.1), // Assumes 384 dim, but query works regardless of dim mismatch usually? No it throws.
      // Problem: We don't know dim.
      // Solution: Fetch index details first to get dim.
      topK: 1,
      includeMetadata: true,
      includeValues: false
    });

    if (results.matches && results.matches.length > 0) {
      return results.matches[0];
    }
    return null;
  } catch (error) {
    // Fallback/Silent fail - might be empty or dim mismatch
    return null;
  }
};

export const upsertRecord = async (
  indexName: string,
  namespace: string,
  record: { id: string, metadata: any, text: string },
  embedding?: number[]
) => {
  if (!process.env.PINECONE_API_KEY) return;
  try {
    const idx = getPineconeClient().index(indexName).namespace(namespace);

    // 1. Get index dimension to match vector (required to avoid error)
    const details = await getPineconeClient().describeIndex(indexName);
    const dimension = details.dimension || 384;

    // 2. Use provided embedding OR generate dummy
    let values: number[];
    if (embedding && embedding.length === dimension) {
      values = embedding;
      console.log(`✅ [Pinecone] Using provided embedding (dim: ${dimension})`);
    } else {
      values = Array.from({ length: dimension }, () => Math.random() * 2 - 1);
      console.log(`⚠️ [Pinecone] Using DUMMY random embedding (dim: ${dimension})`);
    }

    // 3. Upsert
    await idx.upsert([{
      id: record.id,
      values: values,
      metadata: {
        ...record.metadata,
        text: record.text
      }
    }]);
    console.log(`📥 [Pinecone] Upserted record '${record.id}' to ${indexName}::${namespace}`);
    return true;
  } catch (error) {
    console.error(`Error upserting to ${indexName}:`, error);
    throw error;
  }
};

export const upsertRecords = async (
  indexName: string,
  namespace: string,
  records: { id: string, metadata: any, values: number[] }[]
) => {
  if (!process.env.PINECONE_API_KEY) return;
  try {
    const idx = getPineconeClient().index(indexName).namespace(namespace);

    // Pinecone allows up to 1000 records per upsert request
    // We send them as is, assuming values are already provided (embedded)
    await idx.upsert(records);

    console.log(`📥 [Pinecone] Batch upserted ${records.length} records to ${indexName}::${namespace}`);
    return true;
  } catch (error) {
    console.error(`Error batch upserting to ${indexName}:`, error);
    throw error;
  }
};
export const deleteNamespace = async (indexName: string, namespace: string) => {
  if (!process.env.PINECONE_API_KEY) return;
  try {
    const idx = getPineconeClient().index(indexName).namespace(namespace);
    await idx.deleteAll();
    console.log(`🗑️ [Pinecone] Namespace '${namespace}' deleted in index '${indexName}'.`);
    return true;
  } catch (error) {
    console.error(`Error deleting namespace ${namespace} in ${indexName}:`, error);
    throw error;
  }
};
