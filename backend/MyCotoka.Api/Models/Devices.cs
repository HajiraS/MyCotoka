namespace MyCotoka.Api.Models;

public enum DeviceStatus
{
    InStock,
    Assigned,
    Maintenance,
    Retired
}

public class Device
{
    public int Id { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public DeviceStatus Status { get; set; } = DeviceStatus.InStock;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}