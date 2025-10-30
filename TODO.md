
This file tracks planned improvements and refactoring tasks for the mBlox project.

## High Priority / High Impact

- [ ] **Refactor `mBlocks` & Convert to Template Literals (Incremental Approach):** The `mBlocks` function is too large and uses hard-to-read string concatenation. This will be refactored by extracting logic into helper functions and converting HTML generation to use modern template literals, one small step at a time.

    ### **Stage 1: Isolate Post Rendering Logic (Without Changing It)**
    *Goal: Move the post-item HTML generation into a helper function without altering the logic, making it testable in isolation.*
    - [x] **Step 1.1: Create a `blockConfig` Object.** In `mBlocks`, consolidate all configuration variables (e.g., `blockType`, `dataTheme`, `showImage`, `cornerStyle`) into a single `blockConfig` object. This will simplify passing data to future helper functions.
    - [x] **Step 1.2: Create `_createPostHtml` function.** Create a new helper function, e.g., `_createPostHtml(post, postID, config)`.
    - [x] **Step 1.3: "Lift and Shift" the loop body.** Move the entire body of the main `for` loop (the one that iterates through posts) into the new `_createPostHtml` function.
    - [x] **Step 1.4: Return the HTML string.** The new function should still use the existing string concatenation (`+=`) and return the generated HTML string for a single post. The main `for` loop in `mBlocks` will now simply call this function and append the result to `blockBody`.
    *(At this point, the code should function identically to before, but the logic is now better organized.)*

    
    ### **Stage 2: Convert to Template Literals**
    *Goal: Modernize the HTML generation now that it's safely isolated in a helper function.*
    - [x] **Step 2.1: Convert simple HTML strings.** In `_createPostHtml`, convert the generation of `authorCode`, `dateCode`, `snippetCode`, and the header codes (`displayHeaderCode`, `normalHeaderCode`, `commentHeaderCode`) to use template literals.
    - [x] **Step 2.2: Convert `imageCode` generation.** In `_createPostHtml`, refactor the `imageCode` generation to use template literals, including the complex `switch` statement for different block types.
    - [x] **Step 2.3: Convert `ctaButtonCode` generation.** In `_createPostHtml`, refactor the `ctaButtonCode` generation to use template literals, including its `switch` statement.
    - [x] **Step 2.4: Convert `carouselIndicator` and `showcaseHTML`.** Refactor these two remaining pieces in `_createPostHtml` to use template literals.
    - [ ] **Step 2.5: Convert the final `postHTML` assembly.** In `_createPostHtml`, convert the final block of `postHTML += ...` string concatenations into a single, multi-line template literal that assembles all the previously created HTML pieces.

    ### **Stage 3: Extract Structural and Event Logic**
    *Goal: Clean up the main `mBlocks` function by extracting the remaining pieces of logic.*
    - [x] **Step 3.1: Extract Block Header.** Create a `_createBlockHeader(config)` function. Move the block title and description HTML generation from `mBlocks` into this new function and convert it to a template literal.
    - [x] **Step 3.2: Extract Block Footer.** Create a `_createBlockFooter(config, response)` function. Move the "View All" footer/navigation logic from `mBlocks` into this new function and convert it to a template literal.
    - [ ] **Step 3.3: Extract Carousel Controls.** Create a `_createCarouselControls(config)` function. Move the `previousButtonCode` and `nextButtonCode` generation from `mBlocks` into this function and convert it to a template literal.
    - [ ] **Step 3.4: Extract Showcase Event Binding.** Create a `_bindShowcaseEvents(rawElement, config)` function. Move the event binding logic specific to the Showcase layout from the `complete` callback into this new function.
    - [ ] **Step 3.5: Extract Pagination Event Binding.** Create a `_bindPaginationEvents(rawElement)` function. Move the `nav-prev` and `nav-next` event binding logic from the `complete` callback into this new function.

This new, more cautious approach will ensure that you can verify the script's functionality at every step, leading to a successful and error-free refactor.