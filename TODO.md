# mBlox Project TODO

This file tracks planned improvements and refactoring tasks for the mBlox project.

## High Priority / High Impact

- [x] **Refactor Variable Names:** In `mBloxScript.js`, many variable names are very short and cryptic (e.g., `e`, `la`, `cTy`, `bTy`). These should be renamed to be descriptive (e.g., `element`, `label`, `contentType`, `blockType`) to improve code readability and maintainability.
- [ ] **Replace HTML String Concatenation:** The script builds large blocks of HTML by adding strings together. This is hard to read and prone to errors. This should be refactored to use modern **Template Literals** for cleaner HTML structure within the JavaScript. 
- [x] **Add Code Comments:** `mBloxScript.js` has complex logic for handling different block types and settings. Add comments to explain what different sections of the code do, what the cryptic `data-` attribute flags mean, and the purpose of complex calculations.

## Modernization & Best Practices

- [ ] **Plan jQuery Removal:** The project relies heavily on jQuery. For long-term maintainability and performance, create a plan to incrementally replace jQuery functions with native browser APIs (e.g., `$.ajax` with `fetch`, `$(selector)` with `document.querySelector`).
- [x] **Use `let` and `const`:** Replace all `var` declarations with modern `let` (for variables that will be reassigned) and `const` (for variables that won't).
- [ ] **Simplify Complex Ternary Operators:** Some ternary statements are nested or very complex. For clarity, rewrite them as standard `if/else` statements.


## Low Priority

- [x] **Create Constants for Magic Strings:** Instead of using strings like `"v"`, `"s"`, `"l"` directly in the code, define them as constants with meaningful names (e.g., `const BLOCK_TYPE_VERTICAL = 'v';`).
- [x] **Update Copyright Year:** Consider making the copyright year in the file headers dynamic or a range (e.g., 2022-2025).