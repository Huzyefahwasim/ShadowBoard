
export interface RedditPost {
  title: string;
  url: string;
  selftext: string;
  subreddit: string;
  score: number;
  num_comments: number;
  created_utc: number;
  permalink: string;
}

export class RedditService {
  private static readonly BASE_URL = "https://www.reddit.com";
  
  /**
   * Search for relevant discussions on Reddit.
   * Note: This uses the public JSON API which is rate limited.
   * In a production environment, use OAuth with proper credentials.
   */
  static async searchRelevantDiscussions(query: string, limit: number = 5): Promise<RedditPost[]> {
    try {
      // Create a search query focused on problems/questions related to the idea
      // We'll trust the caller to provide a good query, but we could refine it here
      const searchUrl = `${this.BASE_URL}/search.json?q=${encodeURIComponent(query)}&sort=relevance&t=year&limit=${limit}`;
      
      console.log(`Searching Reddit for: ${query}`);
      
      const response = await fetch(searchUrl, {
        headers: {
          // Use a generic user agent to avoid being blocked immediately
          "User-Agent": "Mozilla/5.0 (compatible; SovereignSuite/1.0; +http://localhost)"
        }
      });

      if (!response.ok) {
        console.warn(`Reddit API returned ${response.status}: ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      
      if (!data || !data.data || !data.data.children) {
        return [];
      }

      return data.data.children.map((child: any) => ({
        title: child.data.title,
        url: child.data.url,
        selftext: child.data.selftext ? child.data.selftext.substring(0, 300) + (child.data.selftext.length > 300 ? "..." : "") : "",
        subreddit: child.data.subreddit_name_prefixed,
        score: child.data.score,
        num_comments: child.data.num_comments,
        created_utc: child.data.created_utc,
        permalink: `${this.BASE_URL}${child.data.permalink}`
      }));

    } catch (error) {
      console.error("Error searching Reddit:", error);
      return [];
    }
  }

  /**
   * Formats Reddit posts into a context string for the LLM
   */
  static formatForContext(posts: RedditPost[]): string {
    if (posts.length === 0) {
      return "No relevant Reddit discussions found.";
    }

    let context = "Relevant discussions found on Reddit:\n\n";
    
    posts.forEach((post, index) => {
      context += `${index + 1}. [${post.subreddit}] ${post.title}\n`;
      context += `   Score: ${post.score} | Comments: ${post.num_comments}\n`;
      if (post.selftext) {
        context += `   Snippet: "${post.selftext}"\n`;
      }
      context += `   Link: ${post.permalink}\n\n`;
    });

    return context;
  }
}
