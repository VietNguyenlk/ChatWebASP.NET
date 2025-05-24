using ChatWeb.Models;
using ChatWeb.Service;
using ChatWeb.ViewModel;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace ChatWeb.Controllers
{
    public class AccountController : Controller
    {
        private readonly IUserService _userService;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public AccountController(IUserService userService, SignInManager<ApplicationUser> signInManager)
        {
            _userService = userService;
            _signInManager = signInManager;
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel loginViewModel)
        {
            var user = await _userService.ValidateUserAsync(loginViewModel);
           if(user!= null)
            {
                Console.WriteLine("User is" + User?.Identity?.Name);
                Console.WriteLine("User IsAuthenticated is " + User?.Identity?.IsAuthenticated);
                return RedirectToAction("Home","Chat" );
            }
            ModelState.AddModelError("", "Login failed");
            return View(loginViewModel);


        }
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel registerViewModel)
        {
            if (ModelState.IsValid) {
                var result = await _userService.RegisterUserAsync(registerViewModel);
                if (result)
                {
                    Console.WriteLine("User sign up is " + User?.Identity?.Name);
                    Console.WriteLine("User IsAuthenticated is " + User?.Identity?.IsAuthenticated);
                    return RedirectToAction("Index", "Home");
                }
               
            }

            ModelState.AddModelError("", "Registration failed");
            return View(registerViewModel);
        }

        public IActionResult Register()
        {
            return View();
        }

        // GET: /Account/Logout
        [HttpPost]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return RedirectToAction("Login", "Account");
        }
    }

}
