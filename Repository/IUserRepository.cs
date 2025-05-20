using ChatWeb.Models;

namespace ChatWeb.Repository
{
    public interface IUserRepository
    {
        Task<ApplicationUser> GetByEmailAsync(string email);
        Task CreateAsync(ApplicationUser user, string password);
    }
}
