export class BM25 {
    private k1: number = 1.5;
    private b: number = 0.75;
    private avgdl: number = 0;
    private docCount: number = 0;
    private docLens: Map<string, number> = new Map();
    private tf: Map<string, Map<string, number>> = new Map(); // term -> docId -> count
    private df: Map<string, number> = new Map(); // term -> count

    constructor(docs: { id: string; text: string }[]) {
        this.docCount = docs.length;
        let totalLen = 0;

        for (const doc of docs) {
            const tokens = this.tokenize(doc.text);
            this.docLens.set(doc.id, tokens.length);
            totalLen += tokens.length;

            const counts: Record<string, number> = {};
            for (const token of tokens) {
                counts[token] = (counts[token] || 0) + 1;
            }

            for (const [term, count] of Object.entries(counts)) {
                if (!this.tf.has(term)) this.tf.set(term, new Map());
                this.tf.get(term)!.set(doc.id, count);
                this.df.set(term, (this.df.get(term) || 0) + 1);
            }
        }

        this.avgdl = totalLen / this.docCount;
    }

    private tokenize(text: string): string[] {
        return text.toLowerCase().match(/\w+/g) || [];
    }

    public search(query: string, topK: number = 10): { id: string; score: number }[] {
        const queryTokens = this.tokenize(query);
        const scores: Record<string, number> = {};

        for (const term of queryTokens) {
            const df = this.df.get(term) || 0;
            if (df === 0) continue;

            const idf = Math.log((this.docCount - df + 0.5) / (df + 0.5) + 1);

            const docTfs = this.tf.get(term);
            if (!docTfs) continue;

            for (const [docId, tf] of docTfs.entries()) {
                const dl = this.docLens.get(docId)!;
                const score = idf * (tf * (this.k1 + 1)) / (tf + this.k1 * (1 - this.b + this.b * (dl / this.avgdl)));
                scores[docId] = (scores[docId] || 0) + score;
            }
        }

        return Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, topK)
            .map(([id, score]) => ({ id, score }));
    }
}
