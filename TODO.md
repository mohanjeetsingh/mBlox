# mBlox Project TODO

This file tracks planned improvements and refactoring tasks for the mBlox project.

## High Priority / High Impact_
- [ ] **Replace HTML String Concatenation:** The script builds large blocks of HTML by adding strings together (e.g., `blockBody += '...'`). This is hard to read, maintain, and prone to syntax errors. This should be refactored to use modern **Template Literals** (backticks `` ` ``) for cleaner, multi-line HTML structure within the JavaScript.


## Low Priority / Opportunities

- [ ] **Break Down Large Functions:** The main `mBlocks` function is very large. Consider breaking out the post-processing loop and the `complete` callback logic into smaller, dedicated helper functions to improve modularity and testability.