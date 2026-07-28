using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyCotoka.Api.Data;
using MyCotoka.Api.DTOs;
using MyCotoka.Api.Models;

namespace MyCotoka.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ClientsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var clients = await _db.Clients.ToListAsync();
        return Ok(clients);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var client = await _db.Clients.FindAsync(id);
        if (client == null) return NotFound();
        return Ok(client);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(ClientDto dto)
    {
        var client = new Client
        {
            CompanyName = dto.CompanyName,
            ContactEmail = dto.ContactEmail
        };
        _db.Clients.Add(client);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = client.Id }, client);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, ClientDto dto)
    {
        var client = await _db.Clients.FindAsync(id);
        if (client == null) return NotFound();

        client.CompanyName = dto.CompanyName;
        client.ContactEmail = dto.ContactEmail;
        await _db.SaveChangesAsync();
        return Ok(client);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var client = await _db.Clients.FindAsync(id);
        if (client == null) return NotFound();

        _db.Clients.Remove(client);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
