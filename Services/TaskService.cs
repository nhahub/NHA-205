using System.Collections.Generic;
using System.Linq;
using Codexly.Models;
using Codexly.Data;

namespace Codexly.Services
{
    public class TaskService : ITaskService
    {
        private readonly ApplicationDbContext _db;

        public TaskService(ApplicationDbContext db)
        {
            _db = db;
        }

        public List<TaskItem> GetTasksForUser(string userId)
        {
            return _db.Tasks.Where(x => x.UserId == userId).OrderBy(x => x.Id).ToList();
        }

        public TaskItem? GetById(int id)
        {
            return _db.Tasks.FirstOrDefault(x => x.Id == id);
        }

        public void Add(TaskItem item)
        {
            Console.WriteLine($"[DEBUG] TaskService.Add called. Title: {item.Title}, UserId: {item.UserId}");
            _db.Tasks.Add(item);
            var result = _db.SaveChanges();
            Console.WriteLine($"[DEBUG] SaveChanges result: {result}");
        }

        public void Update(TaskItem item)
        {
            var existing = GetById(item.Id);
            if (existing != null)
            {
                existing.Title = item.Title;
                existing.IsDone = item.IsDone;
                _db.SaveChanges();
            }
        }

        public void Delete(int id)
        {
            var existing = GetById(id);
            if (existing != null)
            {
                _db.Tasks.Remove(existing);
                _db.SaveChanges();
            }
        }
    }
}
