/**
 * Electionant - Main Application Logic
 * Handles SPA navigation, UI interactions, and common utilities.
 */

// ═══════════════════════════════════════
// Accessibility Features (Global Scope)
// ═══════════════════════════════════════
let currentFontSize = 0;

// Global Toast System
window.showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `
        <span>${icon}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        toast.style.transition = 'all 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
};

window.changeFontSize = (step) => {
    const html = document.documentElement;
    const baseSize = 16;
    if (step === 0) {
        currentFontSize = 0;
    } else {
        currentFontSize = Math.max(-4, Math.min(6, currentFontSize + step));
    }
    // Changing font-size on html affects all 'rem' units site-wide
    html.style.fontSize = `${baseSize + currentFontSize}px`;
    
    // Show feedback
    if (window.showToast) showToast(`Font size adjusted`, 'info');
};

// ═══════════════════════════════════════
// UI Utilities (Global Scope)
// ═══════════════════════════════════════

// Global Toast Notification Helper
window.showToast = (message, type = 'info') => {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.animation = 'slideIn 0.3s ease forwards';
    const icons = {
        success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
        info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-message">${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

document.addEventListener('DOMContentLoaded', () => {
    // SPA State Management
    const state = {
        currentPage: 'home',
        user: null,
        authenticated: false
    };

    // ═══════════════════════════════════════
    // Selectors
    // ═══════════════════════════════════════
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const authBtn = document.getElementById('auth-btn');
    const featureCards = document.querySelectorAll('.feature-card');
    const heroChatBtn = document.getElementById('hero-chat-btn');
    const heroExploreBtn = document.getElementById('hero-explore-btn');

    // ═══════════════════════════════════════
    // Navigation Logic
    // ═══════════════════════════════════════
    function navigateTo(pageId) {
        if (!pageId) return;

        // Update State
        state.currentPage = pageId;

        // Update UI
        pages.forEach(page => {
            page.classList.toggle('active', page.id === `page-${pageId}`);
        });

        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageId);
        });

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Trigger page-specific logic
        if (pageId === 'chat') initChat();
        if (pageId === 'timeline') initTimeline();
        if (pageId === 'guides') initGuides();
        if (pageId === 'lookup') initLookup();
        if (pageId === 'maps') initMaps();
        if (pageId === 'videos') initVideos();
        
        // Update URL hash without reload
        window.history.pushState(null, '', `#${pageId}`);
    }

    // Event Listeners for Nav (Main + Footer)
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            // Only prevent default if it's an internal SPA link
            const pageId = link.dataset.page;
            if (pageId) {
                e.preventDefault();
                navigateTo(pageId);
            }
        });
    });

    // Feature card clicks
    featureCards.forEach(card => {
        card.addEventListener('click', () => navigateTo(card.dataset.page));
    });

    if (heroChatBtn) heroChatBtn.addEventListener('click', () => navigateTo('chat'));
    if (heroExploreBtn) heroExploreBtn.addEventListener('click', () => navigateTo('timeline'));

    // Handle initial hash navigation
    const initialHash = window.location.hash.substring(1);
    if (initialHash && ['home', 'chat', 'timeline', 'guides', 'lookup'].includes(initialHash)) {
        navigateTo(initialHash);
    }

    // ═══════════════════════════════════════
    // Authentication
    // ═══════════════════════════════════════
    async function checkAuthStatus() {
        try {
            const response = await fetch('/auth/status');
            const data = await response.json();
            
            if (data.authenticated) {
                state.authenticated = true;
                state.user = data.user;
                updateAuthUI(true);
            } else {
                state.authenticated = false;
                state.user = null;
                updateAuthUI(false);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }

    function updateAuthUI(isAuthenticated) {
        if (!authBtn) return;
        
        if (isAuthenticated) {
            authBtn.innerHTML = `<img src="${state.user.picture}" alt="" class="user-pic"> Logout`;
            authBtn.onclick = () => window.location.href = '/auth/logout';
        } else {
            authBtn.innerHTML = `<span class="google-icon">G</span> Sign In`;
            authBtn.onclick = () => window.location.href = '/auth/login';
        }
    }

    checkAuthStatus();

    // ═══════════════════════════════════════
    // UI Effects
    // ═══════════════════════════════════════
    
    // Stats Counter Animation
    const stats = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = +entry.target.dataset.count;
                let count = 0;
                const duration = 2000;
                const increment = target / (duration / 16);
                
                const updateCount = () => {
                    count += increment;
                    if (count < target) {
                        entry.target.innerText = Math.ceil(count);
                        requestAnimationFrame(updateCount);
                    } else {
                        entry.target.innerText = target;
                    }
                };
                updateCount();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));

    // ═══════════════════════════════════════
    // FAQ Population
    // ═══════════════════════════════════════
    function initFAQ() {
        const faqContainer = document.getElementById('faq-container');
        if (!faqContainer) return;

        const faqs = [
            {
                q: "How do I check if my name is in the voter list?",
                a: "You can check your name on the Electoral Search portal at voterportal.eci.gov.in or by using the Voter Helpline App."
            },
            {
                q: "What documents are required for voter registration?",
                a: "You typically need proof of age (like birth certificate or school leaving certificate) and proof of residence (like Aadhaar card, bank passbook, or utility bills)."
            },
            {
                q: "Can I vote if I don't have my Voter ID card?",
                a: "Yes, you can vote even without your Voter ID card if your name is in the electoral roll. You will need to show one of the alternative identity documents approved by the ECI, such as Aadhaar, PAN card, or Passport."
            },
            {
                q: "What is the minimum age to vote in India?",
                a: "The minimum age to vote in India is 18 years. You must be 18 years old on the qualifying date (usually January 1st of the year the electoral roll is prepared)."
            },
            {
                q: "What is NOTA (None of the Above)?",
                a: "NOTA is an option on the EVM that allows a voter to officially register a vote of rejection for all candidates who are contesting an election."
            },
            {
                q: "How can I apply for a duplicate Voter ID card?",
                a: "You can apply for a duplicate Voter ID (EPIC) by filling out Form 001 on the Voter Portal if your original card is lost, destroyed, or mutilated."
            },
            {
                q: "Can NRIs vote in Indian elections?",
                a: "Yes, Non-Resident Indians (NRIs) can vote. They must be registered as 'Overseas Electors' and must be physically present at their respective polling station in India on the day of voting."
            },
            {
                q: "What is VVPAT?",
                a: "Voter Verifiable Paper Audit Trail (VVPAT) is a machine connected to the EVM that prints a paper slip showing the serial number, name, and symbol of the candidate you voted for, allowing you to verify your vote."
            }
        ];

        faqContainer.innerHTML = faqs.map(faq => `
            <div class="faq-item">
                <div class="faq-question">
                    <span>${faq.q}</span>
                    <span class="faq-icon">+</span>
                </div>
                <div class="faq-answer">
                    <p>${faq.a}</p>
                </div>
            </div>
        `).join('');

        // FAQ Toggle Logic
        document.querySelectorAll('.faq-question').forEach(item => {
            item.addEventListener('click', () => {
                const parent = item.parentElement;
                const wasActive = parent.classList.contains('active');
                
                // Close all others
                document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('active'));
                
                if (!wasActive) {
                    parent.classList.add('active');
                }
            });
        });
    }

    initFAQ();

// ═══════════════════════════════════════
// Google Maps Integration
// ═══════════════════════════════════════
let map; // Global map instance

function initMaps() {
    console.log('OpenStreetMap (Leaflet) initialized');
    const searchBtn = document.getElementById('map-search-btn');
    const searchInput = document.getElementById('map-search-input');
    const mapContainer = document.getElementById('leaflet-map');

    if (!searchBtn || !searchInput || !mapContainer) return;

    // Initialize map if not already done
    if (!map) {
        map = L.map('leaflet-map').setView([20.5937, 78.9629], 5); // Center of India
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }

    // Search Logic
    const handleSearch = async () => {
        const query = searchInput.value.trim();
        if (!query) return;

        showToast(`Locating ${query}...`, 'info');

        try {
            // Use free Nominatim API for geocoding
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', India')}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const coords = [parseFloat(lat), parseFloat(lon)];
                
                map.setView(coords, 14);
                
                // Add marker
                L.marker(coords).addTo(map)
                    .bindPopup(`<b>${query}</b><br>Potential Polling Area`)
                    .openPopup();
            } else {
                showToast('Location not found. Try a more specific area name.', 'error');
            }
        } catch (error) {
            console.error('Map Search Error:', error);
            showToast('Search failed. Please check your connection.', 'error');
        }
    };

    // Remove old listeners
    const newBtn = searchBtn.cloneNode(true);
    searchBtn.parentNode.replaceChild(newBtn, searchBtn);
    newBtn.addEventListener('click', handleSearch);
}

// ═══════════════════════════════════════
// YouTube Integration
// ═══════════════════════════════════════
function initVideos() {
    console.log('YouTube Gallery initialized');
}
});
