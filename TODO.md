# mBlox Project TODO

This file tracks planned improvements and refactoring tasks for the mBlox project.

## High Priority / High Impact

- [ ] **Replace HTML String Concatenation:** The script builds large blocks of HTML by adding strings together (e.g., `blockBody += '...'`). This is hard to read, maintain, and prone to syntax errors. This should be refactored to use modern **Template Literals** (backticks `` ` ``) for cleaner, multi-line HTML structure within the JavaScript.

- [ ] **Add JSDoc and Code Comments:** The script lacks sufficient comments, making it difficult to understand the logic.
    - [ ] Add JSDoc blocks to major functions (`mBlocks`, `fetchJSONP`, `loadScripts`) to explain their purpose, parameters, and return values.
    - [ ] Add inline comments to explain complex sections, such as the `data-type` parsing, image resolution calculations, and the logic for different block layouts (e.g., Showcase, List).

## Modernization & Best Practices_

- [ ] **Refactor Variable Names:** Many variable names are too short and cryptic (e.g., `m`, `s` in `mBloxCall.js`, and `o`, `h`, `v`, `z` inside `mBloxScript.js`). These should be renamed to be descriptive (e.g., `selectorOrElement`, `shouldLoad`, `dateString`, `dateParts`) to improve code readability.

- [x] **Simplify Date Formatting:** The current date formatting logic manually splits strings and uses an array of month names. This has been replaced with the modern, built-in `Intl.DateTimeFormat` object, which is more robust, efficient, and supports localization.

- [ ] **Refactor `mBloxCall.js`:**
    - [x] Convert the `cFn` function to an arrow function for more concise syntax.

## Low Priority / Opportunities

- [ ] **Break Down Large Functions:** The main `mBlocks` function is very large. Consider breaking out the post-processing loop and the `complete` callback logic into smaller, dedicated helper functions to improve modularity and testability.