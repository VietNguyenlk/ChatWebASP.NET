using ChatWeb.Models;
using Microsoft.AspNetCore.Identity;

namespace ChatWeb.Midleware
{
    public static class SeedRoles
    {
        public static async Task InitializeAsync(RoleManager<IdentityRole> roleManager, UserManager<ApplicationUser> userManager)
        {
          
            string[] roles = { "Admin", "Member" };
            foreach (var role in roles) { 
                if(!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }
            // tạo admin mặc định
            var adminEmail = "admin@gmail.com";
            var admin = await userManager.FindByEmailAsync(adminEmail);
            if (admin == null) {
                var newAdmin = new ApplicationUser { UserName = adminEmail, Email = adminEmail };
                var   results=  await userManager.CreateAsync(newAdmin,"Admin@123");
                if (results.Succeeded) {
                    await userManager.AddToRoleAsync(newAdmin, "Admin");
                }
            }
        }










    }
}
