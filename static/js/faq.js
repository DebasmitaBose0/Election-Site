/**
 * FAQ Accordion Logic
 * Handles expanding/collapsing FAQ items
 */

function initFAQ() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const content = header.nextElementSibling;
            const icon = header.querySelector('.accordion-icon');
            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            // Close all other items
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item) {
                    const otherHeader = otherItem.querySelector('.accordion-header');
                    const otherContent = otherItem.querySelector('.accordion-content');
                    const otherIcon = otherItem.querySelector('.accordion-icon');

                    otherItem.classList.remove('active');
                    otherHeader.setAttribute('aria-expanded', 'false');
                    otherContent.style.maxHeight = null;
                    otherIcon.style.transform = 'rotate(0deg)';
                }
            });

            // Toggle current item
            if (isExpanded) {
                item.classList.remove('active');
                header.setAttribute('aria-expanded', 'false');
                content.style.maxHeight = null;
                icon.style.transform = 'rotate(0deg)';
            } else {
                item.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
                content.style.maxHeight = content.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
}

// Font size adjustment functions
function changeFontSize(delta) {
    const html = document.documentElement;
    const currentSize = parseFloat(getComputedStyle(html).fontSize);
    const newSize = Math.max(12, Math.min(24, currentSize + delta));
    html.style.fontSize = newSize + 'px';

    // Store preference
    localStorage.setItem('fontSize', newSize + 'px');
}

// High contrast toggle
function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    const isHighContrast = document.body.classList.contains('high-contrast');
    localStorage.setItem('highContrast', isHighContrast);
}

// Load user preferences
document.addEventListener('DOMContentLoaded', () => {
    initFAQ();

    // Load font size preference
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        document.documentElement.style.fontSize = savedFontSize;
    }

    // Load high contrast preference
    const highContrast = localStorage.getItem('highContrast') === 'true';
    if (highContrast) {
        document.body.classList.add('high-contrast');
    }

    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
});