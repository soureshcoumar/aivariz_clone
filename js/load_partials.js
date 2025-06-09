// Function to load a single partial
async function loadPartial(id, url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load partial: ${url}`);
        }
        const html = await response.text();
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = html;
            // After header is loaded, initialize mobile menu
            if (id === 'header-placeholder' && window.initializeMobileMenu) {
                window.initializeMobileMenu();
            }
            // After header is loaded, initialize nav links (if they are part of the header)
            if (id === 'header-placeholder' && window.initializeNavLinks) {
                 window.initializeNavLinks();
            }
        } else {
            console.warn(`Placeholder element with ID '${id}' not found.`);
        }
    } catch (error) {
        console.error(`Error loading partial ${url}:`, error);
    }
}

// Function to load all necessary partials
function loadAllPagePartials() {
    loadPartial('header-placeholder', '/header.html');
    loadPartial('footer-placeholder', '/footer.html');
    // Add other partials here if you have them
}

// --- IMPORTANT ---
// 1. Run on initial full page load
document.addEventListener('DOMContentLoaded', loadAllPagePartials);

// 2. Expose the function globally so it can be called from other scripts (like script.js)
window.loadAllPagePartials = loadAllPagePartials;