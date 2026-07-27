namespace MyCotoka.Api.Models;

public class Client
{
    public int Id { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string ContactEmail { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}