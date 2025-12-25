// ===== GOPOS Chat Page - ChatGPT/Gemini Style =====
// Uses same backend API as index.html demo bot + chat history

const CONFIG = {
    apiUrl: 'https://asia-southeast2-proyek3-smz.cloudfunctions.net/GoPosInd',
    endpoints: {
        chatbot: '/api/chatbot',      // Original Gemini endpoint (for guests)
        chat: '/api/chat',             // Chat with history (for logged in users)
        history: '/api/chat/history'   // Chat history endpoint
    }
};

// ===== Theme Management =====
const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('gopos-theme') || 'dark';
        this.setTheme(savedTheme);
        this.updateIcon();
        this.bindEvents();
    },

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('gopos-theme', theme);
        this.updateIcon();
    },

    updateIcon() {
        const theme = document.documentElement.getAttribute('data-theme');
        const icons = document.querySelectorAll('#themeToggle, #themeBtn');
        icons.forEach(icon => {
            if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
        });
    },

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    },

    bindEvents() {
        document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());
        document.getElementById('themeBtn')?.addEventListener('click', () => this.toggleTheme());
    }
};

// ===== Auth Manager =====
const AuthManager = {
    token: null,
    user: null,

    init() {
        this.token = localStorage.getItem('gopos-token');
        const userData = localStorage.getItem('gopos-user');
        this.user = userData ? JSON.parse(userData) : null;
        this.updateUI();
    },

    isLoggedIn() {
        return !!this.token && !!this.user;
    },

    updateUI() {
        const userName = document.getElementById('sidebarUserName');
        if (userName) {
            userName.textContent = this.user?.name || this.user?.phonenumber || 'Guest';
        }
    },

    getAuthHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = this.token;
        }
        return headers;
    }
};

// ===== Sidebar Manager =====
const SidebarManager = {
    init() {
        this.sidebar = document.getElementById('sidebar');
        this.overlay = document.getElementById('mobileOverlay');
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('menuBtn')?.addEventListener('click', () => this.toggle());
        document.getElementById('sidebarToggle')?.addEventListener('click', () => this.toggle());
        this.overlay?.addEventListener('click', () => this.close());
    },

    toggle() {
        this.sidebar?.classList.toggle('active');
        this.overlay?.classList.toggle('active');
    },

    close() {
        this.sidebar?.classList.remove('active');
        this.overlay?.classList.remove('active');
    }
};

// ===== Chat Manager =====
const ChatManager = {
    messages: [],
    conversationHistory: [], // For Gemini API context
    isTyping: false,

    init() {
        this.messagesContainer = document.getElementById('chatMessages');
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.input = document.getElementById('chatInput');
        this.sendBtn = document.getElementById('sendBtn');

        this.bindEvents();
        this.loadHistory();
        this.autoResizeInput();
    },

    bindEvents() {
        // Send button
        this.sendBtn?.addEventListener('click', () => this.sendMessage());

        // Enter to send (Shift+Enter for new line)
        this.input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Enable/disable send button based on input
        this.input?.addEventListener('input', () => {
            this.sendBtn.disabled = !this.input.value.trim();
            this.autoResizeInput();
        });

        // New chat button
        document.getElementById('newChatBtn')?.addEventListener('click', () => this.newChat());

        // Suggestion cards
        document.querySelectorAll('.suggestion-card').forEach(card => {
            card.addEventListener('click', () => {
                const prompt = card.dataset.prompt;
                if (prompt) {
                    this.input.value = prompt;
                    this.sendBtn.disabled = false;
                    this.sendMessage();
                }
            });
        });
    },

    autoResizeInput() {
        if (this.input) {
            this.input.style.height = 'auto';
            this.input.style.height = Math.min(this.input.scrollHeight, 200) + 'px';
        }
    },

    async loadHistory() {
        if (!AuthManager.isLoggedIn()) {
            // Load from sessionStorage for guests
            const sessionHistory = sessionStorage.getItem('gopos-chat-messages');
            if (sessionHistory) {
                this.messages = JSON.parse(sessionHistory);
                this.rebuildConversationHistory();
                this.renderMessages();
            }
            this.renderHistorySidebar();
            return;
        }

        // Load from server for logged-in users
        try {
            const response = await fetch(`${CONFIG.apiUrl}${CONFIG.endpoints.history}`, {
                headers: AuthManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                if (data.messages && data.messages.length > 0) {
                    this.messages = data.messages.map(m => ({
                        userMessage: m.message,
                        botResponse: m.response,
                        source: m.source,
                        timestamp: m.created_at
                    }));
                    this.rebuildConversationHistory();
                    this.renderMessages();
                }
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }

        this.renderHistorySidebar();
    },

    // Rebuild Gemini conversation history from messages
    rebuildConversationHistory() {
        this.conversationHistory = [];
        this.messages.forEach(msg => {
            this.conversationHistory.push({
                role: 'user',
                parts: [{ text: msg.userMessage }]
            });
            if (msg.botResponse) {
                this.conversationHistory.push({
                    role: 'model',
                    parts: [{ text: msg.botResponse }]
                });
            }
        });
        // Keep only last 20 messages for context
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
    },

    renderMessages() {
        if (this.messages.length === 0) {
            this.welcomeScreen.style.display = 'flex';
            this.messagesContainer.classList.remove('active');
            return;
        }

        this.welcomeScreen.style.display = 'none';
        this.messagesContainer.classList.add('active');
        this.messagesContainer.innerHTML = '';

        this.messages.forEach(msg => {
            // User message
            this.appendMessage('user', msg.userMessage);
            // Bot response
            if (msg.botResponse) {
                this.appendMessage('bot', msg.botResponse);
            }
        });

        this.scrollToBottom();
    },

    appendMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${role}`;

        const avatar = role === 'user' ? '👤' : '📮';

        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">${this.formatMessage(content)}</div>
        `;

        this.messagesContainer.appendChild(messageDiv);
    },

    formatMessage(content) {
        // Basic markdown-like formatting
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/• /g, '<br>• ');
    },

    showTyping() {
        if (this.isTyping) return;
        this.isTyping = true;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message message-bot';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-avatar">📮</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;

        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    },

    hideTyping() {
        this.isTyping = false;
        document.getElementById('typingIndicator')?.remove();
    },

    async sendMessage() {
        const text = this.input?.value.trim();
        if (!text || this.isTyping) return;

        // Hide welcome screen
        this.welcomeScreen.style.display = 'none';
        this.messagesContainer.classList.add('active');

        // Add user message to UI
        this.appendMessage('user', text);
        this.input.value = '';
        this.sendBtn.disabled = true;
        this.autoResizeInput();
        this.scrollToBottom();

        // Add to conversation history for context
        this.conversationHistory.push({
            role: 'user',
            parts: [{ text: text }]
        });

        // Show typing indicator
        this.showTyping();

        try {
            let botResponse, source;

            if (AuthManager.isLoggedIn()) {
                // Use /api/chat endpoint (saves history to server)
                const response = await fetch(`${CONFIG.apiUrl}${CONFIG.endpoints.chat}`, {
                    method: 'POST',
                    headers: AuthManager.getAuthHeaders(),
                    body: JSON.stringify({
                        message: text,
                        history: this.conversationHistory.slice(-20)
                    })
                });

                const data = await response.json();
                botResponse = data.response || 'Maaf, terjadi kesalahan.';
                source = data.source || 'unknown';

            } else {
                // Use /api/chatbot endpoint (Gemini only, no persistence)
                const response = await fetch(`${CONFIG.apiUrl}${CONFIG.endpoints.chatbot}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: text,
                        history: this.conversationHistory.slice(-20)
                    })
                });

                const data = await response.json();
                botResponse = data.response || 'Maaf, terjadi kesalahan.';
                source = data.source || 'unknown';
            }

            this.hideTyping();

            console.log(`📮 GOPOS Response (source: ${source})`);

            // Add bot response to conversation history
            this.conversationHistory.push({
                role: 'model',
                parts: [{ text: botResponse }]
            });

            // Keep conversation history manageable
            if (this.conversationHistory.length > 20) {
                this.conversationHistory = this.conversationHistory.slice(-20);
            }

            // Add to messages array
            this.messages.push({
                userMessage: text,
                botResponse: botResponse,
                source: source,
                timestamp: new Date().toISOString()
            });

            // Save to sessionStorage for guests
            if (!AuthManager.isLoggedIn()) {
                sessionStorage.setItem('gopos-chat-messages', JSON.stringify(this.messages));
            }

            // Display bot response
            this.appendMessage('bot', botResponse);
            this.scrollToBottom();
            this.renderHistorySidebar();

        } catch (error) {
            console.error('Chat error:', error);
            this.hideTyping();

            // Remove failed user message from history
            this.conversationHistory.pop();

            this.appendMessage('bot', 'Maaf, terjadi kesalahan koneksi. Silakan coba lagi.');
        }
    },

    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    },

    newChat() {
        this.messages = [];
        this.conversationHistory = [];

        if (!AuthManager.isLoggedIn()) {
            sessionStorage.removeItem('gopos-chat-messages');
        } else {
            // Clear server history
            this.clearServerHistory();
        }

        this.messagesContainer.innerHTML = '';
        this.messagesContainer.classList.remove('active');
        this.welcomeScreen.style.display = 'flex';
        this.renderHistorySidebar();
        SidebarManager.close();
    },

    async clearServerHistory() {
        try {
            await fetch(`${CONFIG.apiUrl}${CONFIG.endpoints.history}`, {
                method: 'DELETE',
                headers: AuthManager.getAuthHeaders()
            });
            console.log('🗑️ Chat history cleared');
        } catch (error) {
            console.error('Failed to clear history:', error);
        }
    },

    renderHistorySidebar() {
        const todayHistory = document.getElementById('todayHistory');
        const previousHistory = document.getElementById('previousHistory');

        if (!todayHistory || !previousHistory) return;

        if (this.messages.length === 0) {
            todayHistory.innerHTML = '<div class="history-item" style="color: var(--text-muted); font-style: italic;">Belum ada percakapan</div>';
            previousHistory.innerHTML = '';
            return;
        }

        // Get first message as title
        const firstMessage = this.messages[0]?.userMessage || 'Chat';
        const title = firstMessage.substring(0, 30) + (firstMessage.length > 30 ? '...' : '');

        todayHistory.innerHTML = `
            <div class="history-item active">
                <span class="icon">💬</span>
                <span class="title">${this.escapeHtml(title)}</span>
            </div>
        `;
        previousHistory.innerHTML = '';
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    AuthManager.init();
    SidebarManager.init();
    ChatManager.init();

    console.log('📮 GOPOS Chat Page initialized');
    console.log(`🔐 User logged in: ${AuthManager.isLoggedIn()}`);
});
