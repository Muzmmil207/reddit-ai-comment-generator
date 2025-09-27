// content.js

/**
 * Listens for a message from the popup script to trigger content extraction.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getPost") {
    const postDetails = extractPostContent();
    sendResponse(postDetails);
  }
  // Return true to indicate that the response will be sent asynchronously.
  // This is important to keep the message channel open for the sendResponse call.
  return true;
});

/**
 * Extracts the title and body content from the current Reddit post page.
 *
 * NOTE: These selectors are based on common structures in Reddit's UI.
 * They may need adjustment if Reddit significantly changes its front-end code.
 * Using `data-testid` attributes is preferred as they are less likely to change
 * than obfuscated CSS class names.
 *
 * @returns {{title: string, body: string}|{error: string}} An object with the
 *          post title and body, or an error object if extraction fails.
 */
function extractPostContent() {
  // TODO: These selectors are best-guesses and should be verified against the live Reddit DOM.
  // The title is typically in an H1 element with a specific data-testid.
  const titleElement = document.querySelector('h1[data-testid="post-title"]');

  if (!titleElement) {
    return {
      error: "Extraction failed: Could not find the post title. Reddit's page structure may have changed. Please copy the text manually."
    };
  }
  const title = titleElement.innerText;

  let body = "";
  // The body of a text post is usually within a container with this data-testid.
  const postBodyContainer = document.querySelector('div[data-testid="post-content"]');

  if (postBodyContainer) {
    // For text posts, we combine the text from all paragraph elements.
    const paragraphs = postBodyContainer.querySelectorAll('p');
    if (paragraphs.length > 0) {
      body = Array.from(paragraphs).map(p => p.innerText).join('\n\n');
    } else {
      // Fallback for posts that might not use <p> tags inside the container (e.g., code blocks).
      body = postBodyContainer.innerText;
    }
  } else {
    // If it's not a text post, it could be a link, image, or video post.
    // We'll try to find the main outbound link to provide context.
    const outboundLink = document.querySelector('a[data-testid="outbound-link"]');
    if (outboundLink) {
      body = `Link Post: ${outboundLink.href}`;
    } else {
      // If no specific body or link is found, we provide a generic message.
      body = "[No text body found. This is likely an image, video, or crosspost.]";
    }
  }

  // As per requirements, trim long post bodies to avoid sending excessive data to the API.
  const MAX_BODY_LENGTH = 4000; // A reasonable character limit.
  if (body.length > MAX_BODY_LENGTH) {
    body = body.substring(0, MAX_BODY_LENGTH) + "\n\n[... Post body was truncated because it was too long.]";
  }

  return { title: title.trim(), body: body.trim() };
}