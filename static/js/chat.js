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
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    history: chatHistory
                })
            });

            // Remove loading
            removeMessage(loadingId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                appendMessage('bot', `❌ Server Error: ${errorData.error || response.statusText || 'Unknown error'}`);
                return;
            }

            const data = await response.json();

            if (data.error) {
                appendMessage('bot', `⚠️ AI Error: ${data.error}`);
            } else {
                appendMessage('bot', data.response);
                // Update History
                chatHistory.push({ role: 'user', content: message });
                chatHistory.push({ role: 'model', content: data.response });
                // Keep only last 10 messages for context
                if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
            }
        } catch (error) {
            removeMessage(loadingId);
            appendMessage('bot', `❌ Connection Error: ${error.message}. Please check if the server is running.`);
        }

        scrollToBottom();
    }

    function appendMessage(role, content, isLoading = false) {
        const id = 'msg-' + Date.now();
        const msgDiv = document.createElement('div');
        msgDiv.className = `message message-${role}`;
        msgDiv.id = id;
        
        if (isLoading) {
            msgDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        } else {
            // Simple markdown-ish bolding/bullets
            const formattedContent = content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\n\* (.*?)/g, '<br>• $1')
                .replace(/\n/g, '<br>');
            msgDiv.innerHTML = formattedContent;
        }

        chatMessages.appendChild(msgDiv);
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
                <div class="welcome-icon">🗳️</div>
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
            chatInput.value = transcript;
            chatInput.dispatchEvent(new Event('input')); // Trigger resize
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            voiceBtn.classList.remove('recording');
            if (window.showToast) showToast(`Error: ${event.error}`, 'error');
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
