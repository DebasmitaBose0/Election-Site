/**
 * Electionant - Live Results Dashboard & Data Visualizations
 */

async function initDashboard() {
    const resultsGrid = document.getElementById('results-grid');
    if (!resultsGrid) return;

    try {
        const response = await fetch('/api/election-results');
        const data = await response.json();
        
        resultsGrid.innerHTML = '';

        for (const [state, info] of Object.entries(data)) {
            const card = document.createElement('div');
            card.className = 'state-result-card';
            
            const total = info.total_seats;
            const counted = info.counted_seats;
            const percentage = Math.round((counted / total) * 100);

            // Party breakdown HTML
            const partiesHtml = info.parties.map(p => `
                <div class="party-row">
                    <div class="party-info">
                        <span class="party-color" style="background: ${p.color}"></span>
                        <span class="party-name">${p.name}</span>
                    </div>
                    <div class="party-stats">
                        <span class="p-leads">${p.leads}</span>
                        <span class="p-won">${p.won}</span>
                    </div>
                </div>
            `).join('');

            card.innerHTML = `
                <div class="card-header">
                    <h3>${state}</h3>
                    <span class="status-tag ${info.status.includes('Final') ? 'final' : 'live'}">${info.status}</span>
                </div>
                <div class="counting-progress">
                    <div class="progress-labels">
                        <span>Progress</span>
                        <span>${counted}/${total} Seats</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
                <div class="party-table-header">
                    <span>Party</span>
                    <span>Leads / Won</span>
                </div>
                <div class="parties-list">
                    ${partiesHtml}
                </div>
                <div class="card-chart">
                    <canvas id="chart-${state.replace(/\s+/g, '-')}"></canvas>
                </div>
            `;
            
            resultsGrid.appendChild(card);

            // Create mini pie chart for each state
            setTimeout(() => {
                const ctx = document.getElementById(`chart-${state.replace(/\s+/g, '-')}`).getContext('2d');
                new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: info.parties.map(p => p.name),
                        datasets: [{
                            data: info.parties.map(p => p.leads + p.won),
                            backgroundColor: info.parties.map(p => p.color),
                            borderWidth: 0,
                            hoverOffset: 10
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        cutout: '70%'
                    }
                });
            }, 0);
        }
    } catch (error) {
        console.error("Dashboard Init Error:", error);
        resultsGrid.innerHTML = '<p class="error-msg">Failed to load live results. Please try again later.</p>';
    }
}

function initYouthChart() {
    const ctx = document.getElementById('youthChart');
    if (!ctx) return;

    new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['2011', '2016', '2021', '2026 (Est)'],
            datasets: [{
                label: 'Youth Voter Turnout (%)',
                data: [42, 51, 62, 68],
                backgroundColor: 'rgba(255, 153, 51, 0.6)',
                borderColor: '#FF9933',
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: '#FF9933'
            }, {
                label: 'Female Youth Turnout (%)',
                data: [38, 48, 64, 71],
                backgroundColor: 'rgba(19, 136, 8, 0.6)',
                borderColor: '#138808',
                borderWidth: 2,
                borderRadius: 8,
                hoverBackgroundColor: '#138808'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#f8fafc', font: { family: 'Inter' } }
                }
            }
        }
    });
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    initYouthChart();
    // Dashboard will be initialized when the page is navigated to (via app.js)
});

// Expose to window for app.js
window.initDashboard = initDashboard;
