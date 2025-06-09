// videoCallManager.js - Quản lý video call
class VideoCallManager {
    constructor() {
        this.setupSignalRHandlers();
    }

    setupSignalRHandlers() {
        appConfig.connection.on("CallAccepted", async (accepterId) => {
            console.log("Call accepted by:", accepterId);
            if (appConfig.voiceConnection) {
                window.voiceCallManager.updateVoiceCallUI(true);
            } else {
                domElements.callStatus.textContent = "Call connected";
            }
        });

        appConfig.connection.on("CallDeclined", (declinerId) => {
            if (appConfig.voiceConnection) {
                domElements.voiceCallButton.textContent = "❌ Cuộc gọi bị từ chối";
                setTimeout(() => {
                    domElements.voiceCallButton.textContent = "🔊 Gọi thoại";
                    domElements.voiceCallButton.disabled = false;
                }, 2000);
                window.voiceCallManager.endVoiceCall();
            } else {
                domElements.callStatus.textContent = "Call declined";
                setTimeout(() => {
                    domElements.callStatus.textContent = "Ready to call";
                }, 2000);
                this.endCall();
            }
        });

        appConfig.connection.on("CallEnded", () => {
            if (appConfig.voiceConnection) {
                window.voiceCallManager.endVoiceCall();
            } else {
                domElements.callStatus.textContent = "Call ended";
                setTimeout(() => {
                    domElements.callStatus.textContent = "Ready to call";
                }, 2000);
                this.endCall();
            }
        });

        appConfig.connection.on("IncomingCall", async (callerId, callerName, callType) => {
            if (callType === "voice") {
                const accepted = confirm(`📞 ${callerName} đang gọi thoại cho bạn. Nhận cuộc gọi?`);

                if (accepted) {
                    try {
                        await window.voiceCallManager.createVoiceConnection(callerId);
                        await appConfig.connection.invoke("AcceptCall", callerId);
                        window.voiceCallManager.updateVoiceCallUI(true);
                    } catch (error) {
                        console.error("Error accepting voice call:", error);
                        alert("Không thể nhận cuộc gọi");
                        window.voiceCallManager.endVoiceCall();
                    }
                } else {
                    await appConfig.connection.invoke("DeclineCall", callerId);
                }
            } else {
                // Video call logic
                domElements.videoCallModal.style.display = "flex";
                domElements.callStatus.textContent = `Incoming call from ${callerName}...`;

                if (confirm(`📞 ${callerName} đang gọi bạn (${callType}) — Nhận cuộc gọi?`)) {
                    try {
                        await this.createPeerConnection(callerId);
                        await appConfig.connection.invoke("AcceptCall", callerId);
                        domElements.callStatus.textContent = "Call connected";
                    } catch (error) {
                        console.error("Error accepting call:", error);
                        domElements.callStatus.textContent = "Failed to connect";
                        this.endCall();
                    }
                } else {
                    await appConfig.connection.invoke("DeclineCall", callerId);
                    domElements.callStatus.textContent = "Call declined";
                    domElements.videoCallModal.style.display = "none";
                }
            }
        });
    }

    async initiateCall() {
        try {
            domElements.callStatus.textContent = "Calling...";
            await this.createPeerConnection(appConfig.receiverId);
            const offer = await appConfig.peerConnection.createOffer();
            await appConfig.peerConnection.setLocalDescription(offer);
            await appConfig.connection.invoke("SendSignal", appConfig.receiverId, JSON.stringify(offer));
            await appConfig.connection.invoke("InitiateCall", appConfig.receiverId, appConfig.senderUserName, "video");
            domElements.callStatus.textContent = "Waiting for answer...";
        } catch (error) {
            console.error("Error initiating call:", error);
            domElements.callStatus.textContent = "Failed to call";
            this.endCall();
        }
    }

    async endCallAndNotify() {
        domElements.callStatus.textContent = "Ending call...";
        this.endCall();
        await appConfig.connection.invoke("EndCall", appConfig.receiverId);
        domElements.callStatus.textContent = "Ready to call";
    }

    async createPeerConnection(otherUserId) {
        try {
            appConfig.peerConnection = new RTCPeerConnection(appConfig.rtcConfig);

            appConfig.peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    appConfig.connection.invoke("SendSignal", otherUserId, JSON.stringify({
                        candidate: event.candidate.candidate,
                        sdpMid: event.candidate.sdpMid,
                        sdpMLineIndex: event.candidate.sdpMLineIndex
                    }));
                }
            };

            appConfig.peerConnection.ontrack = (event) => {
                console.log("Received remote stream");
                domElements.remoteVideo.srcObject = event.streams[0];
            };

            appConfig.peerConnection.onconnectionstatechange = () => {
                console.log("Connection state:", appConfig.peerConnection.connectionState);
                if (appConfig.peerConnection.connectionState === 'failed') {
                    console.error("Connection failed");
                    domElements.callStatus.textContent = "Connection failed";
                    this.endCall();
                }
            };

            appConfig.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            domElements.localVideo.srcObject = appConfig.localStream;

            appConfig.localStream.getTracks().forEach(track => {
                appConfig.peerConnection.addTrack(track, appConfig.localStream);
            });

            console.log("PeerConnection created successfully");

        } catch (error) {
            console.error("Error creating peer connection:", error);
            domElements.callStatus.textContent = "Failed to access camera/microphone";
            throw error;
        }
    }

    endCall() {
        if (appConfig.peerConnection) {
            appConfig.peerConnection.close();
            appConfig.peerConnection = null;
        }
        if (appConfig.localStream) {
            appConfig.localStream.getTracks().forEach(track => track.stop());
            appConfig.localStream = null;
        }
        domElements.localVideo.srcObject = null;
        domElements.remoteVideo.srcObject = null;
        console.log("Call ended and resources cleaned up");
    }
}

// Khởi tạo video call manager toàn cục
window.videoCallManager = new VideoCallManager();