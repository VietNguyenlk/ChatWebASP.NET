using ChatWeb.Models;
namespace ChatWeb.ViewModel {
public class ChatViewModel
{
    public List<ApplicationUser> Users { get; set; }
    public List<ChatMessage>? Messages { get; set; }
}


}