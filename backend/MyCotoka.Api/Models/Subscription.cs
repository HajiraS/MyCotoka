namespace MyCotoka.Api.Models;

public enum SubscriptionStatus
{
    Active,
    Paused,
    Cancelled,
    Expired
}

public class Subscription
{
    public int Id { get; set; }

    public int DeviceId { get; set; }
    public Device Device { get; set; } = null!;

    public int ClientId { get; set; }
    public Client Client { get; set; } = null!;

    public string PlanName { get; set; } = string.Empty;
    public decimal MonthlyPrice { get; set; }
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Active;

    public DateTime StartDate { get; set; } = DateTime.UtcNow;
    public DateTime? EndDate { get; set; }
}