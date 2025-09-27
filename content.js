// content.js

/**
 * Listens for a message from the popup script to trigger content extraction.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPost") {
    // Using a try-catch block to gracefully handle any unexpected errors during extraction.
    try {
      const postDetails = extractPostContent();
      sendResponse(postDetails);
    } catch (e) {
      console.error("Reddit AI Comment Helper: Unhandled exception during content extraction.", e);
      sendResponse({ error: "An unexpected error occurred while reading the page." });
    }
  }
  // Return true to indicate that the response will be sent asynchronously.
  return true;
});

/**
 * Extracts the title and body content from the current Reddit post page.
 * This version is updated to be more resilient to Reddit's UI changes.
 *
 * @returns {{title: string, body: string}|{error: string}} An object with the
 *          post title and body, or an error object if extraction fails.
 */
function extractPostContent() {
  // Reddit's modern UI uses the 'shreddit-post' custom element as a container. This is a very reliable starting point.
  const postContainer = document.querySelector('shreddit-post');

  if (!postContainer) {
    return {
      error: "Extraction failed: Could not find the main post container. Please ensure you are on a valid Reddit post page. The page structure may have changed."
    };
  }

  // --- Extract Title ---
  // The title is reliably located in an H1 tag, often with slot="title".
  const titleElement = postContainer.querySelector('h1[slot="title"], h1');
  if (!titleElement) {
    return {
      error: "Extraction failed: Could not find the post title within the main container."
    };
  }
  const title = titleElement.innerText;

  // --- Extract Body ---
  let body = "";
  // For text posts, the content is in a container with a specific data-testid.
  const postBodyContainer = postContainer.querySelector('div[data-testid="post-content"]');

  if (postBodyContainer) {
    // For text posts, combine the text from all paragraph elements.
    body = Array.from(postBodyContainer.querySelectorAll('p'))
                .map(p => p.innerText)
                .join('\n\n');

    // If no paragraphs are found, fall back to the container's full text content.
    if (!body) {
      body = postBodyContainer.innerText;
    }
  } else {
    // Handle non-text posts (links, images, videos).
    const outboundLink = postContainer.querySelector('a[data-testid="outbound-link"]');
    if (outboundLink) {
      body = `Link Post: ${outboundLink.href}`;
    } else {
      const mediaPreview = postContainer.querySelector('[slot="media-preview"]');
      if (mediaPreview) {
        const image = mediaPreview.querySelector('img');
        const video = mediaPreview.querySelector('video');
        if (image) {
          body = `[Image post. Alt text: "${image.alt || 'No alt text'}"]`;
        } else if (video) {
          body = `[Video post]`;
        } else {
           body = "[Media post detected, but specific content could not be identified.]";
        }
      } else {
         body = "[No text body found. This is likely an image, video, or crosspost.]";
      }
    }
  }

  // As per requirements, trim long post bodies to avoid sending excessive data to the API.
  const MAX_BODY_LENGTH = 4000;
  if (body.length > MAX_BODY_LENGTH) {
    body = body.substring(0, MAX_BODY_LENGTH) + "\n\n[... Post body was truncated because it was too long.]";
  }

  return { title: title.trim(), body: body.trim() };
}