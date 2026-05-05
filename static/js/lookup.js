/**
 * Lookup Logic
 * Handles Google Civic Information API and Calendar integration.
 */

async function initLookup() {
    const lookupForm = document.getElementById('lookup-form');
    const lookupInput = document.getElementById('lookup-input');
    const lookupResults = document.getElementById('lookup-results');
    const calendarDates = document.getElementById('calendar-dates');

    if (lookupForm) {
        lookupForm.onsubmit = async (e) => {
            e.preventDefault();
            const address = lookupInput.value.trim();
            if (!address) return;

            lookupResults.innerHTML = '<div class="loading">Searching for representatives...</div>';

            try {
                const response = await fetch(`/api/representatives?address=${encodeURIComponent(address)}`);
                const data = await response.json();

                if (data.error) {
                    lookupResults.innerHTML = `<div class="error-box">${data.error}</div>`;
                } else {
                    renderRepresentatives(data);
                }
            } catch (error) {
                lookupResults.innerHTML = '<div class="error-box">Failed to fetch data. Please check your connection.</div>';
            }
        };
    }

    function renderRepresentatives(data) {
        const reps = data.representatives;
        if (!reps || reps.length === 0) {
            lookupResults.innerHTML = `
                <div class="chat-welcome">
                    <span class="welcome-icon"><i data-lucide="search" style="width: 48px; height: 48px; color: var(--text-secondary);"></i></span>
                    <h3>No Results Found</h3>
                    <p>We couldn't find any representatives for that address. Please try a more specific location.</p>
                </div>
            `;
            return;
        }

        lookupResults.innerHTML = `
            <div class="results-header">
                <h3>Elected Representatives</h3>
                <p>Showing results for: <strong>${data.normalized_address.line1 || ''}, ${data.normalized_address.city || ''}</strong></p>
            </div>
            <div class="reps-grid">
                ${reps.map(rep => {
                    const adrUrl = `https://myneta.info/search.php?name=${encodeURIComponent(rep.name)}`;
                    const prsUrl = `https://prsindia.org/mptrack/search?name=${encodeURIComponent(rep.name)}`;
                    
                    return `
                    <div class="rep-card-premium">
                        <div class="rep-card-main">
                            <div class="rep-photo-container">
                                ${rep.photo_url ? 
                                    `<img src="${rep.photo_url}" alt="${rep.name}" class="rep-photo-large" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(rep.name)}&background=random'">` : 
                                    `<div class="rep-photo-placeholder-large"><i data-lucide="user" style="width: 64px; height: 64px; color: var(--text-secondary);"></i></div>`
                                }
                                <div class="rep-party-badge">${rep.party || 'Independent'}</div>
                            </div>
                            
                            <div class="rep-details">
                                <span class="rep-office-tag">${rep.office}</span>
                                <h4 class="rep-name-large">${rep.name}</h4>
                                
                                <div class="rep-meta-grid">
                                    ${rep.address && rep.address.length > 0 ? `
                                        <div class="meta-item">
                                            <span class="meta-label"><i data-lucide="map-pin" style="width: 14px; height: 14px; vertical-align: middle;"></i> Office Address</span>
                                            <p class="meta-value">${rep.address[0].line1 || ''}, ${rep.address[0].city || ''}, ${rep.address[0].state || ''} ${rep.address[0].zip || ''}</p>
                                        </div>
                                    ` : ''}
                                    
                                    <div class="meta-item">
                                        <span class="meta-label"><i data-lucide="phone" style="width: 14px; height: 14px; vertical-align: middle;"></i> Contact</span>
                                        <div class="contact-buttons">
                                            ${rep.phones && rep.phones.length > 0 ? `<a href="tel:${rep.phones[0]}" class="btn btn-icon" title="Call"><i data-lucide="phone" style="width: 16px; height: 16px;"></i></a>` : ''}
                                            ${rep.emails && rep.emails.length > 0 ? `<a href="mailto:${rep.emails[0]}" class="btn btn-icon" title="Email"><i data-lucide="mail" style="width: 16px; height: 16px;"></i></a>` : ''}
                                            ${rep.urls && rep.urls.length > 0 ? `<a href="${rep.urls[0]}" target="_blank" class="btn btn-icon" title="Website"><i data-lucide="globe" style="width: 16px; height: 16px;"></i></a>` : ''}
                                        </div>
                                    </div>

                                    <div class="meta-item">
                                        <span class="meta-label"><i data-lucide="smartphone" style="width: 14px; height: 14px; vertical-align: middle;"></i> Social Media</span>
                                        <div class="social-buttons">
                                            ${rep.channels && rep.channels.length > 0 ? rep.channels.map(c => {
                                                const platform = c.type.toLowerCase();
                                                const icon = platform === 'twitter' ? '<i data-lucide="twitter" style="width: 16px; height: 16px;"></i>' : (platform === 'facebook' ? '<i data-lucide="facebook" style="width: 16px; height: 16px;"></i>' : platform === 'youtube' ? '<i data-lucide="youtube" style="width: 16px; height: 16px;"></i>' : '<i data-lucide="link" style="width: 16px; height: 16px;"></i>');
                                                return `<a href="https://${platform}.com/${c.id}" target="_blank" class="btn btn-icon" title="${c.type}">${icon}</a>`;
                                            }).join('') : '<span class="no-data">None found</span>'}
                                        </div>
                                    </div>
                                </div>

                                <div class="rep-actions">
                                    <div class="research-links">
                                        <span class="research-label">Verified Research Portals:</span>
                                        <div class="link-row">
                                            <a href="${adrUrl}" target="_blank" class="research-btn adr">
                                                <span><i data-lucide="bar-chart-2" style="width: 14px; height: 14px; vertical-align: middle;"></i></span> MyNeta (ADR Details)
                                            </a>
                                            <a href="${prsUrl}" target="_blank" class="research-btn prs">
                                                <span><i data-lucide="landmark" style="width: 14px; height: 14px; vertical-align: middle;"></i></span> PRS (MP Track)
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `}).join('')}
            </div>
        `;
    }

    // Calendar logic
    if (calendarDates && calendarDates.children.length === 0) {
        try {
            const response = await fetch('/api/calendar/dates');
            const data = await response.json();
            
            calendarDates.innerHTML = '';
            data.dates.forEach(date => {
                const dateCard = document.createElement('div');
                dateCard.className = 'calendar-date-card';
                const eventDate = new Date(date.date);
                dateCard.innerHTML = `
                    <div class="date-info">
                        <div class="date-badge">
                            <span class="month">${eventDate.toLocaleDateString('en-IN', {month: 'short'})}</span>
                            <span class="day">${eventDate.toLocaleDateString('en-IN', {day: '2-digit'})}</span>
                        </div>
                        <div class="date-text">
                            <h4>${date.title}</h4>
                            <p>${date.description}</p>
                        </div>
                    </div>
                    <button class="btn btn-glass btn-sm add-cal-btn" data-id="${date.id}">
                        <i data-lucide="calendar-plus" style="width: 14px; height: 14px; vertical-align: middle;"></i> Add to Calendar
                    </button>
                `;
                
                const btn = dateCard.querySelector('.add-cal-btn');
                btn.onclick = () => addToCalendar(date);
                calendarDates.appendChild(dateCard);
            });
        } catch (error) {
            calendarDates.innerHTML = '<p class="error-small">Could not load election dates.</p>';
        }
    }

    async function addToCalendar(dateEvent) {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            const response = await fetch('/api/calendar/add', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(dateEvent)
            });
            
            const data = await response.json();
            
            if (data.success) {
                window.showToast('Added to your Google Calendar!', 'success');
                window.open(data.event_link, '_blank');
            } else if (data.error === 'Authentication required. Please sign in with Google.') {
                window.showToast('Please sign in with Google first', 'error');
            } else {
                window.showToast(data.error || 'Failed to add to calendar', 'error');
            }
        } catch (error) {
            window.showToast('Error connecting to calendar service', 'error');
        }
    }
}
