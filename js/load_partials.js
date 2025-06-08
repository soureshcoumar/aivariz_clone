async function loadHtmlPartial(path, elementId) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const placeholder = document.getElementById(elementId);
        placeholder.innerHTML = html;

        // After inserting HTML, initialize mobile menu and nav links if it's the header
        if (elementId === 'header-placeholder') {
            // Adding a small delay to ensure DOM is fully processed before running JS that accesses elements
            setTimeout(() => {
                if (window.initializeMobileMenu) { // Check if the global function exists
                    window.initializeMobileMenu(); // Call the globally accessible function
                } else {
                    console.error("initializeMobileMenu function not found in global scope.");
                }
                // Call initializeNavLinks AFTER header content is in DOM and mobile menu is initialized
                if (window.initializeNavLinks) { // Check if the global function exists
                    window.initializeNavLinks();
                } else {
                    console.error("initializeNavLinks function not found in global scope.");
                }
            }, 100); // 100ms delay
        }
    } catch (error) {
        console.error(`Could not load HTML partial from ${path}:`, error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadHtmlPartial('/header.html', 'header-placeholder');
    await loadHtmlPartial('/footer.html', 'footer-placeholder');
});