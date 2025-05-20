using ChatWeb.Models;
using ChatWeb.ViewModel;

namespace ChatWeb.Service
{
    public interface IUserService
    {
        Task<bool> RegisterUserAsync(RegisterViewModel model);
        Task<ApplicationUser> ValidateUserAsync(LoginViewModel model);
    }
}
