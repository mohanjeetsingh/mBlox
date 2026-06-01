import { fetchJSONP, mapWordPressResponseToStandardFormat, mapRssResponseToStandardFormat, mapRssJsonToStandardFormat, mapBloggerResponseToStandardFormat, mapRedditResponseToStandardFormat } from './data-fetcher.js';

const CACHE_DURATION_MS = 15 * 60 * 1000;
const feedCache = new Map();

async function _fetchWithProxy(apiUrl) {
    const proxies = [
        { url: `https://api.codetabs.com/v1/proxy?quest=${apiUrl}`, type: 'raw' },
        { url: `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`, type: 'raw' },
        { url: `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`, type: 'json' }
    ];
    for (const proxy of proxies) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); 
            const response = await fetch(proxy.url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (response.ok) {
                let text;
                if (proxy.type === 'json') {
                    const data = await response.json();
                    text = data.contents;
                } else {
                    text = await response.text();
                }
                if (text && text.length > 0) {
                    // If it is a WordPress request, verify that the response is actually valid JSON
                    if (apiUrl.includes('/wp-json')) {
                        const trimmed = text.trim();
                        if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
                            console.warn(`mBlox: Proxy ${proxy.url} returned non-JSON HTML for WordPress: ${trimmed.substring(0, 100)}`);
                            continue;
                        }
                    }
                    return { text, response };
                }
            }
        } catch (e) {
            console.warn(`mBlox: Proxy attempt failed for ${apiUrl}: ${e.message}`);
        }
    }
    throw new Error(`All CORS proxies failed for ${apiUrl}`);
}

class WordPressProvider {
    constructor(config) { this.config = config; }
    _buildFeedUrl() {
        let baseUrl = this.config.siteURL;
        baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
        if (!baseUrl.endsWith('/posts/')) baseUrl += 'wp/v2/posts/';
        let apiUrl = `${baseUrl}?_embed&per_page=${this.config.postsPerBlock}&page=${this.config.stageID}`;
        if (this.config.contentType === 'label' && !isNaN(parseInt(this.config.labelName, 10))) apiUrl += `&categories=${this.config.labelName}`;
        return apiUrl;
    }
    async fetch() {
        const apiUrl = this._buildFeedUrl();
        const cached = feedCache.get(apiUrl);
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) return cached.data;
        const { text: responseText, response } = await _fetchWithProxy(apiUrl);
        try {
            const rawData = JSON.parse(responseText);
            const formattedData = mapWordPressResponseToStandardFormat(rawData, response.headers);
            feedCache.set(apiUrl, { data: formattedData, timestamp: Date.now() });
            return formattedData;
        } catch (e) {
            console.error("mBlox: Failed to parse WordPress JSON.", e);
            throw new Error("Invalid JSON response from WordPress feed.");
        }
    }
}

class RssProvider {
    constructor(config) { this.config = config; }
    _buildFeedUrl() { return this.config.siteURL; }
    async fetch() {
        const apiUrl = this._buildFeedUrl();
        const cached = feedCache.get(apiUrl);
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) return cached.data;
        const { text: xmlString } = await _fetchWithProxy(apiUrl);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        if (xmlDoc.getElementsByTagName("parsererror").length) throw new Error("Failed to parse RSS feed.");
        const formattedData = mapRssResponseToStandardFormat(xmlDoc);
        feedCache.set(apiUrl, { data: formattedData, timestamp: Date.now() });
        return formattedData;
    }
}

class YouTubeProvider {
    constructor(config) { this.config = config; }
    _buildFeedUrl() {
        return `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(this.config.siteURL)}`;
    }
    async fetch() {
        const url = this._buildFeedUrl();
        const cached = feedCache.get(url);
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) return cached.data;
        const rawData = await fetchJSONP(url);
        const formattedData = mapRssJsonToStandardFormat(rawData);
        feedCache.set(url, { data: formattedData, timestamp: Date.now() });
        return formattedData;
    }
}

export class BloggerProvider {
    constructor(config) { this.config = config; }
    _buildFeedUrl() {
        let feedURL = this.config.siteURL + "feeds/";
        switch (this.config.contentType) {
            case "recent": feedURL += "posts" + (this.config.showImage ? "/default" : "/summary"); break;
            case "comments": feedURL += "comments" + (this.config.showImage ? "/default" : "/summary"); break;
            default: feedURL += "posts" + (this.config.showImage ? "/default" : "/summary") + "/-/" + this.config.labelName;
        }
        feedURL += `?alt=json-in-script&start-index=${(this.config.stageID - 1) * this.config.postsPerBlock + 1}&max-results=${this.config.postsPerBlock}`;
        return feedURL;
    }
    async fetch() {
        const url = this._buildFeedUrl();
        const cached = feedCache.get(url);
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) return cached.data;
        const rawData = await fetchJSONP(url);
        const formattedData = mapBloggerResponseToStandardFormat(rawData);
        feedCache.set(url, { data: formattedData, timestamp: Date.now() });
        return formattedData;
    }
}

class RedditProvider {
    constructor(config) { this.config = config; }
    _buildFeedUrl() {
        let url = this.config.siteURL.replace(/\/$/, "");
        if (!url.endsWith('.json')) url += '.json';
        return url;
    }
    async fetch() {
        const url = this._buildFeedUrl();
        const cached = feedCache.get(url);
        if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) return cached.data;
        
        try {
            // Reddit sometimes blocks proxies and restricts CORS. Attempt native fetch first.
            const response = await window.fetch(url);
            if (!response.ok) throw new Error("Native fetch failed");
            const responseText = await response.text();
            const rawData = JSON.parse(responseText);
            const formattedData = mapRedditResponseToStandardFormat(rawData);
            feedCache.set(url, { data: formattedData, timestamp: Date.now() });
            return formattedData;
        } catch (e) {
            console.warn("mBlox: Reddit native fetch failed (CORS/403). Falling back to rss2json...");
            // Fallback to RSS endpoint via rss2json
            const rssUrl = url.replace('.json', '.rss');
            const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
            const rawData = await fetchJSONP(rss2jsonUrl);
            const formattedData = mapRssJsonToStandardFormat(rawData);
            
            // Clean up author links
            formattedData.posts.forEach(post => {
                if(post.authorName && post.authorName.startsWith('/u/')) {
                    post.authorUri = `https://www.reddit.com${post.authorName}`;
                }
            });

            feedCache.set(url, { data: formattedData, timestamp: Date.now() });
            return formattedData;
        }
    }
}

class TumblrProvider extends RssProvider {
    _buildFeedUrl() {
        let url = this.config.siteURL.replace(/\/$/, "");
        if (!url.endsWith('/rss')) url += '/rss';
        return url;
    }
}

class FediverseProvider extends RssProvider {
    _buildFeedUrl() {
        let url = this.config.siteURL.replace(/\/$/, "");
        if (!url.endsWith('.rss')) url += '.rss';
        return url;
    }
}

export function getProvider(config) {
    const url = config.siteURL.toLowerCase();
    const urlWithoutQuery = url.split('?')[0];
    
    if (url.includes('reddit.com')) return new RedditProvider(config);
    if (url.includes('tumblr.com')) return new TumblrProvider(config);
    if (url.includes('mastodon.social') || url.includes('bsky.app')) return new FediverseProvider(config);
    if (url.includes('deviantart.com')) return new RssProvider(config);
    
    if (url.includes('/wp-json')) return new WordPressProvider(config);
    if (url.includes('youtube.com')) return new YouTubeProvider(config);
    if (urlWithoutQuery.endsWith('.xml') || url.includes('/feed') || urlWithoutQuery.endsWith('.rss') || urlWithoutQuery.endsWith('/rss')) return new RssProvider(config);
    
    return new BloggerProvider(config);
}
