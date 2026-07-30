using System.ComponentModel.DataAnnotations;

namespace MyCotoka.Api.DTOs;

public class SubscriptionDto
{
    [Required(ErrorMessage = "Device is required.")]
    public int DeviceId { get; set; }

    [Required(ErrorMessage = "Client is required.")]
    public int ClientId { get; set; }

    [Required(ErrorMessage = "Plan name is required.")]
    public string PlanName { get; set; } = string.Empty;

    [Range(0.01, 100000, ErrorMessage = "Monthly price must be greater than 0.")]
    public decimal MonthlyPrice { get; set; }
}
