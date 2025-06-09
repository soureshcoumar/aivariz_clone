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

// /js/script.js

// Keep the event listener for nav-link clicks as it handles dynamic content loading.
// The mobile menu and nav link initialization functions are now called from load_partials.js
// after the header is inserted.
document.body.addEventListener('click', async (event) => {
    const navLink = event.target.closest('.nav-link');
    if (navLink) {
        event.preventDefault(); // Prevent default link behavior
        const path = navLink.dataset.path; // Gets the path from data-path attribute

        if (path) {
            try {
                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const html = await response.text();

                // Use DOMParser to parse the fetched HTML string into a DOM document
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // Find the current <main> element in the live DOM
                const currentMain = document.querySelector('main');
                // Find the new <main> element from the parsed fetched HTML
                const newMain = doc.querySelector('main');

                if (currentMain && newMain) {
                    // Replace the old <main> element with the new one
                    currentMain.replaceWith(newMain);
                } else {
                    console.error('Main element not found in current document or fetched content.');
                    return; // Stop execution if main element isn't found
                }

                // Update page title
                const newTitle = doc.querySelector('title') ? doc.querySelector('title').textContent : 'Aivariz';
                document.title = newTitle;

                // Re-load partials (header and footer) for the new page content
                // This function is exposed globally by load_partials.js
                if (window.loadAllPagePartials) {
                    window.loadAllPagePartials();
                } else {
                    console.warn('loadAllPagePartials function not found. Partials might not load.');
                }

                // Re-initialize AOS (Animate On Scroll) for the new content
                // Calling AOS.init() again will scan the newly inserted DOM for elements with data-aos attributes
                if (typeof AOS !== 'undefined') {
                    AOS.init({
                        duration: 800, // values from 0 to 3000, with step 50ms
                        once: true, // whether animation should happen only once - while scrolling down
                    });
                } else {
                    console.warn('AOS library not found. Animations might not work.');
                }

                // Scroll to the top of the new page content
                window.scrollTo(0, 0);

            } catch (error) {
                console.error('Error loading page:', error);
                // Optionally, you might want to redirect to the full page if AJAX load fails
                // window.location.href = path;
            }
        }
    }
});