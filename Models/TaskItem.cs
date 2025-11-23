namespace Codexly.Models
{
    public class TaskItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string? Description { get; set; }
        public bool IsDone { get; set; }
        public bool IsCompleted { get; internal set; }
    }
}

