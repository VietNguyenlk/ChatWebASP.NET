// voiceCallManager.js - Quản lý voice call
class VoiceCallManager {
    constructor() {
        // Không cần setup handlers ở đây vì đã được xử lý trong videoCallManager
    }

    async initiateVoiceCall() {
        try {
            domElements.voiceCallButton.textContent = "🔄 Đang gọi...";
            domElements.voiceCallButton.disabled = true;

            await this.createVoiceConnection(appConfig.receiverId);
            const offer = await appConfig.voiceConnection.createOffer();
            await appConfig.voiceConnection.setLocalDescription(offer);

            await appConfig.connection.invoke("SendSignal", appConfig.receiverId, JSON.stringify(offer));
            await appConfig.connection.invoke("InitiateCall", appConfig.receiverId, appConfig.senderUserName, "voice");

            domElements.voiceCallButton.textContent = "⏳ Chờ phản hồi...";

        } catch (error) {
            console.error("Error initiating voice call:", error);
            domElements.voiceCallButton.textContent = "🔊 Gọi thoại";
            domElements.voiceCallButton.disabled = false;
            alert("Không thể bắt đầu cuộc gọi. Vui lòng kiểm tra microphone.");
        }
    }

    async createVoiceConnection(otherUserId) {
        try {
            appConfig.voiceConnection = new RTCPeerConnection(appConfig.rtcConfig);

            appConfig.voiceConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    appConfig.connection.invoke("SendSignal", otherUserId, JSON.stringify({
                        candidate: event.candidate.candidate,
                        sdpMid: event.candidate.sdpMid,
                        sdpMLineIndex: event.candidate.sdpMLineIndex
                    }));
                }
            };

            appConfig.voiceConnection.ontrack = (event) => {
                console.log("Received remote audio stream");
                const remoteAudio = new Audio();
                remoteAudio.srcObject = event.streams[0];
                remoteAudio.play();
            };

            appConfig.voiceConnection.onconnectionstatechange = () => {
                console.log("Voice connection state:", appConfig.voiceConnection.connectionState);
                if (appConfig.voiceConnection.connectionState === 'connected') {
                    appConfig.isVoiceCallActive = true;
                    this.updateVoiceCallUI(true);
                } else if (appConfig.voiceConnection.connectionState === 'failed') {
                    console.error("Voice connection failed");
                    this.endVoiceCall();
                }
            };

            // Chỉ lấy audio stream cho voice call
            appConfig.localAudioStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });

            appConfig.localAudioStream.getTracks().forEach(track => {
                appConfig.voiceConnection.addTrack(track, appConfig.localAudioStream);
            });

            console.log("Voice connection created successfully");

        } catch (error) {
            console.error("Error creating voice connection:", error);
            throw error;
        }
    }

    endVoiceCall() {
        if (appConfig.voiceConnection) {
            appConfig.voiceConnection.close();
            appConfig.voiceConnection = null;
        }

        if (appConfig.localAudioStream) {
            appConfig.localAudioStream.getTracks().forEach(track => track.stop());
            appConfig.localAudioStream = null;
        }

        appConfig.isVoiceCallActive = false;
        this.updateVoiceCallUI(false);

        // Thông báo cho người khác
        if (appConfig.receiverId) {
            appConfig.connection.invoke("EndCall", appConfig.receiverId);
        }

        console.log("Voice call ended and resources cleaned up");
    }

    updateVoiceCallUI(isActive) {
        if (isActive) {
            domElements.voiceCallButton.style.display = "none";
            domElements.endVoiceCallButton.style.display = "inline-block";
            domElements.endVoiceCallButton.textContent = "❌ Kết thúc thoại";

            // Thêm indicator cho cuộc gọi đang hoạt động
            const chatHeader = document.querySelector('.chat-header h4');
            if (chatHeader) {
                chatHeader.style.color = "#00ff00";
                chatHeader.textContent = "📞 Đang trong cuộc gọi...";
            }
        } else {
            domElements.voiceCallButton.style.display = "inline-block";
            domElements.voiceCallButton.textContent = "🔊 Gọi thoại";
            domElements.voiceCallButton.disabled = false;
            domElements.endVoiceCallButton.style.display = "none";

            // Reset header
            const chatHeader = document.querySelector('.chat-header h4');
            if (chatHeader) {
                chatHeader.style.color = "";
                chatHeader.textContent = "📞 Cuộc gọi thoại";
            }
        }
    }
}

// Khởi tạo voice call manager toàn cục
window.voiceCallManager = new VoiceCallManager();