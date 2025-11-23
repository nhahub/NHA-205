using Microsoft.AspNetCore.Mvc;

namespace Codexly.Controllers
{
    public class WhiteBoardController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}


