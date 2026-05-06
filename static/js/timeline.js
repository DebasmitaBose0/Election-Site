async function initTimeline() {
    const timelineContainer = document.getElementById('timeline');
    const stateSelector = document.getElementById('state-selector');
    const stateResultContainer = document.getElementById('state-result-container');
    
    if (!timelineContainer) return;
    
    // Don't re-fetch if already loaded
    if (timelineContainer.children.length > 0 && stateSelector.children.length > 1) return;

    // Load Main Timeline
    timelineContainer.innerHTML = '<div class="loading">Loading timeline...</div>';

    try {
        // Fetch Timeline Data
        const timelineRes = await fetch('/api/timeline');
        const timelineData = await timelineRes.json();
        
        timelineContainer.innerHTML = '';
        timelineData.timeline.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'timeline-item';
            itemDiv.style.animationDelay = `${index * 0.1}s`;
            
            const isLive = item.duration.includes('Exact Date');
            
            itemDiv.innerHTML = `
                <div class="timeline-icon ${isLive ? 'pulse-icon' : ''}">
                    <i data-lucide="${item.icon}"></i>
                </div>
                <div class="timeline-content ${isLive ? 'live-content' : ''}">
                    <div class="timeline-header">
                        <h3 class="timeline-phase">${item.phase}</h3>
                        <span class="timeline-duration ${isLive ? 'live-date' : ''}">${item.duration}</span>
                    </div>
                    <p class="timeline-desc">${item.description}</p>
                    <ul class="timeline-details">
                        ${item.details.map(detail => `<li>${detail}</li>`).join('')}
                    </ul>
                </div>
            `;
            timelineContainer.appendChild(itemDiv);
        });

        // Re-initialize Lucide icons for the new timeline items
        if (window.lucide) lucide.createIcons();

        // Fetch State-wise Data
        const stateRes = await fetch('/api/state-elections');
        const stateData = await stateRes.json();

        // Populate Dropdown
        const states = Object.keys(stateData).sort();
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelector.appendChild(option);
        });

        // Handle Dropdown Change
        stateSelector.addEventListener('change', (e) => {
            const selectedState = e.target.value;
            const data = stateData[selectedState];
            
            if (!data) return;

            if (data.has_election) {
                stateResultContainer.innerHTML = `
                    <div class="state-schedule-card">
                        <div class="state-card-header">
                            <h4 class="state-card-name">${selectedState}</h4>
                            <span class="state-card-badge">Election Year 2026</span>
                        </div>
                        <div class="state-card-body">
                            <div class="schedule-item">
                                <span class="schedule-label">Total Seats</span>
                                <span class="schedule-value">${data.total_seats}</span>
                            </div>
                            <div class="schedule-item">
                                <span class="schedule-label">Counting Date</span>
                                <span class="schedule-value">${data.counting_date}</span>
                            </div>
                            <div class="schedule-item">
                                <span class="schedule-label">Polling Time</span>
                                <span class="schedule-value">${data.polling_time}</span>
                            </div>
                        </div>
                        <div class="phases-list">
                            <span class="schedule-label">Phase Schedule</span>
                            ${data.schedule.map(p => `
                                <div class="phase-row">
                                    <span class="phase-name">${p.phase}</span>
                                    <span class="phase-date">${p.date} (${p.seats})</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            } else {
                stateResultContainer.innerHTML = `
                    <div class="state-schedule-card no-election">
                        <div class="state-card-header">
                            <h4 class="state-card-name">${selectedState}</h4>
                            <span class="state-card-badge">No Election</span>
                        </div>
                        <p class="schedule-value">No Legislative Assembly elections are scheduled for ${selectedState} in 2026.</p>
                    </div>
                `;
            }
        });

    } catch (error) {
        console.error('Error loading timeline/state data:', error);
        timelineContainer.innerHTML = '<div class="error">Failed to load election data.</div>';
    }
}
