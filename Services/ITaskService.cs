using System.Collections.Generic;
using Codexly.Models;

namespace Codexly.Services
{
    public interface ITaskService
    {
        List<TaskItem> GetTasksForUser(string userId);
        TaskItem? GetById(int id);
        void Add(TaskItem item);
        void Update(TaskItem item);
        void Delete(int id);
    }
}
