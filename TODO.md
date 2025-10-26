# mBlox Project TODO

This file tracks planned improvements and refactoring tasks for the mBlox project.

## High Priority / High Impact

- [x] **Refactor Variable Names:** In `mBloxScript.js`, many variable names are very short and cryptic (e.g., `e`, `la`, `cTy`, `bTy`). These should be renamed to be descriptive (e.g., `element`, `label`, `contentType`, `blockType`) to improve code readability and maintainability.
- [ ] **Replace HTML String Concatenation:** The script builds large blocks of HTML by adding strings together. This is hard to read and prone to errors. This should be refactored to use modern **Template Literals** for cleaner HTML structure within the JavaScript. 
- [ ] **Add Code Comments:** `mBloxScript.js` has complex logic for handling different block types and settings. Add comments to explain what different sections of the code do, what the cryptic `data-` attribute flags mean, and the purpose of complex calculations.

## Modernization & Best Practices

- [ ] **Plan jQuery Removal:** The project relies heavily on jQuery. For long-term maintainability and performance, create a plan to incrementally replace jQuery functions with native browser APIs (e.g., `$.ajax` with `fetch`, `$(selector)` with `document.querySelector`).
- [x] **Use `let` and `const`:** Replace all `var` declarations with modern `let` (for variables that will be reassigned) and `const` (for variables that won't).
- [ ] **Simplify Complex Ternary Operators:** Some ternary statements are nested or very complex. For clarity, rewrite them as standard `if/else` statements.
- [ ] **Remove Dead Code:** Clean up the codebase by removing all commented-out `console.log()` statements.

## Low Priority

- [ ] **Create Constants for Magic Strings:** Instead of using strings like `"v"`, `"s"`, `"l"` directly in the code, define them as constants with meaningful names (e.g., `const BLOCK_TYPE_COVER = 'v';`).
- [ ] **Update Copyright Year:** Consider making the copyright year in the file headers dynamic or a range (e.g., 2022-2025).


- [ ] **Remove jQuery Dependency:** The project relies heavily on jQuery. For long-term maintainability and performance, replace jQuery functions with native browser APIs (`fetch`, `querySelector`, etc.).

    This will be done in a staged manner to ensure the layout and functionality can be tested after each step. The core idea is to replace jQuery methods with native equivalents incrementally.

    ### Stage 1: Initial Setup and Element Selection
    The goal of this stage is to handle the main loop and basic attribute reading without jQuery.
    - [ ] **Handle `mBlocks` input:** The `mBlocks` function is called with either a selector string (e.g., `.mBlock`) or a DOM element. The function should handle both cases. If it's a string, use `document.querySelectorAll` to get a list of elements. If it's a single element, wrap it in an array to be used in a `forEach` loop.
    - [ ] **Replace `$(m).map()`:** Change the initial `$(m).map(function() { ... })` to a native `forEach` loop over the elements.
    - [ ] **Replace `$(this)`:** Inside the loop, the jQuery `$(this)` object will become the native `element` passed by `forEach`.
    - [ ] **Replace `.attr()` for attributes:** Replace `element.attr("data-...")` with `element.getAttribute("data-...")` for reading, and `element.attr("data-...", "value")` with `element.setAttribute("data-...", "value")` for writing.

    > **Checkpoint:** After this stage, the script should still function correctly. You've only changed how the initial elements are looped over and how their `data-*` attributes are read.

    ### Stage 2: Replace AJAX with a JSONP Fetch Helper
    This is a critical step. We'll replace `$.ajax` with a native solution for fetching JSONP data.
    - [ ] **Create a `fetchJSONP` helper function:** This function will take a URL and a callback function as arguments. Inside, it will:
        1.  Create a unique callback function name (e.g., `jsonp_callback_12345`).
        2.  Attach this callback to the global `window` object.
        3.  Create a new `<script>` element.
        4.  Set its `src` to the feed URL, appending `&callback=window.jsonp_callback_12345`.
        5.  Append the script to the document head to trigger the request.
        6.  The global callback function will execute the original `success` logic, and then clean up by removing the script tag and the global callback function itself.
    - [ ] **Replace `$.ajax()` call:** Use the new `fetchJSONP` helper to fetch the Blogger feed. The logic inside the `success` function will remain the same for now.
    - [ ] **Move `complete` logic:** The logic from the `$.ajax` `complete` block should be moved to the end of the `fetchJSONP`'s callback, after the `success` logic has run.

    > **Checkpoint:** The blocks should still load content correctly. The only change is the data fetching mechanism.

    ### Stage 3: Incremental DOM Manipulation and Event Handling
    In this stage, we'll replace jQuery DOM and event methods one by one.
    - [ ] **HTML Parsing:** Replace `$("<div>").html(itemContent)` with `new DOMParser().parseFromString(itemContent, 'text/html')`. Then use `querySelector` on the resulting document to find elements.
    - [ ] **DOM Traversal:** Replace `.find()`, `.closest()`, and `.parent()` with their native equivalents: `querySelector()`, `.closest()`, and `.parentElement`.
    - [ ] **DOM Creation & Insertion:** Replace `$(document.createElement(...))` with `document.createElement(...)`. Replace `.append()`, `.appendTo()`, `.before()`, `.after()` with native methods like `element.append()`, `parent.appendChild()`, and `element.insertAdjacentHTML()`.
    - [ ] **Class Manipulation:** Replace `.addClass()`, `.removeClass()` with `element.classList.add()`, `element.classList.remove()`.
    - [ ] **Event Handling:** Replace `.click()` and `.unbind().click()` with `element.addEventListener()`. For unbinding, you may need to store the listener function in a variable so it can be passed to `removeEventListener()`. This is especially important for the navigation and "Showcase" click handlers.
    - [ ] **Chained Methods:** Replace chained jQuery calls like `element.find(".foo").click(...)` with native equivalents, e.g., `element.querySelector(".foo").addEventListener('click', ...)`.

    > **Checkpoint:** After each sub-step in this stage, verify that the layout, carousels, and click events are all working as expected.

    ### Final Stage: Cleanup
    Once all `$` and `jQuery` references are removed from `mBloxScript.js` and everything is confirmed to be working...
    - [ ] **Update `mBloxCall.js`:** Modify the `loadScripts` function to no longer load `jquery.min.js`.
    - [ ] **Final Test:** Do a full regression test to ensure all block types and configurations work correctly without jQuery.

    - [ ] Modify `loadScripts` to no longer load `jquery.min.js`.
    - [ ] The `mBlocks` function is called with a selector (`.mBlock`) or a DOM element (`entry.target`). The native version of `mBlocks` will need to handle both cases.
