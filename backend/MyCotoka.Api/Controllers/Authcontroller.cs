using Microsoft.AspNetCore.Mvc;
using MyCotoka.Api.DTOs;
using MyCotoka.Api.Services;

namespace MyCotoka.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        if (result == null) return BadRequest("Username already exists.");
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (result == null) return Unauthorized("Invalid username or password.");
        return Ok(result);
    }
}