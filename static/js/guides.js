async function initGuides() {
    const guidesGrid = document.getElementById('guides-grid');
    const guideDetail = document.getElementById('guide-detail');
    const guideDetailContent = document.getElementById('guide-detail-content');
    const guideBackBtn = document.getElementById('guide-back-btn');

    if (!guidesGrid) return;
    
    // Reset view
    guidesGrid.style.display = 'grid';
    guideDetail.style.display = 'none';

    // Fetch guides if grid is empty
    if (guidesGrid.children.length === 0) {
        try {
            const response = await fetch('/api/guides');
            const data = await response.json();
            
            data.guides.forEach(guide => {
                const card = document.createElement('div');
                card.className = 'feature-card guide-card';
                card.innerHTML = `
                    <div class="feature-icon"><i data-lucide="${guide.icon}"></i></div>
                    <h3>${guide.title}</h3>
                    <p>${guide.description}</p>
                    <div class="guide-meta">${guide.step_count} steps</div>
                `;
                
                card.onclick = () => showGuideDetail(guide.id);
                guidesGrid.appendChild(card);
            });
            
            // Re-initialize Lucide icons
            if (window.lucide) {
                lucide.createIcons();
            }
        } catch (error) {
            guidesGrid.innerHTML = '<div class="error">Failed to load guides.</div>';
        }
    }

    async function showGuideDetail(guideId) {
        guidesGrid.style.display = 'none';
        guideDetail.style.display = 'block';
        guideDetailContent.innerHTML = '<div class="loading">Loading details...</div>';

        try {
            const response = await fetch(`/api/guides/${guideId}`);
            const data = await response.json();
            const guide = data.guide;

            guideDetailContent.innerHTML = `
                <div class="guide-header-full">
                    <span class="guide-icon-large"><i data-lucide="${guide.icon}"></i></span>
                    <div>
                        <h2>${guide.title}</h2>
                        <p>${guide.description}</p>
                    </div>
                </div>
                <div class="guide-steps">
                    ${guide.steps.map((step, idx) => `
                        <div class="guide-step">
                            <div class="step-number">${idx + 1}</div>
                            <div class="step-body">
                                <h4>${step.title}</h4>
                                <p>${step.content}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            // Re-initialize Lucide icons
            if (window.lucide) {
                lucide.createIcons();
            }
        } catch (error) {
            guideDetailContent.innerHTML = '<div class="error">Error loading guide content.</div>';
        }
    }

    guideBackBtn.onclick = () => {
        guideDetail.style.display = 'none';
        guidesGrid.style.display = 'grid';
    };
}
