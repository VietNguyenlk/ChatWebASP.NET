// chatManager.js - Quản lý chat
class ChatManager {
    constructor() {
        this.setupSignalRHandlers();
    }

    setupSignalRHandlers() {
        appConfig.connection.on("ReceiveMessage", (senderId, message, senderUserName) => {
            this.addMessage(senderUserName, message, 'received');
            appConfig.resetInactivityTimer(); // Reset khi nhận tin nhắn
        });
    }

    addMessage(senderUserName, message, type) {
        const msgBox = domElements.chatBox;
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const currentTime = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.innerHTML = `
            <div class="message-bubble">
                ${message}
                <div class="message-time">${currentTime}</div>
            </div>
        `;

        const emptyState = msgBox.querySelector('.empty-state');
        if (emptyState) emptyState.remove();

        msgBox.appendChild(messageDiv);
        msgBox.scrollTop = msgBox.scrollHeight;
    }

    async sendMessage() {
        const message = domElements.messageInput.value;
        if (!message.trim()) return;

        try {
            await appConfig.connection.invoke("SendMessage",
                appConfig.senderId,
                appConfig.receiverId,
                message,
                appConfig.senderUserName
            );

            this.addMessage("You", message, 'sent');
            domElements.messageInput.value = "";
            appConfig.resetInactivityTimer(); // Reset khi gửi tin nhắn
        } catch (err) {
            console.error("Send error:", err);
        }
    }
}

// Khởi tạo chat manager toàn cục
window.chatManager = new ChatManager();