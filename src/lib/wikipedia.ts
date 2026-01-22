export interface WikipediaArticle {
    id: string;
    title: string;
    extract: string;
    url: string;
}

export const fetchWikipediaArticles = async (topics: string[], countPerTopic: number = 3): Promise<WikipediaArticle[]> => {
    const articles: WikipediaArticle[] = [];

    for (const topic of topics) {
        try {
            const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(topic)}&format=json&origin=*`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();

            if (searchData.query?.search) {
                const topResults = searchData.query.search.slice(0, countPerTopic);

                for (const result of topResults) {
                    const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&pageids=${result.pageid}&format=json&origin=*`;
                    const contentRes = await fetch(contentUrl);
                    const contentData = await contentRes.json();

                    const page = contentData.query.pages[result.pageid];
                    if (page && page.extract) {
                        articles.push({
                            id: result.pageid.toString(),
                            title: page.title,
                            extract: page.extract.slice(0, 500), // Keep snippet manageable
                            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`Error fetching Wikipedia articles for topic ${topic}:`, error);
        }
    }

    return articles;
};
