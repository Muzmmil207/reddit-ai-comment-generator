/**
 * Reddit AI Comment Helper - Content Script
 * 
 * This script runs on Reddit pages and extracts post content when requested by the popup.
 * It handles both the new Reddit interface and various post types (text, link, image, etc.).
 */

/**
 * Listen for messages from the popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPost') {
        try {
            const postData = extractPostContent();
            sendResponse(postData);
        } catch (error) {
            console.error('Error extracting post content:', error);
            sendResponse({ 
                error: error.message,
                title: null,
                body: null
            });
        }
    }
    return true; // Keep message channel open for async response
});

/**
 * Extract post content from Reddit page
 * Handles both old and new Reddit interfaces
 */
function extractPostContent() {
    const postData = {
        title: '',
        body: '',
        type: 'unknown',
        url: window.location.href
    };

    // Wait for page to be fully loaded
    if (document.readyState !== 'complete') {
        return { error: 'Page not fully loaded. Please wait and try again.' };
    }

    try {
        // Extract title - try multiple selectors for different Reddit layouts
        const titleSelectors = [
            'h1[data-test-id="post-content"]', // New Reddit
            'h1.Post__title', // Old Reddit
            'h1.title', // Alternative
            'h1', // Fallback
            '[data-testid="post-title"]', // Mobile/new layout
            '.title h1', // Another fallback
            'h2.title a', // Link posts
            'h3.title a' // Another variant
        ];

        for (const selector of titleSelectors) {
            const titleElement = document.querySelector(selector);
            if (titleElement && titleElement.textContent.trim()) {
                postData.title = cleanText(titleElement.textContent);
                break;
            }
        }

        // If no title found, try to get it from meta tags
        if (!postData.title) {
            const metaTitle = document.querySelector('meta[property="og:title"]');
            if (metaTitle) {
                postData.title = cleanText(metaTitle.content);
            }
        }

        // Extract post body/content
        const bodySelectors = [
            '[data-test-id="post-content"] .RichTextJSON-root', // New Reddit text posts
            '[data-test-id="post-content"] .UserContent', // New Reddit
            '.Post__body', // Old Reddit
            '.usertext-body .md', // Old Reddit markdown
            '.expando .usertext-body', // Expanded text
            '[data-testid="post-content"] .RichTextJSON-root', // Alternative
            '.post-content .md', // Another variant
            '.selftext', // Self post content
            '.post .usertext-body' // General post content
        ];

        for (const selector of bodySelectors) {
            const bodyElement = document.querySelector(selector);
            if (bodyElement && bodyElement.textContent.trim()) {
                postData.body = cleanText(bodyElement.textContent);
                postData.type = 'text';
                break;
            }
        }

        // For link posts, try to get additional context
        if (!postData.body) {
            // Check if it's a link post
            const linkSelectors = [
                '[data-test-id="post-content"] a[href^="http"]',
                '.post .title a[href^="http"]',
                '.link a.title'
            ];

            for (const selector of linkSelectors) {
                const linkElement = document.querySelector(selector);
                if (linkElement && linkElement.href && !linkElement.href.includes('reddit.com')) {
                    postData.body = `External link: ${linkElement.href}`;
                    postData.type = 'link';
                    break;
                }
            }

            // Try to get link preview or description
            const previewSelectors = [
                '[data-test-id="post-content"] .RichTextJSON-root p',
                '.post .usertext-body p',
                '.post-content p'
            ];

            for (const selector of previewSelectors) {
                const previewElement = document.querySelector(selector);
                if (previewElement && previewElement.textContent.trim()) {
                    postData.body += (postData.body ? '\n\n' : '') + cleanText(previewElement.textContent);
                    break;
                }
            }
        }

        // For image/video posts, add context
        if (!postData.body) {
            const mediaSelectors = [
                '[data-test-id="post-content"] img',
                '[data-test-id="post-content"] video',
                '.post img',
                '.post video'
            ];

            for (const selector of mediaSelectors) {
                const mediaElement = document.querySelector(selector);
                if (mediaElement) {
                    if (mediaElement.tagName === 'IMG') {
                        postData.body = `[Image post]`;
                        postData.type = 'image';
                    } else if (mediaElement.tagName === 'VIDEO') {
                        postData.body = `[Video post]`;
                        postData.type = 'video';
                    }
                    break;
                }
            }
        }

        // Validate extracted data
        if (!postData.title) {
            return { 
                error: 'Could not extract post title. Make sure you are viewing a Reddit post.',
                title: null,
                body: null
            };
        }

        // If no body found, that's okay for some post types
        if (!postData.body) {
            postData.body = '[No additional content found]';
            postData.type = postData.type || 'unknown';
        }

        // Add post metadata for context
        postData.subreddit = extractSubreddit();
        postData.author = extractAuthor();
        postData.timestamp = new Date().toISOString();

        return postData;

    } catch (error) {
        console.error('Error in extractPostContent:', error);
        return { 
            error: `Error extracting post content: ${error.message}`,
            title: null,
            body: null
        };
    }
}

/**
 * Extract subreddit name
 */
function extractSubreddit() {
    const subredditSelectors = [
        '[data-test-id="subreddit-name"]',
        '.subreddit',
        '.post .subreddit',
        'h2.subreddit'
    ];

    for (const selector of subredditSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            return cleanText(element.textContent);
        }
    }

    // Try to extract from URL
    const urlMatch = window.location.pathname.match(/\/r\/([^\/]+)/);
    return urlMatch ? urlMatch[1] : '';
}

/**
 * Extract author name
 */
function extractAuthor() {
    const authorSelectors = [
        '[data-test-id="post_author_link"]',
        '.post .author',
        '.author',
        '.post .tagline .author'
    ];

    for (const selector of authorSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            return cleanText(element.textContent);
        }
    }

    return '';
}

/**
 * Clean and normalize text content
 */
function cleanText(text) {
    if (!text) return '';
    
    return text
        .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
        .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
        .trim();
}

/**
 * Fallback function to get basic page content if specific selectors fail
 */
function getFallbackContent() {
    const title = document.title.replace(' : ', ' - ').split(' - ')[0];
    const body = document.body.textContent.substring(0, 1000) + '...';
    
    return {
        title: title,
        body: body,
        type: 'fallback',
        url: window.location.href
    };
}

/**
 * Utility function to wait for elements to appear
 */
function waitForElement(selector, timeout = 3000) {
    return new Promise((resolve) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }

        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeout);
    });
}
