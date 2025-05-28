using ChatWeb.Data;
using ChatWeb.Models;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace ChatWeb.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ApplicationDbContext _context;
        public ChatHub(ApplicationDbContext applicationDbContext)
        {
            _context = applicationDbContext;
        }
        public async Task SendMessage(string senderId, string receiverId, string message, string SenderUserName)
        {
            // Debug: Log thông tin
            Console.WriteLine($"SenderId: {senderId}");
            Console.WriteLine($"ReceiverId: {receiverId}");
            Console.WriteLine($"Current User ID: {Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value}");
            Console.WriteLine($"Message: {message}");

            var newMessage = new ChatMessage
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                SenderUserName = SenderUserName,
                Content = message,
                Timestamp = DateTime.Now,

            };
            _context.ChatMessages.Add(newMessage);
            await _context.SaveChangesAsync();
            // Thử cả 2 cách gửi
            // Cách 1: Gửi cho user cụ thể
            await Clients.User(receiverId).SendAsync("ReceiveMessage", senderId, message, SenderUserName);

            // Cách 2: Gửi cho tất cả (để test)
            // await Clients.All.SendAsync("ReceiveMessage", senderId, message);
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"User connected: {userId}");
            await base.OnConnectedAsync();
        }

        public async Task InitiateCall(string receiverId, string callerName, string callType)
        {
            await Clients.User(receiverId).SendAsync("IncomingCall", Context.UserIdentifier, callerName, callType);
        }

        public async Task AcceptCall(string callerId)
        {
            await Clients.User(callerId).SendAsync("CallAccepted", Context.UserIdentifier);
        }

        public async Task DeclineCall(string callerId)
        {
            await Clients.User(callerId).SendAsync("CallDeclined", Context.UserIdentifier);
        }

        public async Task RecallMessage(string messageId)
        {
            // Logic để xóa/đánh dấu tin nhắn trong database
            // Sau đó thông báo cho tất cả clients trong cuộc trò chuyện
            await Clients.All.SendAsync("MessageRecalled", messageId);
        }



    }
    }
