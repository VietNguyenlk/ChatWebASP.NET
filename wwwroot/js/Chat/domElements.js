// domElements.js - Quản lý DOM elements
class DOMElements {
    constructor() {
        // Modal elements
        this.videoCallModal = document.getElementById("videoCallModal");
        this.openVideoCallModalBtn = document.getElementById("openVideoCallModal");
        this.closeVideoCallModalBtn = document.getElementById("closeVideoCallModal");
        this.callStatus = document.getElementById("callStatus");

        // Video elements
        this.localVideo = document.getElementById("localVideo");
        this.remoteVideo = document.getElementById("remoteVideo");
        this.callButton = document.getElementById("callButton");
        this.endCallButton = document.getElementById("endCallButton");

        // Voice call elements
        this.voiceCallButton = document.getElementById("voiceCallButton");
        this.endVoiceCallButton = document.getElementById("endVoiceCallButton");

        // Chat elements
        this.chatBox = document.getElementById("chatBox");
        this.messageInput = document.getElementById("messageInput");

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Modal control
        this.openVideoCallModalBtn.addEventListener("click", () => {
            this.videoCallModal.style.display = "flex";
        });

        this.closeVideoCallModalBtn.addEventListener("click", () => {
            this.videoCallModal.style.display = "none";
            window.videoCallManager.endCall();
        });

        window.addEventListener("click", (event) => {
            if (event.target === this.videoCallModal) {
                this.videoCallModal.style.display = "none";
                window.videoCallManager.endCall();
            }
        });

        // Chat input
        this.messageInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                window.chatManager.sendMessage();
            }
        });

        // Video call buttons
        this.callButton.onclick = () => window.videoCallManager.initiateCall();
        this.endCallButton.onclick = () => window.videoCallManager.endCallAndNotify();

        // Voice call buttons
        this.voiceCallButton.addEventListener("click", () => window.voiceCallManager.initiateVoiceCall());
        this.endVoiceCallButton.addEventListener("click", () => window.voiceCallManager.endVoiceCall());

        // Initially hide end call button
        this.endVoiceCallButton.style.display = "none";
    }
}

// Khởi tạo DOM elements toàn cục
const domElements = new DOMElements();