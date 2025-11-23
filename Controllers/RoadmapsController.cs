using Microsoft.AspNetCore.Mvc;

namespace Codexly.Controllers
{
    public class RoadmapsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}

