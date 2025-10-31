This file tracks the next set of refactoring and feature implementation tasks for the mBlox project.

## Stage 12: API and Maintainability Improvements

*Goal: Finalize the public API and improve long-term maintainability by adopting best practices for data attributes and documentation.*

- [x] **Step 12.1: Implement a `destroy` Method**
    - [x] Created a public `mBlocks.destroy(element)` method that properly tears down an mBlox instance.
    - [x] This method removes all event listeners and generated HTML, restoring the element to its original state.
- [ ] **Step 12.2: Namespace Data Attributes (Breaking Change)**
    - [ ] To prevent conflicts with other libraries, update all `data-*` attributes to be namespaced with `data-mblox-*`.
    - [ ] For example, `data-type` becomes `data-mblox-type`, `data-feed` becomes `data-mblox-feed`, etc.
    - [ ] Update `_parseBlockConfig` to read these new attribute names.
    - [ ] Update the `README.md` to reflect this change across all documentation.

- [x] **Step 12.3: Align Documentation**
    - [x] Reviewed all `data-*` attributes in `README.md` and ensured their casing matches the `getAttribute()` calls in `_parseBlockConfig`.