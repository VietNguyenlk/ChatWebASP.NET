using ChatWeb.Data;
using ChatWeb.Models;
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

        // danh sach nguoi dung
        public async Task<IActionResult> Home()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser != null)
            {
                var useres = _userManager.Users
               .Where(u => u.Id != currentUser.Id)
               .ToList();
                return View(useres);

            }
            return View();


        }

        public async Task<IActionResult> StartChat(string userId)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            Console.WriteLine("userId " + userId);
            var receiver = await _userManager.FindByIdAsync(userId);

            ViewBag.Receiver = receiver;

            ViewBag.CurrentUser = currentUser;

            var message = _context.ChatMessages
               .Where(m =>
               (m.SenderId == currentUser.Id && m.ReceiverId == userId) ||
               (m.SenderId == userId && m.ReceiverId == currentUser.Id))
               .OrderBy(m => m.Timestamp)
               .ToList();

            return View(message);

        }


        [HttpPost]
        public async Task<IActionResult> SendMessage(string receiverId, string message)
        { 
            var currentUser = await _userManager.GetUserAsync(User);
            var msg = new ChatMessage
            {
                SenderId = currentUser.Id,
                SenderUserName = currentUser.UserName,
                ReceiverId = receiverId,
                Content = message,
                Timestamp = DateTime.Now

            };
            _context.ChatMessages.Add(msg);
            await _context.SaveChangesAsync();
            return RedirectToAction("StartChat",new {userId= receiverId });

        }


    }
}
