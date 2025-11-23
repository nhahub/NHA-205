using Microsoft.AspNetCore.Mvc;
using Codexly.Services;
using Codexly.Models;

namespace Codexly.Controllers
{
    public class TasksController : Controller
    {
        private readonly ITaskService _service;

        public TasksController(ITaskService service)
        {
            _service = service;
        }

        public IActionResult Index()
        {
            // Advanced todo list UI is client-side, but backend service is available for future integration
            return View();
        }

        public IActionResult Create()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Create(string Title)
        {
            if (string.IsNullOrWhiteSpace(Title))
            {
                TempData["Error"] = "You must enter a task name";
                return RedirectToAction("Index");
            }

            _service.Add(new TaskItem
            {
                Title = Title,
                Description = "",
                IsDone = false
            });

            TempData["Success"] = "Task added successfully!";
            return RedirectToAction("Index");
        }

        public IActionResult Edit(int id)
        {
            var item = _service.GetById(id);
            if (item == null) return NotFound();

            return View(item);
        }

        [HttpPost]
        public IActionResult Edit(TaskItem item)
        {
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
            var item = _service.GetById(id);
            if (item == null) return NotFound();

            return View(item);
        }

        [HttpPost]
        public IActionResult DeleteConfirmed(int id)
        {
            _service.Delete(id);
            TempData["Success"] = "Task deleted successfully!";
            return RedirectToAction("Index");
        }
    }
}

