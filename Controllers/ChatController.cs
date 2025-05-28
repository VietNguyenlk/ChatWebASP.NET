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

        public async Task<IActionResult> Home(string? userId = null)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return RedirectToAction("Login", "Account");
            }
            var users = _userManager.Users.Where(u => u.Id != currentUser.Id).ToList();
            var messages = new List<ChatMessage>();
            ApplicationUser? selectedUser = null; // Change to nullable type

            if (!string.IsNullOrEmpty(userId))
            {
                selectedUser = await _userManager.FindByIdAsync(userId);
                if (selectedUser != null) // Add null check
                {
                    messages = _context.ChatMessages
                        .Where(m => (m.SenderId == currentUser.Id && m.ReceiverId == userId) ||
                                    (m.SenderId == userId && m.ReceiverId == currentUser.Id))
                        .OrderBy(m => m.Timestamp)
                        .ToList();
                }
            }

            ViewBag.ReceiverId = userId;
            ViewBag.SelectedUser = selectedUser;
            ViewBag.HasSelectedUser = !string.IsNullOrEmpty(userId) && selectedUser != null; // Update condition

            return View(new ChatViewModel
            {
                Users = users,
                Messages = messages
            });
        }
    }
}