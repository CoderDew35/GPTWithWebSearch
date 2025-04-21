import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { WebSearchParams } from '../types';

export const webSearchFunction = {
  name: "web_search",
  description: "Performs a web search and returns top results.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query."
      },
      num_results: {
        type: "number",
        description: "Number of results to return (default: 5, max: 10)"
      }
    },
    required: ["query"]
  }
};

const SERP_API_BASE_URL = 'https://serpapi.com/search';

export async function performWebSearch({ query, numResults = 5 }: WebSearchParams): Promise<string> {
  try {
    const params = { 
      api_key: env.SERP_API_KEY,
      q: query, 
      location: "United States",
      hl: "en",
      gl: "us",
      num: Math.min(numResults, 10)
    };

    logger.info(`Performing web search for: "${query}"`);
    const response = await axios.get(SERP_API_BASE_URL, { params });
    const data = response.data;

    if (!data) {
      throw new Error("Failed to get search results: No data returned");
    }

    if (data.error) {
      throw new Error(`Search API error: ${data.error}`);
    }

    if (!data.organic_results || data.organic_results.length === 0) {
      return "No search results found for this query.";
    }

    const results = data.organic_results
      .slice(0, Math.min(numResults, 10))
      .map((result: any, index: number) => {
        return `[${index + 1}] ${result.title}\nURL: ${result.link}${result.snippet ? `\nSummary: ${result.snippet}` : ''}`;
      }).join('\n\n');

    // Include search metadata
    const searchInfo = data.search_metadata ? 
      `Search Query: "${query}" - Results as of ${new Date(data.search_metadata.created_at || Date.now()).toLocaleString()}` : 
      `Search Query: "${query}"`;

    return `${searchInfo}\n\n${results}`;
  } catch (error) {
    logger.error('Error performing web search:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to perform web search');
  }
}
