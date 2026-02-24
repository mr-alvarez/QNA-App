// ===== QAApplication Class =====
class QAApplication {
    constructor() {
        this.qaContainer = document.getElementById('qaContainer');
        this.qaForm = document.getElementById('qaForm');
        this.questionInput = document.getElementById('questionInput');
        this.submitBtn = document.getElementById('submitBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.messages = [];
        this.apiEndpoint = window.location.origin + '/api/answer'; // Dynamically use current domain
        this.isLoading = false;
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.clearWelcomeMessage();
    }

    attachEventListeners() {
        // Form submission
        this.qaForm?.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Example buttons
        const exampleButtons = document.querySelectorAll('.example-btn');
        exampleButtons.forEach((btn) => {
            btn.addEventListener('click', (e) => this.handleExampleClick(e));
        });

        // Input focus to clear errors
        this.questionInput?.addEventListener('focus', () => this.clearError());
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const question = this.questionInput?.value.trim();
        if (!question) {
            this.showError('Please enter a question');
            return;
        }

        this.askQuestion(question);
    }

    handleExampleClick(e) {
        const btn = e.target;
        const question = btn.dataset['example'];
        if (question && this.questionInput) {
            this.questionInput.value = question;
            this.askQuestion(question);
        }
    }

    async askQuestion(question) {
        if (this.isLoading) return;

        this.clearError();
        this.isLoading = true;
        this.setSubmitButtonDisabled(true);

        // Add question to chat
        this.addMessage({
            type: 'question',
            content: question,
            timestamp: new Date(),
        });

        // Clear input
        if (this.questionInput) {
            this.questionInput.value = '';
        }

        // Add loading indicator
        this.addMessage({
            type: 'loading',
            content: 'Getting answer...',
            timestamp: new Date(),
        });

        try {
            const response = await this.fetchAnswer(question);
            
            // Remove loading message
            this.messages.pop();
            this.renderMessages();

            // Add answer to chat
            this.addMessage({
                type: 'answer',
                content: response.answer,
                timestamp: new Date(),
            });
        } catch (error) {
            // Remove loading message
            this.messages.pop();
            this.renderMessages();

            const errorMsg = error instanceof Error ? error.message : 'An error occurred while fetching the answer';
            this.showError(errorMsg);
            console.error('Error:', error);
        } finally {
            this.isLoading = false;
            this.setSubmitButtonDisabled(false);
            this.questionInput?.focus();
        }
    }

    async fetchAnswer(question) {
        const response = await fetch(this.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    }

    addMessage(message) {
        this.messages.push(message);
        this.renderMessages();
        this.scrollToBottom();
    }

    renderMessages() {
        if (!this.qaContainer) return;

        // Clear existing messages but keep welcome if needed
        const messageElements = this.qaContainer.querySelectorAll('.message');
        messageElements.forEach((el) => el.remove());

        // Render all messages
        this.messages.forEach((msg) => {
            const messageEl = this.createMessageElement(msg);
            this.qaContainer?.appendChild(messageEl);
        });
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (message.type === 'loading') {
            contentDiv.innerHTML = `
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
        } else {
            contentDiv.textContent = message.content;
        }

        messageDiv.appendChild(contentDiv);

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.formatTime(message.timestamp);
        messageDiv.appendChild(timeDiv);

        return messageDiv;
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    scrollToBottom() {
        if (this.qaContainer) {
            setTimeout(() => {
                this.qaContainer.scrollTop = this.qaContainer.scrollHeight;
            }, 0);
        }
    }

    clearWelcomeMessage() {
        const welcome = this.qaContainer?.querySelector('.welcome-message');
        if (welcome && this.messages.length > 0) {
            welcome.remove();
        }
    }

    showError(message) {
        if (this.errorMessage) {
            this.errorMessage.textContent = message;
            this.errorMessage.classList.add('active');
        }
    }

    clearError() {
        if (this.errorMessage) {
            this.errorMessage.classList.remove('active');
            this.errorMessage.textContent = '';
        }
    }

    setSubmitButtonDisabled(disabled) {
        if (this.submitBtn) {
            this.submitBtn.disabled = disabled;
        }
    }

    // Public method to set API endpoint
    setApiEndpoint(endpoint) {
        this.apiEndpoint = endpoint;
    }

    // Public method to add custom message for debugging
    addCustomMessage(type, content) {
        this.addMessage({
            type,
            content,
            timestamp: new Date(),
        });
    }
}

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', () => {
    const app = new QAApplication();

    // API endpoint is now dynamically set to window.location.origin + '/api/answer'
    // This works across all environments: localhost, staging, and production
    // No need to manually change the endpoint for different deployments

    // Make it globally accessible for debugging
    window.qaApp = app;
});
