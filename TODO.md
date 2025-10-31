This file tracks planned improvements and refactoring tasks for the mBlox project.

All initial refactoring tasks are complete. The codebase is now more modular, maintainable, and uses modern JavaScript features.

## Next Steps: Further Refinement

*Goal: Continue to improve the structure and clarity of the main `mBlocks` function by extracting the remaining large logic blocks into dedicated helper functions.*

- [ ] **Stage 4: Final `mBlocks` Cleanup**
    - [ ] **Step 4.1: Extract Configuration Parsing.** Create a `_parseBlockConfig(rawElement)` function that reads all `data-*` attributes and returns a complete `config` object.
    - [ ] **Step 4.2: Extract Carousel & Column Logic.** Create a `_calculateLayout(config, postsInFeed)` function. Move the logic for calculating responsive columns (`actualColumnCount`) and determining if a block should be a carousel or use simple navigation. This function should return an updated config object.
    - [ ] **Step 4.3: Extract Main Post Loop.** Create a `_buildBlockBody(response, config)` function. Move the main `for` loop that iterates through posts, calls `_createPostHtml`, and assembles the `blockBody` string into this new function.
    - [ ] **Step 4.4: Refactor `complete` Callback.** Refactor the `complete` callback in `fetchJSONP` to accept the `blockConfig` object directly, removing the need for the `tempConfig` object and cleaning up the event binding calls.

- [x] **Stage 5: Code & Logic Refinement**
    - [x] **Step 5.1: Simplify `switch` statements.** Convert the `switch` statements for default column counts and grid classes in `mBlocks` to use object lookups.
    - [x] **Step 5.2: Add JSDoc Comments.** Add comprehensive JSDoc comments to the `fadeIn`, `fadeOut`, and `_bindPaginationEvents` helper functions.

- [ ] **Stage 6: Advanced Refactoring & Modernization**
    - [ ] **Step 6.1: Globalize Constants.** Move the `BLOCK_TYPE_*` constants to the global scope so they don't need to be redefined on every `mBlocks` call or passed via the `config` object.
    - [ ] **Step 6.2: Promisify `fetchJSONP`.** Refactor `fetchJSONP` to return a `Promise`. This will allow the main `mBlocks` function to be converted to an `async` function, replacing the `success`/`complete` callbacks with `await` and enabling the use of a `try...catch` block for robust error handling.
    - [ ] **Step 6.3: Eliminate Side Effects in `_createPostHtml`.** Move the logic that modifies `config.columnCount` for the 'list' block type out of `_createPostHtml` and into the main `mBlocks` loop to make the helper function pure.

- [ ] **Stage 7: Multi-Platform Support**
    *Goal: Refactor the data fetching and processing logic to support different feed sources like WordPress or YouTube in addition to Blogger.*
    - [ ] **Step 7.1: Create Data Provider Interface.** Design a provider pattern. Create a `BloggerProvider` that encapsulates the current `fetchJSONP` and Blogger-specific URL/data mapping logic. This provider should expose a simple `fetch()` method that returns data in a standardized internal format.
    - [ ] **Step 7.2: Refactor `mBlocks` to Use Providers.** Create a `detectProvider(url)` function that uses regular expressions to check the `data-feed` URL and returns the appropriate provider instance (e.g., `new BloggerProvider()`, `new WordPressProvider()`).
    - [ ] **Step 7.3: Implement a `WordPressProvider`.** As the first new implementation, create a `WordPressProvider` that uses the standard `fetch` API. It will be responsible for building the correct WordPress REST API URL and mapping the WP JSON response to the same standardized internal format that the rendering functions expect.

- [x] **Stage 8: Implement "Measure, then Fetch" for Images**
    *Goal: Replace the predictive image size calculation with a more accurate and robust method that measures the container after rendering and then fetches the optimally sized image.*
    - [x] **Step 8.1: Render with Placeholders.** Modify `_createPostHtml` to render `<img>` tags with a low-quality placeholder in `src` and the high-resolution base URL in a `data-img-src` attribute. The `calculateImageResolution` function will no longer be called here.
    - [x] **Step 8.2: Create `_loadOptimalImages` Function.** Create a new helper function that iterates over placeholder images. For each image, it will measure the container's actual width, calculate the optimal resolution (considering device pixel ratio), construct the new image URL, and set the `src` attribute to trigger the load.
    - [x] **Step 8.3: Integrate into `mBlocks`.** Call the new `_loadOptimalImages` function from the `complete` callback in `mBlocks` after the HTML has been rendered to the DOM.
    - [x] **Step 8.4: Cleanup.** Remove the now-obsolete `calculateImageResolution` function and any related logic.