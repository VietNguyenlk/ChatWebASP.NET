using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace ChatWeb.Hubs
{
    public class ChatHub : Hub
    {
        public async Task SendMessage(string senderId, string receiverId, string message)
        {
            // Debug: Log thông tin
            Console.WriteLine($"SenderId: {senderId}");
            Console.WriteLine($"ReceiverId: {receiverId}");
            Console.WriteLine($"Current User ID: {Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value}");
            Console.WriteLine($"Message: {message}");

            // Thử cả 2 cách gửi
            // Cách 1: Gửi cho user cụ thể
            await Clients.User(receiverId).SendAsync("ReceiveMessage", senderId, message);

            // Cách 2: Gửi cho tất cả (để test)
            // await Clients.All.SendAsync("ReceiveMessage", senderId, message);
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"User connected: {userId}");
            await base.OnConnectedAsync();
        }
    }
}
