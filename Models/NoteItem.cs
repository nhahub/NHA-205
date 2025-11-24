namespace Codexly.Models
{
    public class NoteItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string? Body { get; set; }
        public long UpdatedAt { get; set; }
        public string UserId { get; set; } = "";
    }
}