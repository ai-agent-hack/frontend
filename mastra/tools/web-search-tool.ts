import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import FirecrawlApp from "@mendable/firecrawl-js";

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

export const webSearchTool = createTool({
	id: "web-search",
	description: "Search the web for information about spots, travel recommendations, or general information",
	inputSchema: z.object({
		query: z.string().describe("The search query"),
		limit: z.number().default(3).describe("Maximum number of results to return"),
		summaryOnly: z.boolean().default(true).describe("Return only search summaries without full content scraping"),
	}),
	outputSchema: z.object({
		markdown: z.string(),
	}),
	execute: async ({ context }) => {
		const query = context.query;
		const limit = context.limit || 3;
		const summaryOnly = context.summaryOnly !== false; // Default to true

		try {
			// Initialize Firecrawl
			const app = new FirecrawlApp({
				apiKey: FIRECRAWL_API_KEY,
			});

			// Perform search using Firecrawl
			const searchResults = await app.search(query, {
				limit: limit,
			});

			// If summaryOnly, return just the search results without scraping
			if (summaryOnly) {
				const summaryParts = (searchResults.data || []).slice(0, limit).map((result: any, index: number) => {
					const title = result.title || "No title";
					const source = result.url ? new URL(result.url).hostname : "Unknown source";
					const description = result.description || result.excerpt || result.snippet || "No description available";
					return `### ${index + 1}. ${title}\n\n**URL:** ${result.url}\n**Source:** ${source}\n\n${description}\n`;
				});
				
				const header = `# Web Search Results for "${query}"\n\n`;
				return {
					markdown: header + (summaryParts.join('\n') || `No results found.`),
				};
			}
			
			// Process all URLs in parallel for better performance
			const scrapePromises = (searchResults.data || []).slice(0, limit).map(async (result: any) => {
				try {
					// Skip if URL is undefined
					if (!result.url) return null;
					
					// Scrape each result URL to get markdown content
					const scrapedData = await app.scrapeUrl(result.url, {
						formats: ['markdown'],
						timeout: 5000, // 5 second timeout for faster response
						waitFor: 1000, // Don't wait for JavaScript
						onlyMainContent: true, // Only extract main content for faster processing
					});
					
					// Check if scraping was successful
					if (scrapedData.success && 'markdown' in scrapedData) {
						const title = result.title || scrapedData.metadata?.title || "No title";
						const source = new URL(result.url).hostname;
						
						// Return formatted markdown for this result
						return `## ${title}\n\n**Source:** [${source}](${result.url})\n\n${scrapedData.markdown}\n\n---\n`;
					}
					return null;
				} catch (scrapeError: any) {
					console.error(`Error scraping ${result.url}:`, scrapeError);
					// Return error info but continue processing other results
					const title = result.title || "No title";
					const source = result.url ? new URL(result.url).hostname : "Unknown source";
					return `## ${title}\n\n**Source:** [${source}](${result.url})\n\n*Error retrieving content: ${scrapeError.message || 'Unknown error'}*\n\n---\n`;
				}
			});
			
			// Wait for all scraping to complete
			const results = await Promise.all(scrapePromises);
			const markdownParts = results.filter(result => result !== null) as string[];

			return {
				markdown: markdownParts.join('\n') || `No results found for "${query}"`,
			};
		} catch (error) {
			console.error("Error searching with Firecrawl:", error);
			
			// Fallback to error message
			return {
				markdown: `Error searching for "${query}": ${error}`,
			};
		}
	},
});