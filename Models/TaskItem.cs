namespace Codexly.Models
{
    public class TaskItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string? Description { get; set; }
        public bool IsDone { get; set; }

        // Link the task to a specific user
        public string UserId { get; set; } = "";
    }
}

