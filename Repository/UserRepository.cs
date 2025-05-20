using ChatWeb.Data;
using ChatWeb.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ChatWeb.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;
        public UserRepository(UserManager<ApplicationUser> userManager )
        {
            _userManager = userManager;
        }

        public async Task CreateAsync(ApplicationUser user, string password)
        {
            await _userManager.CreateAsync(user, password);
        }

        public async Task<ApplicationUser> GetByEmailAsync(string email)
        {
           return await _userManager.FindByEmailAsync(email);
        }
    }
 
}
