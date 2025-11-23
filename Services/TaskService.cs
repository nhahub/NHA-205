using System.Collections.Generic;
using System.Linq;
using Codexly.Models;

namespace Codexly.Services
{
    public class TaskService : ITaskService
    {
        private static List<TaskItem> _items = new List<TaskItem>()
        {
            new TaskItem { Id = 1, Title = "Sample Task", IsDone = false, UserId = "sample-user-id" }
        };

        public List<TaskItem> GetTasksForUser(string userId)
        {
            return _items.Where(x => x.UserId == userId).ToList();
        }

        public TaskItem? GetById(int id)
        {
            return _items.FirstOrDefault(x => x.Id == id);
        }

        public void Add(TaskItem item)
        {
            item.Id = _items.Count == 0 ? 1 : _items.Max(x => x.Id) + 1;
            _items.Add(item);
        }

        public void Update(TaskItem item)
        {
            var existing = GetById(item.Id);
            if (existing != null)
            {
                existing.Title = item.Title;
                existing.IsDone = item.IsDone;
            }
        }

        public void Delete(int id)
        {
            var existing = GetById(id);
            if (existing != null)
                _items.Remove(existing);
        }
    }
}
