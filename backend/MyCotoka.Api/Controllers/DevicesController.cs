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
public class DevicesController : ControllerBase
{
    private readonly AppDbContext _db;

    public DevicesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var devices = await _db.Devices.ToListAsync();
        return Ok(devices);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var device = await _db.Devices.FindAsync(id);
        if (device == null) return NotFound();
        return Ok(device);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(DeviceDto dto)
    {
        if (await _db.Devices.AnyAsync(d => d.SerialNumber == dto.SerialNumber))
        {
            return BadRequest(new { message = "A device with this serial number already exists." });
        }

        var device = new Device
        {
            SerialNumber = dto.SerialNumber,
            Model = dto.Model
        };
        _db.Devices.Add(device);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = device.Id }, device);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, DeviceDto dto)
    {
        var device = await _db.Devices.FindAsync(id);
        if (device == null) return NotFound();

        device.SerialNumber = dto.SerialNumber;
        device.Model = dto.Model;
        await _db.SaveChangesAsync();
        return Ok(device);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var device = await _db.Devices.FindAsync(id);
        if (device == null) return NotFound();

        _db.Devices.Remove(device);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
