using MyCotoka.Api.Models;

namespace MyCotoka.Api.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (!db.Users.Any(u => u.Username == "admin"))
        {
            db.Users.Add(new User
            {
                Username = "admin",
                Email = "admin@mycotoka.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin1234!"),
                Role = "Admin"
            });
        }

        if (!db.Clients.Any())
        {
            db.Clients.AddRange(
                new Client { CompanyName = "Acme Corp", ContactEmail = "contact@acme.com" },
                new Client { CompanyName = "Globex Inc", ContactEmail = "info@globex.com" }
            );
        }

        if (!db.Devices.Any())
        {
            db.Devices.AddRange(
                new Device { SerialNumber = "SN-1001", Model = "CotokaDevice-X1", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-1002", Model = "CotokaDevice-X1", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-1003", Model = "CotokaDevice-X2", Status = DeviceStatus.InStock }
            );
        }

        db.SaveChanges();
    }
}
