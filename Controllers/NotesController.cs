using Microsoft.AspNetCore.Mvc;

namespace Codexly.Controllers
{
    public class NotesController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}

