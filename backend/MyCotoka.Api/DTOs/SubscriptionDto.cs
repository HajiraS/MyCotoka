namespace MyCotoka.Api.DTOs;

public class SubscriptionDto
{
    public int DeviceId { get; set; }
    public int ClientId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public decimal MonthlyPrice { get; set; }
}
