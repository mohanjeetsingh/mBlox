
This file tracks planned improvements and refactoring tasks for the mBlox project.

## High Priority / High Impact

- [ ] **Refactor `mBlocks` & Convert to Template Literals (Incremental Approach):** The `mBlocks` function is too large and uses hard-to-read string concatenation. This will be refactored by extracting logic into helper functions and converting HTML generation to use modern template literals, one small step at a time.

    ### **Stage 1: Isolate Post Rendering Logic (Without Changing It)**
    *Goal: Move the post-item HTML generation into a helper function without altering the logic, making it testable in isolation.*
    - [ ] **Step 1.1: Create a `blockConfig` Object.** In `mBlocks`, consolidate all configuration variables (e.g., `blockType`, `dataTheme`, `showImage`, `cornerStyle`) into a single `blockConfig` object. This will simplify passing data to future helper functions.
    - [ ] **Step 1.2: Create `_createPostHtml` function.** Create a new helper function, e.g., `_createPostHtml(post, postID, config)`.
    - [ ] **Step 1.3: "Lift and Shift" the loop body.** Move the entire body of the main `for` loop (the one that iterates through posts) into the new `_createPostHtml` function.
    - [ ] **Step 1.4: Return the HTML string.** The new function should still use the existing string concatenation (`+=`) and return the generated HTML string for a single post. The main `for` loop in `mBlocks` will now simply call this function and append the result to `blockBody`.
    *(At this point, the code should function identically to before, but the logic is now better organized.)*

    ### **Stage 2: Convert to Template Literals**
    *Goal: Modernize the HTML generation now that it's safely isolated in a helper function.*
    - [ ] **Step 2.1: Refactor `_createPostHtml` to use Template Literals.** Inside the `_createPostHtml` function, replace all the `blockBody += '...'` string concatenation with a single, multi-line template literal (`` `...` ``).
    - [ ] **Step 2.2: Handle the Showcase layout.** Modify `_createPostHtml` to return an object like `{ html, showcaseImageCode }` to handle the special case for the Showcase block's main image, which is rendered outside the main loop.

    ### **Stage 3: Extract Structural and Event Logic**
    *Goal: Clean up the main `mBlocks` function by extracting the remaining pieces of logic.*
    - [ ] **Step 3.1: Extract Header & Footer.** Create helper functions (`_createBlockHeader`, `_createBlockFooter`) and move the corresponding HTML generation logic into them, converting it to template literals.
    - [ ] **Step 3.2: Extract Navigation.** Create a helper function (`_createNavigationControls`) for the carousel/pagination buttons and convert its HTML to template literals.
    - [ ] **Step 3.3: Extract Event Binding.** Create a new function (`_bindEventListeners`) and move the logic from the `complete` callback (Showcase interactivity, pagination clicks) into it.

This new, more cautious approach will ensure that you can verify the script's functionality at every step, leading to a successful and error-free refactor.

<!--
[PROMPT_SUGGESTION]Let's start with Stage 1, Step 1.1: Create the `blockConfig` object.[/PROMPT_SUGGESTION]
[PROMPT_SUGGESTION]Can you explain the benefits of using template literals over string concatenation in more detail?[/PROMPT_SUGGESTION]
