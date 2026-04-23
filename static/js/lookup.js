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
            lookupResults.innerHTML = '<div class="info-box">No representatives found for this location.</div>';
            return;
        }

        lookupResults.innerHTML = `
            <div class="results-header">
                <h3>Representatives for your area</h3>
                <p>${data.normalized_address.line1 || ''}, ${data.normalized_address.city || ''}</p>
            </div>
            <div class="reps-grid">
                ${reps.map(rep => `
                    <div class="rep-card">
                        ${rep.photo_url ? `<img src="${rep.photo_url}" alt="${rep.name}" class="rep-photo">` : `<div class="rep-photo-placeholder">👤</div>`}
                        <div class="rep-info">
                            <span class="rep-office">${rep.office}</span>
                            <h4 class="rep-name">${rep.name}</h4>
                            <span class="rep-party">${rep.party}</span>
                            <div class="rep-contact">
                                ${rep.phones.map(p => `<a href="tel:${p}" class="contact-link">📞 ${p}</a>`).join('')}
                                ${rep.urls.map(u => `<a href="${u}" target="_blank" class="contact-link">🌐 Website</a>`).join('')}
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
                dateCard.innerHTML = `
                    <div class="date-info">
                        <span class="date-day">${new Date(date.date).toLocaleDateString('en-IN', {day: '2-digit', month: 'short'})}</span>
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
            const response = await fetch('/api/calendar/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
