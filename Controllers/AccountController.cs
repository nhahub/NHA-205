using Microsoft.AspNetCore.Mvc;

namespace Codexly.Controllers
{
    public class AccountController : Controller
    {
        public IActionResult SignUp()
        {
            return View();
        }

        public IActionResult SignIn()
        {
            return View();
        }
    }
}

