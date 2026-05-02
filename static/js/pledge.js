/**
 * Voter Pledge Logic
 * Handles certificate generation and user interaction.
 */

function initPledge() {
    const generateBtn = document.getElementById('generate-pledge-btn');
    const nameInput = document.getElementById('pledge-name');
    const inputArea = document.getElementById('pledge-input-area');
    const certArea = document.getElementById('certificate-area');
    const resetBtn = document.getElementById('take-new-pledge-btn');
    
    const certName = document.getElementById('cert-user-name');
    const certDate = document.getElementById('cert-date-val');
    const certId = document.getElementById('cert-id-val');

    if (!generateBtn || !nameInput) return;

    generateBtn.addEventListener('click', () => {
        const name = nameInput.value.trim();
        if (!name) {
            if (window.showToast) window.showToast('Please enter your full name', 'error');
            return;
        }

        // Generate Pledge Data
        const today = new Date();
        const dateString = today.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const pledgeId = 'ECI-' + Math.random().toString(36).substr(2, 9).toUpperCase();

        // Update Certificate
        certName.textContent = name;
        certDate.textContent = dateString;
        certId.textContent = pledgeId;

        // Visual Transition
        inputArea.style.display = 'none';
        certArea.style.display = 'block';
        
        if (window.showToast) window.showToast('Pledge taken successfully!', 'success');
        
        // Scroll to certificate
        certArea.scrollIntoView({ behavior: 'smooth' });
    });

    resetBtn.addEventListener('click', () => {
        certArea.style.display = 'none';
        inputArea.style.display = 'block';
        nameInput.value = '';
    });
}

document.addEventListener('DOMContentLoaded', initPledge);
