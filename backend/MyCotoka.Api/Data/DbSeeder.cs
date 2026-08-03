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
                new Client { CompanyName = "Globex Inc", ContactEmail = "info@globex.com" },
                new Client { CompanyName = "Initech", ContactEmail = "hello@initech.com" },
                new Client { CompanyName = "Umbrella Corp", ContactEmail = "contact@umbrella.com" },
                new Client { CompanyName = "Stark Industries", ContactEmail = "info@stark.com" },
                new Client { CompanyName = "Wayne Enterprises", ContactEmail = "contact@wayne.com" },
                new Client { CompanyName = "Hooli", ContactEmail = "hello@hooli.com" },
                new Client { CompanyName = "Wonka Industries", ContactEmail = "contact@wonka.com" },
                new Client { CompanyName = "Soylent Corp", ContactEmail = "info@soylent.com" },
                new Client { CompanyName = "Cyberdyne Systems", ContactEmail = "contact@cyberdyne.com" }
            );
        }

        if (!db.Devices.Any())
        {
            db.Devices.AddRange(
                new Device { SerialNumber = "SN-1001", Model = "CotokaDevice-X1", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-1002", Model = "CotokaDevice-X1", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-1003", Model = "CotokaDevice-X2", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-1004", Model = "CotokaDevice-X2", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-1005", Model = "CotokaDevice-X3", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-1006", Model = "CotokaDevice-X1", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-1007", Model = "CotokaDevice-X2", Status = DeviceStatus.Maintenance },
                new Device { SerialNumber = "SN-1008", Model = "CotokaDevice-X3", Status = DeviceStatus.Maintenance },
                new Device { SerialNumber = "SN-1009", Model = "CotokaDevice-X1", Status = DeviceStatus.Retired },
                new Device { SerialNumber = "SN-1010", Model = "CotokaDevice-X2", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-1011", Model = "CotokaDevice-X3", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-1012", Model = "CotokaDevice-X1", Status = DeviceStatus.InStock }
            );
        }

        db.SaveChanges();
    }
}
