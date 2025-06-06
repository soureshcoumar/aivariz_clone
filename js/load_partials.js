async function loadHtmlPartial(url, elementId) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const placeholder = document.getElementById(elementId);
        if (placeholder) {
            placeholder.innerHTML = html;

            // Re-initialize mobile menu and other event listeners if they are part of the loaded content
            // The existing script.js handles mobile menu and smooth scrolling.
            // We just need to ensure it runs after the header is inserted.
            // Since script.js is loaded *after* load_partials.js, it will already have access to the new DOM elements.
        }
    } catch (error) {
        console.error(`Error loading HTML partial ${url}:`, error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    // Load header and footer HTML content
    await loadHtmlPartial('/header.html', 'header-placeholder');
    await loadHtmlPartial('/footer.html', 'footer-placeholder');

    // After partials are loaded, ensure the main script (script.js)
    // runs its DOMContentLoaded logic to attach event listeners.
    // If script.js uses DOMContentLoaded, it will automatically run once the DOM is ready,
    // including the injected content.
});
