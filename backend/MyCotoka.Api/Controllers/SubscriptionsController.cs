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
public class SubscriptionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SubscriptionsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var subscriptions = await _db.Subscriptions
            .Include(s => s.Device)
            .Include(s => s.Client)
            .ToListAsync();
        return Ok(subscriptions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var subscription = await _db.Subscriptions
            .Include(s => s.Device)
            .Include(s => s.Client)
            .FirstOrDefaultAsync(s => s.Id == id);
        if (subscription == null) return NotFound();
        return Ok(subscription);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(SubscriptionDto dto)
    {
        var device = await _db.Devices.FindAsync(dto.DeviceId);
        if (device == null) return BadRequest("Device not found.");

        var client = await _db.Clients.FindAsync(dto.ClientId);
        if (client == null) return BadRequest("Client not found.");

        var subscription = new Subscription
        {
            DeviceId = dto.DeviceId,
            ClientId = dto.ClientId,
            PlanName = dto.PlanName,
            MonthlyPrice = dto.MonthlyPrice,
            Status = SubscriptionStatus.Active,
            StartDate = DateTime.UtcNow
        };

        device.Status = DeviceStatus.Assigned;

        _db.Subscriptions.Add(subscription);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = subscription.Id }, subscription);
    }

    [HttpPut("{id}/cancel")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Cancel(int id)
    {
        var subscription = await _db.Subscriptions.Include(s => s.Device).FirstOrDefaultAsync(s => s.Id == id);
        if (subscription == null) return NotFound();

        subscription.Status = SubscriptionStatus.Cancelled;
        subscription.EndDate = DateTime.UtcNow;
        subscription.Device.Status = DeviceStatus.InStock;

        await _db.SaveChangesAsync();
        return Ok(subscription);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var subscription = await _db.Subscriptions.FindAsync(id);
        if (subscription == null) return NotFound();

        _db.Subscriptions.Remove(subscription);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
