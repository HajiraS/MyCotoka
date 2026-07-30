using System.ComponentModel.DataAnnotations;

namespace MyCotoka.Api.DTOs;

public class ClientDto
{
    [Required(ErrorMessage = "Company name is required.")]
    public string CompanyName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Contact email is required.")]
    [EmailAddress(ErrorMessage = "Enter a valid email address.")]
    public string ContactEmail { get; set; } = string.Empty;
}
