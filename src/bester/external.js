// This module wraps all external interfaces so they can be subbed out for different platforms.
// This implementation is for the browser.

// Will be null/undefined if running in a non-browser environment:
export const document = window.document;
// TODO: eliminate reference to window, since it's way too broad.
const window_ = window;
export {window_ as window};

// Will have an partial/limited replacement in a non-browser environment:
export const fetch = window.fetch;

// Will behave ~identically in a non-browser environment:
export const URL = window.URL;
