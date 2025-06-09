// signalHandler.js - Xử lý SignalR signals
class SignalHandler {
    constructor() {
        this.setupSignalHandlers();
    }

    setupSignalHandlers() {
        appConfig.connection.on("ReceiveSignal", async (senderId, signal) => {
            const data = JSON.parse(signal);

            // Xác định connection nào đang được sử dụng
            const activeConnection = appConfig.voiceConnection || appConfig.peerConnection;

            if (!activeConnection) {
                // Tạo connection tùy theo loại cuộc gọi
                if (appConfig.isVoiceCallActive || (!appConfig.peerConnection && !domElements.videoCallModal.style.display)) {
                    await window.voiceCallManager.createVoiceConnection(senderId);
                } else {
                    await window.videoCallManager.createPeerConnection(senderId);
                }
            }

            try {
                const currentConnection = appConfig.voiceConnection || appConfig.peerConnection;

                if (data.type === "offer") {
                    await this.handleOffer(currentConnection, data, senderId);
                } else if (data.type === "answer") {
                    await this.handleAnswer(currentConnection, data);
                } else if (data.candidate) {
                    await this.handleIceCandidate(currentConnection, data);
                }
            } catch (error) {
                console.error("Error processing signal:", error);
                if (appConfig.voiceConnection) {
                    window.voiceCallManager.endVoiceCall();
                } else {
                    window.videoCallManager.endCall();
                }
            }
        });
    }

    async handleOffer(connection, data, senderId) {
        await connection.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);
        await appConfig.connection.invoke("SendSignal", senderId, JSON.stringify(answer));

        if (appConfig.voiceConnection) {
            window.voiceCallManager.updateVoiceCallUI(true);
        } else {
            domElements.callStatus.textContent = "Call connected";
        }
    }

    async handleAnswer(connection, data) {
        await connection.setRemoteDescription(new RTCSessionDescription(data));

        if (appConfig.voiceConnection) {
            window.voiceCallManager.updateVoiceCallUI(true);
        } else {
            domElements.callStatus.textContent = "Call connected";
        }
    }

    async handleIceCandidate(connection, data) {
        if (connection.remoteDescription) {
            await connection.addIceCandidate(new RTCIceCandidate(data));
        } else {
            console.log("Buffering ICE candidate until remote description is set");
            // Có thể thêm buffer logic ở đây nếu cần
        }
    }
}

// Khởi tạo signal handler
const signalHandler = new SignalHandler();