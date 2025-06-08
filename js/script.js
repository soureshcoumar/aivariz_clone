// Make initializeMobileMenu globally accessible for load_partials.js
window.initializeMobileMenu = function() {
    console.log('Attempting to initialize mobile menu...');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        console.log('Mobile menu elements found, attaching listeners.');
        const navLinks = mobileMenu.querySelectorAll('a');

        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            const icon = mobileMenuButton.querySelector('i');
            if (mobileMenu.classList.contains('hidden')) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            } else {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuButton.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
    } else {
        console.log('Mobile menu elements not found during initialization.');
    }
};

// Function to initialize nav link click listeners
window.initializeNavLinks = function() {
    document.querySelectorAll('.nav-link').forEach(link => {
        // Prevent attaching multiple listeners
        if (!link.dataset.listenerAttached) {
            link.addEventListener('click', function(e) {
                const path = this.getAttribute('data-path');
                if (path) {
                    e.preventDefault(); // Prevent default full page reload
                    loadPageContent(path); // Load content dynamically
                } else {
                    console.log('Nav-link has no data-path, or data-path is empty.');
                }
            });
            link.dataset.listenerAttached = 'true'; // Mark that listener is attached
        }
    });
    console.log('Nav-link listeners initialized.');
};

// Function to initialize scroll animations
function initializeScrollAnimations() {
    console.log('Initializing scroll animations...');
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of element visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-on-scroll').forEach(element => {
        observer.observe(element);
    });
}

// Function to load dynamic content
function loadPageContent(path, pushState = true) {
    // Determine the target element for content loading. This might need to be specific.
    const contentArea = document.querySelector('main'); // Currently targets the main tag

    if (!contentArea) {
        console.error('Content area (main tag) not found.');
        return;
    }

    // Show a loading indicator if desired
    contentArea.innerHTML = '<div class="flex justify-center items-center h-screen"><div class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div></div>';

    fetch(path, { cache: 'no-cache' })
        .then(response => {
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn(`Dynamic content not found at ${path}, falling back to full page load.`);
                    window.location.href = path;
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            // --- IMPORTANT: Ensure 'substring' is REMOVED from the following console.log ---
            console.log('Fetched HTML for', path, ':', html);

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const fetchedMainContent = tempDiv.querySelector('main');

        
            // --- END NEW LOGS ---

            if (fetchedMainContent) {
                // --- IMPORTANT: Ensure 'substring' is REMOVED from the following console.log ---
                console.log('Fetched main content for', path, ':', fetchedMainContent.innerHTML);

                contentArea.innerHTML = fetchedMainContent.innerHTML;

                const fetchedTitle = tempDiv.querySelector('title');
                if (fetchedTitle) {
                    document.title = fetchedTitle.textContent;
                }

                contentArea.scrollTop = 0;
                window.scrollTo(0, 0);

                if (window.initializeScrollAnimations) {
                    window.initializeScrollAnimations();
                }

                if (pushState) {
                    history.pushState({ path: path }, document.title, path);
                }
            } else {
                console.error('No main tag found in fetched content from', path);
                window.location.href = path;
            }
        })
        .catch(error => {
            console.error('Error loading page content:', error);
            window.location.href = path;
        });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('script.js loaded and DOM content is ready!');

    // Initial call for nav links (if any exist before partials are loaded, e.g., logo)
    // This is primarily for elements that might be present in index.html directly
    // before header partial is loaded.
    window.initializeNavLinks();

    // Initial call for scroll animations on the very first page load
    if (typeof initializeScrollAnimations === 'function') {
        initializeScrollAnimations();
    } else {
        console.warn("initializeScrollAnimations function not found. Skipping initial call.");
    }

    // Handle browser back/forward buttons (PopState event)
    window.addEventListener('popstate', (event) => {
        // Get the path from the history state or the current URL if state is null
        const path = event.state && event.state.path ? event.state.path : window.location.pathname;
        loadPageContent(path, false); // Load content, but don't push a new state
    });

    // Initial `history.replaceState` for the current page when the script first loads.
    // This ensures `popstate` works correctly if the user navigates back to the initial page.
    history.replaceState({ path: window.location.pathname }, document.title, window.location.pathname);
});