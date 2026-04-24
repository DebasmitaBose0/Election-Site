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
                    <span class="welcome-icon">🔍</span>
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
                ${reps.map(rep => `
                    <div class="rep-card">
                        ${rep.photo_url ? 
                            `<img src="${rep.photo_url}" alt="${rep.name}" class="rep-photo" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(rep.name)}&background=random'">` : 
                            `<div class="rep-photo-placeholder">👤</div>`
                        }
                        <div class="rep-info">
                            <span class="rep-office">${rep.office}</span>
                            <h4 class="rep-name">${rep.name}</h4>
                            <span class="rep-party">${rep.party || 'Independent'}</span>
                            <div class="rep-contact">
                                ${rep.phones && rep.phones.length > 0 ? 
                                    rep.phones.map(p => `<a href="tel:${p}" class="contact-link" title="Call">📞 ${p}</a>`).join('') : ''
                                }
                                ${rep.urls && rep.urls.length > 0 ? 
                                    rep.urls.map(u => `<a href="${u}" target="_blank" class="contact-link" title="Website">🌐 Official Site</a>`).join('') : ''
                                }
                                ${rep.emails && rep.emails.length > 0 ? 
                                    rep.emails.map(e => `<a href="mailto:${e}" class="contact-link" title="Email">✉️ Email</a>`).join('') : ''
                                }
                                ${rep.channels && rep.channels.length > 0 ? 
                                    rep.channels.map(c => {
                                        const icon = c.type === 'Twitter' ? '𝕏' : (c.type === 'Facebook' ? 'ⓕ' : '📱');
                                        return `<a href="https://${c.type.toLowerCase()}.com/${c.id}" target="_blank" class="contact-link">${icon} ${c.type}</a>`;
                                    }).join('') : ''
                                }
                            </div>
                        </div>
                    </div>
                `).join('')}
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
                        📅 Add to Calendar
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
