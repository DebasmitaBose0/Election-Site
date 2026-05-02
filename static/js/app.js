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

// Preloader Logic
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('hidden');
            setTimeout(() => preloader.style.display = 'none', 850); // Wait for transition (800ms)
        }, 1500); // Allow the 1.5s progress bar animation to complete
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Chat Interface Logic
    const chatToggle = document.getElementById('chat-toggle-btn');
    const chatOverlay = document.getElementById('chat-overlay');
    const chatClose = document.getElementById('chat-close-btn');

    if (chatToggle && chatOverlay) {
        chatToggle.addEventListener('click', () => {
            const isVisible = chatOverlay.style.display === 'block';
            chatOverlay.style.display = isVisible ? 'none' : 'block';
            if (!isVisible && !window.chatInitialized) {
                if (typeof initChat === 'function') {
                    initChat();
                    window.chatInitialized = true;
                }
            }
        });
    }

    if (chatClose && chatOverlay) {
        chatClose.addEventListener('click', () => {
            chatOverlay.style.display = 'none';
        });
    }

    // Live News Ticker Logic
    async function initNewsTicker() {
        const track = document.querySelector('.ticker-track');
        if (!track) return;

        try {
            const response = await fetch('/api/live-news');
            const data = await response.json();
            
            if (data.headlines && data.headlines.length > 0) {
                // Clear existing and add new live headlines
                track.innerHTML = data.headlines.map(text => `<span>${text}</span>`).join('');
                
                // Duplicate headlines for a seamless infinite loop
                const originalHtml = track.innerHTML;
                track.innerHTML = originalHtml + originalHtml;
            }
        } catch (error) {
            console.error("Failed to fetch live news:", error);
        }
    }

    initNewsTicker();

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
                const suffix = entry.target.dataset.suffix || '';
                let count = 0;
                const duration = 2000;
                const increment = target / (duration / 16);
                
                const updateCount = () => {
                    count += increment;
                    if (count < target) {
                        entry.target.innerText = Math.ceil(count) + suffix;
                        requestAnimationFrame(updateCount);
                    } else {
                        entry.target.innerText = target + suffix;
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
// OpenStreetMap Integration (Free - No Billing Required)
// ═══════════════════════════════════════
let map;
let leafletMarker;
let boothMarkers = [];

function initMaps() {
    console.log('Leaflet Map initialized with premium styling');
    const mapContainer = document.getElementById('google-map');
    const searchBtn = document.getElementById('map-search-btn');
    const searchInput = document.getElementById('map-search-input');
    const infoOverlay = document.getElementById('map-info-overlay');
    const locationNameDisplay = document.getElementById('overlay-location-name');

    if (!mapContainer || !searchInput || !window.L) return;

    if (!map) {
        map = L.map(mapContainer, {
            zoomControl: false, // We'll use a custom tidy position
            scrollWheelZoom: true
        }).setView([20.5937, 78.9629], 5);

        L.control.zoom({ position: 'topright' }).addTo(map);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(map);
        
        setTimeout(() => map.invalidateSize(), 300);
    }

    const handleSearch = () => {
        const query = searchInput.value.trim();
        if (!query) return;

        window.showToast(`Locating ${query}...`, 'info');

        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', India')}&limit=1`)
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    const displayName = data[0].display_name.split(',')[0];
                    
                    map.setView([lat, lon], 15);

                    // Update Overlay
                    if (infoOverlay) infoOverlay.style.display = 'block';
                    if (locationNameDisplay) locationNameDisplay.textContent = displayName;

                    if (leafletMarker) map.removeLayer(leafletMarker);
                    
                    // Custom User Marker Icon
                    const userIcon = L.divIcon({
                        className: 'user-marker-icon',
                        html: '📍',
                        iconSize: [30, 30],
                        iconAnchor: [15, 15]
                    });

                    leafletMarker = L.marker([lat, lon], { icon: userIcon }).addTo(map)
                        .bindPopup(`<div class="premium-popup"><h4>${displayName}</h4><p>Search Result Area</p></div>`)
                        .openPopup();
                    
                    findBooths(lat, lon, displayName);
                } else {
                    window.showToast('Location not found', 'error');
                }
            });
    };

    searchBtn.onclick = handleSearch;
}

function findBooths(lat, lon, locationName) {
    const boothCountDisplay = document.getElementById('overlay-booth-count');
    
    // Clear old booth markers
    boothMarkers.forEach(m => map.removeLayer(m));
    boothMarkers = [];

    const overpassQuery = `
        [out:json][timeout:25];
        (
            node["amenity"="polling_station"](around:5000, ${lat}, ${lon});
            way["amenity"="polling_station"](around:5000, ${lat}, ${lon});
            node["polling_station"="yes"](around:5000, ${lat}, ${lon});
            way["polling_station"="yes"](around:5000, ${lat}, ${lon});
            node["amenity"="school"](around:3000, ${lat}, ${lon});
            way["amenity"="school"](around:3000, ${lat}, ${lon});
            node["amenity"="community_centre"](around:3000, ${lat}, ${lon});
            way["amenity"="community_centre"](around:3000, ${lat}, ${lon});
        );
        out center;
    `;

    fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery
    })
    .then(res => res.json())
    .then(data => {
        const elements = data.elements || [];
        if (boothCountDisplay) boothCountDisplay.textContent = elements.length;

        const boothIcon = L.divIcon({
            className: 'booth-marker-icon',
            html: '🗳️',
            iconSize: [26, 26],
            iconAnchor: [13, 13]
        });

        elements.forEach(el => {
            let itemLat = el.lat;
            let itemLon = el.lon;

            // Handle Way centers for buildings/areas
            if (el.type === 'way' && el.center) {
                itemLat = el.center.lat;
                itemLon = el.center.lon;
            }

            if (itemLat && itemLon) {
                const name = (el.tags && el.tags.name) ? el.tags.name : 'Polling Booth';
                const marker = L.marker([itemLat, itemLon], { icon: boothIcon }).addTo(map)
                .bindPopup(`
                    <div class="premium-popup">
                        <h4>🗳️ ${name}</h4>
                        <p>Verified Polling Station</p>
                        <a href="https://www.google.com/maps/dir/?api=1&destination=${el.lat},${el.lon}" target="_blank" class="directions-link">
                            📍 Get Directions
                        </a>
                    </div>
                `);
                boothMarkers.push(marker);
            }
        });
        
        if (elements.length > 0) {
            window.showToast(`Identified ${elements.length} booths!`, 'success');
        } else {
            window.showToast('Scanning area... No specific coordinates found.', 'info');
        }
    });
}

// Free Autocomplete (Nominatim)
(function() {
    let debounceTimer;
    function setupAutocomplete(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const dropdown = document.createElement('div');
        dropdown.className = 'autocomplete-dropdown';
        dropdown.style.cssText = 'position:absolute;z-index:10000;background:#1a1f3a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;max-height:200px;overflow-y:auto;display:none;width:100%;left:0;top:100%;box-shadow:0 8px 24px rgba(0,0,0,0.4);';
        input.parentElement.style.position = 'relative';
        input.parentElement.appendChild(dropdown);

        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const query = input.value.trim();
            if (query.length < 3) { dropdown.style.display = 'none'; return; }

            debounceTimer = setTimeout(() => {
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', India')}&limit=5&countrycodes=in`)
                    .then(res => res.json())
                    .then(data => {
                        dropdown.innerHTML = '';
                        if (data.length === 0) { dropdown.style.display = 'none'; return; }
                        data.forEach(item => {
                            const option = document.createElement('div');
                            option.textContent = item.display_name;
                            option.style.cssText = 'padding:10px 14px;cursor:pointer;font-size:0.85rem;color:#ccc;border-bottom:1px solid rgba(255,255,255,0.05);';
                            option.addEventListener('click', () => {
                                input.value = item.display_name;
                                dropdown.style.display = 'none';
                            });
                            dropdown.appendChild(option);
                        });
                        dropdown.style.display = 'block';
                    });
            }, 400);
        });

        document.addEventListener('click', (e) => {
            if (!input.contains(e.target) && !dropdown.contains(e.target)) dropdown.style.display = 'none';
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        setupAutocomplete('lookup-input');
        setupAutocomplete('map-search-input');
        initMaps(); // Re-init since we're using a direct call now
    });
})();
});
