This file tracks the next set of refactoring and feature implementation tasks for the mBlox project.

## Stage 9: Final Code Cleanup & Simplification

*Goal: Address remaining complexities and inefficiencies in the rendering logic, and improve the overall code structure.*

- [x] **Step 9.1: Complete the Simplification of `_createPostHtml`**
    - [x] **Extract Block-Specific Renderers:** The `_createPostHtml` function is now a simplified orchestrator that calls component renderers and a dispatcher (`_renderPostByType`) which in turn calls block-specific renderers. This dramatically improves readability and maintainability.

## Stage 10: Bug Fixes & Performance Enhancements

*Goal: Address specific functional bugs, performance bottlenecks, and structural issues identified in the code review.*

- [x] **Step 10.1: Unify Constants**
    - [x] Rename `CONTENT_QUOTE` and `CONTENT_COMMENT` to `BLOCK_TYPE_QUOTE` and `BLOCK_TYPE_COMMENT` respectively, and update their usage throughout the script for consistency.

- [x] **Step 10.2: Fix Showcase Block Rendering**
    - [x] **Correct Grid/Carousel Structure:** Refactored `_buildBlockBody` to ensure the smaller showcase items (`sPost`) are correctly wrapped in Bootstrap `row` and `carousel-item` divs, fixing layout bugs.
    - [x] **Isolate Feature Item Logic:** The main showcase feature item is now generated outside the main loop in `_buildBlockBody`, clarifying the logic and preventing rendering conflicts.

- [ ] **Step 10.3: Optimize Event Handling & Data Access**
    - [ ] **Improve `_bindShowcaseEvents`:** Refactor the function to read all necessary `data-*` attributes from the `.sPost` elements into a JavaScript array on initialization. The click handler should then read from this array instead of querying the DOM on every click, improving performance.
    - [ ] **Unify `videoID` Calculation:** Consolidate the `videoID` calculation to a single, reliable point at the top of `_createPostHtml` to prevent `ReferenceError` bugs and redundant processing.

- [ ] **Step 10.4: Improve Code Encapsulation**
    - [ ] **Wrap Script in an IIFE:** Encapsulate the entire `mBloxScript.js` in an Immediately Invoked Function Expression (IIFE) to move all helper functions out of the global `window` scope. Expose only the main `mBlocks` function to the outside world.

- [ ] **Step 10.5: Enhance Error Handling**
    - [ ] **Provide Specific Error Messages:** Refactor the `catch` block in the main `mBlocks` function to provide more specific, user-friendly error messages based on the error type (e.g., "Feed not found (404)", "Invalid feed format", "CORS policy error").

## Completed Tasks
*All previous refactoring stages (4 through 8) are considered complete.*