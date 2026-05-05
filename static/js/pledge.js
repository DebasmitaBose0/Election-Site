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

    const shareBtn = document.getElementById('share-pledge-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const name = certName.textContent;
            const text = `I just took the Digital Voter Pledge on Electionant! I'm committed to being an informed and ethical voter for the 2026 Elections. Get your certificate at: #Electionant #VoteIndia #Democracy`;
            const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
            window.open(url, '_blank');
        });
    }

    const printBtn = document.getElementById('print-cert-btn');
    if (printBtn) {
        printBtn.addEventListener('click', async () => {
            const certElement = document.getElementById('voter-certificate');
            if (!certElement) return;
            
            const originalBtnText = printBtn.innerHTML;
            printBtn.innerHTML = '<i class="lucide-loader animate-spin"></i> Generating...';
            printBtn.disabled = true;

            try {
                const response = await fetch('/api/pledge/download', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({ name: certName.textContent })
                });

                if (!response.ok) throw new Error('Backend generation failed');

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Voter_Pledge_${certName.textContent.replace(/\s+/g, '_')}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                if (window.showToast) window.showToast('Professional Certificate Downloaded!', 'success');
            } catch (error) {
                console.error("PDF Generation Error:", error);
                if (window.showToast) window.showToast('Failed to generate PDF. Trying fallback...', 'error');
                // Fallback to simple print if backend fails
                window.print();
            } finally {
                printBtn.innerHTML = originalBtnText;
                printBtn.disabled = false;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', initPledge);
