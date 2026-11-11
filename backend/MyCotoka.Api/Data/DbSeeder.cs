using MyCotoka.Api.Models;

namespace MyCotoka.Api.Data;

/// <summary>
/// Seeds the database with demo data on application startup.
/// Called from Program.cs after migrations run.
/// All operations are idempotent — they only insert data when the relevant tables are empty
/// (or when a specific user is missing).
/// </summary>
public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        // ------------------------------------------------------------------
        // 1. Users
        // ------------------------------------------------------------------
        // Admin user (used for the live demo login)
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

        // ------------------------------------------------------------------
        // 2. Clients
        // ------------------------------------------------------------------
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

        // ------------------------------------------------------------------
        // 3. Devices
        // ------------------------------------------------------------------
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

        // Persist clients + devices so they receive generated IDs.
        // We need real IDs before we can create subscriptions and link the test user.
        db.SaveChanges();

        // ------------------------------------------------------------------
        // 4. Link testuser (ClientAdmin) to the first client
        // ------------------------------------------------------------------
        if (!db.Users.Any(u => u.Username == "testuser"))
        {
            var firstClient = db.Clients.OrderBy(c => c.Id).FirstOrDefault();

            db.Users.Add(new User
            {
                Username = "testuser",
                Email = "testuser@mycotoka.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test1234!"),
                Role = "ClientAdmin",
                ClientId = firstClient?.Id          // may be null if no clients exist
            });
        }

        // ------------------------------------------------------------------
        // 5. Subscriptions
        //    Link some InStock devices to clients and mark those devices as Assigned.
        // ------------------------------------------------------------------
        if (!db.Subscriptions.Any())
        {
            var clients = db.Clients.OrderBy(c => c.Id).Take(5).ToList();
            var availableDevices = db.Devices
                .Where(d => d.Status == DeviceStatus.InStock)
                .OrderBy(d => d.Id)
                .Take(6)
                .ToList();

            // Only seed when we have enough related data
            if (clients.Count >= 3 && availableDevices.Count >= 4)
            {
                var subscriptions = new List<Subscription>
                {
                    new Subscription
                    {
                        DeviceId     = availableDevices[0].Id,
                        ClientId     = clients[0].Id,
                        PlanName     = "Basic",
                        MonthlyPrice = 29.99m,
                        Status       = SubscriptionStatus.Active,
                        StartDate    = DateTime.UtcNow.AddMonths(-4)
                    },
                    new Subscription
                    {
                        DeviceId     = availableDevices[1].Id,
                        ClientId     = clients[1].Id,
                        PlanName     = "Pro",
                        MonthlyPrice = 49.99m,
                        Status       = SubscriptionStatus.Active,
                        StartDate    = DateTime.UtcNow.AddMonths(-2)
                    },
                    new Subscription
                    {
                        DeviceId     = availableDevices[2].Id,
                        ClientId     = clients[2].Id,
                        PlanName     = "Enterprise",
                        MonthlyPrice = 99.00m,
                        Status       = SubscriptionStatus.Active,
                        StartDate    = DateTime.UtcNow.AddMonths(-1)
                    },
                    new Subscription
                    {
                        DeviceId     = availableDevices[3].Id,
                        ClientId     = clients[0].Id,          // same client as first subscription
                        PlanName     = "Pro",
                        MonthlyPrice = 49.99m,
                        Status       = SubscriptionStatus.Paused,
                        StartDate    = DateTime.UtcNow.AddMonths(-6)
                    }
                };

                db.Subscriptions.AddRange(subscriptions);

                // Reflect the assignment on the devices
                availableDevices[0].Status = DeviceStatus.Assigned;
                availableDevices[1].Status = DeviceStatus.Assigned;
                availableDevices[2].Status = DeviceStatus.Assigned;
                availableDevices[3].Status = DeviceStatus.Assigned;
            }
        }

        // Final save (users + subscriptions + device status updates)
        db.SaveChanges();
    }
}