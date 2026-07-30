using System.ComponentModel.DataAnnotations;

namespace MyCotoka.Api.DTOs;

public class DeviceDto
{
    [Required(ErrorMessage = "Serial number is required.")]
    [StringLength(50, ErrorMessage = "Serial number must be under 50 characters.")]
    public string SerialNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Model is required.")]
    public string Model { get; set; } = string.Empty;
}
