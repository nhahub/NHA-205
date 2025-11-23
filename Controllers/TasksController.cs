using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Codexly.Services;
using Codexly.Models;

namespace Codexly.Controllers
{
    [Authorize]
    public class TasksController : Controller
    {
        private readonly ITaskService _service;
        private readonly UserManager<IdentityUser> _userManager;

        public TasksController(ITaskService service, UserManager<IdentityUser> userManager)
        {
            _service = service;
            _userManager = userManager;
        }

        public IActionResult Index()
        {
            var userId = _userManager.GetUserId(User);
            var tasks = _service.GetTasksForUser(userId);
            return View(tasks);
        }

        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public IActionResult ToggleDone(int id)
        {
            var userId = _userManager.GetUserId(User);
            var task = _service.GetById(id);

            if (task == null || task.UserId != userId)
                return Unauthorized();

            task.IsDone = !task.IsDone; // Flip the boolean
            _service.Update(task);

            return RedirectToAction("Index");
        }

        [HttpPost]
        public IActionResult Create(string Title)
        {
            if (string.IsNullOrWhiteSpace(Title))
            {
                TempData["Error"] = "You must enter a task name";
                return RedirectToAction("Index");
            }

            var userId = _userManager.GetUserId(User);

            _service.Add(new TaskItem
            {
                Title = Title,
                Description = "",
                IsDone = false,
                UserId = userId
            });

            TempData["Success"] = "Task added successfully!";
            return RedirectToAction("Index");
        }

        public IActionResult Edit(int id)
        {
            var userId = _userManager.GetUserId(User);
            var item = _service.GetById(id);

            if (item == null || item.UserId != userId)
                return Unauthorized();

            return View(item);
        }

        [HttpPost]
        public IActionResult Edit(TaskItem item)
        {
            var userId = _userManager.GetUserId(User);
            if (item.UserId != userId)
                return Unauthorized();

            if (ModelState.IsValid)
            {
                _service.Update(item);
                TempData["Success"] = "Task updated successfully!";
                return RedirectToAction("Index");
            }

            return View(item);
        }

        public IActionResult Delete(int id)
        {
            var userId = _userManager.GetUserId(User);
            var item = _service.GetById(id);

            if (item == null || item.UserId != userId)
                return Unauthorized();

            return View(item);
        }

        [HttpPost]
        public IActionResult DeleteConfirmed(int id)
        {
            var userId = _userManager.GetUserId(User);
            var item = _service.GetById(id);

            if (item == null || item.UserId != userId)
                return Unauthorized();

            _service.Delete(id);
            TempData["Success"] = "Task deleted successfully!";
            return RedirectToAction("Index");
        }
    }
}
