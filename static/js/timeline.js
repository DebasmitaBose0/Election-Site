/**
 * Timeline Logic
 * Fetches and renders the election process timeline.
 */

async function initTimeline() {
    const timelineContainer = document.getElementById('timeline');
    if (!timelineContainer) return;
    
    // Don't re-fetch if already loaded
    if (timelineContainer.children.length > 0) return;

    timelineContainer.innerHTML = '<div class="loading">Loading timeline...</div>';

    try {
        const response = await fetch('/api/timeline');
        const data = await response.json();
        
        timelineContainer.innerHTML = '';

        data.timeline.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'timeline-item';
            itemDiv.style.animationDelay = `${index * 0.1}s`;
            
            const isLive = item.duration.includes('Exact Date');
            
            itemDiv.innerHTML = `
                <div class="timeline-icon ${isLive ? 'pulse-icon' : ''}">${item.icon}</div>
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
    } catch (error) {
        timelineContainer.innerHTML = '<div class="error">Failed to load timeline data.</div>';
    }
}
