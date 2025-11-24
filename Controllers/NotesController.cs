using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Codexly.Data;
using Codexly.Models;

namespace Codexly.Controllers
{
    [Authorize]
    public class NotesController : Controller
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<IdentityUser> _userManager;

        public NotesController(ApplicationDbContext db, UserManager<IdentityUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        public IActionResult Index()
        {
            var userId = _userManager.GetUserId(User);
            var notes = _db.Notes.Where(n => n.UserId == userId).OrderByDescending(n => n.UpdatedAt).ToList();
            return View(notes);
        }

        [HttpPost]
        public IActionResult Add()
        {
            var userId = _userManager.GetUserId(User);
            var note = new NoteItem
            {
                Title = "Untitled",
                Body = "",
                UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                UserId = userId
            };
            _db.Notes.Add(note);
            _db.SaveChanges();
            return RedirectToAction("Index");
        }

        [HttpPost]
        public IActionResult Update(int id, string Title, string Body)
        {
            var userId = _userManager.GetUserId(User);
            var note = _db.Notes.FirstOrDefault(n => n.Id == id);
            if (note == null || note.UserId != userId) return Unauthorized();
            note.Title = Title ?? note.Title;
            note.Body = Body;
            note.UpdatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            _db.SaveChanges();
            return RedirectToAction("Index");
        }

        [HttpPost]
        public IActionResult Delete(int id)
        {
            var userId = _userManager.GetUserId(User);
            var note = _db.Notes.FirstOrDefault(n => n.Id == id);
            if (note == null || note.UserId != userId) return Unauthorized();
            _db.Notes.Remove(note);
            _db.SaveChanges();
            return RedirectToAction("Index");
        }
    }
}


