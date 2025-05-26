using ChatWeb.Data;
using ChatWeb.Models;
using ChatWeb.ViewModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ChatWeb.Controllers
{
    [Authorize]
    public class ChatController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public ChatController(UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<IActionResult> Home(string userId)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            var users = _userManager.Users.Where(u => u.Id != currentUser.Id).ToList();

            var messages = new List<ChatMessage>();
            if (!string.IsNullOrEmpty(userId))
            {
                messages = _context.ChatMessages
                    .Where(m => (m.SenderId == currentUser.Id && m.ReceiverId == userId) ||
                                (m.SenderId == userId && m.ReceiverId == currentUser.Id))
                    .OrderBy(m => m.Timestamp)
                    .ToList();
            }

            ViewBag.ReceiverId = userId;

            return View(new ChatViewModel
            {
                Users = users,
                Messages = messages
            });
        }

    //    [HttpPost]
    //    public async Task<IActionResult> SendMessage(string receiverId, string message)
    //    {
    //        var currentUser = await _userManager.GetUserAsync(User);
    //        var newMsg = new ChatMessage
    //        {
    //            SenderId = currentUser.Id,
    //            ReceiverId = receiverId,
    //            SenderUserName = currentUser.UserName,
    //            Content = message,
    //            Timestamp = DateTime.Now
    //        };
    //        _context.ChatMessages.Add(newMsg);
    //        await _context.SaveChangesAsync();
    //        return RedirectToAction("Home", new { userId = receiverId });
    //    }
    }

}
