/**
 * mBlox Data Fetcher
 * Handles JSONP requests and normalizing various feed structures.
 */

export function fetchJSONP(url) {
    return new Promise((resolve, reject) => {
        const callbackName = `jsonp_callback_${Math.round(100000 * Math.random())}`;
        const script = document.createElement('script');

        script.src = `${url}&callback=${callbackName}`;

        window[callbackName] = function (data) {
            delete window[callbackName];
            document.head.removeChild(script);
            resolve(data);
        };

        script.onerror = function () {
            delete window[callbackName];
            document.head.removeChild(script);
            const errorMsg = `JSONP request to ${url} failed.`;
            console.error(errorMsg);
            reject(new Error(errorMsg));
        };

        document.head.appendChild(script);
    });
}

export function mapWordPressResponseToStandardFormat(wpResponse, headers) {
    if (!Array.isArray(wpResponse)) return { posts: [], totalResults: 0 };
    const standardPosts = wpResponse.map(post => ({
        title: post.title.rendered,
        content: post.content.rendered,
        authorName: post._embedded?.author[0]?.name || 'Unknown',
        authorUri: post._embedded?.author[0]?.link || '',
        authorImage: post._embedded?.author[0]?.avatar_urls?.['96'] || '',
        publishedDate: post.date_gmt,
        url: post.link,
        thumbnailUrl: post._embedded?.['wp:featuredmedia']?.[0]?.media_details?.sizes?.large?.source_url
            || post._embedded?.['wp:featuredmedia']?.[0]?.source_url || ''
    }));
    return { posts: standardPosts, totalResults: parseInt(headers.get('X-WP-Total') || '0', 10) };
}

export function mapRssResponseToStandardFormat(xmlDoc) {
    const items = xmlDoc.querySelectorAll('item, entry');
    if (!items.length) return { posts: [], totalResults: 0, feedUrl: '' };

    const isYouTube = xmlDoc.querySelector('yt\\:channelId') !== null;
    const standardPosts = Array.from(items).map(item => {
        const getTagContent = (tagName) => {
            const el = item.querySelector(tagName);
            return el ? el.textContent : '';
        };

        if (isYouTube) {
            const videoId = getTagContent('yt\\:videoId');
            const mediaGroup = item.querySelector('media\\:group');
            const thumbnailUrl = mediaGroup ? (mediaGroup.querySelector('media\\:thumbnail[url]')?.getAttribute('url') || '') : '';
            return {
                title: getTagContent('title'),
                content: getTagContent('media\\:description') || '',
                authorName: getTagContent('author > name'),
                publishedDate: getTagContent('published'),
                url: item.querySelector('link[rel="alternate"]')?.getAttribute('href') || '',
                thumbnailUrl: thumbnailUrl,
                videoId: videoId,
                authorUri: getTagContent('author > uri') || '',
                authorImage: ''
            };
        } else {
            let thumbnailUrl = item.querySelector('media\\:thumbnail[url], thumbnail[url]')?.getAttribute('url') || '';
            if (!thumbnailUrl) {
                const content = getTagContent('description') || getTagContent('content');
                const match = content.match(/<img[^>]+src="([^">]+)"/);
                if (match) thumbnailUrl = match[1];
            }
            return {
                title: getTagContent('title'),
                content: getTagContent('description') || getTagContent('content'),
                authorName: getTagContent('dc\\:creator, author > name') || 'Unknown',
                publishedDate: getTagContent('pubDate, published'),
                url: getTagContent('link') || item.querySelector('link[href]')?.getAttribute('href') || '',
                thumbnailUrl: thumbnailUrl,
                authorUri: getTagContent('author > uri') || '',
                authorImage: ''
            };
        }
    });

    const feedUrl = xmlDoc.querySelector('channel > link, feed > link[rel="alternate"]')?.getAttribute('href')
        || xmlDoc.querySelector('channel > link, feed > link[rel="alternate"]')?.textContent || '';
    return { posts: standardPosts, totalResults: items.length, feedUrl };
}

export function mapRssJsonToStandardFormat(jsonDoc) {
    if (jsonDoc.status !== 'ok' || !jsonDoc.items) return { posts: [], totalResults: 0, feedUrl: '' };
    
    const isYouTube = jsonDoc.feed.url.includes('youtube.com');
    
    const standardPosts = jsonDoc.items.map(item => {
        let videoId = '';
        if (isYouTube) {
            const match = item.link.match(/v=([^&]+)/);
            videoId = match ? match[1] : '';
        }
        
        let thumbnailUrl = item.thumbnail || '';
        if (!thumbnailUrl && item.enclosure && item.enclosure.link && item.enclosure.type && item.enclosure.type.startsWith('image/')) {
            thumbnailUrl = item.enclosure.link;
        }
        if (!thumbnailUrl && item.content) {
            const match = item.content.match(/<img[^>]+src="([^">]+)"/);
            if (match) thumbnailUrl = match[1];
        }

        return {
            title: item.title,
            content: item.description || item.content || '',
            authorName: item.author || 'Unknown',
            publishedDate: item.pubDate,
            url: item.link,
            thumbnailUrl: thumbnailUrl,
            videoId: videoId,
            authorUri: '', 
            authorImage: ''
        };
    });

    return { posts: standardPosts, totalResults: jsonDoc.items.length, feedUrl: jsonDoc.feed.link };
}

export function mapBloggerResponseToStandardFormat(bloggerResponse) {
    if (!bloggerResponse.feed || !bloggerResponse.feed.entry) {
        return { posts: [], totalResults: 0, feedUrl: '' };
    }
    const standardPosts = bloggerResponse.feed.entry.map(post => {
        const content = ("content" in post) ? post.content.$t : (("summary" in post) ? post.summary.$t : "");
        let thumbnailUrl = '';
        if (content) {
            const contentParser = new DOMParser().parseFromString(content, 'text/html');
            const firstImage = contentParser.querySelector("img");
            if (firstImage) thumbnailUrl = firstImage.src;
        }
        return {
            title: post.title.$t,
            content: content,
            authorName: post.author[0].name.$t,
            authorUri: (post.author[0].name.$t === "Anonymous" || post.author[0].name.$t === "Unknown") ? '' : post.author[0].uri.$t,
            authorImage: post.author[0].gd$image ? post.author[0].gd$image.src : '',
            publishedDate: post.published.$t,
            url: (post.link.find(l => l.rel === 'alternate') || {}).href || '',
            thumbnailUrl: thumbnailUrl
        };
    });
    const alternateLink = (bloggerResponse.feed.link.find(l => l.rel === 'alternate') || {}).href || '';
    return { posts: standardPosts, totalResults: bloggerResponse.feed.openSearch$totalResults.$t, feedUrl: alternateLink };
}

export function getYouTubeVideoId(post) {
    if (post.videoId) return post.videoId;
    if (post.thumbnailUrl && (post.thumbnailUrl.includes("ytimg.com/vi/") || post.thumbnailUrl.includes("youtube.com/vi/"))) {
        const idStartIndex = post.thumbnailUrl.indexOf("/vi/") + 4;
        const nextSlashIndex = post.thumbnailUrl.indexOf('/', idStartIndex);
        if (nextSlashIndex !== -1) return post.thumbnailUrl.substring(idStartIndex, nextSlashIndex);
    }
    if (post.content && post.content.includes('youtube.com/embed/')) {
        const match = post.content.match(/youtube\.com\/embed\/([^?"]+)/);
        return (match && match[1]) ? match[1] : "noVideo";
    }
    return "noVideo";
}
