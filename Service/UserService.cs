using ChatWeb.Models;
using ChatWeb.Repository;
using ChatWeb.ViewModel;
using Microsoft.AspNetCore.Identity;

namespace ChatWeb.Service
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public UserService(IUserRepository userRepository, SignInManager<ApplicationUser> signInManager)
        {
            _userRepository = userRepository;
            _signInManager = signInManager;
        }

        public async Task<bool> RegisterUserAsync(RegisterViewModel model)
        {
            var user = new ApplicationUser
            {
                UserName = model.Email,
                Email = model.Email
            };
            await _userRepository.CreateAsync(user, model.Password);
            return true;
        }

        public async Task<ApplicationUser?> ValidateUserAsync(LoginViewModel model)
        {
            var user = await _userRepository.GetByEmailAsync(model.Email);
            if (user == null)
            {
                return null;
            }
           var result = await _signInManager.PasswordSignInAsync(model.Email, model.Password, model.RememberMe, lockoutOnFailure: false);
           return result.Succeeded ? user : null;
        
        }
    }

}
