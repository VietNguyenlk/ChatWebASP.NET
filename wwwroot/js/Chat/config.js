// config.js - Cấu hình và biến toàn cục
class AppConfig {
    constructor() {
        // SignalR configuration
        this.connection = new signalR.HubConnectionBuilder()
            .withUrl("/chathub")
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // WebRTC configuration
        this.rtcConfig = {
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        };

        // User information
        this.senderId = document.getElementById("senderId").value;
        this.receiverId = document.getElementById("receiverId").value;
        this.senderUserName = document.getElementById("senderUserName").value;

        // Global variables
        this.iceCandidateBuffer = [];
        this.localStream = null;
        this.peerConnection = null;
        this.voiceConnection = null;
        this.localAudioStream = null;
        this.isVoiceCallActive = false;

        this.inactivityTimeout = null;
        //this.warningTimeout = null;
        this.inactivityLimit = 5 * 60 * 1000; // 5 phút
        //this.warningLimit = 4 * 60 * 1000; // 4 phút (1 phút trước khi ngắt)


        this.initializeConnection();
    }

    //showInactivityWarning() {
    //    const warning = document.getElementById("inactivity-warning");
    //    if (warning) warning.style.display = "block";
    //}

    //hideInactivityWarning() {
    //    const warning = document.getElementById("inactivity-warning");
    //    if (warning) warning.style.display = "none";
    //}

    resetInactivityTimer() {
        // Xoá các timeout cũ
        clearTimeout(this.inactivityTimeout);
        //clearTimeout(this.warningTimeout);

        // Ẩn cảnh báo nếu có
        this.hideInactivityWarning();

        // Đặt lại timeout cảnh báo sau 4 phút
        //this.warningTimeout = setTimeout(() => {
        //    this.showInactivityWarning();
        //}, this.warningLimit);

        this.inactivityTimeout = setTimeout(() => {
            console.log("Hết phiên đăng nhập do không hoạt động trong 5 phút.");
            this.connection.stop();
            this.hideInactivityWarning();

            // Tạo thông báo tuỳ chỉnh thay vì alert
            const timeoutNotice = document.createElement("div");
            timeoutNotice.innerHTML = "⚠️ Phiên làm việc đã hết do bạn không hoạt động trong 5 phút. Đang chuyển hướng đến trang đăng nhập...";
            timeoutNotice.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #fff3cd;
        color: #856404;
        padding: 12px 20px;
        border: 1px solid #ffeeba;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        font-size: 16px;
    `;
            document.body.appendChild(timeoutNotice);

            // Tự động chuyển hướng sau 4 giây
            setTimeout(() => {
                window.location.href = "/Account/Login";
            }, 4000);
        }, this.inactivityLimit);

    }

    initializeConnection() {
        this.connection.start()
            .then(() => {
                console.log("SignalR connected");
                this.resetInactivityTimer();
            })
            .catch(err => console.error("Connection error:", err));

        this.connection.serverTimeoutInMilliseconds = 60000;

        this.connection.onclose(function (error) {
            console.log("SignalR connection close", error);
        });

        window.addEventListener('beforeunload', () => {
            if (this.isVoiceCallActive) {
                window.voiceCallManager.endVoiceCall();
            }
        });
    }
}

// Khởi tạo config toàn cục
const appConfig = new AppConfig();