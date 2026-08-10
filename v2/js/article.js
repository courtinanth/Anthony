// Article page functionality

document.addEventListener('DOMContentLoaded', function () {
    // Generate Table of Contents from H2 headings
    generateTOC();

    // Setup scroll spy for TOC
    setupScrollSpy();

    // Setup smooth scroll for TOC links
    setupSmoothScroll();
});

/**
 * Generate Table of Contents from article H2 headings
 */
function generateTOC() {
    const tocList = document.getElementById('toc-list');
    const articleContent = document.querySelector('.article-content');

    if (!tocList || !articleContent) return;

    const headings = articleContent.querySelectorAll('h2[id]');

    if (headings.length === 0) {
        // If no IDs, try to add them
        const allH2 = articleContent.querySelectorAll('h2');
        allH2.forEach((h2, index) => {
            if (!h2.id) {
                h2.id = 'section-' + (index + 1);
            }
        });
    }

    const h2s = articleContent.querySelectorAll('h2');

    h2s.forEach(h2 => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + h2.id;
        a.textContent = h2.textContent;
        li.appendChild(a);
        tocList.appendChild(li);
    });
}

/**
 * Setup scroll spy to highlight current section in TOC
 */
function setupScrollSpy() {
    const tocLinks = document.querySelectorAll('.toc-list a');
    const sections = [];

    tocLinks.forEach(link => {
        const id = link.getAttribute('href').substring(1);
        const section = document.getElementById(id);
        if (section) {
            sections.push({ id, element: section, link });
        }
    });

    if (sections.length === 0) return;

    function onScroll() {
        const scrollPos = window.scrollY + 150; // Offset for header

        let currentSection = sections[0];

        sections.forEach(section => {
            if (section.element.offsetTop <= scrollPos) {
                currentSection = section;
            }
        });

        // Remove active from all
        tocLinks.forEach(link => link.classList.remove('active'));

        // Add active to current
        if (currentSection) {
            currentSection.link.classList.add('active');
        }
    }

    window.addEventListener('scroll', onScroll);
    onScroll(); // Initial check
}

/**
 * Setup smooth scrolling for TOC links
 */
function setupSmoothScroll() {
    const tocLinks = document.querySelectorAll('.toc-list a');

    tocLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);

            if (target) {
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Update URL without scrolling
                history.pushState(null, null, '#' + targetId);
            }
        });
    });
}

/**
 * Calculate reading time (optional utility)
 */
function calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
}
