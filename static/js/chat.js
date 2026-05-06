/**
 * Chat Interface Logic
 * Manages conversation history and interacts with the Gemini AI API.
 */

function initChat() {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatClearBtn = document.getElementById('chat-clear-btn');
    const suggestionChips = document.querySelectorAll('.chip');

    let chatHistory = [];

    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
        chatSendBtn.disabled = !chatInput.value.trim();
    });

    // Send Message
    async function sendMessage(message) {
        if (!message.trim()) return;

        // Add User Message to UI
        appendMessage('user', message);
        chatInput.value = '';
        chatInput.style.height = 'auto';
        chatSendBtn.disabled = true;

        // Add Loading State
        const loadingId = appendMessage('bot', '...', true);
        scrollToBottom();

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({
                    message: message,
                    history: chatHistory
                })
            });

            // Remove loading
            removeMessage(loadingId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                appendMessage('bot', `[Error] Server Error: ${errorData.error || response.statusText || 'Unknown error'}`);
                return;
            }

            const data = await response.json();

            if (data.error) {
                appendMessage('bot', `[Warning] AI Error: ${data.error}`);
            } else {
                const debugTag = data.is_fallback ? '<small style="opacity:0.3">[Groq]</small> ' : '<small style="opacity:0.3">[Gemini]</small> ';
                appendMessage('bot', debugTag + data.response);
                // Update History
                chatHistory.push({ role: 'user', content: message });
                chatHistory.push({ role: 'model', content: data.response });
                // Keep only last 10 messages for context
                if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
            }
        } catch (error) {
            removeMessage(loadingId);
            appendMessage('bot', `[Error] Connection Error: ${error.message}. Please check if the server is running.`);
        }

        scrollToBottom();
    }

    function appendMessage(role, content, isLoading = false) {
        const id = 'msg-' + Date.now();
        const wrapper = document.createElement('div');
        wrapper.className = `message-wrapper ${role}-wrapper`;
        wrapper.id = id;
        
        const avatar = role === 'user' 
            ? '<div class="msg-avatar user-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>'
            : `<div class="msg-avatar bot-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="10" rx="2" stroke="currentColor" stroke-width="2" />
                    <path d="M12 11V7" stroke="currentColor" stroke-width="2" />
                    <circle cx="12" cy="5" r="2" fill="#FF9933" />
                    <path d="M8 15h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    <path d="M16 15h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
               </div>`;

        const label = role === 'user' ? 'You' : 'Electionant AI';

        let innerContent = '';
        if (isLoading) {
            innerContent = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        } else {
            // Simple markdown-ish formatting
            innerContent = content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n\* (.*?)/g, '<br>• $1')
                .replace(/\n/g, '<br>');
        }

        wrapper.innerHTML = `
            ${role === 'bot' ? avatar : ''}
            <div class="message-container">
                <div class="message-label">${label}</div>
                <div class="message ${role}">${innerContent}</div>
            </div>
            ${role === 'user' ? avatar : ''}
        `;

        chatMessages.appendChild(wrapper);
        scrollToBottom();
        return id;
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Event Listeners
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage(chatInput.value);
    });

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event('submit'));
        }
    });

    chatClearBtn.addEventListener('click', () => {
        chatMessages.innerHTML = `
            <div class="chat-welcome">
                <span class="welcome-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"></path><path d="M21 12v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6"></path><path d="M10 12h4"></path></svg>
                </span>
                <h3>Chat Cleared</h3>
                <p>How else can I help you today?</p>
            </div>
        `;
        chatHistory = [];
    });

    // Voice Recognition
    const voiceBtn = document.getElementById('voice-input-btn');
    if (voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
            voiceBtn.classList.add('recording');
            if (window.showToast) showToast('Listening...', 'info');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (transcript.trim()) {
                if (window.showToast) showToast('Speech recognized!', 'success');
                sendMessage(transcript);
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            voiceBtn.classList.remove('recording');
            let errorMsg = 'Error accessing microphone';
            if (event.error === 'not-allowed') errorMsg = 'Microphone permission denied';
            if (event.error === 'no-speech') errorMsg = 'No speech detected';
            if (window.showToast) showToast(errorMsg, 'error');
        };

        recognition.onend = () => {
            voiceBtn.classList.remove('recording');
        };

        voiceBtn.addEventListener('click', () => {
            if (voiceBtn.classList.contains('recording')) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else if (voiceBtn) {
        voiceBtn.style.display = 'none';
    }

    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            sendMessage(chip.dataset.question);
        });
    });
}
