# mBlox Feature Roadmap

This document outlines planned future features and platform integrations for the mBlox project. These are longer-term goals that will be addressed after the current code refactoring and cleanup is complete.
## Multi-Platform Support

The primary goal is to evolve mBlox into a platform-agnostic tool by creating a "Provider" model. This will allow users to fetch and display content from various sources, not just Blogger.

*   **Reddit**
    *   **Method:** Use the public `.json` endpoint available for any subreddit (e.g., `/r/subreddit_name.json`).
    *   **Data Format:** JSON.
    *   **Notes:** An extremely versatile and easy-to-implement source for a vast range of content.
*   **YouTube**
    *   **Method:** Use the public, key-free RSS feed for channels or playlists (e.g., `videos.xml`).
    *   **Data Format:** XML (will require parsing with `DOMParser`).
    *   **Notes:** This avoids the need for API keys, making it perfect for a client-side library.
*   **Pinterest:** User profiles have public RSS feeds, ideal for visual/gallery blocks. (XML)
*   **Vimeo:** Provides public RSS feeds for users and channels, similar to YouTube. (XML)
*   **Dribbble:** A designer portfolio site with public RSS feeds for user shots. (XML)
*   **Medium / Substack:** Most publications on these platforms offer standard RSS feeds. (XML)